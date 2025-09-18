import { MutationCtx } from '../../../_generated/server';
import { Doc } from '../../../_generated/dataModel';
import { Infer, v } from 'convex/values';

export const tenantConfirmCompletionArgs = v.object({
  requestId: v.id('maintenanceRequests'),
  rating: v.optional(v.number()), // 1-5 star rating
  feedback: v.optional(v.string()), // Optional feedback
});

export const tenantConfirmCompletionHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof tenantConfirmCompletionArgs>
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return { success: false, message: 'User not authenticated' };

  const request = await ctx.db.get(args.requestId);
  if (!request) return { success: false, message: 'Request not found' };

  const me = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('clerkId'), identity.subject))
    .first();
  if (!me) return { success: false, message: 'User not found' };
  const isRequester = request.requestedBy === me._id;

  // Only the original requester can confirm completion
  if (!isRequester) {
    return { success: false, message: 'Only the request creator can confirm completion' };
  }

  // Can only confirm if request is in_progress or completed (technician marked as done)
  if (!['in_progress', 'completed'].includes(request.status)) {
    return { success: false, message: 'Request must be in progress or completed to confirm' };
  }

  const patch: Partial<Doc<'maintenanceRequests'>> = {
    tenantApproval: true,
    tenantApprovalAt: Date.now(),
    updatedAt: Date.now(),
  };

  await ctx.db.patch(args.requestId, patch);

  // Create an update log entry
  await ctx.db.insert('maintenanceUpdates', {
    requestId: args.requestId,
    propertyId: request.propertyId,
    status: request.status,
    description: 'Tenant confirmed completion',
    updatedBy: me._id,
    timestamp: Date.now(),
  });

  return { success: true };
};
