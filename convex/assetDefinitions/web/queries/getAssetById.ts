import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const getAssetByIdArgs = {
  assetId: v.id('assets'),
} as const;

export const getAssetByIdReturns = v.object({
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
  // Recent history (last 10 entries)
  recentHistory: v.array(
    v.object({
      _id: v.id('assetHistory'),
      action: v.string(),
      notes: v.optional(v.string()),
      timestamp: v.number(),
      performedBy: v.id('users'),
      performer: v.object({
        _id: v.id('users'),
        firstName: v.string(),
        lastName: v.string(),
      }),
    })
  ),
});

type Args = {
  assetId: Id<'assets'>;
};

export const getAssetByIdHandler = async (ctx: QueryCtx, args: Args) => {
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

  // Get assigned user info if applicable
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
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  let maintenanceDue = false;
  let daysSinceLastMaintenance: number | undefined;
  let daysUntilNextMaintenance: number | undefined;
  
  if (asset.maintenanceSchedule) {
    if (asset.maintenanceSchedule.nextMaintenance) {
      maintenanceDue = asset.maintenanceSchedule.nextMaintenance <= now;
      daysUntilNextMaintenance = Math.ceil((asset.maintenanceSchedule.nextMaintenance - now) / oneDay);
    }
    
    if (asset.maintenanceSchedule.lastMaintenance) {
      daysSinceLastMaintenance = Math.floor((now - asset.maintenanceSchedule.lastMaintenance) / oneDay);
    }
  }

  let warrantyExpiring = false;
  let daysUntilWarrantyExpiry: number | undefined;
  
  if (asset.warrantyExpiry) {
    const thirtyDaysFromNow = now + (30 * oneDay);
    warrantyExpiring = asset.warrantyExpiry <= thirtyDaysFromNow;
    daysUntilWarrantyExpiry = Math.ceil((asset.warrantyExpiry - now) / oneDay);
  }

  // Get recent history (last 10 entries)
  const recentHistoryEntries = await ctx.db
    .query('assetHistory')
    .withIndex('by_asset', q => q.eq('assetId', args.assetId))
    .order('desc')
    .take(10);

  const recentHistory = await Promise.all(
    recentHistoryEntries.map(async entry => {
      const performer = await ctx.db.get(entry.performedBy);
      if (!performer) throw new Error('Performer not found');
      
      return {
        _id: entry._id,
        action: entry.action,
        notes: entry.notes,
        timestamp: entry.timestamp,
        performedBy: entry.performedBy,
        performer: {
          _id: performer._id,
          firstName: performer.firstName,
          lastName: performer.lastName,
        },
      };
    })
  );

  return {
    ...asset,
    property: {
      _id: property._id,
      name: property.name,
      address: property.address,
    },
    assignedUser,
    maintenanceDue,
    warrantyExpiring,
    daysSinceLastMaintenance,
    daysUntilNextMaintenance,
    daysUntilWarrantyExpiry,
    recentHistory,
  };
};
