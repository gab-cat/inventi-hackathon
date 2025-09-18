import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const getAssetAnalyticsArgs = {
  propertyId: v.optional(v.id('properties')),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
} as const;

export const getAssetAnalyticsReturns = v.object({
  utilizationRate: v.number(),
  maintenanceCost: v.number(),
  totalValue: v.number(),
  depreciationRate: v.number(),
});

type Args = {
  propertyId?: Id<'properties'>;
  dateFrom?: number;
  dateTo?: number;
};

export const getAssetAnalyticsHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    throw new Error('Forbidden');
  }

  // Placeholder analytics data
  return {
    utilizationRate: 0.75,
    maintenanceCost: 0,
    totalValue: 0,
    depreciationRate: 0.1,
  };
};
