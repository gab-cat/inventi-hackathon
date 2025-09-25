import { v } from 'convex/values';
import { Doc, Id } from '../../../_generated/dataModel';

export const webSendPaymentRequestArgs = v.object({
  invoiceId: v.id('invoices'),
  paymentMethod: v.union(v.literal('credit_card'), v.literal('bank_transfer'), v.literal('cash'), v.literal('crypto')),
  amount: v.number(),
  paymentReference: v.optional(v.string()),
});

export const webSendPaymentRequestReturns = v.object({
  _id: v.id('payments'),
  status: v.union(v.literal('pending'), v.literal('completed'), v.literal('failed'), v.literal('refunded')),
  paymentReference: v.optional(v.string()),
  createdAt: v.number(),
});

export const webSendPaymentRequestHandler = async (
  ctx: any,
  args: typeof webSendPaymentRequestArgs.type
): Promise<typeof webSendPaymentRequestReturns.type> => {
  const { invoiceId, paymentMethod, amount, paymentReference } = args;

  // Get the invoice
  const invoice = await ctx.db.get(invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Check if invoice is still pending
  if (invoice.status !== 'pending') {
    throw new Error('Invoice is not in pending status');
  }

  // Create payment record
  const paymentId = await ctx.db.insert('payments', {
    invoiceId,
    propertyId: invoice.propertyId,
    tenantId: invoice.tenantId,
    amount,
    paymentMethod,
    paymentReference,
    status: 'pending',
    createdAt: Date.now(),
  });

  // Update invoice status to paid if amount matches total
  if (amount >= invoice.totalAmount) {
    await ctx.db.patch(invoiceId, {
      status: 'paid',
      paidAt: Date.now(),
      paidAmount: amount,
      paymentMethod,
      updatedAt: Date.now(),
    });
  }

  return {
    _id: paymentId,
    status: 'pending',
    paymentReference,
    createdAt: Date.now(),
  };
};
