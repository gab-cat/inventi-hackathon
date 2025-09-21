import { v, Infer } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';

export const webCreatePollArgs = v.object({
  propertyId: v.id('properties'),
  title: v.string(),
  description: v.string(),
  question: v.string(),
  options: v.array(v.string()),
  pollType: v.union(v.literal('single_choice'), v.literal('multiple_choice'), v.literal('rating'), v.literal('text')),
  allowAnonymous: v.optional(v.boolean()),
  expiresAt: v.optional(v.number()),
});

export const webCreatePollReturns = v.id('polls');

export const webCreatePollHandler = async (ctx: MutationCtx, args: Infer<typeof webCreatePollArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Get current user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
    .first();

  if (!currentUser) throw new Error('User not found');

  const now = Date.now();

  return await ctx.db.insert('polls', {
    propertyId: args.propertyId,
    createdBy: currentUser._id,
    title: args.title,
    description: args.description,
    question: args.question,
    options: args.options,
    pollType: args.pollType,
    isActive: true,
    allowAnonymous: args.allowAnonymous ?? false,
    expiresAt: args.expiresAt,
    createdAt: now,
    updatedAt: now,
  });
};
