import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';
import { Infer, v } from 'convex/values';

export const createRequestArgs = v.object({
  propertyId: v.id('properties'),
  unitId: v.optional(v.id('units')),
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
  photos: v.optional(v.array(v.string())),
  requestedBy: v.id('users'),
});

export const createRequestHandler = async (ctx: MutationCtx, args: Infer<typeof createRequestArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  const now = Date.now();

  // Insert request as pending first
  const requestId = await ctx.db.insert('maintenanceRequests', {
    propertyId: args.propertyId,
    unitId: args.unitId,
    requestedBy: args.requestedBy,
    requestType: args.requestType,
    priority: args.priority,
    title: args.title,
    description: args.description,
    location: args.location,
    status: 'pending',
    photos: args.photos,
    createdAt: now,
    updatedAt: now,
  });

  // Try automatic assignment to a vendor/technician associated to the property
  let assignee: Id<'users'> | undefined;

  const potentialAssignees = await ctx.db
    .query('userProperties')
    .withIndex('by_property', q => q.eq('propertyId', args.propertyId))
    .collect();

  const vendorsOrTechs = potentialAssignees.filter(up => up.role === 'vendor' || up.role === 'field_technician');

  if (vendorsOrTechs.length > 0) {
    // Select least-loaded assignee by counting active assignments
    const loads: Array<{ userId: Id<'users'>; load: number }> = [];
    for (const up of vendorsOrTechs) {
      const active = await ctx.db
        .query('maintenanceRequests')
        .withIndex('by_assigned_to', q => q.eq('assignedTo', up.userId))
        .collect();
      const activeCount = active.filter(r => r.status === 'assigned' || r.status === 'in_progress').length;
      loads.push({ userId: up.userId, load: activeCount });
    }
    loads.sort((a, b) => a.load - b.load);
    assignee = loads[0]?.userId;
  }

  if (assignee) {
    await ctx.db.patch(requestId, {
      assignedTo: assignee,
      assignedAt: now,
      status: 'assigned',
      updatedAt: now,
    });

    await ctx.db.insert('maintenanceUpdates', {
      requestId,
      propertyId: args.propertyId,
      status: 'assigned',
      description: 'Request automatically assigned',
      updatedBy: identity._id as Id<'users'>,
      timestamp: now,
    });
  }

  return { success: true, requestId, assignedTo: assignee };
};
