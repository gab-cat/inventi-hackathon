import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const getMaintenanceScheduleArgs = {
  propertyId: v.optional(v.id('properties')),
} as const;

export const getMaintenanceScheduleReturns = v.array(
  v.object({
    assetId: v.id('assets'),
    assetName: v.string(),
    nextMaintenance: v.number(),
    daysUntil: v.number(),
  })
);

type Args = {
  propertyId?: Id<'properties'>;
};

export const getMaintenanceScheduleHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    throw new Error('Forbidden');
  }

  // Placeholder maintenance schedule
  return [];
};
