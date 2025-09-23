import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';
import { v } from 'convex/values';

export const getIoTDevicesArgs = v.object({
  propertyId: v.optional(v.id('properties')),
  unitId: v.optional(v.id('units')),
  deviceType: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
});

export const getIoTDevicesHandler = async (
  ctx: QueryCtx,
  args: {
    propertyId?: Id<'properties'>;
    unitId?: Id<'units'>;
    deviceType?: string;
    isActive?: boolean;
  }
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  // Collect then filter to avoid type narrowing issues with reassigning query builders
  let all = await ctx.db.query('iotDevices').collect();

  if (args.propertyId) all = all.filter((device) => device.propertyId === args.propertyId);
  if (args.unitId) all = all.filter((device) => device.unitId === args.unitId);
  if (args.deviceType) all = all.filter((device) => device.deviceType === args.deviceType);
  if (args.isActive !== undefined) all = all.filter((device) => device.isActive === args.isActive);

  return { success: true, devices: all };
};