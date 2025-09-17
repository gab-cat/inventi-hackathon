import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const scheduleNoticeArgs = {
  noticeId: v.id('notices'),
  scheduledAt: v.number(),
  expiresAt: v.optional(v.number()),
} as const;

export const scheduleNoticeReturns = v.union(
  v.object({
    _id: v.id('notices'),
    _creationTime: v.number(),
    propertyId: v.id('properties'),
    unitId: v.optional(v.id('units')),
    createdBy: v.id('users'),
    title: v.string(),
    content: v.string(),
    noticeType: v.string(),
    priority: v.string(),
    targetAudience: v.string(),
    targetUnits: v.optional(v.array(v.id('units'))),
    isActive: v.boolean(),
    scheduledAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  v.null()
);

type Args = {
  noticeId: Id<'notices'>;
  scheduledAt: number;
  expiresAt?: number;
};

export const scheduleNoticeHandler = async (ctx: MutationCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager (admin side)
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Get the existing notice
  const existingNotice = await ctx.db.get(args.noticeId);
  if (!existingNotice) return null;

  // Verify user has access to the property
  const property = await ctx.db.get(existingNotice.propertyId);
  if (!property) throw new Error('Property not found');
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  // Validate scheduling
  const now = Date.now();
  if (args.scheduledAt <= now) {
    throw new Error('Scheduled time must be in the future');
  }
  if (args.expiresAt && args.expiresAt <= now) {
    throw new Error('Expiration time must be in the future');
  }
  if (args.expiresAt && args.expiresAt <= args.scheduledAt) {
    throw new Error('Expiration time must be after scheduled time');
  }

  // Update the notice with scheduling information
  await ctx.db.patch(args.noticeId, {
    scheduledAt: args.scheduledAt,
    expiresAt: args.expiresAt,
    isActive: false, // Set to inactive until scheduled time
    updatedAt: now,
  });

  // Return the updated notice
  const updatedNotice = await ctx.db.get(args.noticeId);
  if (!updatedNotice) throw new Error('Failed to update notice');

  return updatedNotice;
};
