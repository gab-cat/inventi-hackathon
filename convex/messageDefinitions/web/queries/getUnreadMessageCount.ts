import { query } from '../../../_generated/server';
import { v } from 'convex/values';

export const webGetUnreadMessageCountArgs = {
  propertyId: v.optional(v.id('properties')),
  threadId: v.optional(v.id('chatThreads')),
};

export const webGetUnreadMessageCountReturns = v.object({
  totalUnread: v.number(),
  unreadByThread: v.array(
    v.object({
      threadId: v.id('chatThreads'),
      threadTitle: v.optional(v.string()),
      unreadCount: v.number(),
    })
  ),
});

export const webGetUnreadMessageCountHandler = async (ctx: any, args: any) => {
  const { propertyId, threadId } = args;

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

  let threads: any[] = [];

  if (threadId) {
    // Get unread count for specific thread
    const thread = await ctx.db.get(threadId);
    if (thread && thread.participants.includes(user._id)) {
      threads = [thread];
    }
  } else if (propertyId) {
    // Get unread count for all threads in property
    const userProperty = await ctx.db
      .query('userProperties')
      .withIndex('by_user_property', (q: any) => q.eq('userId', user._id).eq('propertyId', propertyId))
      .first();

    if (!userProperty && user.role !== 'manager') {
      throw new Error('Access denied');
    }

    threads = await ctx.db
      .query('chatThreads')
      .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
      .filter((q: any) => q.eq(q.field('participants'), user._id))
      .collect();
  } else {
    // Get unread count for all threads user participates in
    threads = await ctx.db
      .query('chatThreads')
      .filter((q: any) => q.eq(q.field('participants'), user._id))
      .collect();
  }

  let totalUnread = 0;
  const unreadByThread = [];

  for (const thread of threads) {
    const unreadMessages = await ctx.db
      .query('messages')
      .withIndex('by_thread', (q: any) => q.eq('threadId', thread._id))
      .filter((q: any) =>
        q.and(
          q.eq(q.field('isRead'), false),
          q.neq(q.field('senderId'), user._id),
          q.eq(q.field('deletedAt'), undefined)
        )
      )
      .collect();

    const unreadCount = unreadMessages.length;
    totalUnread += unreadCount;

    if (unreadCount > 0) {
      unreadByThread.push({
        threadId: thread._id,
        threadTitle: thread.title,
        unreadCount,
      });
    }
  }

  return {
    totalUnread,
    unreadByThread,
  };
};

export type GetUnreadMessageCountArgs = typeof webGetUnreadMessageCountArgs;
export type GetUnreadMessageCountReturns = typeof webGetUnreadMessageCountReturns;
export type GetUnreadMessageCountHandler = typeof webGetUnreadMessageCountHandler;
