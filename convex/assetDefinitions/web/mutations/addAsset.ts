import { v } from 'convex/values';
import { MutationCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const addAssetArgs = {
  propertyId: v.id('properties'),
  assetTag: v.string(), // Barcode/RFID/QR code
  name: v.string(),
  description: v.string(),
  category: v.union(
    v.literal('tool'),
    v.literal('equipment'),
    v.literal('material'),
    v.literal('furniture'),
    v.literal('appliance')
  ),
  subcategory: v.optional(v.string()),
  brand: v.optional(v.string()),
  model: v.optional(v.string()),
  serialNumber: v.optional(v.string()),
  purchaseDate: v.optional(v.number()),
  purchasePrice: v.optional(v.number()),
  currentValue: v.optional(v.number()),
  condition: v.union(
    v.literal('excellent'),
    v.literal('good'),
    v.literal('fair'),
    v.literal('poor'),
    v.literal('broken')
  ),
  status: v.union(
    v.literal('available'),
    v.literal('checked_out'),
    v.literal('maintenance'),
    v.literal('retired'),
    v.literal('lost')
  ),
  location: v.string(),
  assignedTo: v.optional(v.id('users')),
  maintenanceSchedule: v.optional(
    v.object({
      interval: v.number(), // Days between maintenance
      lastMaintenance: v.optional(v.number()),
      nextMaintenance: v.optional(v.number()),
    })
  ),
  warrantyExpiry: v.optional(v.number()),
  photos: v.optional(v.array(v.string())),
  documents: v.optional(v.array(v.string())),
} as const;

export const addAssetReturns = v.object({
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
  propertyId: Id<'properties'>;
  assetTag: string;
  name: string;
  description: string;
  category: 'tool' | 'equipment' | 'material' | 'furniture' | 'appliance';
  subcategory?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: number;
  purchasePrice?: number;
  currentValue?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  status: 'available' | 'checked_out' | 'maintenance' | 'retired' | 'lost';
  location: string;
  assignedTo?: Id<'users'>;
  maintenanceSchedule?: {
    interval: number;
    lastMaintenance?: number;
    nextMaintenance?: number;
  };
  warrantyExpiry?: number;
  photos?: string[];
  documents?: string[];
};

export const addAssetHandler = async (ctx: MutationCtx, args: Args) => {
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

  // Verify property exists and user has access to it
  const property = await ctx.db.get(args.propertyId);
  if (!property) throw new Error('Property not found');
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  // Check if asset tag already exists
  const existingAsset = await ctx.db
    .query('assets')
    .withIndex('by_asset_tag', q => q.eq('assetTag', args.assetTag))
    .unique();
  if (existingAsset) throw new Error('Asset tag already exists');

  // Verify assigned user exists and has access to the property (if specified)
  if (args.assignedTo) {
    const assignedUser = await ctx.db.get(args.assignedTo);
    if (!assignedUser) throw new Error('Assigned user not found');
    
    // Check if user has access to this property
    const userProperty = await ctx.db
      .query('properties')
      .withIndex('by_manager', q => q.eq('managerId', assignedUser._id))
      .filter(q => q.eq(q.field('_id'), args.propertyId))
      .unique();
    
    if (!userProperty && assignedUser.role !== 'manager') {
      throw new Error('Assigned user does not have access to this property');
    }
  }

  // Validate maintenance schedule
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

  // Calculate next maintenance if maintenance schedule is provided
  let nextMaintenance: number | undefined;
  if (args.maintenanceSchedule) {
    if (args.maintenanceSchedule.lastMaintenance) {
      nextMaintenance = args.maintenanceSchedule.lastMaintenance + (args.maintenanceSchedule.interval * 24 * 60 * 60 * 1000);
    } else {
      // If no last maintenance, schedule first maintenance based on interval
      nextMaintenance = now + (args.maintenanceSchedule.interval * 24 * 60 * 60 * 1000);
    }
  }

  // Create the asset
  const assetId = await ctx.db.insert('assets', {
    propertyId: args.propertyId,
    assetTag: args.assetTag,
    name: args.name,
    description: args.description,
    category: args.category,
    subcategory: args.subcategory,
    brand: args.brand,
    model: args.model,
    serialNumber: args.serialNumber,
    purchaseDate: args.purchaseDate,
    purchasePrice: args.purchasePrice,
    currentValue: args.currentValue,
    condition: args.condition,
    status: args.status,
    location: args.location,
    assignedTo: args.assignedTo,
    assignedAt: args.assignedTo ? now : undefined,
    maintenanceSchedule: args.maintenanceSchedule ? {
      interval: args.maintenanceSchedule.interval,
      lastMaintenance: args.maintenanceSchedule.lastMaintenance,
      nextMaintenance: nextMaintenance,
    } : undefined,
    warrantyExpiry: args.warrantyExpiry,
    photos: args.photos,
    documents: args.documents,
    createdAt: now,
    updatedAt: now,
  });

  // Create initial history entry
  await ctx.db.insert('assetHistory', {
    assetId,
    propertyId: args.propertyId,
    action: 'created',
    notes: `Asset created: ${args.name}`,
    timestamp: now,
    performedBy: currentUser._id,
  });

  // If asset is assigned, create assignment history
  if (args.assignedTo) {
    await ctx.db.insert('assetHistory', {
      assetId,
      propertyId: args.propertyId,
      action: 'assigned',
      toUser: args.assignedTo,
      toLocation: args.location,
      notes: `Asset assigned to user`,
      timestamp: now,
      performedBy: currentUser._id,
    });
  }

  // Return the created asset
  const createdAsset = await ctx.db.get(assetId);
  if (!createdAsset) throw new Error('Failed to create asset');

  return createdAsset;
};
