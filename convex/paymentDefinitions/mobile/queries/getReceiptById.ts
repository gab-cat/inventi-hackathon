import { QueryCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const getReceiptByIdArgs = v.object({
  receiptId: v.id('receipts'),
});

export const getReceiptByIdReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
  receipt: v.optional(
    v.object({
      _id: v.id('receipts'),
      receiptNumber: v.string(),
      amount: v.number(),
      blockchainTxHash: v.string(),
      blockNumber: v.number(),
      nftTokenId: v.optional(v.string()),
      nftContractAddress: v.optional(v.string()),
      metadata: v.optional(
        v.object({
          description: v.string(),
          items: v.array(v.string()),
          timestamp: v.number(),
        })
      ),
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
        items: v.array(
          v.object({
            description: v.string(),
            amount: v.number(),
            quantity: v.optional(v.number()),
          })
        ),
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
        status: v.union(v.literal('pending'), v.literal('completed'), v.literal('failed'), v.literal('refunded')),
        processedAt: v.optional(v.number()),
      }),
      property: v.object({
        _id: v.id('properties'),
        name: v.string(),
        address: v.string(),
      }),
    })
  ),
});

export const getReceiptByIdHandler = async (ctx: QueryCtx, args: Infer<typeof getReceiptByIdArgs>) => {
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

  // Get the receipt
  const receipt = await ctx.db.get(args.receiptId);
  if (!receipt) {
    return { success: false, message: 'Receipt not found' };
  }

  // Verify the receipt belongs to the authenticated user
  if (receipt.tenantId !== me._id) {
    return { success: false, message: 'Unauthorized access to receipt' };
  }

  // Get related data
  const invoice = await ctx.db.get(receipt.invoiceId);
  const payment = await ctx.db.get(receipt.paymentId);
  const property = await ctx.db.get(receipt.propertyId);

  if (!invoice || !payment || !property) {
    return { success: false, message: 'Receipt data incomplete' };
  }

  return {
    success: true,
    receipt: {
      _id: receipt._id,
      receiptNumber: receipt.receiptNumber,
      amount: receipt.amount,
      blockchainTxHash: receipt.blockchainTxHash,
      blockNumber: receipt.blockNumber,
      nftTokenId: receipt.nftTokenId,
      nftContractAddress: receipt.nftContractAddress,
      metadata: receipt.metadata,
      createdAt: receipt.createdAt,
      invoice: {
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceType: invoice.invoiceType,
        description: invoice.description,
        amount: invoice.amount,
        totalAmount: invoice.totalAmount,
        dueDate: invoice.dueDate,
        status: invoice.status,
        paidAt: invoice.paidAt,
        items: invoice.items,
      },
      payment: {
        _id: payment._id,
        paymentMethod: payment.paymentMethod,
        paymentReference: payment.paymentReference,
        status: payment.status,
        processedAt: payment.processedAt,
      },
      property: {
        _id: property._id,
        name: property.name,
        address: property.address,
      },
    },
  };
};
