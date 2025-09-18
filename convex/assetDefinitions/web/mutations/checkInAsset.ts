import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const checkInAssetArgs = {
  assetId: v.id('assets'),
  location: v.optional(v.string()),
  condition: v.optional(
    v.union(
      v.literal('excellent'),
      v.literal('good'),
      v.literal('fair'),
      v.literal('poor'),
      v.literal('broken')
    )
  ),
  notes: v.optional(v.string()),
} as const;

export const checkInAssetReturns = v.object({
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
});

type Args = {
  assetId: Id<'assets'>;
  location?: string;
  condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  notes?: string;
};

export const checkInAssetHandler = async (ctx: MutationCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager or field technician
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) {
    throw new Error('Forbidden');
  }

  // Get the asset
  const asset = await ctx.db.get(args.assetId);
  if (!asset) throw new Error('Asset not found');

  // Verify user has access to the property
  const property = await ctx.db.get(asset.propertyId);
  if (!property) throw new Error('Property not found');
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  // Check if asset is checked out
  if (asset.status !== 'checked_out') {
    throw new Error('Asset is not currently checked out');
  }

  // Check if asset is assigned
  if (!asset.assignedTo) {
    throw new Error('Asset is not assigned to any user');
  }

  const now = Date.now();
  const newLocation = args.location || asset.location;
  const newCondition = args.condition || asset.condition;

  // Prepare update data
  const updateData: any = {
    assignedTo: undefined,
    assignedAt: undefined,
    location: newLocation,
    condition: newCondition,
    status: 'available',
    updatedAt: now,
  };

  // Update the asset
  await ctx.db.patch(args.assetId, updateData);

  // Create history entry
  await ctx.db.insert('assetHistory', {
    assetId: args.assetId,
    propertyId: asset.propertyId,
    action: 'check_in',
    fromUser: asset.assignedTo,
    fromLocation: asset.location,
    toLocation: newLocation,
    notes: args.notes || `Asset checked in from ${asset.assignedTo ? 'assigned user' : 'unknown user'}`,
    timestamp: now,
    performedBy: currentUser._id,
  });

  // Return the updated asset
  const updatedAsset = await ctx.db.get(args.assetId);
  if (!updatedAsset) throw new Error('Failed to check in asset');

  return updatedAsset;
};
