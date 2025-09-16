import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const getMaintenanceTrendsArgs = {
  propertyId: v.optional(v.id('properties')),
  // interval in days for grouping (1 = daily, 7 = weekly, 30 = monthly approx)
  bucketDays: v.optional(v.number()),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
} as const;

export const getMaintenanceTrendsReturns = v.object({
  buckets: v.array(
    v.object({
      start: v.number(),
      end: v.number(),
      createdCount: v.number(),
      completedCount: v.number(),
    })
  ),
});

type Args = {
  propertyId?: Id<'properties'>;
  bucketDays?: number;
  dateFrom?: number;
  dateTo?: number;
};

export const getMaintenanceTrendsHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  const bucketDays = Math.max(1, Math.floor(args.bucketDays ?? 7));
  const now = Date.now();
  const defaultFrom = now - 30 * 24 * 60 * 60 * 1000; // last 30 days
  const start = args.dateFrom ?? defaultFrom;
  const end = args.dateTo ?? now;

  // Collect created
  const createdQuery = args.propertyId
    ? ctx.db.query('maintenanceRequests').withIndex('by_property', qi => qi.eq('propertyId', args.propertyId!))
    : ctx.db.query('maintenanceRequests');
  const created = await createdQuery
    .filter(f => f.gte(f.field('createdAt'), start))
    .filter(f => f.lte(f.field('createdAt'), end))
    .collect();

  // Collect completed (actualCompletion within range)
  const completedQuery = args.propertyId
    ? ctx.db.query('maintenanceRequests').withIndex('by_property', qi => qi.eq('propertyId', args.propertyId!))
    : ctx.db.query('maintenanceRequests');
  const completed = await completedQuery
    .filter(f => f.neq(f.field('actualCompletion'), null as any))
    .filter(f => f.gte(f.field('actualCompletion'), start))
    .filter(f => f.lte(f.field('actualCompletion'), end))
    .collect();

  const bucketMs = bucketDays * 24 * 60 * 60 * 1000;
  const bucketStart = (ts: number) => Math.floor((ts - start) / bucketMs) * bucketMs + start;

  const map = new Map<number, { start: number; end: number; createdCount: number; completedCount: number }>();
  const ensure = (s: number) => {
    if (!map.has(s)) map.set(s, { start: s, end: s + bucketMs - 1, createdCount: 0, completedCount: 0 });
    return map.get(s)!;
  };

  for (const r of created) {
    const s = bucketStart(r.createdAt);
    ensure(s).createdCount += 1;
  }
  for (const r of completed) {
    const s = bucketStart(r.actualCompletion!);
    ensure(s).completedCount += 1;
  }

  const buckets = Array.from(map.values()).sort((a, b) => a.start - b.start);
  return { buckets };
};
