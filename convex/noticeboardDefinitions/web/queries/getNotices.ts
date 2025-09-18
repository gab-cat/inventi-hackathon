import { v } from 'convex/values';
import { PaginationOptions, paginationOptsValidator } from 'convex/server';
import { QueryCtx } from '../../../_generated/server';
import { Id, Doc } from '../../../_generated/dataModel';

export const webGetNoticesArgs = {
  paginationOpts: paginationOptsValidator,
  propertyId: v.optional(v.id('properties')),
  unitId: v.optional(v.id('units')),
  noticeType: v.optional(
    v.union(
      v.literal('announcement'),
      v.literal('maintenance'),
      v.literal('payment_reminder'),
      v.literal('emergency'),
      v.literal('event'),
      v.literal('general')
    )
  ),
  priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('urgent'))),
  targetAudience: v.optional(
    v.union(v.literal('all'), v.literal('tenants'), v.literal('specific_units'), v.literal('managers'))
  ),
  isActive: v.optional(v.boolean()),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
  search: v.optional(v.string()),
  createdBy: v.optional(v.id('users')),
} as const;

export const webGetNoticesReturns = v.object({
  page: v.array(
    v.object({
      _id: v.id('notices'),
      _creationTime: v.number(),
      propertyId: v.id('properties'),
      unitId: v.optional(v.id('units')),
      createdBy: v.id('users'),
      title: v.string(),
      content: v.string(),
      noticeType: v.string(),
      priority: v.string(),
      targetAudience: v.string(),
      targetUnits: v.optional(v.array(v.id('units'))),
      isActive: v.boolean(),
      scheduledAt: v.optional(v.number()),
      expiresAt: v.optional(v.number()),
      attachments: v.optional(v.array(v.string())),
      createdAt: v.number(),
      updatedAt: v.number(),
      // Joined data
      property: v.object({
        _id: v.id('properties'),
        name: v.string(),
        address: v.string(),
      }),
      creator: v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
      }),
      unit: v.optional(
        v.object({
          _id: v.id('units'),
          unitNumber: v.string(),
        })
      ),
      acknowledgmentCount: v.number(),
      totalTargetUsers: v.number(),
    })
  ),
  isDone: v.boolean(),
  continueCursor: v.optional(v.string()),
});

type Args = {
  paginationOpts: PaginationOptions;
  propertyId?: Id<'properties'>;
  unitId?: Id<'units'>;
  noticeType?: 'announcement' | 'maintenance' | 'payment_reminder' | 'emergency' | 'event' | 'general';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience?: 'all' | 'tenants' | 'specific_units' | 'managers';
  isActive?: boolean;
  dateFrom?: number;
  dateTo?: number;
  search?: string;
  createdBy?: Id<'users'>;
};

export const webGetNoticesHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager (admin side)
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Choose the best index anchor based on provided filters
  let base;
  if (args.propertyId && args.noticeType) {
    base = ctx.db
      .query('notices')
      .withIndex('by_property', q => q.eq('propertyId', args.propertyId!))
      .filter(q => q.eq(q.field('noticeType'), args.noticeType!));
  } else if (args.propertyId) {
    base = ctx.db.query('notices').withIndex('by_property', q => q.eq('propertyId', args.propertyId!));
  } else if (args.createdBy) {
    base = ctx.db.query('notices').withIndex('by_created_by', q => q.eq('createdBy', args.createdBy!));
  } else if (args.noticeType) {
    base = ctx.db.query('notices').withIndex('by_type', q => q.eq('noticeType', args.noticeType!));
  } else if (args.priority) {
    base = ctx.db.query('notices').withIndex('by_priority', q => q.eq('priority', args.priority!));
  } else if (args.isActive !== undefined) {
    base = ctx.db.query('notices').withIndex('by_active', q => q.eq('isActive', args.isActive!));
  } else {
    base = ctx.db.query('notices');
  }

  // Apply additional filters
  if (args.unitId) {
    base = base.filter(q => q.eq(q.field('unitId'), args.unitId!));
  }
  if (args.targetAudience) {
    base = base.filter(q => q.eq(q.field('targetAudience'), args.targetAudience!));
  }
  if (args.dateFrom) {
    base = base.filter(q => q.gte(q.field('createdAt'), args.dateFrom!));
  }
  if (args.dateTo) {
    base = base.filter(q => q.lte(q.field('createdAt'), args.dateTo!));
  }
  // Note: We'll handle search filtering after pagination for better performance
  // and to support case-insensitive partial matching

  // Order by creation time (newest first)
  const results = await base.order('desc').paginate(args.paginationOpts);

  // Enrich with related data
  const enrichedPage = await Promise.all(
    results.page.map(async (notice: Doc<'notices'>) => {
      // Get property info
      const property = await ctx.db.get(notice.propertyId);
      if (!property) throw new Error('Property not found');

      // Get creator info
      const creator = await ctx.db.get(notice.createdBy);
      if (!creator) throw new Error('Creator not found');

      // Get unit info if applicable
      let unit = undefined;
      if (notice.unitId) {
        const unitData = await ctx.db.get(notice.unitId);
        if (unitData) {
          unit = {
            _id: unitData._id,
            unitNumber: unitData.unitNumber,
          };
        }
      }

      // Get acknowledgment count
      const acknowledgments = await ctx.db
        .query('noticeAcknowledgments')
        .withIndex('by_notice', q => q.eq('noticeId', notice._id))
        .collect();
      const acknowledgmentCount = acknowledgments.length;

      // Calculate total target users based on target audience
      let totalTargetUsers = 0;
      if (notice.targetAudience === 'all') {
        const allUnits = await ctx.db
          .query('units')
          .withIndex('by_property', q => q.eq('propertyId', notice.propertyId))
          .filter(q => q.eq(q.field('isOccupied'), true))
          .collect();
        totalTargetUsers = allUnits.length;
      } else if (notice.targetAudience === 'tenants') {
        const tenantUnits = await ctx.db
          .query('units')
          .withIndex('by_property', q => q.eq('propertyId', notice.propertyId))
          .filter(q => q.eq(q.field('isOccupied'), true))
          .collect();
        totalTargetUsers = tenantUnits.length;
      } else if (notice.targetAudience === 'specific_units' && notice.targetUnits) {
        totalTargetUsers = notice.targetUnits.length;
      } else if (notice.targetAudience === 'managers') {
        const managers = await ctx.db
          .query('users')
          .withIndex('by_role', q => q.eq('role', 'manager'))
          .collect();
        totalTargetUsers = managers.length;
      }

      return {
        ...notice,
        property: {
          _id: property._id,
          name: property.name,
          address: property.address,
        },
        creator: {
          _id: creator._id,
          firstName: creator.firstName,
          lastName: creator.lastName,
          email: creator.email,
        },
        unit,
        acknowledgmentCount,
        totalTargetUsers,
      };
    })
  );

  // Apply search filter if provided
  let filteredPage = enrichedPage;
  if (args.search) {
    const searchTerm = args.search.toLowerCase();
    filteredPage = enrichedPage.filter(
      notice => notice.title.toLowerCase().includes(searchTerm) || notice.content.toLowerCase().includes(searchTerm)
    );
  }

  return {
    page: filteredPage,
    isDone: results.isDone,
    continueCursor: results.continueCursor,
  };
};
