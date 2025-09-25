import { v } from 'convex/values';
import { Doc, Id } from '../../../_generated/dataModel';

export const webGetAllReceiptsArgs = v.object({
  propertyId: v.id('properties'),
  limit: v.optional(v.number()),
  status: v.optional(v.union(v.literal('pending'), v.literal('completed'), v.literal('failed'), v.literal('refunded'))),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
});

export const webGetAllReceiptsReturns = v.array(
  v.object({
    _id: v.id('receipts'),
    _creationTime: v.number(),
    paymentId: v.id('payments'),
    invoiceId: v.id('invoices'),
    propertyId: v.id('properties'),
    tenantId: v.id('users'),
    receiptNumber: v.string(),
    amount: v.number(),
    nftTokenId: v.optional(v.string()),
    nftContractAddress: v.optional(v.string()),
    blockchainTxHash: v.string(),
    blockNumber: v.number(),
    metadata: v.optional(
      v.object({
        description: v.string(),
        items: v.array(v.string()),
        timestamp: v.number(),
      })
    ),
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
    }),
    payment: v.object({
      _id: v.id('payments'),
      amount: v.number(),
      paymentMethod: v.union(
        v.literal('credit_card'),
        v.literal('bank_transfer'),
        v.literal('cash'),
        v.literal('crypto')
      ),
      status: v.union(v.literal('pending'), v.literal('completed'), v.literal('failed'), v.literal('refunded')),
      processedAt: v.optional(v.number()),
    }),
  })
);

export const webGetAllReceiptsHandler = async (
  ctx: any,
  args: typeof webGetAllReceiptsArgs.type
): Promise<typeof webGetAllReceiptsReturns.type> => {
  const { propertyId, limit = 50, status, startDate, endDate } = args;

  // Get receipts with filters
  let receiptsQuery = ctx.db
    .query('receipts')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .order('desc');

  if (startDate || endDate) {
    receiptsQuery = receiptsQuery.filter((q: any) => {
      let filter = q.gte('createdAt', startDate || 0);
      if (endDate) {
        filter = filter.and(q.lte('createdAt', endDate));
      }
      return filter;
    });
  }

  const receipts = await receiptsQuery.take(limit);

  // Get related data
  const receiptsWithDetails = await Promise.all(
    receipts.map(async (receipt: Doc<'receipts'>) => {
      const [tenant, invoice, payment] = await Promise.all([
        ctx.db.get(receipt.tenantId),
        ctx.db.get(receipt.invoiceId),
        ctx.db.get(receipt.paymentId),
      ]);

      // Filter by payment status if specified
      if (status && payment?.status !== status) {
        return null;
      }

      return {
        ...receipt,
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
        },
        payment: {
          _id: payment!._id,
          amount: payment!.amount,
          paymentMethod: payment!.paymentMethod,
          status: payment!.status,
          processedAt: payment!.processedAt,
        },
      };
    })
  );

  return receiptsWithDetails.filter(Boolean) as typeof webGetAllReceiptsReturns.type;
};
