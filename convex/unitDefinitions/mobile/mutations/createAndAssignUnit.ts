import { MutationCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const createAndAssignUnitArgs = v.object({
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
});

export const createAndAssignUnitHandler = async (ctx: MutationCtx, args: Infer<typeof createAndAssignUnitArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  const me = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('clerkId'), identity.subject))
    .first();
  if (!me) {
    return { success: false, message: 'User not found' };
  }

  // Check if user has access to this property
  const userProperty = await ctx.db
    .query('userProperties')
    .withIndex('by_user_property', q => q.eq('userId', me._id).eq('propertyId', args.propertyId))
    .filter(q => q.eq(q.field('isActive'), true))
    .first();

  // If user doesn't have access, create the relationship as a tenant
  if (!userProperty) {
    await ctx.db.insert('userProperties', {
      userId: me._id,
      propertyId: args.propertyId,
      role: 'tenant',
      permissions: ['view_property', 'manage_own_unit'],
      isActive: true,
      assignedAt: Date.now(),
      assignedBy: me._id, // Self-assigned when creating unit
    });
  }

  // Check if unit number already exists for this property
  const existingUnit = await ctx.db
    .query('units')
    .withIndex('by_unit_number', q => q.eq('propertyId', args.propertyId).eq('unitNumber', args.unitNumber))
    .first();

  if (existingUnit) {
    return { success: false, message: 'Unit number already exists for this property' };
  }

  // Check if user is already assigned to another unit in this property
  const existingUserUnit = await ctx.db
    .query('units')
    .withIndex('by_tenant', q => q.eq('tenantId', me._id))
    .filter(q => q.eq(q.field('propertyId'), args.propertyId))
    .first();

  if (existingUserUnit) {
    return { success: false, message: 'You are already assigned to another unit in this property' };
  }

  const now = Date.now();

  // Create the unit and assign it to the current user
  const unitId = await ctx.db.insert('units', {
    propertyId: args.propertyId,
    unitNumber: args.unitNumber,
    unitType: args.unitType,
    floor: args.floor,
    bedrooms: args.bedrooms,
    bathrooms: args.bathrooms,
    squareFootage: args.squareFootage,
    tenantId: me._id, // Assign to current user
    isOccupied: true,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  return { success: true, unitId };
};
