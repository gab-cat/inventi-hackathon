import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const unassignAssetFromUserArgs = {
  assetId: v.id('assets'),
  notes: v.optional(v.string()),
} as const;

export const unassignAssetFromUserReturns = v.object({
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
  notes?: string;
};

export const unassignAssetFromUserHandler = async (ctx: MutationCtx, args: Args) => {
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

  // Check if asset is assigned
  if (!asset.assignedTo) {
    throw new Error('Asset is not currently assigned to any user');
  }

  const now = Date.now();

  // Update the asset
  await ctx.db.patch(args.assetId, {
    assignedTo: undefined,
    assignedAt: undefined,
    status: 'available',
    updatedAt: now,
  });

  // Create history entry
  await ctx.db.insert('assetHistory', {
    assetId: args.assetId,
    propertyId: asset.propertyId,
    action: 'unassigned',
    fromUser: asset.assignedTo,
    notes: args.notes || 'Asset unassigned from user',
    timestamp: now,
    performedBy: currentUser._id,
  });

  // Return the updated asset
  const updatedAsset = await ctx.db.get(args.assetId);
  if (!updatedAsset) throw new Error('Failed to unassign asset');

  return updatedAsset;
};
