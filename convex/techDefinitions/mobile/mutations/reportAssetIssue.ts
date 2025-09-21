import { MutationCtx } from '../../../_generated/server';
import { v, Infer } from 'convex/values';

export const reportAssetIssueArgs = v.object({
  assetId: v.id('assets'),
  issueType: v.union(v.literal('damaged'), v.literal('missing'), v.literal('malfunctioning'), v.literal('other')),
  description: v.string(),
  severity: v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('critical')),
  photos: v.optional(v.array(v.string())),
});

export const reportAssetIssueReturns = v.object({
  success: v.boolean(),
  message: v.string(),
});

export const reportAssetIssueHandler = async (ctx: MutationCtx, args: Infer<typeof reportAssetIssueArgs>) => {
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

  // Update asset status based on issue type
  let newStatus = asset.status;
  if (args.issueType === 'missing') {
    newStatus = 'lost';
  } else if (args.severity === 'critical' || args.issueType === 'damaged') {
    newStatus = 'maintenance';
  }

  // Update asset if status changed
  if (newStatus !== asset.status) {
    await ctx.db.patch(args.assetId, {
      status: newStatus,
      updatedAt: now,
    });
  }

  // Create asset history record for the issue report
  await ctx.db.insert('assetHistory', {
    assetId: args.assetId,
    propertyId: asset.propertyId,
    action: args.issueType === 'missing' ? 'transfer' : 'maintenance', // Use appropriate action
    fromUser: asset.assignedTo,
    toUser: asset.assignedTo, // Keep same assignment
    fromLocation: asset.location,
    toLocation: asset.location, // Location doesn't change
    notes: `Issue reported: ${args.issueType} - ${args.description} (Severity: ${args.severity})`,
    timestamp: now,
    performedBy: me._id,
  });

  // TODO: Here you could create a maintenance request or notification
  // for the asset issue depending on your workflow

  return {
    success: true,
    message: `Asset issue reported for ${asset.assetTag}`,
  };
};
