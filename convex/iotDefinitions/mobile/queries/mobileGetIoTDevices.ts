import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';
import { v } from 'convex/values';

export const mobileGetIoTDevicesArgs = v.object({
  propertyId: v.optional(v.id('properties')),
  unitId: v.optional(v.id('units')),
  deviceType: v.optional(v.string()),
});

export const mobileGetIoTDevicesHandler = async (
  ctx: QueryCtx,
  args: {
    propertyId?: Id<'properties'>;
    unitId?: Id<'units'>;
    deviceType?: string;
  }
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  const me = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('clerkId'), identity.subject))
    .first();
  if (!me) {
    return { success: false, message: 'User not found' };
  }

  // Collect then filter to avoid type narrowing issues with reassigning query builders
  let all = await ctx.db.query('iotDevices').collect();

  if (args.unitId) all = all.filter(device => device.unitId === args.unitId);
  if (args.deviceType) all = all.filter(device => device.deviceType === args.deviceType);

  // Only show active devices for mobile users
  all = all.filter(device => device.isActive === true);

  return { success: true, devices: all };
};
