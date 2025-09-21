import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webUpdateNoticeArgs = {
  noticeId: v.id('notices'),
  title: v.optional(v.string()),
  content: v.optional(v.string()),
  noticeType: v.optional(
    v.union(
      v.literal('announcement'),
      v.literal('maintenance'),
      v.literal('payment_reminder'),
      v.literal('emergency'),
      v.literal('event'),
      v.literal('general')
    )
  ),
  priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('urgent'))),
  targetAudience: v.optional(
    v.union(v.literal('all'), v.literal('tenants'), v.literal('specific_units'), v.literal('managers'))
  ),
  targetUnits: v.optional(v.array(v.id('units'))),
  isActive: v.optional(v.boolean()),
  scheduledAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),
  attachments: v.optional(v.array(v.string())),
} as const;

export const webUpdateNoticeReturns = v.union(
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
  title?: string;
  content?: string;
  noticeType?: 'announcement' | 'maintenance' | 'payment_reminder' | 'emergency' | 'event' | 'general';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience?: 'all' | 'tenants' | 'specific_units' | 'managers';
  targetUnits?: Id<'units'>[];
  isActive?: boolean;
  scheduledAt?: number;
  expiresAt?: number;
  attachments?: string[];
};

export const webUpdateNoticeHandler = async (ctx: MutationCtx, args: Args) => {
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

  // Validate target units if provided
  if (args.targetUnits && args.targetUnits.length > 0) {
    for (const unitId of args.targetUnits) {
      const unit = await ctx.db.get(unitId);
      if (!unit) throw new Error(`Unit ${unitId} not found`);
      if (unit.propertyId !== existingNotice.propertyId)
        throw new Error(`Unit ${unitId} does not belong to the property`);
    }
  }

  // Validate scheduling
  const now = Date.now();
  if (args.expiresAt && args.expiresAt <= now) {
    throw new Error('Expiration time must be in the future');
  }
  if (args.scheduledAt && args.expiresAt && args.expiresAt <= args.scheduledAt) {
    throw new Error('Expiration time must be after scheduled time');
  }

  // Prepare update data
  const updateData: any = {
    updatedAt: now,
  };

  // Only update fields that are provided
  if (args.title !== undefined) updateData.title = args.title;
  if (args.content !== undefined) updateData.content = args.content;
  if (args.noticeType !== undefined) updateData.noticeType = args.noticeType;
  if (args.priority !== undefined) updateData.priority = args.priority;
  if (args.targetAudience !== undefined) updateData.targetAudience = args.targetAudience;
  if (args.targetUnits !== undefined) updateData.targetUnits = args.targetUnits;
  if (args.isActive !== undefined) updateData.isActive = args.isActive;
  if (args.scheduledAt !== undefined) updateData.scheduledAt = args.scheduledAt;
  if (args.expiresAt !== undefined) updateData.expiresAt = args.expiresAt;
  if (args.attachments !== undefined) updateData.attachments = args.attachments;

  // Update the notice
  await ctx.db.patch(args.noticeId, updateData);

  // Return the updated notice
  const updatedNotice = await ctx.db.get(args.noticeId);
  if (!updatedNotice) throw new Error('Failed to update notice');

  return updatedNotice;
};
