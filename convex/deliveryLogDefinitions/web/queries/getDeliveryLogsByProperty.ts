import { v } from 'convex/values';
import { PaginationOptions, paginationOptsValidator } from 'convex/server';
import { QueryCtx } from '../../../_generated/server';
import { Id, Doc } from '../../../_generated/dataModel';

export const webGetDeliveryLogsByPropertyArgs = {
  paginationOpts: paginationOptsValidator,
  propertyId: v.id('properties'),
  action: v.optional(
<<<<<<< HEAD
    v.union(v.literal('registered'), v.literal('arrived'), v.literal('collected'), v.literal('failed'))
=======
    v.union(
      v.literal('registered'),
      v.literal('assigned'),
      v.literal('delivered'),
      v.literal('collected'),
      v.literal('failed')
    )
>>>>>>> origin
  ),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
} as const;

export const webGetDeliveryLogsByPropertyReturns = v.object({
  page: v.array(
    v.object({
      _id: v.id('deliveryLogs'),
      _creationTime: v.number(),
      deliveryId: v.id('deliveries'),
      propertyId: v.id('properties'),
<<<<<<< HEAD
      action: v.union(v.literal('registered'), v.literal('arrived'), v.literal('collected'), v.literal('failed')),
=======
      action: v.string(),
>>>>>>> origin
      timestamp: v.number(),
      performedBy: v.optional(v.id('users')),
      notes: v.optional(v.string()),
      blockchainTxHash: v.optional(v.string()),
      createdAt: v.number(),
      // Joined data
      performer: v.optional(
        v.object({
          _id: v.id('users'),
          firstName: v.string(),
          lastName: v.string(),
          email: v.string(),
        })
      ),
      delivery: v.object({
        _id: v.id('deliveries'),
        deliveryType: v.string(),
        senderName: v.string(),
        recipientName: v.string(),
        trackingNumber: v.optional(v.string()),
        status: v.string(),
      }),
    })
  ),
  isDone: v.boolean(),
  continueCursor: v.optional(v.string()),
});

type Args = {
  paginationOpts: PaginationOptions;
  propertyId: Id<'properties'>;
<<<<<<< HEAD
  action?: 'registered' | 'arrived' | 'collected' | 'failed';
=======
  action?: 'registered' | 'assigned' | 'delivered' | 'collected' | 'failed';
>>>>>>> origin
  dateFrom?: number;
  dateTo?: number;
};

export const webGetDeliveryLogsByPropertyHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager or field technician
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Verify property access
  const property = await ctx.db.get(args.propertyId);
  if (!property) throw new Error('Property not found');
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  // Choose the best index anchor based on provided filters
  let base;
  if (args.action) {
    base = ctx.db
      .query('deliveryLogs')
      .withIndex('by_property', q => q.eq('propertyId', args.propertyId))
      .filter(q => q.eq(q.field('action'), args.action!));
  } else {
    base = ctx.db.query('deliveryLogs').withIndex('by_property', q => q.eq('propertyId', args.propertyId));
  }

  // Apply additional filters
  if (args.dateFrom) {
    base = base.filter(q => q.gte(q.field('timestamp'), args.dateFrom!));
  }
  if (args.dateTo) {
    base = base.filter(q => q.lte(q.field('timestamp'), args.dateTo!));
  }

  // Order by timestamp (newest first)
  const results = await base.order('desc').paginate(args.paginationOpts);

  // Enrich with related data
  const enrichedPage = await Promise.all(
    results.page.map(async (log: Doc<'deliveryLogs'>) => {
      // Get performer info
      let performer = undefined;
      if (log.performedBy) {
        const performerData = await ctx.db.get(log.performedBy);
        if (performerData) {
          performer = {
            _id: performerData._id,
            firstName: performerData.firstName,
            lastName: performerData.lastName,
            email: performerData.email,
          };
        }
      }

      // Get delivery info
      const delivery = await ctx.db.get(log.deliveryId);
      if (!delivery) throw new Error('Delivery not found');

      return {
        ...log,
        performer,
        delivery: {
          _id: delivery._id,
          deliveryType: delivery.deliveryType,
          senderName: delivery.senderName,
          recipientName: delivery.recipientName,
          trackingNumber: delivery.trackingNumber,
          status: delivery.status,
        },
      };
    })
  );

  return {
    page: enrichedPage,
    isDone: results.isDone,
    continueCursor: results.continueCursor,
  };
};
