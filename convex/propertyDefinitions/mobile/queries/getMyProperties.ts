import { QueryCtx } from '../../../_generated/server';

export const getMyPropertiesArgs = {};

export const getMyPropertiesHandler = async (ctx: QueryCtx) => {
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

  // Get user properties where the user has tenant role
  const userProperties = await ctx.db
    .query('userProperties')
    .withIndex('by_user', q => q.eq('userId', me._id))
    .filter(q => q.eq(q.field('role'), 'tenant'))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  // Get the actual properties
  const propertyIds = userProperties.map(up => up.propertyId);
  const properties = await Promise.all(propertyIds.map(propertyId => ctx.db.get(propertyId)));

  // Filter out null properties and return active ones
  const validProperties = properties
    .filter(p => p !== null && p.isActive)
    .map(property => ({
      ...property,
      // Include user property info for convenience
      userRole: 'tenant',
      permissions: userProperties.find(up => up.propertyId === property?._id)?.permissions || [],
    }));

  return { success: true, properties: validProperties };
};
