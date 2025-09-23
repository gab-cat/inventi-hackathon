import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const webDeleteMessageArgs = {
  messageId: v.id('messages'),
};

export const webDeleteMessageReturns = v.object({
  success: v.boolean(),
  message: v.string(),
});

export const webDeleteMessageHandler = async (ctx: any, args: any) => {
  const { messageId } = args;

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

  // Check if user is the sender or a manager
  const isSender = message.senderId === user._id;
  const isManager = user.role === 'manager';

  if (!isSender && !isManager) {
    throw new Error('Only the sender or a manager can delete messages');
  }

  // Check if message is already deleted
  if (message.deletedAt) {
    throw new Error('Message is already deleted');
  }

  // Soft delete the message
  await ctx.db.patch(messageId, {
    deletedAt: Date.now(),
    content: isSender ? '[Message deleted by sender]' : '[Message deleted by manager]',
  });

  return {
    success: true,
    message: 'Message deleted successfully',
  };
};

export type DeleteMessageArgs = typeof webDeleteMessageArgs;
export type DeleteMessageReturns = typeof webDeleteMessageReturns;
export type DeleteMessageHandler = typeof webDeleteMessageHandler;
