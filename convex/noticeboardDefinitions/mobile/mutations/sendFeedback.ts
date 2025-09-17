import { v, Infer } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';

export const mobileSendFeedbackArgs = v.object({
  propertyId: v.id('properties'),
  subject: v.string(),
  message: v.string(),
  feedbackType: v.union(
    v.literal('general'),
    v.literal('maintenance'),
    v.literal('service'),
    v.literal('complaint'),
    v.literal('suggestion'),
    v.literal('praise')
  ),
  priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('urgent'))),
  attachments: v.optional(v.array(v.string())), // File URLs
});

export const mobileSendFeedbackReturns = v.object({
  _id: v.id('notices'),
  _creationTime: v.number(),
  propertyId: v.id('properties'),
  createdBy: v.id('users'),
  title: v.string(),
  content: v.string(),
  noticeType: v.string(),
  priority: v.string(),
  targetAudience: v.string(),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const mobileSendFeedbackHandler = async (ctx: MutationCtx, args: Infer<typeof mobileSendFeedbackArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Get current tenant user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) throw new Error('User not found');
  if (currentUser.role !== 'tenant') throw new Error('Access denied: Tenants only');

  // Verify user has access to this property
  const userProperty = await ctx.db
    .query('userProperties')
    .withIndex('by_user_property', q => q.eq('userId', currentUser._id).eq('propertyId', args.propertyId))
    .filter(q => q.eq(q.field('isActive'), true))
    .unique();

  if (!userProperty) {
    throw new Error('Access denied: You do not have access to this property');
  }

  // Get property info for validation
  const property = await ctx.db.get(args.propertyId);
  if (!property) throw new Error('Property not found');

  // Create feedback as a notice with special type
  const feedbackNoticeId = await ctx.db.insert('notices', {
    propertyId: args.propertyId,
    createdBy: currentUser._id,
    title: `[Feedback - ${args.feedbackType.toUpperCase()}] ${args.subject}`,
    content: args.message,
    noticeType: 'feedback', // Special notice type for feedback
    priority: args.priority || 'medium',
    targetAudience: 'managers', // Feedback goes to property managers
    targetUnits: undefined,
    isActive: true,
    scheduledAt: undefined,
    expiresAt: undefined,
    attachments: args.attachments,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Get the created feedback notice
  const createdFeedback = await ctx.db.get(feedbackNoticeId);
  if (!createdFeedback) throw new Error('Failed to create feedback');

  // Create an audit log entry for the feedback submission
  await ctx.db.insert('auditLogs', {
    propertyId: args.propertyId,
    userId: currentUser._id,
    action: 'submit_feedback',
    resourceType: 'notices',
    resourceId: feedbackNoticeId,
    newValues: {
      feedbackType: args.feedbackType,
      subject: args.subject,
      priority: args.priority,
    },
    timestamp: Date.now(),
  });

  return createdFeedback;
};
