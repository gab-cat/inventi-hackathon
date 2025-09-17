import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const mobileGetNoticeByIdArgs = {
  noticeId: v.id('notices'),
} as const;

export const mobileGetNoticeByIdReturns = v.union(
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
    // Mobile-specific fields
    isRead: v.boolean(),
    acknowledgedAt: v.optional(v.number()),
    canAcknowledge: v.boolean(),
    // Joined data
    property: v.object({
      _id: v.id('properties'),
      name: v.string(),
      address: v.string(),
    }),
    creator: v.object({
      _id: v.id('users'),
      firstName: v.string(),
      lastName: v.string(),
    }),
    unit: v.optional(
      v.object({
        _id: v.id('units'),
        unitNumber: v.string(),
      })
    ),
    acknowledgmentStats: v.object({
      totalAcknowledged: v.number(),
      totalTargetUsers: v.number(),
    }),
  }),
  v.null()
);

type Args = {
  noticeId: Id<'notices'>;
};

export const mobileGetNoticeByIdHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Get current tenant user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) throw new Error('User not found');
  if (currentUser.role !== 'tenant') throw new Error('Access denied: Tenants only');

  // Get the notice
  const notice = await ctx.db.get(args.noticeId);
  if (!notice) return null;

  // Check if user has access to this notice (same property/units)
  const userProperties = await ctx.db
    .query('userProperties')
    .withIndex('by_user', q => q.eq('userId', currentUser._id))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  const hasAccess = userProperties.some(up => up.propertyId === notice.propertyId);
  if (!hasAccess) return null; // User doesn't have access to this notice

  // Check if this notice is targeted at the user
  let canAccess = false;
  if (notice.targetAudience === 'all') {
    canAccess = true;
  } else if (notice.targetAudience === 'tenants') {
    canAccess = true;
  } else if (notice.targetAudience === 'specific_units') {
    if (notice.targetUnits && notice.targetUnits.length > 0) {
      // Check if user is tenant of any of the target units
      const userUnits = await ctx.db
        .query('units')
        .filter(q => q.and(q.eq(q.field('tenantId'), currentUser._id), q.eq(q.field('isOccupied'), true)))
        .collect();
      const userUnitIds = userUnits.map(unit => unit._id);
      canAccess = notice.targetUnits.some(unitId => userUnitIds.includes(unitId));
    }
  }

  if (!canAccess) return null;

  // Get property info
  const property = await ctx.db.get(notice.propertyId);
  if (!property) throw new Error('Property not found');

  // Get creator info
  const creator = await ctx.db.get(notice.createdBy);
  if (!creator) throw new Error('Creator not found');

  // Get unit info if applicable
  let unit = undefined;
  if (notice.unitId) {
    const unitData = await ctx.db.get(notice.unitId);
    if (unitData) {
      unit = {
        _id: unitData._id,
        unitNumber: unitData.unitNumber,
      };
    }
  }

  // Check if user has acknowledged this notice
  const acknowledgment = await ctx.db
    .query('noticeAcknowledgments')
    .withIndex('by_notice_user', q => q.eq('noticeId', notice._id).eq('userId', currentUser._id))
    .unique();

  const isRead = !!acknowledgment;
  const acknowledgedAt = acknowledgment?.acknowledgedAt;

  // Calculate acknowledgment statistics
  const allAcknowledgments = await ctx.db
    .query('noticeAcknowledgments')
    .withIndex('by_notice', q => q.eq('noticeId', notice._id))
    .collect();
  const totalAcknowledged = allAcknowledgments.length;

  // Calculate total target users based on target audience
  let totalTargetUsers = 0;
  if (notice.targetAudience === 'all') {
    const allUnits = await ctx.db
      .query('units')
      .withIndex('by_property', q => q.eq('propertyId', notice.propertyId))
      .filter(q => q.eq(q.field('isOccupied'), true))
      .collect();
    totalTargetUsers = allUnits.length;
  } else if (notice.targetAudience === 'tenants') {
    const tenantUnits = await ctx.db
      .query('units')
      .withIndex('by_property', q => q.eq('propertyId', notice.propertyId))
      .filter(q => q.eq(q.field('isOccupied'), true))
      .collect();
    totalTargetUsers = tenantUnits.length;
  } else if (notice.targetAudience === 'specific_units' && notice.targetUnits) {
    totalTargetUsers = notice.targetUnits.length;
  }

  return {
    ...notice,
    isRead,
    acknowledgedAt,
    canAcknowledge: !isRead && notice.isActive,
    property: {
      _id: property._id,
      name: property.name,
      address: property.address,
    },
    creator: {
      _id: creator._id,
      firstName: creator.firstName,
      lastName: creator.lastName,
    },
    unit,
    acknowledgmentStats: {
      totalAcknowledged,
      totalTargetUsers,
    },
  };
};
