import { QueryCtx } from '../../../_generated/server';

export const getMyUnitsArgs = {};

export const getMyUnitsHandler = async (ctx: QueryCtx) => {
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

  // Get units where the user is the tenant
  const myUnits = await ctx.db
    .query('units')
    .withIndex('by_tenant', q => q.eq('tenantId', me._id))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  // Get the properties for these units
  const propertyIds = [...new Set(myUnits.map(unit => unit.propertyId))];
  const properties = await Promise.all(propertyIds.map(propertyId => ctx.db.get(propertyId)));

  // Create a map of property ID to property
  const propertyMap = new Map();
  properties.forEach(property => {
    if (property) {
      propertyMap.set(property._id, property);
    }
  });

  // Attach property info to units
  const unitsWithProperties = myUnits.map(unit => ({
    ...unit,
    property: propertyMap.get(unit.propertyId),
  }));

  return { success: true, units: unitsWithProperties };
};
