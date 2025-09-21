import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webApproveVisitorRequestArgs = {
  visitorRequestId: v.id('visitorRequests'),
} as const;

export const webApproveVisitorRequestReturns = v.object({
  success: v.boolean(),
});

type Args = {
  visitorRequestId: Id<'visitorRequests'>;
};

export const webApproveVisitorRequestHandler = async (ctx: MutationCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Not authenticated');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  if (user.role !== 'manager') {
    throw new Error('Only managers can approve visitor requests');
  }

  const visitorRequest = await ctx.db.get(args.visitorRequestId);
  if (!visitorRequest) {
    throw new Error('Visitor request not found');
  }

  if (visitorRequest.status !== 'pending') {
    throw new Error('Visitor request is not pending');
  }

  await ctx.db.patch(args.visitorRequestId, {
    status: 'approved',
    approvedBy: user._id,
    approvedAt: Date.now(),
    updatedAt: Date.now(),
  });

  return { success: true };
};
