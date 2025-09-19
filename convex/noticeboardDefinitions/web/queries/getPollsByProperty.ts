import { v, Infer } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';

export const webGetPollsByPropertyArgs = v.object({
  propertyId: v.id('properties'),
});

export const webGetPollsByPropertyReturns = v.array(
  v.object({
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
  })
);

export const webGetPollsByPropertyHandler = async (ctx: QueryCtx, args: Infer<typeof webGetPollsByPropertyArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Get current user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
    .first();

  if (!currentUser) throw new Error('User not found');

  const polls = await ctx.db
    .query('polls')
    .withIndex('by_property', (q: any) => q.eq('propertyId', args.propertyId))
    .order('desc')
    .collect();

  // Get creator information for each poll
  const pollsWithCreator = await Promise.all(
    polls.map(async poll => {
      const creator = await ctx.db.get(poll.createdBy);
      return {
        ...poll,
        pollType: poll.pollType as 'single_choice' | 'multiple_choice' | 'rating' | 'text',
        creatorName: creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown',
        creatorEmail: creator?.email || 'Unknown',
      };
    })
  );

  return pollsWithCreator;
};
