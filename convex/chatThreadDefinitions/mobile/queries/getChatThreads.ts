import { query } from '../../../_generated/server';
import { v } from 'convex/values';

export const mobileGetChatThreadsArgs = v.object({
  propertyId: v.optional(v.id('properties')),
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
});

export const mobileGetChatThreadsReturns = v.object({
  threads: v.array(
    v.object({
      _id: v.id('chatThreads'),
      _creationTime: v.number(),
      threadType: v.string(),
      title: v.optional(v.string()),
      participants: v.array(v.id('users')),
      lastMessageAt: v.optional(v.number()),
      isArchived: v.boolean(),
      priority: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      // Last message preview
      lastMessage: v.optional(
        v.object({
          content: v.string(),
          messageType: v.string(),
          senderId: v.id('users'),
          createdAt: v.number(),
        })
      ),
      // Unread count for current user
      unreadCount: v.number(),
      // Other participants (excluding current user)
      otherParticipants: v.array(
        v.object({
          _id: v.id('users'),
          firstName: v.string(),
          lastName: v.string(),
          email: v.string(),
          role: v.string(),
          profileImage: v.optional(v.string()),
        })
      ),
    })
  ),
  hasMore: v.boolean(),
  nextCursor: v.optional(v.string()),
});

export const mobileGetChatThreadsHandler = async (ctx: any, args: any) => {
  const { propertyId, limit = 20, cursor } = args;

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

  // Get threads where user is a participant
  let query = ctx.db
    .query('chatThreads')
    .filter((q: any) => q.eq(q.field('isArchived'), false))
    .filter((q: any) => q.neq(q.field('threadType'), 'maintenance')) // Exclude maintenance threads from mobile
    .filter((q: any) => q.neq(q.field('threadType'), 'emergency')); // Exclude emergency threads from mobile

  if (propertyId) {
    query = query.filter((q: any) => q.eq(q.field('propertyId'), propertyId));
  }

  if (cursor) {
    query = query.filter((q: any) => q.lt(q.field('lastMessageAt') || q.field('createdAt'), parseInt(cursor)));
  }

  const threads = await query.order('desc').take(limit + 1);
  const hasMore = threads.length > limit;
  const threadsToReturn = hasMore ? threads.slice(0, limit) : threads;

  // Filter threads where user is a participant and enrich with data
  const enrichedThreads = await Promise.all(
    threadsToReturn
      .filter((thread: any) => thread.participants.includes(user._id))
      .map(async (thread: any) => {
        // Get last message
        const lastMessage = await ctx.db
          .query('messages')
          .withIndex('by_thread', (q: any) => q.eq('threadId', thread._id))
          .filter((q: any) => q.eq(q.field('deletedAt'), undefined))
          .order('desc')
          .first();

        // Get unread count
        const unreadCount = await ctx.db
          .query('messages')
          .withIndex('by_thread', (q: any) => q.eq('threadId', thread._id))
          .filter((q: any) => q.eq(q.field('isRead'), false))
          .filter((q: any) => q.neq(q.field('senderId'), user._id))
          .collect();

        // Get other participants
        const otherParticipants = await Promise.all(
          thread.participants
            .filter((participantId: any) => participantId !== user._id)
            .map(async (participantId: any) => {
              const participant = await ctx.db.get(participantId);
              return participant
                ? {
                    _id: participant._id,
                    firstName: participant.firstName,
                    lastName: participant.lastName,
                    email: participant.email,
                    role: participant.role,
                    profileImage: participant.profileImage,
                  }
                : null;
            })
        );

        return {
          _id: thread._id,
          _creationTime: thread._creationTime,
          threadType: thread.threadType,
          title: thread.title,
          participants: thread.participants,
          lastMessageAt: thread.lastMessageAt,
          isArchived: thread.isArchived,
          priority: thread.priority,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                messageType: lastMessage.messageType,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt,
              }
            : undefined,
          unreadCount: unreadCount.length,
          otherParticipants: otherParticipants.filter(Boolean),
        };
      })
  );

  const nextCursor = hasMore
    ? (
        threadsToReturn[threadsToReturn.length - 1].lastMessageAt ||
        threadsToReturn[threadsToReturn.length - 1].createdAt
      ).toString()
    : undefined;

  return {
    threads: enrichedThreads,
    hasMore,
    nextCursor,
  };
};

export type MobileGetChatThreadsArgs = typeof mobileGetChatThreadsArgs;
export type MobileGetChatThreadsReturns = typeof mobileGetChatThreadsReturns;
export type MobileGetChatThreadsHandler = typeof mobileGetChatThreadsHandler;
