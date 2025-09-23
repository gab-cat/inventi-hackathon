import { v } from 'convex/values';
import { PaginationOptions, paginationOptsValidator } from 'convex/server';
import { QueryCtx } from '../../../_generated/server';
import { Id, Doc } from '../../../_generated/dataModel';

export const webGetDeliveryLogArgs = {
  paginationOpts: paginationOptsValidator,
  deliveryId: v.id('deliveries'),
} as const;

export const webGetDeliveryLogReturns = v.object({
  page: v.array(
    v.object({
      _id: v.id('deliveryLogs'),
      _creationTime: v.number(),
      deliveryId: v.id('deliveries'),
      propertyId: v.id('properties'),
      action: v.string(),
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
    })
  ),
  isDone: v.boolean(),
  continueCursor: v.optional(v.string()),
});

type Args = {
  paginationOpts: PaginationOptions;
  deliveryId: Id<'deliveries'>;
};

export const webGetDeliveryLogHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Verify current user is a manager or field technician
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser || !['manager', 'field_technician'].includes(currentUser.role)) throw new Error('Forbidden');

  // Verify delivery exists and user has access
  const delivery = await ctx.db.get(args.deliveryId);
  if (!delivery) throw new Error('Delivery not found');

  const property = await ctx.db.get(delivery.propertyId);
  if (!property) throw new Error('Property not found');
  if (property.managerId !== currentUser._id) throw new Error('Access denied to this property');

  // Get delivery logs
  const results = await ctx.db
    .query('deliveryLogs')
    .withIndex('by_delivery', q => q.eq('deliveryId', args.deliveryId))
    .order('desc')
    .paginate(args.paginationOpts);

  // Enrich with performer data
  const enrichedPage = await Promise.all(
    results.page.map(async (log: Doc<'deliveryLogs'>) => {
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

      return {
        ...log,
        performer,
      };
    })
  );

  return {
    page: enrichedPage,
    isDone: results.isDone,
    continueCursor: results.continueCursor,
  };
};
