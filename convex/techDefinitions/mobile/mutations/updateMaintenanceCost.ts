import { MutationCtx } from '../../../_generated/server';
import { v, Infer } from 'convex/values';

export const updateMaintenanceCostArgs = v.object({
  requestId: v.id('maintenanceRequests'),
  materialsCost: v.optional(v.number()),
  laborHours: v.optional(v.number()),
  laborRate: v.optional(v.number()),
  notes: v.optional(v.string()),
});

export const updateMaintenanceCostReturns = v.object({
  success: v.boolean(),
  message: v.string(),
  data: v.optional(
    v.object({
      totalCost: v.number(),
      materialsCost: v.number(),
      laborCost: v.number(),
    })
  ),
});

export const updateMaintenanceCostHandler = async (ctx: MutationCtx, args: Infer<typeof updateMaintenanceCostArgs>) => {
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

  // Calculate costs
  const materialsCost = args.materialsCost || 0;
  const laborRate = args.laborRate || 0; // Default hourly rate if not provided
  const laborHours = args.laborHours || 0;
  const laborCost = laborHours * laborRate;
  const totalCost = materialsCost + laborCost;

  // Update the request with cost information
  await ctx.db.patch(args.requestId, {
    actualCost: totalCost,
    updatedAt: Date.now(),
  });

  // Create maintenance update record for cost tracking
  const description =
    args.notes ||
    `Cost updated: $${totalCost.toFixed(2)} (Materials: $${materialsCost.toFixed(2)}, Labor: $${laborCost.toFixed(2)})`;

  await ctx.db.insert('maintenanceUpdates', {
    requestId: args.requestId,
    propertyId: request.propertyId,
    status: request.status, // Keep current status
    description,
    updatedBy: me._id,
    timestamp: Date.now(),
  });

  return {
    success: true,
    message: 'Maintenance cost updated successfully',
    data: {
      totalCost,
      materialsCost,
      laborCost,
    },
  };
};
