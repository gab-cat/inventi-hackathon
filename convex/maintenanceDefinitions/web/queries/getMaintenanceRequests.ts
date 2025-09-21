import { v } from 'convex/values';
import { PaginationOptions, paginationOptsValidator, Query } from 'convex/server';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webGetMaintenanceRequestsArgs = {
  paginationOpts: paginationOptsValidator,
  propertyId: v.optional(v.id('properties')),
  unitId: v.optional(v.id('units')),
  status: v.optional(
    v.union(
      v.literal('pending'),
      v.literal('assigned'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('cancelled'),
      v.literal('rejected')
    )
  ),
  priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('emergency'))),
  requestType: v.optional(
    v.union(
      v.literal('plumbing'),
      v.literal('electrical'),
      v.literal('hvac'),
      v.literal('appliance'),
      v.literal('general'),
      v.literal('emergency')
    )
  ),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
  search: v.optional(v.string()),
  assignedTo: v.optional(v.id('users')),
} as const;

export const webGetMaintenanceRequestsReturns = v.object({
  page: v.array(
    v.object({
      _id: v.id('maintenanceRequests'),
      _creationTime: v.number(),
      propertyId: v.id('properties'),
      unitId: v.optional(v.id('units')),
      requestedBy: v.id('users'),
      requestType: v.union(
        v.literal('plumbing'),
        v.literal('electrical'),
        v.literal('hvac'),
        v.literal('appliance'),
        v.literal('general'),
        v.literal('emergency')
      ),
      priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('emergency')),
      title: v.string(),
      description: v.string(),
      location: v.string(),
      status: v.union(
        v.literal('pending'),
        v.literal('assigned'),
        v.literal('in_progress'),
        v.literal('completed'),
        v.literal('cancelled'),
        v.literal('rejected')
      ),
      assignedTo: v.optional(v.id('users')),
      assignedAt: v.optional(v.number()),
      estimatedCost: v.optional(v.number()),
      actualCost: v.optional(v.number()),
      estimatedCompletion: v.optional(v.number()),
      actualCompletion: v.optional(v.number()),
      photos: v.optional(v.array(v.string())),
      documents: v.optional(v.array(v.string())),
      tenantApproval: v.optional(v.boolean()),
      tenantApprovalAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
      // denormalized fields for convenience
      tenantName: v.optional(v.string()),
      tenantEmail: v.optional(v.string()),
      unitNumber: v.optional(v.string()),
      assignedTechnicianName: v.optional(v.string()),
      assignedTechnicianEmail: v.optional(v.string()),
    })
  ),
  isDone: v.boolean(),
  continueCursor: v.union(v.string(), v.null()),
  pageStatus: v.optional(v.union(v.string(), v.null())),
  splitCursor: v.optional(v.string()),
});

type Args = {
  paginationOpts: PaginationOptions;
  propertyId?: Id<'properties'>;
  unitId?: Id<'units'>;
  status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'emergency';
  requestType?: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'general' | 'emergency';
  dateFrom?: number;
  dateTo?: number;
  search?: string;
  assignedTo?: Id<'users'>;
};

export const webGetMaintenanceRequestsHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager (admin side)
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Choose the best index anchor based on provided filters to keep it efficient
  let base;
  if (args.propertyId && args.status) {
    base = ctx.db
      .query('maintenanceRequests')
      .withIndex('by_property_status', q => q.eq('propertyId', args.propertyId!).eq('status', args.status!));
  } else if (args.propertyId) {
    base = ctx.db.query('maintenanceRequests').withIndex('by_property', q => q.eq('propertyId', args.propertyId!));
  } else if (args.assignedTo) {
    base = ctx.db.query('maintenanceRequests').withIndex('by_assigned_to', q => q.eq('assignedTo', args.assignedTo!));
  } else if (args.status) {
    base = ctx.db.query('maintenanceRequests').withIndex('by_status', q => q.eq('status', args.status!));
  } else if (args.priority) {
    base = ctx.db.query('maintenanceRequests').withIndex('by_priority', q => q.eq('priority', args.priority!));
  } else if (args.requestType) {
    base = ctx.db
      .query('maintenanceRequests')
      .withIndex('by_request_type', q => q.eq('requestType', args.requestType!));
  } else if (args.unitId) {
    base = ctx.db.query('maintenanceRequests').withIndex('by_unit', q => q.eq('unitId', args.unitId!));
  } else {
    // Default to all requests ordered by creation time (ascending by default)
    base = ctx.db.query('maintenanceRequests');
  }

  // Apply additional filters via .filter only when necessary
  if (args.unitId) {
    base = base.filter(q => q.eq(q.field('unitId'), args.unitId!));
  }
  if (args.priority) {
    base = base.filter(q => q.eq(q.field('priority'), args.priority!));
  }
  if (args.requestType) {
    base = base.filter(q => q.eq(q.field('requestType'), args.requestType!));
  }
  if (args.dateFrom) {
    base = base.filter(q => q.gte(q.field('createdAt'), args.dateFrom!));
  }
  if (args.dateTo) {
    base = base.filter(q => q.lte(q.field('createdAt'), args.dateTo!));
  }
  if (args.assignedTo) {
    base = base.filter(q => q.eq(q.field('assignedTo'), args.assignedTo!));
  }

  // Default latest first
  const paginated = await base.order('desc').paginate(args.paginationOpts);

  // Optional search across title, description, tenant name - apply in-memory on the page only for efficiency
  let page = paginated.page;
  if (args.search && args.search.trim()) {
    const term = args.search.trim().toLowerCase();
    // load tenant names for items on this page
    const userIds = Array.from(new Set(page.map(r => r.requestedBy)));
    const users = await Promise.all(userIds.map(id => ctx.db.get(id)));
    const idToName = new Map<Id<'users'>, string>();
    users.forEach(u => {
      if (u && 'firstName' in u && 'lastName' in u) {
        idToName.set(u._id as Id<'users'>, `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim());
      }
    });

    page = page.filter(r => {
      const tenantName = idToName.get(r.requestedBy) ?? '';
      return (
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) ||
        tenantName.toLowerCase().includes(term)
      );
    });
  }

  // Denormalize tenantName and unitNumber for this page for convenience in UI
  const unitIds = Array.from(new Set(page.map(r => r.unitId).filter(Boolean))) as Array<Id<'units'>>;
  const unitDocs = await Promise.all(unitIds.map(id => ctx.db.get(id)));
  const unitMap = new Map(unitDocs.filter(Boolean).map(u => [u!._id, u!.unitNumber]));

  const tenantIds = Array.from(new Set(page.map(r => r.requestedBy)));
  const tenantDocs = await Promise.all(tenantIds.map(id => ctx.db.get(id)));
  const tenantMap = new Map(
    tenantDocs
      .filter(
        (u): u is NonNullable<typeof u> & { firstName: string; lastName: string; email: string } =>
          u !== null && 'firstName' in u && 'lastName' in u && 'email' in u
      )
      .map(u => [u._id as Id<'users'>, { name: `${u.firstName} ${u.lastName}`.trim(), email: u.email }])
  );

  // Get assigned technician information
  const assignedTechnicianIds = Array.from(new Set(page.map(r => r.assignedTo).filter(Boolean))) as Array<Id<'users'>>;
  const assignedTechnicianDocs = await Promise.all(assignedTechnicianIds.map(id => ctx.db.get(id)));
  const assignedTechnicianMap = new Map(
    assignedTechnicianDocs
      .filter(
        (u): u is NonNullable<typeof u> & { firstName: string; lastName: string; email: string } =>
          u !== null && 'firstName' in u && 'lastName' in u && 'email' in u
      )
      .map(u => [u._id as Id<'users'>, { name: `${u.firstName} ${u.lastName}`.trim(), email: u.email }])
  );

  const enriched = page.map(r => {
    const tenantInfo = tenantMap.get(r.requestedBy);
    const assignedTechnicianInfo = r.assignedTo ? assignedTechnicianMap.get(r.assignedTo) : undefined;

    return {
      ...r,
      tenantName: tenantInfo?.name ?? undefined,
      tenantEmail: tenantInfo?.email ?? undefined,
      unitNumber: r.unitId ? unitMap.get(r.unitId) : undefined,
      assignedTechnicianName: assignedTechnicianInfo?.name ?? undefined,
      assignedTechnicianEmail: assignedTechnicianInfo?.email ?? undefined,
    };
  });

  return {
    page: enriched,
    isDone: paginated.isDone,
    continueCursor: paginated.continueCursor,
  };
};
