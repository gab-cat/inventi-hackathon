import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webGetNoticeByIdArgs = {
  noticeId: v.id('notices'),
} as const;

export const webGetNoticeByIdReturns = v.union(
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
      email: v.string(),
    }),
    unit: v.optional(
      v.object({
        _id: v.id('units'),
        unitNumber: v.string(),
      })
    ),
    acknowledgmentCount: v.number(),
    totalTargetUsers: v.number(),
    acknowledgments: v.array(
      v.object({
        _id: v.id('noticeAcknowledgments'),
        userId: v.id('users'),
        acknowledgedAt: v.number(),
        user: v.object({
          _id: v.id('users'),
          firstName: v.string(),
          lastName: v.string(),
          email: v.string(),
        }),
      })
    ),
    targetUnitsDetails: v.optional(
      v.array(
        v.object({
          _id: v.id('units'),
          unitNumber: v.string(),
          tenant: v.optional(
            v.object({
              _id: v.id('users'),
              firstName: v.string(),
              lastName: v.string(),
              email: v.string(),
            })
          ),
        })
      )
    ),
  }),
  v.null()
);

type Args = {
  noticeId: Id<'notices'>;
};

export const webGetNoticeByIdHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager (admin side)
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Get the notice
  const notice = await ctx.db.get(args.noticeId);
  if (!notice) return null;

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

  // Get acknowledgments with user details
  const acknowledgments = await ctx.db
    .query('noticeAcknowledgments')
    .withIndex('by_notice', q => q.eq('noticeId', notice._id))
    .collect();

  const acknowledgmentsWithUsers = await Promise.all(
    acknowledgments.map(async ack => {
      const user = await ctx.db.get(ack.userId);
      if (!user) throw new Error('User not found');

      return {
        _id: ack._id,
        userId: ack.userId,
        acknowledgedAt: ack.acknowledgedAt,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      };
    })
  );

  // Get target units details if applicable
  let targetUnitsDetails = undefined;
  if (notice.targetUnits && notice.targetUnits.length > 0) {
    const targetUnitsResults = await Promise.all(
      notice.targetUnits.map(async unitId => {
        const unitData = await ctx.db.get(unitId);
        if (!unitData) return null;

        let tenant = undefined;
        if (unitData.tenantId) {
          const tenantData = await ctx.db.get(unitData.tenantId);
          if (tenantData) {
            tenant = {
              _id: tenantData._id,
              firstName: tenantData.firstName,
              lastName: tenantData.lastName,
              email: tenantData.email,
            };
          }
        }

        return {
          _id: unitData._id,
          unitNumber: unitData.unitNumber,
          tenant,
        };
      })
    );
    targetUnitsDetails = targetUnitsResults.filter((item): item is NonNullable<typeof item> => item !== null);
  }

  return {
    ...notice,
    property: {
      _id: property._id,
      name: property.name,
      address: property.address,
    },
    creator: {
      _id: creator._id,
      firstName: creator.firstName,
      lastName: creator.lastName,
      email: creator.email,
    },
    unit,
    acknowledgmentCount: acknowledgmentsWithUsers.length,
    totalTargetUsers: targetUnitsDetails ? targetUnitsDetails.length : 0,
    acknowledgments: acknowledgmentsWithUsers,
    targetUnitsDetails,
  };
};
