import { query } from '../../../_generated/server';
import { v } from 'convex/values';

export const mobileGetMessagesByThreadIdArgs = v.object({
  threadId: v.id('chatThreads'),
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
});

export const mobileGetMessagesByThreadIdReturns = v.object({
  messages: v.array(
    v.object({
      _id: v.id('messages'),
      _creationTime: v.number(),
      threadId: v.id('chatThreads'),
      senderId: v.id('users'),
      content: v.string(),
      messageType: v.string(),
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
      isRead: v.boolean(),
      readBy: v.optional(
        v.array(
          v.object({
            userId: v.id('users'),
            readAt: v.number(),
          })
        )
      ),
      replyTo: v.optional(v.id('messages')),
      editedAt: v.optional(v.number()),
      deletedAt: v.optional(v.number()),
      createdAt: v.number(),
      // Joined data
      sender: v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
        role: v.string(),
        profileImage: v.optional(v.string()),
      }),
      replyToMessage: v.optional(
        v.object({
          _id: v.id('messages'),
          content: v.string(),
          sender: v.object({
            firstName: v.string(),
            lastName: v.string(),
          }),
        })
      ),
    })
  ),
  hasMore: v.boolean(),
  nextCursor: v.optional(v.string()),
});

export const mobileGetMessagesByThreadIdHandler = async (ctx: any, args: any) => {
  const { threadId, limit = 50, cursor } = args;

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

  // Get messages
  let query = ctx.db
    .query('messages')
    .withIndex('by_thread', (q: any) => q.eq('threadId', threadId))
    .filter((q: any) => q.eq(q.field('deletedAt'), undefined));

  if (cursor) {
    query = query.filter((q: any) => q.lt(q.field('createdAt'), parseInt(cursor)));
  }

  const messages = await query.order('desc').take(limit + 1);
  const hasMore = messages.length > limit;
  const messagesToReturn = hasMore ? messages.slice(0, limit) : messages;

  // Get sender details and reply information
  const messagesWithDetails = await Promise.all(
    messagesToReturn.map(async (message: any) => {
      const sender = await ctx.db.get(message.senderId);
      if (!sender) {
        throw new Error('Sender not found');
      }

      let replyToMessage = undefined;
      if (message.replyTo) {
        const replyMsg = await ctx.db.get(message.replyTo);
        if (replyMsg) {
          const replySender = await ctx.db.get(replyMsg.senderId);
          replyToMessage = {
            _id: replyMsg._id,
            content: replyMsg.content,
            sender: {
              firstName: replySender?.firstName || 'Unknown',
              lastName: replySender?.lastName || 'User',
            },
          };
        }
      }

      return {
        ...message,
        sender: {
          _id: sender._id,
          firstName: sender.firstName,
          lastName: sender.lastName,
          email: sender.email,
          role: sender.role,
          profileImage: sender.profileImage,
        },
        replyToMessage,
      };
    })
  );

  const nextCursor = hasMore ? messagesToReturn[messagesToReturn.length - 1].createdAt.toString() : undefined;

  return {
    messages: messagesWithDetails.reverse(), // Reverse to show oldest first
    hasMore,
    nextCursor,
  };
};

export type MobileGetMessagesByThreadIdArgs = typeof mobileGetMessagesByThreadIdArgs;
export type MobileGetMessagesByThreadIdReturns = typeof mobileGetMessagesByThreadIdReturns;
export type MobileGetMessagesByThreadIdHandler = typeof mobileGetMessagesByThreadIdHandler;
