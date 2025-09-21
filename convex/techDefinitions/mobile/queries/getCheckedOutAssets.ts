import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';

export const getCheckedOutAssetsArgs = v.object({});

export const getCheckedOutAssetsHandler = async (ctx: QueryCtx) => {
  // Get current user
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return {
      success: false,
      error: 'Not authenticated',
    };
  }

  // Find user by clerkId
  const user = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('clerkId'), identity.subject))
    .first();

  if (!user) {
    return {
      success: false,
      error: 'User not found',
    };
  }

  // Get assets checked out by this user
  const checkedOutAssets = await ctx.db
    .query('assets')
    .filter(q => q.and(q.eq(q.field('assignedTo'), user._id), q.eq(q.field('status'), 'checked_out')))
    .collect();

  // Format response
  const assets = checkedOutAssets.map(asset => ({
    _id: asset._id,
    assetTag: asset.assetTag,
    name: asset.name,
    category: asset.category,
    brand: asset.brand,
    condition: asset.condition,
    checkedOutAt: asset.assignedAt,
    checkedOutLocation: asset.location,
  }));

  return {
    success: true,
    data: assets,
  };
};
