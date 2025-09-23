import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';
import { Infer, v } from 'convex/values';

export const getUserPropertiesArgs = v.object({});

export const getUserPropertiesReturns = v.object({
  success: v.boolean(),
  properties: v.array(
    v.object({
      propertyId: v.id('properties'),
      propertyName: v.string(),
      units: v.array(
        v.object({
          unitId: v.id('units'),
          unitNumber: v.string(),
        })
      ),
      role: v.string(),
    })
  ),
  message: v.optional(v.string()),
});

export const getUserPropertiesHandler = async (ctx: QueryCtx, args: Infer<typeof getUserPropertiesArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, properties: [], message: 'User not authenticated' };
  }

  // Get user properties
  const userProperties = await ctx.db
    .query('userProperties')
    .withIndex('by_user', q => q.eq('userId', identity._id as Id<'users'>))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  if (userProperties.length === 0) {
    return { success: true, properties: [], message: 'No associated properties found' };
  }

  // Get property details and associated units
  const propertiesWithUnits = await Promise.all(
    userProperties.map(async userProperty => {
      const property = await ctx.db.get(userProperty.propertyId);
      if (!property) return null;

      // Get all units for this property (user has access to all units in their properties)
      const propertyUnits = await ctx.db
        .query('units')
        .withIndex('by_property', q => q.eq('propertyId', userProperty.propertyId))
        .collect();

      const units = propertyUnits.map(unit => ({
        unitId: unit._id,
        unitNumber: unit.unitNumber,
      }));

      return {
        propertyId: property._id,
        propertyName: property.name,
        units,
        role: userProperty.role,
      };
    })
  );

  const validProperties = propertiesWithUnits.filter((p): p is NonNullable<typeof p> => p !== null);

  return { success: true, properties: validProperties };
};
