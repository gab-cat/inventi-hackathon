import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';
import { Infer, v } from 'convex/values';

export const mobileCancelVisitorRequestArgs = v.object({
  requestId: v.id('visitorRequests'),
});

export const mobileCancelVisitorRequestReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
});

export const mobileCancelVisitorRequestHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof mobileCancelVisitorRequestArgs>
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  // Get the visitor request
  const request = await ctx.db.get(args.requestId);
  if (!request) {
    return { success: false, message: 'Visitor request not found' };
  }

  // Check if user owns this request
  if (request.requestedBy !== (identity._id as Id<'users'>)) {
    return { success: false, message: 'You can only cancel your own visitor requests' };
  }

  // Check if request can be cancelled (not already checked in)
  const activeLogs = await ctx.db
    .query('visitorLogs')
    .withIndex('by_visitor_request', q => q.eq('visitorRequestId', args.requestId))
    .filter(q => q.eq(q.field('action'), 'check_in'))
    .collect();

  if (activeLogs.length > 0) {
    return { success: false, message: 'Cannot cancel request - visitor has already checked in' };
  }

  // Only allow cancellation of pending or approved requests
  if (!['pending', 'approved'].includes(request.status)) {
    return { success: false, message: 'Request cannot be cancelled at this stage' };
  }

  // Update request status
  await ctx.db.patch(args.requestId, {
    status: 'cancelled',
    updatedAt: Date.now(),
  });

  return { success: true, message: 'Visitor request cancelled successfully' };
};
