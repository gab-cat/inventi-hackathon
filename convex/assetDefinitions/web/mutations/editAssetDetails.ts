import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const webEditAssetDetailsArgs = {
  assetId: v.id('assets'),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  category: v.optional(
    v.union(
      v.literal('tool'),
      v.literal('equipment'),
      v.literal('material'),
      v.literal('furniture'),
      v.literal('appliance')
    )
  ),
  subcategory: v.optional(v.string()),
  brand: v.optional(v.string()),
  model: v.optional(v.string()),
  serialNumber: v.optional(v.string()),
  purchaseDate: v.optional(v.number()),
  purchasePrice: v.optional(v.number()),
  currentValue: v.optional(v.number()),
  condition: v.optional(
    v.union(
      v.literal('excellent'),
      v.literal('good'),
      v.literal('fair'),
      v.literal('poor'),
      v.literal('broken')
    )
  ),
  location: v.optional(v.string()),
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
  notes: v.optional(v.string()),
} as const;

export const webEditAssetDetailsReturns = v.object({
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
  name?: string;
  description?: string;
  category?: 'tool' | 'equipment' | 'material' | 'furniture' | 'appliance';
  subcategory?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: number;
  purchasePrice?: number;
  currentValue?: number;
  condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  location?: string;
  maintenanceSchedule?: {
    interval: number;
    lastMaintenance?: number;
    nextMaintenance?: number;
  };
  warrantyExpiry?: number;
  photos?: string[];
  documents?: string[];
  notes?: string;
};

export const webEditAssetDetailsHandler = async (ctx: MutationCtx, args: Args) => {
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

  // Validate maintenance schedule if provided
  if (args.maintenanceSchedule) {
    if (args.maintenanceSchedule.interval <= 0) {
      throw new Error('Maintenance interval must be greater than 0');
    }
    
    if (args.maintenanceSchedule.lastMaintenance && args.maintenanceSchedule.nextMaintenance) {
      if (args.maintenanceSchedule.nextMaintenance <= args.maintenanceSchedule.lastMaintenance) {
        throw new Error('Next maintenance must be after last maintenance');
      }
    }
  }

  // Validate dates
  const now = Date.now();
  if (args.purchaseDate && args.purchaseDate > now) {
    throw new Error('Purchase date cannot be in the future');
  }
  if (args.warrantyExpiry && args.warrantyExpiry <= now) {
    throw new Error('Warranty expiry must be in the future');
  }

  // Calculate next maintenance if maintenance schedule is being updated
  let nextMaintenance: number | undefined;
  if (args.maintenanceSchedule) {
    if (args.maintenanceSchedule.lastMaintenance) {
      nextMaintenance = args.maintenanceSchedule.lastMaintenance + (args.maintenanceSchedule.interval * 24 * 60 * 60 * 1000);
    } else if (asset.maintenanceSchedule?.lastMaintenance) {
      nextMaintenance = asset.maintenanceSchedule.lastMaintenance + (args.maintenanceSchedule.interval * 24 * 60 * 60 * 1000);
    } else {
      nextMaintenance = now + (args.maintenanceSchedule.interval * 24 * 60 * 60 * 1000);
    }
  }

  // Prepare update object
  const updateData: any = {
    updatedAt: now,
  };

  // Only update fields that are provided
  if (args.name !== undefined) updateData.name = args.name;
  if (args.description !== undefined) updateData.description = args.description;
  if (args.category !== undefined) updateData.category = args.category;
  if (args.subcategory !== undefined) updateData.subcategory = args.subcategory;
  if (args.brand !== undefined) updateData.brand = args.brand;
  if (args.model !== undefined) updateData.model = args.model;
  if (args.serialNumber !== undefined) updateData.serialNumber = args.serialNumber;
  if (args.purchaseDate !== undefined) updateData.purchaseDate = args.purchaseDate;
  if (args.purchasePrice !== undefined) updateData.purchasePrice = args.purchasePrice;
  if (args.currentValue !== undefined) updateData.currentValue = args.currentValue;
  if (args.condition !== undefined) updateData.condition = args.condition;
  if (args.location !== undefined) updateData.location = args.location;
  if (args.warrantyExpiry !== undefined) updateData.warrantyExpiry = args.warrantyExpiry;
  if (args.photos !== undefined) updateData.photos = args.photos;
  if (args.documents !== undefined) updateData.documents = args.documents;

  // Update maintenance schedule
  if (args.maintenanceSchedule) {
    updateData.maintenanceSchedule = {
      interval: args.maintenanceSchedule.interval,
      lastMaintenance: args.maintenanceSchedule.lastMaintenance,
      nextMaintenance: nextMaintenance,
    };
  }

  // Update the asset
  await ctx.db.patch(args.assetId, updateData);

  // Create history entry
  const changes = Object.keys(updateData).filter(key => key !== 'updatedAt');
  const changeDescription = changes.length > 0 
    ? `Updated: ${changes.join(', ')}` 
    : 'Asset details updated';
  
  await ctx.db.insert('assetHistory', {
    assetId: args.assetId,
    propertyId: asset.propertyId,
    action: 'updated',
    notes: args.notes || changeDescription,
    timestamp: now,
    performedBy: currentUser._id,
  });

  // Return the updated asset
  const updatedAsset = await ctx.db.get(args.assetId);
  if (!updatedAsset) throw new Error('Failed to update asset');

  return updatedAsset;
};
