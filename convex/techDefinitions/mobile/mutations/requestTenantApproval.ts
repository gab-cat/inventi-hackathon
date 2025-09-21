import { MutationCtx } from '../../../_generated/server';
import { v, Infer } from 'convex/values';

export const requestTenantApprovalArgs = v.object({
  requestId: v.id('maintenanceRequests'),
  message: v.optional(v.string()),
});

export const requestTenantApprovalReturns = v.object({
  success: v.boolean(),
  message: v.string(),
});

export const requestTenantApprovalHandler = async (ctx: MutationCtx, args: Infer<typeof requestTenantApprovalArgs>) => {
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

  // Check if the request is in completed status
  if (request.status !== 'completed') {
    return { success: false, message: 'Can only request tenant approval for completed requests' };
  }

  // Check if tenant approval has already been requested
  if (request.tenantApproval !== undefined) {
    return { success: false, message: 'Tenant approval has already been processed' };
  }

  // Set tenant approval to pending (null means pending, true/false means approved/denied)
  await ctx.db.patch(args.requestId, {
    tenantApproval: undefined, // Pending state
    updatedAt: Date.now(),
  });

  // Create maintenance update record for tenant approval request
  const description = args.message || 'Tenant approval requested for completed maintenance work';

  await ctx.db.insert('maintenanceUpdates', {
    requestId: args.requestId,
    propertyId: request.propertyId,
    status: 'completed', // Keep completed status
    description,
    updatedBy: me._id,
    timestamp: Date.now(),
  });

  // TODO: Here you would typically send a notification to the tenant
  // This could be implemented by creating a notification record or sending an email

  return {
    success: true,
    message: 'Tenant approval requested successfully',
  };
};
