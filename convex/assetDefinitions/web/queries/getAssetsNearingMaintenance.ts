import { v } from 'convex/values';
import { query, QueryCtx } from '../../../_generated/server';
import { Id, Doc } from '../../../_generated/dataModel';

export const webGetAssetsNearingMaintenanceArgs = {
  propertyId: v.id('properties'),
  daysBeforeDue: v.optional(v.number()), // Default to 7 days
} as const;

export const webGetAssetsNearingMaintenanceReturns = v.array(
  v.object({
    _id: v.id('assets'),
    _creationTime: v.number(),
    propertyId: v.id('properties'),
    assetTag: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    purchaseDate: v.optional(v.number()),
    purchasePrice: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    condition: v.string(),
    status: v.string(),
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
    warrantyExpiry: v.optional(v.number()),
    photos: v.optional(v.array(v.string())),
    documents: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Joined data
    property: v.object({
      _id: v.id('properties'),
      name: v.string(),
      address: v.string(),
    }),
    assignedUser: v.optional(
      v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
        email: v.string(),
      })
    ),
    // Computed fields
    maintenanceDue: v.boolean(),
    warrantyExpiring: v.boolean(),
    daysSinceLastMaintenance: v.optional(v.number()),
    daysUntilNextMaintenance: v.optional(v.number()),
    daysUntilWarrantyExpiry: v.optional(v.number()),
  })
);

export const webGetAssetsNearingMaintenanceHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) throw new Error('User not found');

  // Check if user has access to this property
  const property = await ctx.db.get(args.propertyId);
  if (!property) throw new Error('Property not found');

  // Get all assets for the property
  const assets: Doc<'assets'>[] = await ctx.db
    .query('assets')
    .withIndex('by_property', q => q.eq('propertyId', args.propertyId))
    .collect();

  const daysBeforeDue = args.daysBeforeDue || 7;
  const currentTime = Date.now();
  const sevenDaysFromNow = currentTime + daysBeforeDue * 24 * 60 * 60 * 1000;

  // Filter assets that are nearing maintenance due
  const assetsNearingMaintenance = assets.filter(asset => {
    if (!asset.maintenanceSchedule?.nextMaintenance) return false;

    // Check if next maintenance is within the specified days
    return asset.maintenanceSchedule.nextMaintenance <= sevenDaysFromNow;
  });

  // Get property details
  const propertyDetails = {
    _id: property._id,
    name: property.name,
    address: property.address,
  };

  // Process each asset to include computed fields and joined data
  const processedAssets = await Promise.all(
    assetsNearingMaintenance.map(async asset => {
      // Get assigned user details if assigned
      let assignedUser = undefined;
      if (asset.assignedTo) {
        const user = await ctx.db.get(asset.assignedTo);
        if (user) {
          assignedUser = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          };
        }
      }

      // Calculate computed fields
      const maintenanceDue = asset.maintenanceSchedule?.nextMaintenance
        ? asset.maintenanceSchedule.nextMaintenance <= currentTime
        : false;

      const warrantyExpiring = asset.warrantyExpiry
        ? asset.warrantyExpiry <= currentTime + 30 * 24 * 60 * 60 * 1000 // 30 days
        : false;

      const daysSinceLastMaintenance = asset.maintenanceSchedule?.lastMaintenance
        ? Math.floor((currentTime - asset.maintenanceSchedule.lastMaintenance) / (24 * 60 * 60 * 1000))
        : undefined;

      const daysUntilNextMaintenance = asset.maintenanceSchedule?.nextMaintenance
        ? Math.floor((asset.maintenanceSchedule.nextMaintenance - currentTime) / (24 * 60 * 60 * 1000))
        : undefined;

      const daysUntilWarrantyExpiry = asset.warrantyExpiry
        ? Math.floor((asset.warrantyExpiry - currentTime) / (24 * 60 * 60 * 1000))
        : undefined;

      return {
        _id: asset._id,
        _creationTime: asset._creationTime,
        propertyId: asset.propertyId,
        assetTag: asset.assetTag,
        name: asset.name,
        description: asset.description,
        category: asset.category,
        subcategory: asset.subcategory,
        brand: asset.brand,
        model: asset.model,
        serialNumber: asset.serialNumber,
        purchaseDate: asset.purchaseDate,
        purchasePrice: asset.purchasePrice,
        currentValue: asset.currentValue,
        condition: asset.condition,
        status: asset.status,
        location: asset.location,
        assignedTo: asset.assignedTo,
        assignedAt: asset.assignedAt,
        maintenanceSchedule: asset.maintenanceSchedule,
        warrantyExpiry: asset.warrantyExpiry,
        photos: asset.photos,
        documents: asset.documents,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
        property: propertyDetails,
        assignedUser,
        maintenanceDue,
        warrantyExpiring,
        daysSinceLastMaintenance,
        daysUntilNextMaintenance,
        daysUntilWarrantyExpiry,
      };
    })
  );

  // Sort by days until next maintenance (ascending - most urgent first)
  return processedAssets.sort((a, b) => {
    const aDays = a.daysUntilNextMaintenance || 0;
    const bDays = b.daysUntilNextMaintenance || 0;
    return aDays - bDays;
  });
};

export const webGetAssetsNearingMaintenance = query({
  args: webGetAssetsNearingMaintenanceArgs,
  returns: webGetAssetsNearingMaintenanceReturns,
  handler: webGetAssetsNearingMaintenanceHandler,
});

type Args = {
  propertyId: Id<'properties'>;
  daysBeforeDue?: number;
};
