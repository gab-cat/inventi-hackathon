import { MutationCtx } from '../../../_generated/server';
import { v, Infer } from 'convex/values';

export const scheduleAssetMaintenanceArgs = v.object({
  assetId: v.id('assets'),
  maintenanceType: v.string(),
  description: v.string(),
  scheduledDate: v.number(),
  estimatedCost: v.optional(v.number()),
  notes: v.optional(v.string()),
});

export const scheduleAssetMaintenanceReturns = v.object({
  success: v.boolean(),
  message: v.string(),
});

export const scheduleAssetMaintenanceHandler = async (
  ctx: MutationCtx,
  args: Infer<typeof scheduleAssetMaintenanceArgs>
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

  if (me.role !== 'field_technician') {
    return { success: false, message: 'Access denied. Field technician role required.' };
  }

  // Get the asset
  const asset = await ctx.db.get(args.assetId);
  if (!asset) {
    return { success: false, message: 'Asset not found' };
  }

  // Check if user has access to this asset's property
  const userProperties = await ctx.db
    .query('userProperties')
    .withIndex('by_user_property', q => q.eq('userId', me._id).eq('propertyId', asset.propertyId))
    .first();

  if (!userProperties || !userProperties.isActive) {
    return { success: false, message: "Access denied. You don't have access to this property's assets." };
  }

  const now = Date.now();

  // Update asset status to maintenance
  await ctx.db.patch(args.assetId, {
    status: 'maintenance',
    updatedAt: now,
  });

  // Update maintenance schedule if it exists, otherwise create it
  const currentSchedule = asset.maintenanceSchedule;
  const updatedSchedule = {
    interval: currentSchedule?.interval || 30 * 24 * 60 * 60 * 1000, // Default 30 days
    lastMaintenance: now,
    nextMaintenance: args.scheduledDate,
  };

  await ctx.db.patch(args.assetId, {
    maintenanceSchedule: updatedSchedule,
  });

  // Create asset history record
  await ctx.db.insert('assetHistory', {
    assetId: args.assetId,
    propertyId: asset.propertyId,
    action: 'maintenance',
    fromUser: asset.assignedTo,
    toUser: asset.assignedTo, // Keep same assignment
    fromLocation: asset.location,
    toLocation: asset.location, // Location doesn't change
    notes: `${args.maintenanceType}: ${args.description}${args.estimatedCost ? ` (Est. cost: $${args.estimatedCost})` : ''}${args.notes ? ` - ${args.notes}` : ''}`,
    timestamp: now,
    performedBy: me._id,
  });

  return {
    success: true,
    message: `Maintenance scheduled for asset ${asset.assetTag}`,
  };
};
