import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webGetAssetReportsArgs = {
  propertyId: v.optional(v.id('properties')),
  reportType: v.union(
    v.literal('inventory'),
    v.literal('maintenance'),
    v.literal('financial'),
    v.literal('utilization')
  ),
} as const;

export const webGetAssetReportsReturns = v.object({
  reportData: v.any(),
  generatedAt: v.number(),
});

type Args = {
  propertyId?: Id<'properties'>;
  reportType: 'inventory' | 'maintenance' | 'financial' | 'utilization';
};

export const webGetAssetReportsHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    throw new Error('Forbidden');
  }

  // Placeholder report data
  return {
    reportData: {},
    generatedAt: Date.now(),
  };
};
