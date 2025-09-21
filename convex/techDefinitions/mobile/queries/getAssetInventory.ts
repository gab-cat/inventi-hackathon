import { QueryCtx } from '../../../_generated/server';
import { v, Infer } from 'convex/values';
export const getAssetInventoryArgs = v.object({
  category: v.optional(v.string()),
  status: v.optional(v.string()),
});

export const getAssetInventoryReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
  data: v.optional(
    v.array(
      v.object({
        _id: v.id('assets'),
        assetTag: v.string(),
        name: v.string(),
        category: v.string(),
        subcategory: v.optional(v.string()),
        status: v.string(),
        condition: v.string(),
        location: v.string(),
        assignedTo: v.optional(v.id('users')),
        assignedAt: v.optional(v.number()),
        maintenanceSchedule: v.optional(
          v.object({
            interval: v.number(),
            lastMaintenance: v.optional(v.number()),
            nextMaintenance: v.optional(v.number()),
          })
        ),
        photos: v.optional(v.array(v.string())),
      })
    )
  ),
});

export const getAssetInventoryHandler = async (ctx: QueryCtx, args: Infer<typeof getAssetInventoryArgs>) => {
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

  // Get user's assigned properties
  const userProperties = await ctx.db
    .query('userProperties')
    .withIndex('by_user', q => q.eq('userId', me._id))
    .filter(q => q.eq(q.field('isActive'), true))
    .collect();

  const propertyIds = userProperties.map(up => up.propertyId);

  if (propertyIds.length === 0) {
    return { success: false, message: 'No properties assigned to user' };
  }

  // Build asset query
  let assetQuery = ctx.db.query('assets');

  // Filter by user's properties
  assetQuery = assetQuery.filter(q => q.or(...propertyIds.map(propId => q.eq(q.field('propertyId'), propId))));

  // Filter by category if provided
  if (args.category) {
    assetQuery = assetQuery.filter(q => q.eq(q.field('category'), args.category));
  }

  // Filter by status if provided
  if (args.status) {
    assetQuery = assetQuery.filter(q => q.eq(q.field('status'), args.status));
  }

  const assets = await assetQuery.collect();

  return {
    success: true,
    data: assets.map(asset => ({
      _id: asset._id,
      assetTag: asset.assetTag,
      name: asset.name,
      category: asset.category,
      subcategory: asset.subcategory,
      status: asset.status,
      condition: asset.condition,
      location: asset.location,
      assignedTo: asset.assignedTo,
      assignedAt: asset.assignedAt,
      maintenanceSchedule: asset.maintenanceSchedule,
      photos: asset.photos,
    })),
  };
};
