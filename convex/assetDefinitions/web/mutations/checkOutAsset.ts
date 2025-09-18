import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const checkOutAssetArgs = {
  assetId: v.id('assets'),
  userId: v.id('users'),
  expectedReturnDate: v.optional(v.number()),
  location: v.optional(v.string()),
  notes: v.optional(v.string()),
} as const;

export const checkOutAssetReturns = v.object({
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
  userId: Id<'users'>;
  expectedReturnDate?: number;
  location?: string;
  notes?: string;
};

export const checkOutAssetHandler = async (ctx: MutationCtx, args: Args) => {
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

  // Get the user to check out to
  const userToCheckOut = await ctx.db.get(args.userId);
  if (!userToCheckOut) throw new Error('User not found');

  // Check if asset is available for checkout
  if (asset.status !== 'available') {
    throw new Error('Asset is not available for checkout');
  }

  // Check if asset is already assigned
  if (asset.assignedTo) {
    throw new Error('Asset is already assigned to another user');
  }

  // Verify the user has access to this property (if not a manager)
  if (userToCheckOut.role !== 'manager') {
    const userProperty = await ctx.db
      .query('properties')
      .withIndex('by_manager', q => q.eq('managerId', userToCheckOut._id))
      .filter(q => q.eq(q.field('_id'), asset.propertyId))
      .unique();
    
    if (!userProperty) {
      throw new Error('User does not have access to this property');
    }
  }

  // Validate expected return date
  const now = Date.now();
  if (args.expectedReturnDate && args.expectedReturnDate <= now) {
    throw new Error('Expected return date must be in the future');
  }

  const newLocation = args.location || asset.location;

  // Update the asset
  await ctx.db.patch(args.assetId, {
    assignedTo: args.userId,
    assignedAt: now,
    location: newLocation,
    status: 'checked_out',
    updatedAt: now,
  });

  // Create history entry
  await ctx.db.insert('assetHistory', {
    assetId: args.assetId,
    propertyId: asset.propertyId,
    action: 'check_out',
    toUser: args.userId,
    toLocation: newLocation,
    notes: args.notes || `Asset checked out to ${userToCheckOut.firstName} ${userToCheckOut.lastName}`,
    timestamp: now,
    performedBy: currentUser._id,
  });

  // Return the updated asset
  const updatedAsset = await ctx.db.get(args.assetId);
  if (!updatedAsset) throw new Error('Failed to check out asset');

  return updatedAsset;
};
