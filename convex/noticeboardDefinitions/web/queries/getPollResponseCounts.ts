import { v, Infer } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';

export const webGetPollResponseCountsArgs = v.object({
  propertyId: v.id('properties'),
});

export const webGetPollResponseCountsReturns = v.record(v.string(), v.number());

export const webGetPollResponseCountsHandler = async (
  ctx: QueryCtx,
  args: Infer<typeof webGetPollResponseCountsArgs>
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Get current user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
    .first();

  if (!currentUser) throw new Error('User not found');

  // Get all polls for the property
  const polls = await ctx.db
    .query('polls')
    .withIndex('by_property', (q: any) => q.eq('propertyId', args.propertyId))
    .collect();

  // Get response counts for all polls
  const responseCounts: { [pollId: string]: number } = {};

  await Promise.all(
    polls.map(async poll => {
      const responses = await ctx.db
        .query('pollResponses')
        .withIndex('by_poll', (q: any) => q.eq('pollId', poll._id))
        .collect();

      responseCounts[poll._id] = responses.length;
    })
  );

  return responseCounts;
};
