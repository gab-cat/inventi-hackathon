import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';
import { v } from 'convex/values';

export const mobileGetIoTReadingsArgs = v.object({
  deviceId: v.optional(v.id('iotDevices')),
  propertyId: v.optional(v.id('properties')),
  unitId: v.optional(v.id('units')),
  readingType: v.optional(v.string()),
  limit: v.optional(v.number()),
  startTime: v.optional(v.number()),
  endTime: v.optional(v.number()),
});

export const mobileGetIoTReadingsHandler = async (
  ctx: QueryCtx,
  args: {
    deviceId?: Id<'iotDevices'>;
    propertyId?: Id<'properties'>;
    unitId?: Id<'units'>;
    readingType?: string;
    limit?: number;
    startTime?: number;
    endTime?: number;
  }
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated', readings: [] };
  }

  const me = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('clerkId'), identity.subject))
    .first();
  if (!me) {
    return { success: false, message: 'User not found' };
  }

  // Collect then filter to avoid type narrowing issues with reassigning query builders
  let all = await ctx.db.query('iotReadings').order('desc').collect();

  if (args.deviceId) all = all.filter(reading => reading.deviceId === args.deviceId);
  if (args.unitId) all = all.filter(reading => reading.unitId === args.unitId);
  if (args.readingType) all = all.filter(reading => reading.readingType === args.readingType);

  if (args.startTime) all = all.filter(reading => reading.timestamp >= args.startTime!);
  if (args.endTime) all = all.filter(reading => reading.timestamp <= args.endTime!);

  // Limit results for mobile performance
  const limit = args.limit || 50;
  const readings = all.slice(0, limit);

  return { success: true, readings };
};
