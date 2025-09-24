import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const webEditMessageArgs = {
  messageId: v.id('messages'),
  content: v.string(),
};

export const webEditMessageReturns = v.object({
  success: v.boolean(),
  message: v.string(),
});

export const webEditMessageHandler = async (ctx: any, args: any) => {
  const { messageId, content } = args;

  // Get current user
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Not authenticated');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
    .first();

  if (!user) {
    throw new Error('User not found');
  }

  // Get message
  const message = await ctx.db.get(messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  // Check if user is the sender
  if (message.senderId !== user._id) {
    throw new Error('Only the sender can edit their message');
  }

  // Check if message is not deleted
  if (message.deletedAt) {
    throw new Error('Cannot edit deleted message');
  }

  // Check if message is not too old (e.g., 24 hours)
  const maxEditTime = 24 * 60 * 60 * 1000; // 24 hours
  if (Date.now() - message.createdAt > maxEditTime) {
    throw new Error('Message is too old to edit');
  }

  // Update message
  await ctx.db.patch(messageId, {
    content,
    editedAt: Date.now(),
  });

  return {
    success: true,
    message: 'Message edited successfully',
  };
};

export type EditMessageArgs = typeof webEditMessageArgs;
export type EditMessageReturns = typeof webEditMessageReturns;
export type EditMessageHandler = typeof webEditMessageHandler;
