import { mutation } from '../../../_generated/server';
import { v } from 'convex/values';

export const webAssignThreadToEmployeeArgs = {
  threadId: v.id('chatThreads'),
  employeeId: v.id('users'),
};

export const webAssignThreadToEmployeeReturns = v.object({
  success: v.boolean(),
  message: v.string(),
});

export const webAssignThreadToEmployeeHandler = async (ctx: any, args: any) => {
  const { threadId, employeeId } = args;

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

  // Only managers can assign threads
  if (user.role !== 'manager') {
    throw new Error('Only managers can assign threads');
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

  // Get employee
  const employee = await ctx.db.get(employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Check if employee has access to the property
  const employeeProperty = await ctx.db
    .query('userProperties')
    .withIndex('by_user_property', (q: any) => q.eq('userId', employeeId).eq('propertyId', thread.propertyId))
    .first();

  if (!employeeProperty) {
    throw new Error('Employee does not have access to this property');
  }

  // Update thread
  await ctx.db.patch(threadId, {
    assignedTo: employeeId,
    updatedAt: Date.now(),
  });

  // Add employee to participants if not already there
  if (!thread.participants.includes(employeeId)) {
    await ctx.db.patch(threadId, {
      participants: [...thread.participants, employeeId],
    });
  }

  // Create system message
  await ctx.db.insert('messages', {
    threadId,
    senderId: user._id,
    content: `Thread assigned to ${employee.firstName} ${employee.lastName}`,
    messageType: 'system',
    isRead: false,
    createdAt: Date.now(),
  });

  return {
    success: true,
    message: 'Thread assigned successfully',
  };
};

export type AssignThreadToEmployeeArgs = typeof webAssignThreadToEmployeeArgs;
export type AssignThreadToEmployeeReturns = typeof webAssignThreadToEmployeeReturns;
export type AssignThreadToEmployeeHandler = typeof webAssignThreadToEmployeeHandler;
