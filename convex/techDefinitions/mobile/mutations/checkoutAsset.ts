import { MutationCtx } from '../../../_generated/server';
import { v, Infer } from 'convex/values';

export const checkoutAssetArgs = v.object({
  assetId: v.id('assets'),
  requestId: v.optional(v.id('maintenanceRequests')), // Optional association with maintenance request
  notes: v.optional(v.string()),
});

export const checkoutAssetReturns = v.object({
  success: v.boolean(),
  message: v.string(),
});

export const checkoutAssetHandler = async (ctx: MutationCtx, args: Infer<typeof checkoutAssetArgs>) => {
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

  // Check if the asset is available
  if (asset.status !== 'available') {
    return { success: false, message: `Asset is not available. Current status: ${asset.status}` };
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

  // Update asset status
  await ctx.db.patch(args.assetId, {
    status: 'checked_out',
    assignedTo: me._id,
    assignedAt: now,
    updatedAt: now,
  });

  // Create asset history record
  await ctx.db.insert('assetHistory', {
    assetId: args.assetId,
    propertyId: asset.propertyId,
    action: 'check_out',
    fromUser: undefined,
    toUser: me._id,
    fromLocation: asset.location,
    toLocation: asset.location, // Location doesn't change on checkout
    notes: args.notes || 'Checked out by field technician',
    timestamp: now,
    performedBy: me._id,
  });

  return {
    success: true,
    message: `Asset ${asset.assetTag} checked out successfully`,
  };
};
