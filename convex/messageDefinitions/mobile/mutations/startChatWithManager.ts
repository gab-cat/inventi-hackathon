import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const mobileStartChatWithManagerArgs = v.object({
  propertyId: v.id('properties'),
  initialMessage: v.optional(v.string()),
});

export const mobileStartChatWithManagerReturns = v.object({
  success: v.boolean(),
  threadId: v.optional(v.id('chatThreads')),
  message: v.optional(v.string()),
});

export const mobileStartChatWithManagerHandler = async (ctx: any, args: any) => {
  const { propertyId, initialMessage } = args;

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

  // Validate property exists
  const property = await ctx.db.get(propertyId);
  if (!property) {
    return {
      success: false,
      message: 'Property not found',
    };
  }

  // Check if user already has an individual chat thread with a manager for this property
  const existingThread = await ctx.db
    .query('chatThreads')
    .filter((q: any) => q.eq(q.field('propertyId'), propertyId))
    .filter((q: any) => q.eq(q.field('threadType'), 'individual'))
    .filter((q: any) => q.eq(q.field('isArchived'), false))
    .filter((q: any) => q.includes(q.field('participants'), user._id))
    .first();

  if (existingThread) {
    return {
      success: true,
      threadId: existingThread._id,
    };
  }

  // Find a manager for the property
  const manager = await ctx.db
    .query('users')
    .filter((q: any) => q.eq(q.field('role'), 'manager'))
    .filter((q: any) => q.eq(q.field('propertyId'), propertyId))
    .first();

  if (!manager) {
    return {
      success: false,
      message: 'No manager available for this property',
    };
  }

  const now = Date.now();

  // Create new chat thread
  const threadId = await ctx.db.insert('chatThreads', {
    propertyId,
    threadType: 'individual',
    title: `Chat with ${user.firstName} ${user.lastName}`,
    participants: [user._id, manager._id],
    lastMessageAt: initialMessage ? now : undefined,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  });

  // Send initial message if provided
  if (initialMessage) {
    await ctx.db.insert('messages', {
      threadId,
      senderId: user._id,
      content: initialMessage,
      messageType: 'text',
      isRead: false,
      createdAt: now,
    });
  }

  return {
    success: true,
    threadId,
  };
};

export type MobileStartChatWithManagerArgs = typeof mobileStartChatWithManagerArgs;
export type MobileStartChatWithManagerReturns = typeof mobileStartChatWithManagerReturns;
export type MobileStartChatWithManagerHandler = typeof mobileStartChatWithManagerHandler;
