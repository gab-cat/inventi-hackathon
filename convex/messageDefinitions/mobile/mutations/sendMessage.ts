import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const mobileSendMessageArgs = v.object({
  threadId: v.id('chatThreads'),
  content: v.string(),
  messageType: v.optional(v.string()), // "text", "image", "file"
  attachments: v.optional(
    v.array(
      v.object({
        fileName: v.string(),
        fileUrl: v.string(),
        fileType: v.string(),
        fileSize: v.number(),
      })
    )
  ),
  replyTo: v.optional(v.id('messages')),
});

export const mobileSendMessageReturns = v.object({
  success: v.boolean(),
  messageId: v.optional(v.id('messages')),
  message: v.optional(v.string()),
});

export const mobileSendMessageHandler = async (ctx: any, args: any) => {
  const { threadId, content, messageType = 'text', attachments, replyTo } = args;

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

  // Validate replyTo if provided
  if (replyTo) {
    const replyMessage = await ctx.db.get(replyTo);
    if (!replyMessage || replyMessage.threadId !== threadId) {
      return {
        success: false,
        message: 'Invalid reply message',
      };
    }
  }

  const now = Date.now();

  // Create message
  const messageId = await ctx.db.insert('messages', {
    threadId,
    senderId: user._id,
    content,
    messageType,
    attachments: attachments || undefined,
    isRead: false,
    replyTo: replyTo || undefined,
    createdAt: now,
  });

  // Update thread's lastMessageAt
  await ctx.db.patch(threadId, {
    lastMessageAt: now,
    updatedAt: now,
  });

  return {
    success: true,
    messageId,
  };
};

export type MobileSendMessageArgs = typeof mobileSendMessageArgs;
export type MobileSendMessageReturns = typeof mobileSendMessageReturns;
export type MobileSendMessageHandler = typeof mobileSendMessageHandler;
