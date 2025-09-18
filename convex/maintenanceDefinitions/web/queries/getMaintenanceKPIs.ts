import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webGetMaintenanceKPIsArgs = {
  propertyId: v.optional(v.id('properties')),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
} as const;

export const webGetMaintenanceKPIsReturns = v.object({
  totalOpen: v.number(),
  byStatus: v.record(v.string(), v.number()),
  byPriority: v.record(v.string(), v.number()),
  avgResolutionTimeMs: v.optional(v.number()),
  overdueCount: v.number(),
});

type Args = {
  propertyId?: Id<'properties'>;
  dateFrom?: number;
  dateTo?: number;
};

export const webGetMaintenanceKPIsHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  const baseQuery = args.propertyId
    ? ctx.db.query('maintenanceRequests').withIndex('by_property', qi => qi.eq('propertyId', args.propertyId!))
    : ctx.db.query('maintenanceRequests');

  let filteredQuery = baseQuery;
  if (args.dateFrom) filteredQuery = filteredQuery.filter(f => f.gte(f.field('createdAt'), args.dateFrom!));
  if (args.dateTo) filteredQuery = filteredQuery.filter(f => f.lte(f.field('createdAt'), args.dateTo!));

  const all = await filteredQuery.collect();

  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  let totalOpen = 0;
  let overdueCount = 0;
  let resolutionSum = 0;
  let resolutionCount = 0;

  const now = Date.now();
  for (const r of all) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    byPriority[r.priority] = (byPriority[r.priority] ?? 0) + 1;
    if (r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'rejected') totalOpen += 1;
    if (r.estimatedCompletion && r.status !== 'completed' && r.estimatedCompletion < now) overdueCount += 1;
    if (r.actualCompletion) {
      resolutionSum += r.actualCompletion - r.createdAt;
      resolutionCount += 1;
    }
  }

  return {
    totalOpen,
    byStatus,
    byPriority,
    avgResolutionTimeMs: resolutionCount ? Math.round(resolutionSum / resolutionCount) : undefined,
    overdueCount,
  };
};
