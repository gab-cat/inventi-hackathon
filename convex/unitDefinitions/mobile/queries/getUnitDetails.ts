import { QueryCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const getUnitDetailsArgs = v.object({
  unitId: v.id('units'),
});

export const getUnitDetailsHandler = async (ctx: QueryCtx, args: Infer<typeof getUnitDetailsArgs>) => {
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

  // Get the unit
  const unit = await ctx.db.get(args.unitId);
  if (!unit) {
    return { success: false, message: 'Unit not found' };
  }

  // Check authorization - user must be tenant of the unit OR have access to the property
  const isTenant = unit.tenantId === me._id;
  let hasPropertyAccess = false;

  if (!isTenant) {
    const userProperty = await ctx.db
      .query('userProperties')
      .withIndex('by_user_property', q => q.eq('userId', me._id).eq('propertyId', unit.propertyId))
      .filter(q => q.eq(q.field('isActive'), true))
      .first();

    hasPropertyAccess = !!userProperty;
  }

  if (!isTenant && !hasPropertyAccess) {
    return { success: false, message: 'Not authorized to view this unit' };
  }

  // Get property details
  const property = await ctx.db.get(unit.propertyId);

  // Get tenant details if assigned
  let tenant = null;
  if (unit.tenantId) {
    tenant = await ctx.db.get(unit.tenantId);
  }

  return {
    success: true,
    unit: {
      ...unit,
      property,
      tenant: tenant
        ? {
            _id: tenant._id,
            firstName: tenant.firstName,
            lastName: tenant.lastName,
            email: tenant.email,
          }
        : null,
    },
  };
};
