import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const getAssetUtilizationArgs = {
  propertyId: v.optional(v.id('properties')),
} as const;

export const getAssetUtilizationReturns = v.object({
  utilizationRate: v.number(),
  mostUsedAssets: v.array(v.string()),
  leastUsedAssets: v.array(v.string()),
});

type Args = {
  propertyId?: Id<'properties'>;
};

export const getAssetUtilizationHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    throw new Error('Forbidden');
  }

  // Placeholder utilization data
  return {
    utilizationRate: 0.75,
    mostUsedAssets: [],
    leastUsedAssets: [],
  };
};
