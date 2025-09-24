import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const webSendMessageArgs = {
  threadId: v.id('chatThreads'),
  content: v.string(),
  messageType: v.union(v.literal('text'), v.literal('image'), v.literal('file'), v.literal('system')),
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
};

export const webSendMessageReturns = v.object({
  success: v.boolean(),
  message: v.string(),
  messageId: v.id('messages'),
});

export const webSendMessageHandler = async (ctx: any, args: any) => {
  const { threadId, content, messageType, attachments, replyTo } = args;

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

  // Get thread and check access
  const thread = await ctx.db.get(threadId);
  if (!thread) {
    throw new Error('Thread not found');
  }

  if (!thread.participants.includes(user._id)) {
    throw new Error('Access denied');
  }

  // Validate replyTo message if provided
  if (replyTo) {
    const replyMessage = await ctx.db.get(replyTo);
    if (!replyMessage || replyMessage.threadId !== threadId) {
      throw new Error('Invalid reply message');
    }
  }

  // Create message
  const messageId = await ctx.db.insert('messages', {
    threadId,
    senderId: user._id,
    content,
    messageType,
    attachments,
    isRead: false,
    replyTo,
    createdAt: Date.now(),
  });

  // Update thread with last message time
  await ctx.db.patch(threadId, {
    lastMessageAt: Date.now(),
    updatedAt: Date.now(),
  });

  return {
    success: true,
    message: 'Message sent successfully',
    messageId,
  };
};

export type SendMessageArgs = typeof webSendMessageArgs;
export type SendMessageReturns = typeof webSendMessageReturns;
export type SendMessageHandler = typeof webSendMessageHandler;
