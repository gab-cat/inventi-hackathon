import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const updateAssetStatusArgs = {
  assetId: v.id('assets'),
  status: v.union(
    v.literal('available'),
    v.literal('checked_out'),
    v.literal('maintenance'),
    v.literal('retired'),
    v.literal('lost')
  ),
  notes: v.optional(v.string()),
} as const;

export const updateAssetStatusReturns = v.object({
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
  status: 'available' | 'checked_out' | 'maintenance' | 'retired' | 'lost';
  notes?: string;
};

export const updateAssetStatusHandler = async (ctx: MutationCtx, args: Args) => {
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

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    'available': ['checked_out', 'maintenance', 'retired', 'lost'],
    'checked_out': ['available', 'maintenance', 'retired', 'lost'],
    'maintenance': ['available', 'checked_out', 'retired', 'lost'],
    'retired': ['available'], // Can reactivate retired assets
    'lost': ['available'], // Can recover lost assets
  };

  if (!validTransitions[asset.status]?.includes(args.status)) {
    throw new Error(`Invalid status transition from ${asset.status} to ${args.status}`);
  }

  const now = Date.now();
  const updateData: any = {
    status: args.status,
    updatedAt: now,
  };

  // Handle specific status changes
  if (args.status === 'available') {
    // Clear assignment when making available
    updateData.assignedTo = undefined;
    updateData.assignedAt = undefined;
  } else if (args.status === 'retired' || args.status === 'lost') {
    // Clear assignment when retiring or marking as lost
    updateData.assignedTo = undefined;
    updateData.assignedAt = undefined;
  }

  // Update the asset
  await ctx.db.patch(args.assetId, updateData);

  // Create history entry
  const actionMap: Record<string, string> = {
    'available': 'status_available',
    'checked_out': 'status_checked_out',
    'maintenance': 'status_maintenance',
    'retired': 'status_retired',
    'lost': 'status_lost',
  };

  await ctx.db.insert('assetHistory', {
    assetId: args.assetId,
    propertyId: asset.propertyId,
    action: actionMap[args.status],
    notes: args.notes || `Status changed to ${args.status}`,
    timestamp: now,
    performedBy: currentUser._id,
  });

  // Return the updated asset
  const updatedAsset = await ctx.db.get(args.assetId);
  if (!updatedAsset) throw new Error('Failed to update asset status');

  return updatedAsset;
};
