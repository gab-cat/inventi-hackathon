import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webGetManagerPropertiesArgs = {} as const;

export const webGetManagerPropertiesReturns = v.array(
  v.object({
    _id: v.id('properties'),
    name: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    propertyType: v.string(),
    totalUnits: v.number(),
    isActive: v.boolean(),
  })
);

export const webGetManagerPropertiesHandler = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Get properties where current user is the manager
  const properties = await ctx.db
    .query('properties')
    .withIndex('by_manager', q => q.eq('managerId', currentUser._id))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  return properties;
};
