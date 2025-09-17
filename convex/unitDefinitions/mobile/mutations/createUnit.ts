import { MutationCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const createUnitArgs = v.object({
  propertyId: v.id('properties'),
  unitNumber: v.string(),
  unitType: v.union(v.literal('apartment'), v.literal('office'), v.literal('retail'), v.literal('storage')),
  floor: v.optional(v.number()),
  bedrooms: v.optional(v.number()),
  bathrooms: v.optional(v.number()),
  squareFootage: v.optional(v.number()),
  rentAmount: v.optional(v.number()),
});

export const createUnitHandler = async (ctx: MutationCtx, args: Infer<typeof createUnitArgs>) => {
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

  // Check if user has access to this property (must be tenant or manager)
  const userProperty = await ctx.db
    .query('userProperties')
    .withIndex('by_user_property', q => q.eq('userId', me._id).eq('propertyId', args.propertyId))
    .filter(q => q.eq(q.field('isActive'), true))
    .first();

  if (!userProperty) {
    return { success: false, message: 'Access denied to this property' };
  }

  // Only managers can create units, tenants can only be assigned to existing units
  if (userProperty.role !== 'manager') {
    return { success: false, message: 'Only property managers can create units' };
  }

  // Check if unit number already exists for this property
  const existingUnit = await ctx.db
    .query('units')
    .withIndex('by_unit_number', q => q.eq('propertyId', args.propertyId).eq('unitNumber', args.unitNumber))
    .first();

  if (existingUnit) {
    return { success: false, message: 'Unit number already exists for this property' };
  }

  const now = Date.now();

  const unitId = await ctx.db.insert('units', {
    propertyId: args.propertyId,
    unitNumber: args.unitNumber,
    unitType: args.unitType,
    floor: args.floor,
    bedrooms: args.bedrooms,
    bathrooms: args.bathrooms,
    squareFootage: args.squareFootage,
    rentAmount: args.rentAmount,
    tenantId: undefined, // No tenant assigned initially
    isOccupied: false,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  return { success: true, unitId };
};
