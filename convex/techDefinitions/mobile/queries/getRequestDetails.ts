import { QueryCtx } from '../../../_generated/server';
import { v, Infer } from 'convex/values';

export const getRequestDetailsArgs = v.object({
  requestId: v.id('maintenanceRequests'),
});

export const getRequestDetailsReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
  data: v.optional(
    v.object({
      request: v.object({
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
        // Enriched data
        propertyName: v.string(),
        unitNumber: v.optional(v.string()),
        requesterName: v.string(),
        requesterPhone: v.optional(v.string()),
        requesterEmail: v.string(),
        assignedToName: v.optional(v.string()),
      }),
      updates: v.array(
        v.object({
          _id: v.id('maintenanceUpdates'),
          status: v.string(),
          description: v.string(),
          updatedBy: v.id('users'),
          photos: v.optional(v.array(v.string())),
          timestamp: v.number(),
          updatedByName: v.string(),
        })
      ),
    })
  ),
});

export const getRequestDetailsHandler = async (ctx: QueryCtx, args: Infer<typeof getRequestDetailsArgs>) => {
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

  // Get the request
  const request = await ctx.db.get(args.requestId);
  if (!request) {
    return { success: false, message: 'Request not found' };
  }

  // Check if the request is assigned to this technician
  if (request.assignedTo !== me._id) {
    return { success: false, message: 'Access denied. Request not assigned to you.' };
  }

  // Get related data
  const property = await ctx.db.get(request.propertyId);
  const unit = request.unitId ? await ctx.db.get(request.unitId) : null;
  const requester = await ctx.db.get(request.requestedBy);
  const assignedTo = request.assignedTo ? await ctx.db.get(request.assignedTo) : null;

  // Get maintenance updates
  const updates = await ctx.db
    .query('maintenanceUpdates')
    .withIndex('by_request', q => q.eq('requestId', args.requestId))
    .order('desc')
    .collect();

  // Enrich updates with user names
  const enrichedUpdates = await Promise.all(
    updates.map(async update => {
      const updatedBy = await ctx.db.get(update.updatedBy);
      return {
        ...update,
        updatedByName: updatedBy ? `${updatedBy.firstName} ${updatedBy.lastName}` : 'Unknown User',
      };
    })
  );

  const enrichedRequest = {
    ...request,
    propertyName: property?.name || 'Unknown Property',
    unitNumber: unit?.unitNumber,
    requesterName: requester ? `${requester.firstName} ${requester.lastName}` : 'Unknown User',
    requesterPhone: requester?.phone,
    requesterEmail: requester?.email || '',
    assignedToName: assignedTo ? `${assignedTo.firstName} ${assignedTo.lastName}` : undefined,
  };

  return {
    success: true,
    data: {
      request: enrichedRequest,
      updates: enrichedUpdates,
    },
  };
};
