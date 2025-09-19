import { v, Infer } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';

export const webUpdatePollArgs = v.object({
  pollId: v.id('polls'),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  question: v.optional(v.string()),
  options: v.optional(v.array(v.string())),
  pollType: v.optional(v.union(v.literal('single_choice'), v.literal('multiple_choice'), v.literal('rating'), v.literal('text'))),
  allowAnonymous: v.optional(v.boolean()),
  expiresAt: v.optional(v.number()),
  isActive: v.optional(v.boolean()),
});

export const webUpdatePollReturns = v.id('polls');

export const webUpdatePollHandler = async (ctx: MutationCtx, args: Infer<typeof webUpdatePollArgs>) => {
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
    throw new Error('Not authorized to update this poll');
  }

  const updateData: any = {
    updatedAt: Date.now(),
  };

  if (args.title !== undefined) updateData.title = args.title;
  if (args.description !== undefined) updateData.description = args.description;
  if (args.question !== undefined) updateData.question = args.question;
  if (args.options !== undefined) updateData.options = args.options;
  if (args.pollType !== undefined) updateData.pollType = args.pollType;
  if (args.allowAnonymous !== undefined) updateData.allowAnonymous = args.allowAnonymous;
  if (args.expiresAt !== undefined) updateData.expiresAt = args.expiresAt;
  if (args.isActive !== undefined) updateData.isActive = args.isActive;

  await ctx.db.patch(args.pollId, updateData);
  return args.pollId;
};
