import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webAcknowledgeNoticeArgs = {
  noticeId: v.id('notices'),
} as const;

export const webAcknowledgeNoticeReturns = v.union(
  v.object({
    _id: v.id('noticeAcknowledgments'),
    _creationTime: v.number(),
    noticeId: v.id('notices'),
    userId: v.id('users'),
    acknowledgedAt: v.number(),
  }),
  v.null()
);

type Args = {
  noticeId: Id<'notices'>;
};

export const webAcknowledgeNoticeHandler = async (ctx: MutationCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Get current user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) throw new Error('User not found');

  // Verify the notice exists
  const notice = await ctx.db.get(args.noticeId);
  if (!notice) return null;

  // Check if user has already acknowledged this notice
  const existingAck = await ctx.db
    .query('noticeAcknowledgments')
    .withIndex('by_notice_user', q => q.eq('noticeId', args.noticeId).eq('userId', currentUser._id))
    .unique();

  if (existingAck) {
    // Return existing acknowledgment
    return existingAck;
  }

  // Create new acknowledgment
  const acknowledgmentId = await ctx.db.insert('noticeAcknowledgments', {
    noticeId: args.noticeId,
    userId: currentUser._id,
    acknowledgedAt: Date.now(),
  });

  // Return the created acknowledgment
  const createdAck = await ctx.db.get(acknowledgmentId);
  if (!createdAck) throw new Error('Failed to create acknowledgment');

  return createdAck;
};
