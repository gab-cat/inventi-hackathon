import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const webModerateChatArgs = {
  threadId: v.id('chatThreads'),
  action: v.union(v.literal('mute'), v.literal('unmute'), v.literal('warn'), v.literal('suspend')),
  targetUserId: v.optional(v.id('users')),
  reason: v.optional(v.string()),
  duration: v.optional(v.number()), // Duration in minutes for temporary actions
};

export const webModerateChatReturns = v.object({
  success: v.boolean(),
  message: v.string(),
});

export const webModerateChatHandler = async (ctx: any, args: any) => {
  const { threadId, action, targetUserId, reason, duration } = args;

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

  // Only managers can moderate chats
  if (user.role !== 'manager') {
    throw new Error('Only managers can moderate chats');
  }

  // Get thread
  const thread = await ctx.db.get(threadId);
  if (!thread) {
    throw new Error('Thread not found');
  }

  // Check if user has access to this property
  const userProperty = await ctx.db
    .query('userProperties')
    .withIndex('by_user_property', (q: any) => q.eq('userId', user._id).eq('propertyId', thread.propertyId))
    .first();

  if (!userProperty) {
    throw new Error('Access denied');
  }

  let message = '';

  switch (action) {
    case 'mute':
      if (!targetUserId) {
        throw new Error('Target user ID is required for mute action');
      }

      // Create system message about mute
      await ctx.db.insert('messages', {
        threadId,
        senderId: user._id,
        content: `User has been muted${reason ? `: ${reason}` : ''}`,
        messageType: 'system',
        isRead: false,
        createdAt: Date.now(),
      });

      message = 'User muted successfully';
      break;

    case 'unmute':
      if (!targetUserId) {
        throw new Error('Target user ID is required for unmute action');
      }

      // Create system message about unmute
      await ctx.db.insert('messages', {
        threadId,
        senderId: user._id,
        content: `User has been unmuted`,
        messageType: 'system',
        isRead: false,
        createdAt: Date.now(),
      });

      message = 'User unmuted successfully';
      break;

    case 'warn':
      if (!targetUserId) {
        throw new Error('Target user ID is required for warn action');
      }

      // Create system message about warning
      await ctx.db.insert('messages', {
        threadId,
        senderId: user._id,
        content: `Warning issued${reason ? `: ${reason}` : ''}`,
        messageType: 'system',
        isRead: false,
        createdAt: Date.now(),
      });

      message = 'Warning issued successfully';
      break;

    case 'suspend':
      if (!targetUserId) {
        throw new Error('Target user ID is required for suspend action');
      }

      // Remove user from thread participants
      const updatedParticipants = thread.participants.filter((id: any) => id !== targetUserId);
      await ctx.db.patch(threadId, {
        participants: updatedParticipants,
        updatedAt: Date.now(),
      });

      // Create system message about suspension
      await ctx.db.insert('messages', {
        threadId,
        senderId: user._id,
        content: `User has been suspended from this thread${reason ? `: ${reason}` : ''}`,
        messageType: 'system',
        isRead: false,
        createdAt: Date.now(),
      });

      message = 'User suspended successfully';
      break;

    default:
      throw new Error('Invalid moderation action');
  }

  // Update thread last message time
  await ctx.db.patch(threadId, {
    lastMessageAt: Date.now(),
  });

  return {
    success: true,
    message,
  };
};

export type ModerateChatArgs = typeof webModerateChatArgs;
export type ModerateChatReturns = typeof webModerateChatReturns;
export type ModerateChatHandler = typeof webModerateChatHandler;
