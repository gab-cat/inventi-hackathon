import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const getInventoryLevelsArgs = {
  propertyId: v.optional(v.id('properties')),
} as const;

export const getInventoryLevelsReturns = v.array(
  v.object({
    category: v.string(),
    total: v.number(),
    available: v.number(),
    checkedOut: v.number(),
    maintenance: v.number(),
  })
);

type Args = {
  propertyId?: Id<'properties'>;
};

export const getInventoryLevelsHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    throw new Error('Forbidden');
  }

  // Placeholder inventory levels
  return [];
};
