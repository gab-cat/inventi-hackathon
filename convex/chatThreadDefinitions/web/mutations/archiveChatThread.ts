import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const webArchiveChatThreadArgs = {
  threadId: v.id('chatThreads'),
  isArchived: v.boolean(),
};

export const webArchiveChatThreadReturns = v.object({
  success: v.boolean(),
  message: v.string(),
});

export const webArchiveChatThreadHandler = async (ctx: any, args: any) => {
  const { threadId, isArchived } = args;

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

  // Get thread
  const thread = await ctx.db.get(threadId);
  if (!thread) {
    throw new Error('Thread not found');
  }

  // Check if user is a participant or manager
  const isParticipant = thread.participants.includes(user._id);
  const userProperty = await ctx.db
    .query('userProperties')
    .withIndex('by_user_property', (q: any) => q.eq('userId', user._id).eq('propertyId', thread.propertyId))
    .first();

  if (!isParticipant && user.role !== 'manager' && !userProperty) {
    throw new Error('Access denied');
  }

  // Update thread archive status
  await ctx.db.patch(threadId, {
    isArchived,
    updatedAt: Date.now(),
  });

  // Create system message about archive status change
  const action = isArchived ? 'archived' : 'unarchived';
  await ctx.db.insert('messages', {
    threadId,
    senderId: user._id,
    content: `Thread has been ${action}`,
    messageType: 'system',
    isRead: false,
    createdAt: Date.now(),
  });

  // Update thread last message time
  await ctx.db.patch(threadId, {
    lastMessageAt: Date.now(),
  });

  return {
    success: true,
    message: `Thread ${action} successfully`,
  };
};

export type ArchiveChatThreadArgs = typeof webArchiveChatThreadArgs;
export type ArchiveChatThreadReturns = typeof webArchiveChatThreadReturns;
export type ArchiveChatThreadHandler = typeof webArchiveChatThreadHandler;
