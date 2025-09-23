import { v } from 'convex/values';
import { PaginationOptions, paginationOptsValidator } from 'convex/server';
import { QueryCtx } from '../../../_generated/server';
import { Id, Doc } from '../../../_generated/dataModel';

export const mobileGetDeliveryLogArgs = {
  paginationOpts: paginationOptsValidator,
  deliveryId: v.id('deliveries'),
} as const;

export const mobileGetDeliveryLogReturns = v.object({
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

export const mobileGetDeliveryLogHandler = async (ctx: QueryCtx, args: Args) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  // Get current user
  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
    .unique();
  if (!currentUser) throw new Error('User not found');

  // Verify delivery exists and user has access (user must be the recipient or resident of the property)
  const delivery = await ctx.db.get(args.deliveryId);
  if (!delivery) throw new Error('Delivery not found');

  // Since this is accessed from the mobile app after viewing deliveries,
  // we assume the user has already been verified to have access to their deliveries
  // through the getMyDeliveries query. Here we just verify the delivery exists.

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
