import { query } from '../../../_generated/server';
import { v } from 'convex/values';

export const webGetMessageAnalyticsArgs = {
  propertyId: v.id('properties'),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
};

export const webGetMessageAnalyticsReturns = v.object({
  totalThreads: v.number(),
  activeThreads: v.number(),
  archivedThreads: v.number(),
  totalMessages: v.number(),
  messagesByType: v.object({
    individual: v.number(),
    group: v.number(),
    maintenance: v.number(),
    emergency: v.number(),
  }),
  averageResponseTime: v.number(),
  topParticipants: v.array(
    v.object({
      userId: v.id('users'),
      firstName: v.string(),
      lastName: v.string(),
      messageCount: v.number(),
    })
  ),
  messagesOverTime: v.array(
    v.object({
      date: v.string(),
      count: v.number(),
    })
  ),
});

export const webGetMessageAnalyticsHandler = async (ctx: any, args: any) => {
  const { propertyId, startDate, endDate } = args;

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

  const now = Date.now();
  const start = startDate || now - 30 * 24 * 60 * 60 * 1000; // 30 days ago
  const end = endDate || now;

  // Get all threads for the property
  const allThreads = await ctx.db
    .query('chatThreads')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .collect();

  // Get all messages for the property within date range
  const allMessages = await ctx.db
    .query('messages')
    .filter((q: any) => q.and(q.gte(q.field('createdAt'), start), q.lte(q.field('createdAt'), end)))
    .collect();

  // Filter messages by threads in this property
  const threadIds = allThreads.map((t: any) => t._id);
  const propertyMessages = allMessages.filter((m: any) => threadIds.includes(m.threadId));

  // Calculate analytics
  const totalThreads = allThreads.length;
  const activeThreads = allThreads.filter((t: any) => !t.isArchived).length;
  const archivedThreads = allThreads.filter((t: any) => t.isArchived).length;
  const totalMessages = propertyMessages.length;

  // Messages by type
  const messagesByType = {
    individual: allThreads.filter((t: any) => t.threadType === 'individual').length,
    group: allThreads.filter((t: any) => t.threadType === 'group').length,
    maintenance: allThreads.filter((t: any) => t.threadType === 'maintenance').length,
    emergency: allThreads.filter((t: any) => t.threadType === 'emergency').length,
  };

  // Calculate average response time (simplified)
  const responseTimes: number[] = [];
  for (let i = 1; i < propertyMessages.length; i++) {
    const prevMessage = propertyMessages[i - 1];
    const currentMessage = propertyMessages[i];

    if (prevMessage.senderId !== currentMessage.senderId) {
      responseTimes.push(currentMessage.createdAt - prevMessage.createdAt);
    }
  }

  const averageResponseTime =
    responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;

  // Top participants
  const participantCounts: { [key: string]: { user: any; count: number } } = {};
  propertyMessages.forEach((message: any) => {
    if (!participantCounts[message.senderId]) {
      participantCounts[message.senderId] = { user: null, count: 0 };
    }
    participantCounts[message.senderId].count++;
  });

  // Get user details for top participants
  const topParticipants = await Promise.all(
    Object.entries(participantCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(async ([userId, data]) => {
        const user = await ctx.db.get(userId as any);
        return {
          userId: userId as any,
          firstName: user?.firstName || 'Unknown',
          lastName: user?.lastName || 'User',
          messageCount: data.count,
        };
      })
  );

  // Messages over time (daily aggregation)
  const dailyCounts: { [key: string]: number } = {};
  propertyMessages.forEach((message: any) => {
    const date = new Date(message.createdAt).toISOString().split('T')[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  const messagesOverTime = Object.entries(dailyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return {
    totalThreads,
    activeThreads,
    archivedThreads,
    totalMessages,
    messagesByType,
    averageResponseTime,
    topParticipants,
    messagesOverTime,
  };
};

export type GetMessageAnalyticsArgs = typeof webGetMessageAnalyticsArgs;
export type GetMessageAnalyticsReturns = typeof webGetMessageAnalyticsReturns;
export type GetMessageAnalyticsHandler = typeof webGetMessageAnalyticsHandler;
