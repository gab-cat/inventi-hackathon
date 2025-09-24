import { v } from 'convex/values';
import { QueryCtx } from '../../../_generated/server';
import { Id, Doc } from '../../../_generated/dataModel';

export const webExportDeliveryReportsArgs = {
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
  format: v.union(v.literal('csv'), v.literal('json')),
} as const;

export const webExportDeliveryReportsReturns = v.object({
  data: v.array(
    v.object({
      _id: v.id('deliveries'),
      propertyId: v.id('properties'),
      unitId: v.optional(v.id('units')),
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
      // Joined data for export
      propertyName: v.string(),
      propertyAddress: v.string(),
      unitNumber: v.optional(v.string()),
    })
  ),
  summary: v.object({
    totalDeliveries: v.number(),
    byStatus: v.record(v.string(), v.number()),
    byType: v.record(v.string(), v.number()),
    dateRange: v.object({
      from: v.optional(v.number()),
      to: v.optional(v.number()),
    }),
  }),
  exportedAt: v.number(),
});

type Args = {
  propertyId?: Id<'properties'>;
  unitId?: Id<'units'>;
  deliveryType?: 'package' | 'food' | 'grocery' | 'mail' | 'other';
  status?: 'registered' | 'arrived' | 'collected' | 'failed' | 'returned';
  dateFrom?: number;
  dateTo?: number;
  format: 'csv' | 'json';
};

export const webExportDeliveryReportsHandler = async (ctx: QueryCtx, args: Args) => {
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
  } else {
    base = ctx.db.query('deliveries');
  }

  // Apply additional filters
  if (args.unitId && !args.unitId) {
    base = base.filter(q => q.eq(q.field('unitId'), args.unitId!));
  }
  if (args.deliveryType && !args.deliveryType) {
    base = base.filter(q => q.eq(q.field('deliveryType'), args.deliveryType!));
  }
  if (args.status && !args.status) {
    base = base.filter(q => q.eq(q.field('status'), args.status!));
  }
  if (args.dateFrom) {
    base = base.filter(q => q.gte(q.field('createdAt'), args.dateFrom!));
  }
  if (args.dateTo) {
    base = base.filter(q => q.lte(q.field('createdAt'), args.dateTo!));
  }

  // Get all matching deliveries
  const deliveries = await base.collect();

  // Enrich with related data and prepare for export
  const enrichedData = await Promise.all(
    deliveries.map(async (delivery: Doc<'deliveries'>) => {
      // Get property info
      const property = await ctx.db.get(delivery.propertyId);
      if (!property) throw new Error('Property not found');

      // Get unit info if applicable
      let unitNumber = undefined;
      if (delivery.unitId) {
        const unitData = await ctx.db.get(delivery.unitId);
        if (unitData) {
          unitNumber = unitData.unitNumber;
        }
      }

      return {
        _id: delivery._id,
        propertyId: delivery.propertyId,
        unitId: delivery.unitId,
        deliveryType: delivery.deliveryType,
        senderName: delivery.senderName,
        senderCompany: delivery.senderCompany,
        recipientName: delivery.recipientName,
        recipientPhone: delivery.recipientPhone,
        recipientEmail: delivery.recipientEmail,
        trackingNumber: delivery.trackingNumber,
        description: delivery.description,
        estimatedDelivery: delivery.estimatedDelivery,
        actualDelivery: delivery.actualDelivery,
        status: delivery.status,
        deliveryLocation: delivery.deliveryLocation,
        deliveryNotes: delivery.deliveryNotes,
        photos: delivery.photos,
        blockchainTxHash: delivery.blockchainTxHash,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt,
        propertyName: property.name,
        propertyAddress: property.address,
        unitNumber,
      };
    })
  );

  // Calculate summary statistics
  const summary = {
    totalDeliveries: enrichedData.length,
    byStatus: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    dateRange: {
      from: args.dateFrom,
      to: args.dateTo,
    },
  };

  // Count by status and type
  enrichedData.forEach(delivery => {
    summary.byStatus[delivery.status] = (summary.byStatus[delivery.status] || 0) + 1;
    summary.byType[delivery.deliveryType] = (summary.byType[delivery.deliveryType] || 0) + 1;
  });

  return {
    data: enrichedData,
    summary,
    exportedAt: Date.now(),
  };
};
