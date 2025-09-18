import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webSendNoticeToUnitArgs = {
  propertyId: v.id('properties'),
  unitId: v.id('units'),
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

export const webSendNoticeToUnitReturns = v.object({
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
  recipient: v.optional(
    v.object({
      _id: v.id('users'),
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
    })
  ),
});

type Args = {
  propertyId: Id<'properties'>;
  unitId: Id<'units'>;
  title: string;
  content: string;
  noticeType: 'announcement' | 'maintenance' | 'payment_reminder' | 'emergency' | 'event' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: number;
  expiresAt?: number;
  attachments?: string[];
};

export const webSendNoticeToUnitHandler = async (ctx: MutationCtx, args: Args) => {
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

  // Verify unit exists and belongs to the property
  const unit = await ctx.db.get(args.unitId);
  if (!unit) throw new Error('Unit not found');
  if (unit.propertyId !== args.propertyId) throw new Error('Unit does not belong to the specified property');

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

  // Get recipient information (tenant of the unit)
  let recipient = undefined;
  if (unit.tenantId) {
    const tenant = await ctx.db.get(unit.tenantId);
    if (tenant) {
      recipient = {
        _id: tenant._id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
      };
    }
  }

  // Determine if notice should be active immediately
  const isActive = !args.scheduledAt || args.scheduledAt <= now;

  // Create the notice
  const noticeId = await ctx.db.insert('notices', {
    propertyId: args.propertyId,
    unitId: args.unitId,
    createdBy: currentUser._id,
    title: args.title,
    content: args.content,
    noticeType: args.noticeType,
    priority: args.priority,
    targetAudience: 'specific_units',
    targetUnits: [args.unitId],
    isActive,
    scheduledAt: args.scheduledAt,
    expiresAt: args.expiresAt,
    attachments: args.attachments,
    createdAt: now,
    updatedAt: now,
  });

  // Return the created notice with recipient info
  const createdNotice = await ctx.db.get(noticeId);
  if (!createdNotice) throw new Error('Failed to create notice');

  return {
    ...createdNotice,
    recipient,
  };
};
