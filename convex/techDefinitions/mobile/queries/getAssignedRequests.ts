import { QueryCtx } from '../../../_generated/server';
import { v, Infer } from 'convex/values';

export const getAssignedRequestsArgs = v.object({
  status: v.optional(v.string()),
  priority: v.optional(v.string()),
});

export const getAssignedRequestsReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
  data: v.optional(
    v.array(
      v.object({
        _id: v.id('maintenanceRequests'),
        propertyId: v.id('properties'),
        unitId: v.optional(v.id('units')),
        requestedBy: v.id('users'),
        requestType: v.string(),
        priority: v.string(),
        title: v.string(),
        description: v.string(),
        location: v.string(),
        status: v.string(),
        assignedAt: v.optional(v.number()),
        estimatedCost: v.optional(v.number()),
        actualCost: v.optional(v.number()),
        estimatedCompletion: v.optional(v.number()),
        actualCompletion: v.optional(v.number()),
        photos: v.optional(v.array(v.string())),
        tenantApproval: v.optional(v.boolean()),
        createdAt: v.number(),
        updatedAt: v.number(),
        // Enriched data
        propertyName: v.string(),
        unitNumber: v.optional(v.string()),
        requesterName: v.string(),
      })
    )
  ),
});

export const getAssignedRequestsHandler = async (ctx: QueryCtx, args: Infer<typeof getAssignedRequestsArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  const me = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('clerkId'), identity.subject))
    .first();
  if (!me) {
    return { success: false, message: 'User not found' };
  }

  if (me.role !== 'field_technician') {
    return { success: false, message: 'Access denied. Field technician role required.' };
  }

  // Build query for assigned requests
  let requestQuery = ctx.db.query('maintenanceRequests').withIndex('by_assigned_to', q => q.eq('assignedTo', me._id));

  // Filter by status if provided
  if (args.status) {
    requestQuery = requestQuery.filter(q => q.eq(q.field('status'), args.status));
  }

  // Filter by priority if provided
  if (args.priority) {
    requestQuery = requestQuery.filter(q => q.eq(q.field('priority'), args.priority));
  }

  const requests = await requestQuery.collect();

  // Enrich with property, unit, and requester information
  const enrichedRequests = await Promise.all(
    requests.map(async request => {
      const property = await ctx.db.get(request.propertyId);
      const unit = request.unitId ? await ctx.db.get(request.unitId) : null;
      const requester = await ctx.db.get(request.requestedBy);

      return {
        ...request,
        propertyName: property?.name || 'Unknown Property',
        unitNumber: unit?.unitNumber,
        requesterName: requester ? `${requester.firstName} ${requester.lastName}` : 'Unknown User',
      };
    })
  );

  return {
    success: true,
    data: enrichedRequests,
  };
};
