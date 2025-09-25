import { v } from 'convex/values';
import { Doc, Id } from '../../../_generated/dataModel';

export const webGetPaymentHistoryArgs = v.object({
  propertyId: v.id('properties'),
  limit: v.optional(v.number()),
  paymentMethod: v.optional(
    v.union(v.literal('credit_card'), v.literal('bank_transfer'), v.literal('cash'), v.literal('crypto'))
  ),
  status: v.optional(v.union(v.literal('pending'), v.literal('completed'), v.literal('failed'), v.literal('refunded'))),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
});

export const webGetPaymentHistoryReturns = v.array(
  v.object({
    _id: v.id('payments'),
    _creationTime: v.number(),
    invoiceId: v.id('invoices'),
    propertyId: v.id('properties'),
    tenantId: v.id('users'),
    amount: v.number(),
    paymentMethod: v.union(
      v.literal('credit_card'),
      v.literal('bank_transfer'),
      v.literal('cash'),
      v.literal('crypto')
    ),
    paymentReference: v.optional(v.string()),
    status: v.union(v.literal('pending'), v.literal('completed'), v.literal('failed'), v.literal('refunded')),
    processedAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
    blockchainTxHash: v.optional(v.string()),
    createdAt: v.number(),
    // Joined data
    tenant: v.object({
      _id: v.id('users'),
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
    }),
    invoice: v.object({
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
      totalAmount: v.number(),
    }),
  })
);

export const webGetPaymentHistoryHandler = async (
  ctx: any,
  args: typeof webGetPaymentHistoryArgs.type
): Promise<typeof webGetPaymentHistoryReturns.type> => {
  const { propertyId, limit = 50, paymentMethod, status, startDate, endDate } = args;

  // Get payments with filters
  let paymentsQuery = ctx.db
    .query('payments')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .order('desc');

  if (startDate || endDate) {
    paymentsQuery = paymentsQuery.filter((q: any) => {
      let filter = q.gte('createdAt', startDate || 0);
      if (endDate) {
        filter = filter.and(q.lte('createdAt', endDate));
      }
      return filter;
    });
  }

  const payments = await paymentsQuery.take(limit);

  // Get related data
  const paymentsWithDetails = await Promise.all(
    payments.map(async (payment: Doc<'payments'>) => {
      // Apply filters
      if (paymentMethod && payment.paymentMethod !== paymentMethod) {
        return null;
      }
      if (status && payment.status !== status) {
        return null;
      }

      const [tenant, invoice] = await Promise.all([ctx.db.get(payment.tenantId), ctx.db.get(payment.invoiceId)]);

      return {
        ...payment,
        tenant: {
          _id: tenant!._id,
          firstName: tenant!.firstName,
          lastName: tenant!.lastName,
          email: tenant!.email,
        },
        invoice: {
          _id: invoice!._id,
          invoiceNumber: invoice!.invoiceNumber,
          invoiceType: invoice!.invoiceType,
          description: invoice!.description,
          totalAmount: invoice!.totalAmount,
        },
      };
    })
  );

  return paymentsWithDetails.filter(Boolean) as typeof webGetPaymentHistoryReturns.type;
};
