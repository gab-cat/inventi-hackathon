import { QueryCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const getUnitsByPropertyArgs = v.object({
  propertyId: v.id('properties'),
});

export const getUnitsByPropertyHandler = async (ctx: QueryCtx, args: Infer<typeof getUnitsByPropertyArgs>) => {
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

  if (!userProperty) {
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
