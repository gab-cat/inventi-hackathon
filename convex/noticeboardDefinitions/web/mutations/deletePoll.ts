import { v, Infer } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';

export const webDeletePollArgs = v.object({
  pollId: v.id('polls'),
});

export const webDeletePollReturns = v.id('polls');

export const webDeletePollHandler = async (ctx: MutationCtx, args: Infer<typeof webDeletePollArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Get current user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
    .first();

  if (!currentUser) throw new Error('User not found');

  const poll = await ctx.db.get(args.pollId);
  if (!poll) {
    throw new Error('Poll not found');
  }

  if (poll.createdBy !== currentUser._id) {
    throw new Error('Not authorized to delete this poll');
  }

  // Delete all poll responses first
  const responses = await ctx.db
    .query('pollResponses')
    .withIndex('by_poll', (q: any) => q.eq('pollId', args.pollId))
    .collect();

  for (const response of responses) {
    await ctx.db.delete(response._id);
  }

  // Delete the poll
  await ctx.db.delete(args.pollId);
  return args.pollId;
};
