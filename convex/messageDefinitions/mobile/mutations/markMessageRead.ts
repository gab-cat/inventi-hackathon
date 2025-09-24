import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const mobileMarkMessageReadArgs = v.object({
  threadId: v.id('chatThreads'),
  messageIds: v.array(v.id('messages')),
});

export const mobileMarkMessageReadReturns = v.object({
  success: v.boolean(),
  markedCount: v.optional(v.number()),
  message: v.optional(v.string()),
});

export const mobileMarkMessageReadHandler = async (ctx: any, args: any) => {
  const { threadId, messageIds } = args;

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

  // Validate thread exists and user has access
  const thread = await ctx.db.get(threadId);
  if (!thread) {
    return {
      success: false,
      message: 'Thread not found',
    };
  }

  if (!thread.participants.includes(user._id)) {
    return {
      success: false,
      message: 'Access denied',
    };
  }

  const now = Date.now();
  let markedCount = 0;

  // Mark each message as read if it's not from the current user
  for (const messageId of messageIds) {
    const message = await ctx.db.get(messageId);
    if (message && message.threadId === threadId && message.senderId !== user._id && !message.isRead) {
      // Update read status
      await ctx.db.patch(messageId, {
        isRead: true,
        readBy: [
          ...(message.readBy || []),
          {
            userId: user._id,
            readAt: now,
          },
        ],
      });
      markedCount++;
    }
  }

  return {
    success: true,
    markedCount,
  };
};

export type MobileMarkMessageReadArgs = typeof mobileMarkMessageReadArgs;
export type MobileMarkMessageReadReturns = typeof mobileMarkMessageReadReturns;
export type MobileMarkMessageReadHandler = typeof mobileMarkMessageReadHandler;
