import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webGetAssetAlertsArgs = {
  propertyId: v.optional(v.id('properties')),
} as const;

export const webGetAssetAlertsReturns = v.array(
  v.object({
    type: v.string(),
    message: v.string(),
    severity: v.string(),
    assetId: v.optional(v.id('assets')),
    assetName: v.optional(v.string()),
  })
);

type Args = {
  propertyId?: Id<'properties'>;
};

export const webGetAssetAlertsHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    throw new Error('Forbidden');
  }

  // Placeholder alerts
  return [];
};
