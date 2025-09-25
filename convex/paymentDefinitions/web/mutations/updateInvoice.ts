import { v } from 'convex/values';
import { Doc, Id } from '../../../_generated/dataModel';

export const webUpdateInvoiceArgs = v.object({
  invoiceId: v.id('invoices'),
  propertyId: v.optional(v.id('properties')),
  unitId: v.optional(v.id('units')),
  tenantId: v.optional(v.id('users')),
  invoiceType: v.optional(
    v.union(v.literal('rent'), v.literal('maintenance'), v.literal('utility'), v.literal('fine'), v.literal('other'))
  ),
  description: v.optional(v.string()),
  amount: v.optional(v.number()),
  taxAmount: v.optional(v.number()),
  dueDate: v.optional(v.number()),
  items: v.optional(
    v.array(
      v.object({
        description: v.string(),
        amount: v.number(),
        quantity: v.optional(v.number()),
      })
    )
  ),
  lateFee: v.optional(v.number()),
});

export const webUpdateInvoiceReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
});

export const webUpdateInvoiceHandler = async (
  ctx: any,
  args: typeof webUpdateInvoiceArgs.type
): Promise<typeof webUpdateInvoiceReturns.type> => {
  const { invoiceId, ...updateData } = args;

  try {
    // Get the existing invoice
    const existingInvoice = await ctx.db.get(invoiceId);
    if (!existingInvoice) {
      return { success: false, message: 'Invoice not found' };
    }

    // Calculate new total amount if amount, taxAmount, or lateFee changed
    let totalAmount = existingInvoice.totalAmount;
    if (updateData.amount !== undefined || updateData.taxAmount !== undefined || updateData.lateFee !== undefined) {
      const amount = updateData.amount ?? existingInvoice.amount;
      const taxAmount = updateData.taxAmount ?? existingInvoice.taxAmount ?? 0;
      const lateFee = updateData.lateFee ?? existingInvoice.lateFee ?? 0;
      totalAmount = amount + taxAmount + lateFee;
    }

    // Update the invoice
    await ctx.db.patch(invoiceId, {
      ...updateData,
      totalAmount,
      updatedAt: Date.now(),
    });

    return { success: true, message: 'Invoice updated successfully' };
  } catch (error) {
    console.error('Error updating invoice:', error);
    return { success: false, message: 'Failed to update invoice' };
  }
};
