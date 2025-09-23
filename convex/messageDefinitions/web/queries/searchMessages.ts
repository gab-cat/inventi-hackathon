import { query } from '../../../_generated/server';
import { v } from 'convex/values';

export const webSearchMessagesArgs = {
  propertyId: v.id('properties'),
  searchTerm: v.string(),
  threadId: v.optional(v.id('chatThreads')),
  messageType: v.optional(v.string()),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  limit: v.optional(v.number()),
};

export const webSearchMessagesReturns = v.array(
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
    createdAt: v.number(),
    // Joined data
    sender: v.object({
      _id: v.id('users'),
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      role: v.string(),
    }),
    thread: v.object({
      _id: v.id('chatThreads'),
      title: v.optional(v.string()),
      threadType: v.string(),
    }),
  })
);

export const webSearchMessagesHandler = async (ctx: any, args: any) => {
  const { propertyId, searchTerm, threadId, messageType, startDate, endDate, limit = 50 } = args;

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

  // Check if user has access to this property
  const userProperty = await ctx.db
    .query('userProperties')
    .withIndex('by_user_property', (q: any) => q.eq('userId', user._id).eq('propertyId', propertyId))
    .first();

  if (!userProperty && user.role !== 'manager') {
    throw new Error('Access denied');
  }

  // Get threads user has access to
  let threads: any[] = [];
  if (threadId) {
    const thread = await ctx.db.get(threadId);
    if (thread && thread.participants.includes(user._id)) {
      threads = [thread];
    }
  } else {
    threads = await ctx.db
      .query('chatThreads')
      .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
      .filter((q: any) => q.eq(q.field('participants'), user._id))
      .collect();
  }

  const threadIds = threads.map((t: any) => t._id);

  if (threadIds.length === 0) {
    return [];
  }

  // Search messages
  let query = ctx.db.query('messages');

  // Filter by thread IDs
  query = query.filter((q: any) => q.or(...threadIds.map((id: any) => q.eq(q.field('threadId'), id))));

  // Filter by search term (case-insensitive)
  if (searchTerm) {
    query = query.filter((q: any) =>
      q.or(
        q.eq(q.field('content'), searchTerm) // Exact match
        // Note: Convex doesn't support case-insensitive search natively
        // This is a simplified implementation
      )
    );
  }

  // Filter by message type
  if (messageType) {
    query = query.filter((q: any) => q.eq(q.field('messageType'), messageType));
  }

  // Filter by date range
  if (startDate) {
    query = query.filter((q: any) => q.gte(q.field('createdAt'), startDate));
  }
  if (endDate) {
    query = query.filter((q: any) => q.lte(q.field('createdAt'), endDate));
  }

  // Filter out deleted messages
  query = query.filter((q: any) => q.eq(q.field('deletedAt'), undefined));

  const messages = await query.order('desc').take(limit);

  // Get sender and thread details
  const messagesWithDetails = await Promise.all(
    messages.map(async (message: any) => {
      const sender = await ctx.db.get(message.senderId);
      const thread = await ctx.db.get(message.threadId);

      if (!sender || !thread) {
        return null;
      }

      return {
        ...message,
        sender: {
          _id: sender._id,
          firstName: sender.firstName,
          lastName: sender.lastName,
          email: sender.email,
          role: sender.role,
        },
        thread: {
          _id: thread._id,
          title: thread.title,
          threadType: thread.threadType,
        },
      };
    })
  );

  return messagesWithDetails.filter(Boolean);
};

export type SearchMessagesArgs = typeof webSearchMessagesArgs;
export type SearchMessagesReturns = typeof webSearchMessagesReturns;
export type SearchMessagesHandler = typeof webSearchMessagesHandler;
