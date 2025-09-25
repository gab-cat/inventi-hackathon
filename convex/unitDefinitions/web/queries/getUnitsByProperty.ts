import { QueryCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const webGetUnitsByPropertyArgs = v.object({
  propertyId: v.id('properties'),
});

export const webGetUnitsByPropertyReturns = v.object({
  success: v.boolean(),
  units: v.optional(
    v.array(
      v.object({
        _id: v.id('units'),
        _creationTime: v.number(),
        propertyId: v.id('properties'),
        unitNumber: v.string(),
        unitType: v.union(
          v.literal('apartment'),
          v.literal('office'),
          v.literal('retail'),
          v.literal('storage'),
          v.literal('condo'),
          v.literal('house')
        ),
        floor: v.optional(v.number()),
        bedrooms: v.optional(v.number()),
        bathrooms: v.optional(v.number()),
        squareFootage: v.optional(v.number()),
        rentAmount: v.optional(v.number()),
        tenantId: v.optional(v.id('users')),
        isOccupied: v.boolean(),
        isActive: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    )
  ),
  message: v.optional(v.string()),
});

export const webGetUnitsByPropertyHandler = async (ctx: QueryCtx, args: Infer<typeof webGetUnitsByPropertyArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  // Get current user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();

  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    return { success: false, message: 'Access denied - manager role required' };
  }

  // Verify property access - check if user is the manager of this property
  const property = await ctx.db.get(args.propertyId);
  if (!property) {
    return { success: false, message: 'Property not found' };
  }

  if (property.managerId !== currentUser._id) {
    return { success: false, message: 'Access denied to this property' };
  }

  // Get all units for this property that are active
  const units = await ctx.db
    .query('units')
    .withIndex('by_property', q => q.eq('propertyId', args.propertyId))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  return { success: true, units };
};
