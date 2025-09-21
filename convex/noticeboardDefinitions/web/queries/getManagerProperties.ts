import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';

export const webGetManagerPropertiesArgs = {} as const;

export const webGetManagerPropertiesReturns = v.array(
  v.object({
    _id: v.id('properties'),
    _creationTime: v.number(),
    name: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    country: v.string(),
    propertyType: v.union(v.literal('apartment'), v.literal('condo'), v.literal('house'), v.literal('commercial')),
    totalUnits: v.number(),
    managerId: v.id('users'),
    isActive: v.boolean(),
    settings: v.optional(
      v.object({
        maintenanceHours: v.optional(
          v.object({
            start: v.string(),
            end: v.string(),
          })
        ),
        deliveryHours: v.optional(
          v.object({
            start: v.string(),
            end: v.string(),
          })
        ),
        visitorLimitPerUnit: v.optional(v.number()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Additional data
    occupiedUnits: v.number(),
    totalNotices: v.number(),
    activeNotices: v.number(),
  })
);

type Args = {};

export const webGetManagerPropertiesHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Get current user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Get properties managed by this user
  const properties = await ctx.db
    .query('properties')
    .withIndex('by_manager', q => q.eq('managerId', currentUser._id))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  // Enrich with additional data
  const enrichedProperties = await Promise.all(
    properties.map(async property => {
      // Count occupied units
      const occupiedUnits = await ctx.db
        .query('units')
        .withIndex('by_property', q => q.eq('propertyId', property._id))
        .filter(q => q.eq(q.field('isOccupied'), true))
        .collect();
      const occupiedUnitsCount = occupiedUnits.length;

      // Count total notices
      const totalNotices = await ctx.db
        .query('notices')
        .withIndex('by_property', q => q.eq('propertyId', property._id))
        .collect();
      const totalNoticesCount = totalNotices.length;

      // Count active notices
      const activeNotices = await ctx.db
        .query('notices')
        .withIndex('by_property', q => q.eq('propertyId', property._id))
        .filter(q => q.eq(q.field('isActive'), true))
        .collect();
      const activeNoticesCount = activeNotices.length;

      return {
        ...property,
        occupiedUnits: occupiedUnitsCount,
        totalNotices: totalNoticesCount,
        activeNotices: activeNoticesCount,
      };
    })
  );

  return enrichedProperties;
};
