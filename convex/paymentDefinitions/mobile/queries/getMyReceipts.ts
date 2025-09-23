import { QueryCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const getMyReceiptsArgs = v.object({
  paginationOpts: v.object({
    numItems: v.number(),
    cursor: v.union(v.string(), v.null()),
  }),
});

export const getMyReceiptsReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
  receipts: v.optional(
    v.array(
      v.object({
        _id: v.id('receipts'),
        receiptNumber: v.string(),
        amount: v.number(),
        blockchainTxHash: v.string(),
        blockNumber: v.number(),
        nftTokenId: v.optional(v.string()),
        nftContractAddress: v.optional(v.string()),
        createdAt: v.number(),
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
          dueDate: v.number(),
        }),
        payment: v.object({
          _id: v.id('payments'),
          paymentMethod: v.union(
            v.literal('credit_card'),
            v.literal('bank_transfer'),
            v.literal('cash'),
            v.literal('crypto')
          ),
          paymentReference: v.optional(v.string()),
          processedAt: v.optional(v.number()),
        }),
      })
    )
  ),
  isDone: v.boolean(),
  continueCursor: v.optional(v.string()),
});

export const getMyReceiptsHandler = async (ctx: QueryCtx, args: Infer<typeof getMyReceiptsArgs>) => {
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

  // Get user's receipts with pagination, ordered by creation time (most recent first)
  const result = await ctx.db
    .query('receipts')
    .withIndex('by_tenant', q => q.eq('tenantId', me._id))
    .order('desc')
    .paginate(args.paginationOpts);

  // Enrich receipts with invoice and payment data
  const enrichedReceipts = await Promise.all(
    result.page.map(async receipt => {
      const invoice = await ctx.db.get(receipt.invoiceId);
      const payment = await ctx.db.get(receipt.paymentId);

      if (!invoice || !payment) {
        return null; // Skip receipts with missing data
      }

      return {
        _id: receipt._id,
        receiptNumber: receipt.receiptNumber,
        amount: receipt.amount,
        blockchainTxHash: receipt.blockchainTxHash,
        blockNumber: receipt.blockNumber,
        nftTokenId: receipt.nftTokenId,
        nftContractAddress: receipt.nftContractAddress,
        createdAt: receipt.createdAt,
        invoice: {
          _id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          invoiceType: invoice.invoiceType,
          description: invoice.description,
          totalAmount: invoice.totalAmount,
          dueDate: invoice.dueDate,
        },
        payment: {
          _id: payment._id,
          paymentMethod: payment.paymentMethod,
          paymentReference: payment.paymentReference,
          processedAt: payment.processedAt,
        },
      };
    })
  );

  // Filter out null receipts
  const validReceipts = enrichedReceipts.filter(receipt => receipt !== null);

  return {
    success: true,
    receipts: validReceipts,
    isDone: result.isDone,
    continueCursor: result.continueCursor,
  };
};
