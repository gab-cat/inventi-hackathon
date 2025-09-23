import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const webMarkMessageReadArgs = {
  messageId: v.optional(v.id('messages')), // Optional when marking all messages in thread as read
  threadId: v.optional(v.id('chatThreads')), // Optional for marking all messages in thread as read
};

export const webMarkMessageReadReturns = v.object({
  success: v.boolean(),
  message: v.string(),
  markedCount: v.number(),
});

export const webMarkMessageReadHandler = async (ctx: any, args: any) => {
  const { messageId, threadId } = args;

  // Validate that at least one parameter is provided
  if (!messageId && !threadId) {
    throw new Error('Either messageId or threadId must be provided');
  }

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

  let markedCount = 0;

  if (threadId) {
    // Mark all unread messages in thread as read
    const thread = await ctx.db.get(threadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    if (!thread.participants.includes(user._id)) {
      throw new Error('Access denied');
    }

    const unreadMessages = await ctx.db
      .query('messages')
      .withIndex('by_thread', (q: any) => q.eq('threadId', threadId))
      .filter((q: any) =>
        q.and(
          q.eq(q.field('isRead'), false),
          q.neq(q.field('senderId'), user._id),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .collect();

    for (const message of unreadMessages) {
      const readBy = message.readBy || [];
      const existingRead = readBy.find((r: any) => r.userId === user._id);

      if (!existingRead) {
        readBy.push({
          userId: user._id,
          readAt: Date.now(),
        });
      }

      await ctx.db.patch(message._id, {
        isRead: true,
        readBy,
      });

      markedCount++;
    }
  } else {
    // Mark specific message as read
    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user has access to the thread
    const thread = await ctx.db.get(message.threadId);
    if (!thread || !thread.participants.includes(user._id)) {
      throw new Error('Access denied');
    }

    // Don't mark own messages as read
    if (message.senderId === user._id) {
      return {
        success: true,
        message: 'Cannot mark own message as read',
        markedCount: 0,
      };
    }

    const readBy = message.readBy || [];
    const existingRead = readBy.find((r: any) => r.userId === user._id);

    if (!existingRead) {
      readBy.push({
        userId: user._id,
        readAt: Date.now(),
      });
    }

    await ctx.db.patch(messageId, {
      isRead: true,
      readBy,
    });

    markedCount = 1;
  }

  return {
    success: true,
    message: `${markedCount} message(s) marked as read`,
    markedCount,
  };
};

export type MarkMessageReadArgs = typeof webMarkMessageReadArgs;
export type MarkMessageReadReturns = typeof webMarkMessageReadReturns;
export type MarkMessageReadHandler = typeof webMarkMessageReadHandler;
