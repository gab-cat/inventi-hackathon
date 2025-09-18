import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webDeleteNoticeArgs = {
  noticeId: v.id('notices'),
} as const;

export const webDeleteNoticeReturns = v.union(
  v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  v.null()
);

type Args = {
  noticeId: Id<'notices'>;
};

export const webDeleteNoticeHandler = async (ctx: MutationCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager (admin side)
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Get the existing notice
  const existingNotice = await ctx.db.get(args.noticeId);
  if (!existingNotice) return null;

  // Verify user has access to the property
  const property = await ctx.db.get(existingNotice.propertyId);
  if (!property) throw new Error('Property not found');
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  // Delete all acknowledgments for this notice first
  const acknowledgments = await ctx.db
    .query('noticeAcknowledgments')
    .withIndex('by_notice', q => q.eq('noticeId', args.noticeId))
    .collect();

  for (const ack of acknowledgments) {
    await ctx.db.delete(ack._id);
  }

  // Delete the notice
  await ctx.db.delete(args.noticeId);

  return {
    success: true,
    message: 'Notice deleted successfully',
  };
};
