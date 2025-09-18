import { v } from 'convex/values';
import { PaginationOptions, paginationOptsValidator } from 'convex/server';
import { QueryCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';

export const getAssetsArgs = {
  paginationOpts: paginationOptsValidator,
  propertyId: v.optional(v.id('properties')),
  category: v.optional(
    v.union(
      v.literal('tool'),
      v.literal('equipment'),
      v.literal('material'),
      v.literal('furniture'),
      v.literal('appliance')
    )
  ),
  status: v.optional(
    v.union(
      v.literal('available'),
      v.literal('checked_out'),
      v.literal('maintenance'),
      v.literal('retired'),
      v.literal('lost')
    )
  ),
  condition: v.optional(
    v.union(v.literal('excellent'), v.literal('good'), v.literal('fair'), v.literal('poor'), v.literal('broken'))
  ),
  assignedTo: v.optional(v.id('users')),
  location: v.optional(v.string()),
  search: v.optional(v.string()),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
  hasMaintenanceDue: v.optional(v.boolean()),
  hasWarrantyExpiring: v.optional(v.boolean()),
} as const;

export const getAssetsReturns = v.object({
  page: v.array(
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
  ),
  isDone: v.boolean(),
  continueCursor: v.optional(v.string()),
  pageStatus: v.optional(v.union(v.string(), v.null())),
  splitCursor: v.optional(v.string()),
});

type Args = {
  paginationOpts: PaginationOptions;
  propertyId?: Id<'properties'>;
  category?: 'tool' | 'equipment' | 'material' | 'furniture' | 'appliance';
  status?: 'available' | 'checked_out' | 'maintenance' | 'retired' | 'lost';
  condition?: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  assignedTo?: Id<'users'>;
  location?: string;
  search?: string;
  dateFrom?: number;
  dateTo?: number;
  hasMaintenanceDue?: boolean;
  hasWarrantyExpiring?: boolean;
};

export const getAssetsHandler = async (ctx: QueryCtx, args: Args) => {
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

  // Choose the best index anchor based on provided filters
  let base;
  if (args.propertyId && args.category) {
    base = ctx.db
      .query('assets')
      .withIndex('by_property', q => q.eq('propertyId', args.propertyId!))
      .filter(q => q.eq(q.field('category'), args.category!));
  } else if (args.propertyId && args.status) {
    base = ctx.db
      .query('assets')
      .withIndex('by_property', q => q.eq('propertyId', args.propertyId!))
      .filter(q => q.eq(q.field('status'), args.status!));
  } else if (args.propertyId && args.condition) {
    base = ctx.db
      .query('assets')
      .withIndex('by_property', q => q.eq('propertyId', args.propertyId!))
      .filter(q => q.eq(q.field('condition'), args.condition!));
  } else if (args.propertyId) {
    base = ctx.db.query('assets').withIndex('by_property', q => q.eq('propertyId', args.propertyId!));
  } else if (args.category) {
    base = ctx.db.query('assets').withIndex('by_category', q => q.eq('category', args.category!));
  } else if (args.status) {
    base = ctx.db.query('assets').withIndex('by_status', q => q.eq('status', args.status!));
  } else if (args.condition) {
    base = ctx.db.query('assets').withIndex('by_condition', q => q.eq('condition', args.condition!));
  } else if (args.assignedTo) {
    base = ctx.db.query('assets').withIndex('by_assigned_to', q => q.eq('assignedTo', args.assignedTo!));
  } else if (args.location) {
    base = ctx.db.query('assets').withIndex('by_location', q => q.eq('location', args.location!));
  } else {
    base = ctx.db.query('assets');
  }

  // Apply additional filters
  if (args.dateFrom) {
    base = base.filter(q => q.gte(q.field('createdAt'), args.dateFrom!));
  }
  if (args.dateTo) {
    base = base.filter(q => q.lte(q.field('createdAt'), args.dateTo!));
  }

  // Order by creation time (newest first)
  const results = await base.order('desc').paginate(args.paginationOpts);

  // Enrich with related data
  const enrichedPage = await Promise.all(
    results.page.map(async asset => {
      // Get property info
      const property = await ctx.db.get(asset.propertyId);
      if (!property) throw new Error('Property not found');

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
        const thirtyDaysFromNow = now + 30 * oneDay;
        warrantyExpiring = asset.warrantyExpiry <= thirtyDaysFromNow;
        daysUntilWarrantyExpiry = Math.ceil((asset.warrantyExpiry - now) / oneDay);
      }

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
      };
    })
  );

  // Apply search filter if provided
  let filteredPage = enrichedPage;
  if (args.search) {
    const searchTerm = args.search.toLowerCase();
    filteredPage = enrichedPage.filter(
      asset =>
        asset.name.toLowerCase().includes(searchTerm) ||
        asset.description.toLowerCase().includes(searchTerm) ||
        asset.assetTag.toLowerCase().includes(searchTerm) ||
        (asset.brand && asset.brand.toLowerCase().includes(searchTerm)) ||
        (asset.model && asset.model.toLowerCase().includes(searchTerm)) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchTerm))
    );
  }

  // Apply maintenance due filter
  if (args.hasMaintenanceDue !== undefined) {
    filteredPage = filteredPage.filter(asset => asset.maintenanceDue === args.hasMaintenanceDue);
  }

  // Apply warranty expiring filter
  if (args.hasWarrantyExpiring !== undefined) {
    filteredPage = filteredPage.filter(asset => asset.warrantyExpiring === args.hasWarrantyExpiring);
  }

  return {
    page: filteredPage,
    isDone: results.isDone,
    continueCursor: results.continueCursor,
  };
};
