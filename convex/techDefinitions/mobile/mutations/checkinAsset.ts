import { MutationCtx } from '../../../_generated/server';
import { v, Infer } from 'convex/values';

export const checkinAssetArgs = v.object({
  assetId: v.id('assets'),
  condition: v.union(
    v.literal('excellent'),
    v.literal('good'),
    v.literal('fair'),
    v.literal('poor'),
    v.literal('broken')
  ),
  notes: v.optional(v.string()),
});

export const checkinAssetReturns = v.object({
  success: v.boolean(),
  message: v.string(),
});

export const checkinAssetHandler = async (ctx: MutationCtx, args: Infer<typeof checkinAssetArgs>) => {
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

  // Check if the asset is checked out by this user
  if (asset.status !== 'checked_out' || asset.assignedTo !== me._id) {
    return { success: false, message: 'Asset is not checked out by you' };
  }

  const now = Date.now();

  // Update asset status and condition
  await ctx.db.patch(args.assetId, {
    status: 'available',
    assignedTo: undefined,
    assignedAt: undefined,
    condition: args.condition,
    updatedAt: now,
  });

  // Create asset history record
  await ctx.db.insert('assetHistory', {
    assetId: args.assetId,
    propertyId: asset.propertyId,
    action: 'check_in',
    fromUser: me._id,
    toUser: undefined,
    fromLocation: asset.location,
    toLocation: asset.location, // Location doesn't change on checkin
    notes: args.notes || `Checked in with condition: ${args.condition}`,
    timestamp: now,
    performedBy: me._id,
  });

  return {
    success: true,
    message: `Asset ${asset.assetTag} checked in successfully`,
  };
};
