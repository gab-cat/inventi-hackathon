import { v, Infer } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';

export const webSubmitPollResponseArgs = v.object({
  pollId: v.id('polls'),
  selectedOptions: v.optional(v.array(v.number())),
  textResponse: v.optional(v.string()),
});

export const webSubmitPollResponseReturns = v.id('pollResponses');

export const webSubmitPollResponseHandler = async (ctx: MutationCtx, args: Infer<typeof webSubmitPollResponseArgs>) => {
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

  if (!poll.isActive) {
    throw new Error('Poll is not active');
  }

  if (poll.expiresAt && Date.now() > poll.expiresAt) {
    throw new Error('Poll has expired');
  }

  // Check if user has already responded (unless anonymous is allowed)
  if (!poll.allowAnonymous) {
    const existingResponse = await ctx.db
      .query('pollResponses')
      .withIndex('by_poll_user', (q: any) => q.eq('pollId', args.pollId).eq('userId', currentUser._id))
      .first();

    if (existingResponse) {
      throw new Error('You have already responded to this poll');
    }
  }

  return await ctx.db.insert('pollResponses', {
    pollId: args.pollId,
    userId: poll.allowAnonymous ? undefined : currentUser._id,
    selectedOptions: args.selectedOptions || [],
    textResponse: args.textResponse,
    submittedAt: Date.now(),
  });
};
