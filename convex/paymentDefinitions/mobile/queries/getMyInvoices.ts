import { QueryCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const getMyInvoicesArgs = v.object({
  statusFilter: v.optional(
    v.union(
      v.literal('all'),
      v.literal('pending'),
      v.literal('paid'),
      v.literal('overdue'),
      v.literal('cancelled'),
      v.literal('refunded')
    )
  ),
  paginationOpts: v.object({
    numItems: v.number(),
    cursor: v.union(v.string(), v.null()),
  }),
});

export const getMyInvoicesReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
  invoices: v.optional(
    v.array(
      v.object({
        _id: v.id('invoices'),
        invoiceNumber: v.string(),
        invoiceType: v.union(
          v.literal('rent'),
          v.literal('maintenance'),
          v.literal('utility'),
          v.literal('fine'),
          v.literal('other')
        ),
        description: v.string(),
        amount: v.number(),
        totalAmount: v.number(),
        dueDate: v.number(),
        status: v.union(
          v.literal('pending'),
          v.literal('paid'),
          v.literal('overdue'),
          v.literal('cancelled'),
          v.literal('refunded')
        ),
        paidAt: v.optional(v.number()),
        paymentMethod: v.optional(v.string()),
        items: v.array(
          v.object({
            description: v.string(),
            amount: v.number(),
            quantity: v.optional(v.number()),
          })
        ),
        propertyId: v.id('properties'),
        unitId: v.optional(v.id('units')),
        _creationTime: v.number(),
      })
    )
  ),
  isDone: v.boolean(),
  continueCursor: v.optional(v.string()),
});

export const getMyInvoicesHandler = async (ctx: QueryCtx, args: Infer<typeof getMyInvoicesArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  const me = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('clerkId'), identity.subject))
    .first();
  if (!me) {
    return { success: false, message: 'User not found' };
  }

  // Get user's invoices with pagination
  let invoiceQuery = ctx.db
    .query('invoices')
    .withIndex('by_tenant', q => q.eq('tenantId', me._id))
    .order('desc');

  // Apply status filter
  if (args.statusFilter && args.statusFilter !== 'all') {
    invoiceQuery = invoiceQuery.filter(q => q.eq(q.field('status'), args.statusFilter));
  }

  const result = await invoiceQuery.paginate(args.paginationOpts);

  return {
    success: true,
    invoices: result.page,
    isDone: result.isDone,
    continueCursor: result.continueCursor,
  };
};
