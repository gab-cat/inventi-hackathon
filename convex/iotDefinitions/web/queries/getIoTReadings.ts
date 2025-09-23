import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';
import { v } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';

export const getIoTReadingsArgs = v.object({
  deviceId: v.optional(v.id('iotDevices')),
  propertyId: v.optional(v.id('properties')),
  unitId: v.optional(v.id('units')),
  readingType: v.optional(v.string()),
  isAnomaly: v.optional(v.boolean()),
  startTime: v.optional(v.number()),
  endTime: v.optional(v.number()),
  paginationOpts: paginationOptsValidator,
});

export const getIoTReadingsHandler = async (
  ctx: QueryCtx,
  args: {
    deviceId?: Id<'iotDevices'>;
    propertyId?: Id<'properties'>;
    unitId?: Id<'units'>;
    readingType?: string;
    isAnomaly?: boolean;
    startTime?: number;
    endTime?: number;
    paginationOpts: any;
  }
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated', page: [], isDone: true };
  }

  // Collect then filter to avoid type narrowing issues with reassigning query builders
  let all = await ctx.db.query('iotReadings').order('desc').collect();

  if (args.deviceId) all = all.filter((reading) => reading.deviceId === args.deviceId);
  if (args.propertyId) all = all.filter((reading) => reading.propertyId === args.propertyId);
  if (args.unitId) all = all.filter((reading) => reading.unitId === args.unitId);
  if (args.readingType) all = all.filter((reading) => reading.readingType === args.readingType);
  if (args.isAnomaly !== undefined) all = all.filter((reading) => reading.isAnomaly === args.isAnomaly);

  if (args.startTime) all = all.filter((reading) => reading.timestamp >= args.startTime!);
  if (args.endTime) all = all.filter((reading) => reading.timestamp <= args.endTime!);

  // Simple pagination implementation
  const startIndex = 0;
  const endIndex = args.paginationOpts.numItems;
  const page = all.slice(startIndex, endIndex);

  return {
    success: true,
    page,
    isDone: endIndex >= all.length,
    continueCursor: endIndex < all.length ? endIndex.toString() : null,
  };
};