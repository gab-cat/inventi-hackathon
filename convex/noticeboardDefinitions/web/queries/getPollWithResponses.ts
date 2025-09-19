import { v, Infer } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';

export const webGetPollWithResponsesArgs = v.object({
  pollId: v.id('polls'),
});

export const webGetPollWithResponsesReturns = v.object({
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
  // Denormalized fields
  creatorName: v.string(),
  creatorEmail: v.string(),
  responses: v.array(
    v.object({
      _id: v.id('pollResponses'),
      _creationTime: v.number(),
      pollId: v.id('polls'),
      userId: v.optional(v.id('users')),
      selectedOptions: v.array(v.number()),
      textResponse: v.optional(v.string()),
      submittedAt: v.number(),
      // Denormalized fields
      userName: v.string(),
      userEmail: v.string(),
    })
  ),
});

export const webGetPollWithResponsesHandler = async (
  ctx: QueryCtx,
  args: Infer<typeof webGetPollWithResponsesArgs>
) => {
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

  const creator = await ctx.db.get(poll.createdBy);
  const responses = await ctx.db
    .query('pollResponses')
    .withIndex('by_poll', (q: any) => q.eq('pollId', args.pollId))
    .collect();

  // Get user information for responses
  const responsesWithUsers = await Promise.all(
    responses.map(async response => {
      if (response.userId) {
        const user = await ctx.db.get(response.userId);
        return {
          ...response,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          userEmail: user?.email || 'Unknown',
        };
      }
      return {
        ...response,
        userName: 'Anonymous',
        userEmail: 'Anonymous',
      };
    })
  );

  return {
    ...poll,
    pollType: poll.pollType as 'single_choice' | 'multiple_choice' | 'rating' | 'text',
    creatorName: creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown',
    creatorEmail: creator?.email || 'Unknown',
    responses: responsesWithUsers,
  };
};
