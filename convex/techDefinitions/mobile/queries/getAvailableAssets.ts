import { QueryCtx } from '../../../_generated/server';
import { v, Infer } from 'convex/values';

export const getAvailableAssetsArgs = v.object({
  category: v.optional(v.string()),
  search: v.optional(v.string()),
});

export const getAvailableAssetsReturns = v.object({
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
        brand: v.optional(v.string()),
        model: v.optional(v.string()),
        condition: v.string(),
        location: v.string(),
        photos: v.optional(v.array(v.string())),
        maintenanceSchedule: v.optional(
          v.object({
            interval: v.number(),
            lastMaintenance: v.optional(v.number()),
            nextMaintenance: v.optional(v.number()),
          })
        ),
      })
    )
  ),
});

export const getAvailableAssetsHandler = async (ctx: QueryCtx, args: Infer<typeof getAvailableAssetsArgs>) => {
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

  // Build asset query for available assets only
  let assetQuery = ctx.db.query('assets').withIndex('by_status', q => q.eq('status', 'available'));

  // Filter by user's properties
  assetQuery = assetQuery.filter(q => q.or(...propertyIds.map(propId => q.eq(q.field('propertyId'), propId))));

  // Filter by category if provided
  if (args.category) {
    assetQuery = assetQuery.filter(q => q.eq(q.field('category'), args.category));
  }

  // Filter by search term if provided (searches name and asset tag)
  if (args.search) {
    const searchTerm = args.search.toLowerCase();
    assetQuery = assetQuery.filter(q => q.or(q.eq(q.field('name'), searchTerm), q.eq(q.field('assetTag'), searchTerm)));
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
      brand: asset.brand,
      model: asset.model,
      condition: asset.condition,
      location: asset.location,
      photos: asset.photos,
      maintenanceSchedule: asset.maintenanceSchedule,
    })),
  };
};
