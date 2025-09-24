import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const webSendGroupMessageArgs = {
  propertyId: v.id('properties'),
  title: v.string(),
  content: v.string(),
  targetAudience: v.string(), // "all", "tenants", "managers", "specific_units"
  targetUnits: v.optional(v.array(v.id('units'))),
  priority: v.optional(v.string()),
  attachments: v.optional(v.array(v.string())),
};

export const webSendGroupMessageReturns = v.object({
  success: v.boolean(),
  message: v.string(),
  threadId: v.id('chatThreads'),
});

export const webSendGroupMessageHandler = async (ctx: any, args: any) => {
  const { propertyId, title, content, targetAudience, targetUnits, priority, attachments } = args;

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

  // Only managers can send group messages
  if (user.role !== 'manager') {
    throw new Error('Only managers can send group messages');
  }

  // Check if user has access to this property
  const userProperty = await ctx.db
    .query('userProperties')
    .withIndex('by_user_property', (q: any) => q.eq('userId', user._id).eq('propertyId', propertyId))
    .first();

  if (!userProperty) {
    throw new Error('Access denied');
  }

  // Get target participants based on audience
  let participants: string[] = [user._id]; // Always include sender

  if (targetAudience === 'all') {
    const allUsers = await ctx.db
      .query('userProperties')
      .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
      .collect();

    participants = [...participants, ...allUsers.map((up: any) => up.userId)];
  } else if (targetAudience === 'tenants') {
    const tenantUsers = await ctx.db
      .query('userProperties')
      .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
      .filter((q: any) => q.eq(q.field('role'), 'tenant'))
      .collect();

    participants = [...participants, ...tenantUsers.map((up: any) => up.userId)];
  } else if (targetAudience === 'managers') {
    const managerUsers = await ctx.db
      .query('userProperties')
      .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
      .filter((q: any) => q.eq(q.field('role'), 'manager'))
      .collect();

    participants = [...participants, ...managerUsers.map((up: any) => up.userId)];
  } else if (targetAudience === 'specific_units' && targetUnits) {
    const unitUsers = await ctx.db
      .query('userProperties')
      .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
      .collect();

    // Filter users by specific units
    const specificUnitUsers = unitUsers.filter((up: any) => {
      // This would need to be implemented based on how units are associated with users
      // For now, we'll include all users in the property
      return true;
    });

    participants = [...participants, ...specificUnitUsers.map((up: any) => up.userId)];
  }

  // Remove duplicates
  participants = [...new Set(participants)];

  // Create group thread
  const threadId = await ctx.db.insert('chatThreads', {
    propertyId,
    threadType: 'group',
    title,
    participants,
    isArchived: false,
    priority: priority || 'medium',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Create the initial message
  await ctx.db.insert('messages', {
    threadId,
    senderId: user._id,
    content,
    messageType: 'text',
    attachments: attachments
      ? attachments.map((url: string) => ({
          fileName: url.split('/').pop() || 'attachment',
          fileUrl: url,
          fileType: 'unknown',
          fileSize: 0,
        }))
      : undefined,
    isRead: false,
    createdAt: Date.now(),
  });

  // Update thread with last message time
  await ctx.db.patch(threadId, {
    lastMessageAt: Date.now(),
  });

  return {
    success: true,
    message: 'Group message sent successfully',
    threadId,
  };
};

export type SendGroupMessageArgs = typeof webSendGroupMessageArgs;
export type SendGroupMessageReturns = typeof webSendGroupMessageReturns;
export type SendGroupMessageHandler = typeof webSendGroupMessageHandler;
