import { v } from 'convex/values';
import { Doc, Id } from '../../../_generated/dataModel';

export const webUpdateInvoiceStatusArgs = v.object({
  invoiceId: v.id('invoices'),
  status: v.union(
    v.literal('pending'),
    v.literal('paid'),
    v.literal('overdue'),
    v.literal('cancelled'),
    v.literal('refunded')
  ),
  paidAmount: v.optional(v.number()),
  paymentMethod: v.optional(v.string()),
  blockchainTxHash: v.optional(v.string()),
});

export const webUpdateInvoiceStatusReturns = v.object({
  _id: v.id('invoices'),
  status: v.union(
    v.literal('pending'),
    v.literal('paid'),
    v.literal('overdue'),
    v.literal('cancelled'),
    v.literal('refunded')
  ),
  updatedAt: v.number(),
});

export const webUpdateInvoiceStatusHandler = async (
  ctx: any,
  args: typeof webUpdateInvoiceStatusArgs.type
): Promise<typeof webUpdateInvoiceStatusReturns.type> => {
  const { invoiceId, status, paidAmount, paymentMethod, blockchainTxHash } = args;

  // Get the invoice
  const invoice = await ctx.db.get(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Prepare update data
  const updateData: any = {
    status,
    updatedAt: Date.now(),
  };

  // Add payment-related fields if status is paid
  if (status === 'paid') {
    updateData.paidAt = Date.now();
    if (paidAmount) {
      updateData.paidAmount = paidAmount;
    }
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }
  }

  // Add blockchain transaction hash if provided
  if (blockchainTxHash) {
    updateData.blockchainTxHash = blockchainTxHash;
  }

  // Update the invoice
  await ctx.db.patch(invoiceId, updateData);

  return {
    _id: invoiceId,
    status,
    updatedAt: updateData.updatedAt,
  };
};
