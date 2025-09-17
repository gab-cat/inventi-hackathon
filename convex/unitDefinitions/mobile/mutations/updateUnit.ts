import { MutationCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const updateUnitArgs = v.object({
  unitId: v.id('units'),
  unitNumber: v.optional(v.string()),
  unitType: v.optional(v.union(v.literal('apartment'), v.literal('office'), v.literal('retail'), v.literal('storage'))),
  floor: v.optional(v.number()),
  bedrooms: v.optional(v.number()),
  bathrooms: v.optional(v.number()),
  squareFootage: v.optional(v.number()),
  rentAmount: v.optional(v.number()),
});

export const updateUnitHandler = async (ctx: MutationCtx, args: Infer<typeof updateUnitArgs>) => {
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

  // Get the unit to update
  const unit = await ctx.db.get(args.unitId);
  if (!unit) {
    return { success: false, message: 'Unit not found' };
  }

  // Check authorization - user must be tenant of the unit OR manager of the property
  const isTenant = unit.tenantId === me._id;
  let isManager = false;

  if (!isTenant) {
    const userProperty = await ctx.db
      .query('userProperties')
      .withIndex('by_user_property', q => q.eq('userId', me._id).eq('propertyId', unit.propertyId))
      .filter(q => q.eq(q.field('isActive'), true))
      .first();

    isManager = userProperty?.role === 'manager';
  }

  if (!isTenant && !isManager) {
    return { success: false, message: 'Not authorized to update this unit' };
  }

  // Prepare update object
  const updateData: Partial<{
    unitNumber?: string;
    unitType?: 'apartment' | 'office' | 'retail' | 'storage';
    floor?: number;
    bedrooms?: number;
    bathrooms?: number;
    squareFootage?: number;
    rentAmount?: number;
    updatedAt: number;
  }> = {
    updatedAt: Date.now(),
  };

  // Only managers can update unit number (to avoid conflicts)
  if (args.unitNumber !== undefined) {
    if (!isManager) {
      return { success: false, message: 'Only property managers can update unit numbers' };
    }

    // Check if new unit number conflicts with existing units
    if (args.unitNumber !== unit.unitNumber && args.unitNumber !== undefined) {
      const existingUnit = await ctx.db
        .query('units')
        .withIndex('by_unit_number', q => q.eq('propertyId', unit.propertyId).eq('unitNumber', args.unitNumber!))
        .first();

      if (existingUnit) {
        return { success: false, message: 'Unit number already exists for this property' };
      }
    }

    updateData.unitNumber = args.unitNumber;
  }

  // Add other fields that both tenants and managers can update
  if (args.unitType !== undefined) updateData.unitType = args.unitType;
  if (args.floor !== undefined) updateData.floor = args.floor;
  if (args.bedrooms !== undefined) updateData.bedrooms = args.bedrooms;
  if (args.bathrooms !== undefined) updateData.bathrooms = args.bathrooms;
  if (args.squareFootage !== undefined) updateData.squareFootage = args.squareFootage;

  // Only managers can update rent amount
  if (args.rentAmount !== undefined) {
    if (!isManager) {
      return { success: false, message: 'Only property managers can update rent amounts' };
    }
    updateData.rentAmount = args.rentAmount;
  }

  // Update the unit
  await ctx.db.patch(args.unitId, updateData);

  return { success: true, unitId: args.unitId };
};
