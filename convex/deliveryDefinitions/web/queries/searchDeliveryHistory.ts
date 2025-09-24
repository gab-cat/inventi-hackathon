import { v } from 'convex/values';
import { PaginationOptions, paginationOptsValidator } from 'convex/server';
import { QueryCtx } from '../../../_generated/server';
import { Id, Doc } from '../../../_generated/dataModel';

export const webSearchDeliveryHistoryArgs = {
  paginationOpts: paginationOptsValidator,
  propertyId: v.optional(v.id('properties')),
  unitId: v.optional(v.id('units')),
  deliveryType: v.optional(
    v.union(v.literal('package'), v.literal('food'), v.literal('grocery'), v.literal('mail'), v.literal('other'))
  ),
  status: v.optional(
    v.union(
      v.literal('registered'),
      v.literal('arrived'),
      v.literal('collected'),
      v.literal('failed'),
      v.literal('returned')
    )
  ),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
  search: v.optional(v.string()),
  trackingNumber: v.optional(v.string()),
} as const;

export const webSearchDeliveryHistoryReturns = v.object({
  page: v.array(
    v.object({
      _id: v.id('deliveries'),
      _creationTime: v.number(),
      propertyId: v.id('properties'),
      unitId: v.optional(v.id('units')),
      piiHash: v.optional(v.string()),
      deliveryType: v.string(),
      senderName: v.string(),
      senderCompany: v.optional(v.string()),
      recipientName: v.string(),
      recipientPhone: v.optional(v.string()),
      recipientEmail: v.optional(v.string()),
      trackingNumber: v.optional(v.string()),
      description: v.string(),
      estimatedDelivery: v.number(),
      actualDelivery: v.optional(v.number()),
      status: v.union(
        v.literal('registered'),
        v.literal('arrived'),
        v.literal('collected'),
        v.literal('failed'),
        v.literal('returned')
      ),
      deliveryLocation: v.optional(v.string()),
      deliveryNotes: v.optional(v.string()),
      photos: v.optional(v.array(v.string())),
      blockchainTxHash: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      // Joined data
      property: v.object({
        _id: v.id('properties'),
        name: v.string(),
        address: v.string(),
      }),
      unit: v.optional(
        v.object({
          _id: v.id('units'),
          unitNumber: v.string(),
        })
      ),
    })
  ),
  isDone: v.boolean(),
  continueCursor: v.optional(v.string()),
});

type Args = {
  paginationOpts: PaginationOptions;
  propertyId?: Id<'properties'>;
  unitId?: Id<'units'>;
  deliveryType?: 'package' | 'food' | 'grocery' | 'mail' | 'other';
  status?: 'registered' | 'arrived' | 'collected' | 'failed' | 'returned';
  dateFrom?: number;
  dateTo?: number;
  search?: string;
  trackingNumber?: string;
};

export const webSearchDeliveryHistoryHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager or field technician
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Choose the best index anchor based on provided filters
  let base;
  if (args.propertyId && args.status) {
    base = ctx.db
      .query('deliveries')
      .withIndex('by_property_status', q => q.eq('propertyId', args.propertyId!).eq('status', args.status!));
  } else if (args.propertyId) {
    base = ctx.db.query('deliveries').withIndex('by_property', q => q.eq('propertyId', args.propertyId!));
  } else if (args.unitId) {
    base = ctx.db.query('deliveries').withIndex('by_unit', q => q.eq('unitId', args.unitId!));
  } else if (args.status) {
    base = ctx.db.query('deliveries').withIndex('by_status', q => q.eq('status', args.status!));
  } else if (args.deliveryType) {
    base = ctx.db.query('deliveries').filter(q => q.eq(q.field('deliveryType'), args.deliveryType!));
  } else if (args.trackingNumber) {
    base = ctx.db.query('deliveries').withIndex('by_tracking', q => q.eq('trackingNumber', args.trackingNumber!));
  } else {
    base = ctx.db.query('deliveries');
  }

  // Apply additional filters (only if not already used in base query)
  if (args.unitId && !args.propertyId) {
    base = base.filter(q => q.eq(q.field('unitId'), args.unitId!));
  }
  if (args.deliveryType && !args.propertyId) {
    base = base.filter(q => q.eq(q.field('deliveryType'), args.deliveryType!));
  }
  if (args.status && !args.propertyId) {
    base = base.filter(q => q.eq(q.field('status'), args.status!));
  }
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
    results.page.map(async (delivery: Doc<'deliveries'>) => {
      // Get property info
      const property = await ctx.db.get(delivery.propertyId);
      if (!property) throw new Error('Property not found');

      // Get unit info if applicable
      let unit = undefined;
      if (delivery.unitId) {
        const unitData = await ctx.db.get(delivery.unitId);
        if (unitData) {
          unit = {
            _id: unitData._id,
            unitNumber: unitData.unitNumber,
          };
        }
      }

      return {
        ...delivery,
        property: {
          _id: property._id,
          name: property.name,
          address: property.address,
        },
        unit,
      };
    })
  );

  // Apply search filter if provided
  let filteredPage = enrichedPage;
  if (args.search) {
    const searchTerm = args.search.toLowerCase();
    filteredPage = enrichedPage.filter(
      delivery =>
        delivery.senderName.toLowerCase().includes(searchTerm) ||
        delivery.recipientName.toLowerCase().includes(searchTerm) ||
        delivery.description.toLowerCase().includes(searchTerm) ||
        (delivery.trackingNumber && delivery.trackingNumber.toLowerCase().includes(searchTerm))
    );
  }

  return {
    page: filteredPage,
    isDone: results.isDone,
    continueCursor: results.continueCursor,
  };
};
