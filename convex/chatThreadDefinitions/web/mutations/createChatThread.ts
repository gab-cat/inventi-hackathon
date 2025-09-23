import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const webCreateChatThreadArgs = {
  propertyId: v.id('properties'),
  threadType: v.union(v.literal('individual'), v.literal('group'), v.literal('maintenance'), v.literal('emergency')),
  title: v.optional(v.string()),
  participants: v.array(v.id('users')),
  priority: v.optional(v.string()),
  initialMessage: v.optional(v.string()),
};

export const webCreateChatThreadReturns = v.object({
  success: v.boolean(),
  message: v.string(),
  threadId: v.id('chatThreads'),
});

export const webCreateChatThreadHandler = async (ctx: any, args: any) => {
  const { propertyId, threadType, title, participants, priority, initialMessage } = args;

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
  if (user.role !== 'manager') {
    // Check if user has userProperties record for this property
    const userProperty = await ctx.db
      .query('userProperties')
      .withIndex('by_user_property', (q: any) => q.eq('userId', user._id).eq('propertyId', propertyId))
      .first();

    if (!userProperty) {
      // Check if user is a tenant in any unit within this property
      const tenantUnit = await ctx.db
        .query('units')
        .withIndex('by_tenant', (q: any) => q.eq('tenantId', user._id))
        .filter((q: any) => q.eq(q.field('propertyId'), propertyId))
        .first();

      if (!tenantUnit) {
        throw new Error('Access denied');
      }
    }
  }

  // Ensure current user is in participants
  const allParticipants = [...new Set([user._id, ...participants])];

  // Validate that all participants have access to the property
  for (const participantId of allParticipants) {
    const participant = await ctx.db.get(participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    // Check if user is a manager (managers have access to all properties)
    if (participant.role === 'manager') {
      continue;
    }

    // Check if user has userProperties record for this property
    const participantProperty = await ctx.db
      .query('userProperties')
      .withIndex('by_user_property', (q: any) => q.eq('userId', participantId).eq('propertyId', propertyId))
      .first();

    if (participantProperty) {
      continue; // User has explicit access via userProperties
    }

    // Check if user is a tenant in any unit within this property
    const tenantUnit = await ctx.db
      .query('units')
      .withIndex('by_tenant', (q: any) => q.eq('tenantId', participantId))
      .filter((q: any) => q.eq(q.field('propertyId'), propertyId))
      .first();

    if (!tenantUnit) {
      throw new Error(`User ${participant.firstName} ${participant.lastName} does not have access to this property`);
    }
  }

  // Create thread
  const threadId = await ctx.db.insert('chatThreads', {
    propertyId,
    threadType,
    title,
    participants: allParticipants,
    lastMessageAt: undefined, // Will be set when first message is sent
    isArchived: false,
    priority: priority || 'low',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Create initial message if provided
  if (initialMessage) {
    await ctx.db.insert('messages', {
      threadId,
      senderId: user._id,
      content: initialMessage,
      messageType: 'text',
      isRead: false,
      createdAt: Date.now(),
    });

    // Update thread with last message time
    await ctx.db.patch(threadId, {
      lastMessageAt: Date.now(),
    });
  }

  return {
    success: true,
    message: 'Chat thread created successfully',
    threadId,
  };
};

export type CreateChatThreadArgs = typeof webCreateChatThreadArgs;
export type CreateChatThreadReturns = typeof webCreateChatThreadReturns;
export type CreateChatThreadHandler = typeof webCreateChatThreadHandler;
