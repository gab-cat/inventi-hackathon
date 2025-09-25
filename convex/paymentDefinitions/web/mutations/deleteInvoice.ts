import { v } from 'convex/values';
import { Doc, Id } from '../../../_generated/dataModel';

export const webDeleteInvoiceArgs = v.object({
  invoiceId: v.id('invoices'),
});

export const webDeleteInvoiceReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
});

export const webDeleteInvoiceHandler = async (
  ctx: any,
  args: typeof webDeleteInvoiceArgs.type
): Promise<typeof webDeleteInvoiceReturns.type> => {
  const { invoiceId } = args;

  try {
    // Get the existing invoice
    const existingInvoice = await ctx.db.get(invoiceId);
    if (!existingInvoice) {
      return { success: false, message: 'Invoice not found' };
    }

    // Check if invoice can be deleted (only pending invoices should be deletable)
    if (existingInvoice.status !== 'pending') {
      return { success: false, message: 'Only pending invoices can be deleted' };
    }

    // Delete the invoice
    await ctx.db.delete(invoiceId);

    return { success: true, message: 'Invoice deleted successfully' };
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return { success: false, message: 'Failed to delete invoice' };
  }
};
