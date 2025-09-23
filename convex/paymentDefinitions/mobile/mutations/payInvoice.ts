import { MutationCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const payInvoiceArgs = v.object({
  invoiceId: v.id('invoices'),
  paymentMethod: v.union(v.literal('credit_card'), v.literal('bank_transfer'), v.literal('cash'), v.literal('crypto')),
  paymentReference: v.optional(v.string()),
});

export const payInvoiceReturns = v.object({
  success: v.boolean(),
  message: v.string(),
  paymentId: v.optional(v.id('payments')),
  receiptId: v.optional(v.id('receipts')),
  blockchainTxHash: v.optional(v.string()),
});

export const payInvoiceHandler = async (ctx: MutationCtx, args: Infer<typeof payInvoiceArgs>) => {
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

  // Get the invoice
  const invoice = await ctx.db.get(args.invoiceId);
  if (!invoice) {
    return { success: false, message: 'Invoice not found' };
  }

  // Verify the invoice belongs to the authenticated user
  if (invoice.tenantId !== me._id) {
    return { success: false, message: 'Unauthorized access to invoice' };
  }

  // Check if invoice is already paid
  if (invoice.status === 'paid') {
    return { success: false, message: 'Invoice is already paid' };
  }

  // Simulate payment processing (always succeeds for demo)
  const now = Date.now();

  // Create payment record
  const paymentId = await ctx.db.insert('payments', {
    invoiceId: args.invoiceId,
    propertyId: invoice.propertyId,
    tenantId: me._id,
    amount: invoice.totalAmount,
    paymentMethod: args.paymentMethod,
    paymentReference: args.paymentReference,
    status: 'completed',
    processedAt: now,
    blockchainTxHash: `0x${Math.random().toString(16).substring(2, 66)}`, // Simulated blockchain tx hash
    createdAt: now,
  });

  // Generate blockchain receipt (NFT)
  const receiptNumber = `RCT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const blockNumber = Math.floor(Math.random() * 1000000) + 20000000; // Simulated block number
  const nftTokenId = `NFT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const nftContractAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'; // Simulated contract address

  const receiptId = await ctx.db.insert('receipts', {
    paymentId,
    invoiceId: args.invoiceId,
    propertyId: invoice.propertyId,
    tenantId: me._id,
    receiptNumber,
    amount: invoice.totalAmount,
    nftTokenId,
    nftContractAddress,
    blockchainTxHash: `0x${Math.random().toString(16).substring(2, 66)}`, // Different tx hash for receipt
    blockNumber,
    metadata: {
      description: `Payment receipt for invoice ${invoice.invoiceNumber}`,
      items: invoice.items.map(item => item.description),
      timestamp: now,
    },
    createdAt: now,
  });

  // Update invoice status
  await ctx.db.patch(args.invoiceId, {
    status: 'paid',
    paidAt: now,
    paidAmount: invoice.totalAmount,
    paymentMethod: args.paymentMethod,
    updatedAt: now,
  });

  return {
    success: true,
    message: 'Payment processed successfully',
    paymentId,
    receiptId,
    blockchainTxHash: `0x${Math.random().toString(16).substring(2, 66)}`,
  };
};
