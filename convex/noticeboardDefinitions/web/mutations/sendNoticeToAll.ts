import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webSendNoticeToAllArgs = {
  propertyId: v.id('properties'),
  title: v.string(),
  content: v.string(),
  noticeType: v.union(
    v.literal('announcement'),
    v.literal('maintenance'),
    v.literal('payment_reminder'),
    v.literal('emergency'),
    v.literal('event'),
    v.literal('general')
  ),
  priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('urgent')),
  scheduledAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),
  attachments: v.optional(v.array(v.string())),
} as const;

export const webSendNoticeToAllReturns = v.object({
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
  scheduledAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),
  attachments: v.optional(v.array(v.string())),
  createdAt: v.number(),
  updatedAt: v.number(),
  totalRecipients: v.number(),
});

type Args = {
  propertyId: Id<'properties'>;
  title: string;
  content: string;
  noticeType: 'announcement' | 'maintenance' | 'payment_reminder' | 'emergency' | 'event' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: number;
  expiresAt?: number;
  attachments?: string[];
};

export const webSendNoticeToAllHandler = async (ctx: MutationCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager (admin side)
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Verify property exists and user has access to it
  const property = await ctx.db.get(args.propertyId);
  if (!property) throw new Error('Property not found');
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  // Validate scheduling
  const now = Date.now();
  if (args.scheduledAt && args.scheduledAt <= now) {
    throw new Error('Scheduled time must be in the future');
  }
  if (args.expiresAt && args.expiresAt <= now) {
    throw new Error('Expiration time must be in the future');
  }
  if (args.scheduledAt && args.expiresAt && args.expiresAt <= args.scheduledAt) {
    throw new Error('Expiration time must be after scheduled time');
  }

  // Count total recipients (all occupied units in the property)
  const occupiedUnits = await ctx.db
    .query('units')
    .withIndex('by_property', q => q.eq('propertyId', args.propertyId))
    .filter(q => q.eq(q.field('isOccupied'), true))
    .collect();
  const totalRecipients = occupiedUnits.length;

  // Determine if notice should be active immediately
  const isActive = !args.scheduledAt || args.scheduledAt <= now;

  // Create the notice
  const noticeId = await ctx.db.insert('notices', {
    propertyId: args.propertyId,
    unitId: undefined, // No specific unit for "all" notices
    createdBy: currentUser._id,
    title: args.title,
    content: args.content,
    noticeType: args.noticeType,
    priority: args.priority,
    targetAudience: 'all',
    targetUnits: undefined, // No specific units for "all" notices
    isActive,
    scheduledAt: args.scheduledAt,
    expiresAt: args.expiresAt,
    attachments: args.attachments,
    createdAt: now,
    updatedAt: now,
  });

  // Return the created notice with recipient count
  const createdNotice = await ctx.db.get(noticeId);
  if (!createdNotice) throw new Error('Failed to create notice');

  return {
    ...createdNotice,
    totalRecipients,
  };
};
