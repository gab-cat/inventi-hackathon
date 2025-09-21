import { v, Infer } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';

export const webGetPollStatsArgs = v.object({
  pollId: v.id('polls'),
});

export const webGetPollStatsReturns = v.object({
  totalResponses: v.number(),
  optionCounts: v.record(v.string(), v.number()),
  textResponses: v.array(v.string()),
  poll: v.object({
    _id: v.id('polls'),
    _creationTime: v.number(),
    propertyId: v.id('properties'),
    createdBy: v.id('users'),
    title: v.string(),
    description: v.string(),
    question: v.string(),
    options: v.array(v.string()),
    pollType: v.union(v.literal('single_choice'), v.literal('multiple_choice'), v.literal('rating'), v.literal('text')),
    isActive: v.boolean(),
    allowAnonymous: v.boolean(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});

export const webGetPollStatsHandler = async (ctx: QueryCtx, args: Infer<typeof webGetPollStatsArgs>) => {
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

  const responses = await ctx.db
    .query('pollResponses')
    .withIndex('by_poll', (q: any) => q.eq('pollId', args.pollId))
    .collect();

  const totalResponses = responses.length;
  const optionCounts: { [key: string]: number } = {};
  const textResponses: string[] = [];

  responses.forEach(response => {
    if (response.selectedOptions) {
      response.selectedOptions.forEach(optionIndex => {
        optionCounts[optionIndex.toString()] = (optionCounts[optionIndex.toString()] || 0) + 1;
      });
    }
    if (response.textResponse) {
      textResponses.push(response.textResponse);
    }
  });

  return {
    totalResponses,
    optionCounts,
    textResponses,
    poll: {
      ...poll,
      pollType: poll.pollType as 'single_choice' | 'multiple_choice' | 'rating' | 'text',
    },
  };
};
