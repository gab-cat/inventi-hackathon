import { v } from 'convex/values';
import { Doc, Id } from '../../../_generated/dataModel';

export const webCreateInvoiceArgs = v.object({
  propertyId: v.id('properties'),
  unitId: v.optional(v.id('units')),
  tenantId: v.id('users'),
  invoiceType: v.union(
    v.literal('rent'),
    v.literal('maintenance'),
    v.literal('utility'),
    v.literal('fine'),
    v.literal('other')
  ),
  description: v.string(),
  amount: v.number(),
  taxAmount: v.optional(v.number()),
  dueDate: v.number(),
  items: v.array(
    v.object({
      description: v.string(),
      amount: v.number(),
      quantity: v.optional(v.number()),
    })
  ),
  lateFee: v.optional(v.number()),
});

export const webCreateInvoiceReturns = v.object({
  _id: v.id('invoices'),
  invoiceNumber: v.string(),
  totalAmount: v.number(),
  status: v.union(
    v.literal('pending'),
    v.literal('paid'),
    v.literal('overdue'),
    v.literal('cancelled'),
    v.literal('refunded')
  ),
  createdAt: v.number(),
});

export const webCreateInvoiceHandler = async (
  ctx: any,
  args: typeof webCreateInvoiceArgs.type
): Promise<typeof webCreateInvoiceReturns.type> => {
  const {
    propertyId,
    unitId,
    tenantId,
    invoiceType,
    description,
    amount,
    taxAmount = 0,
    dueDate,
    items,
    lateFee = 0,
  } = args;

  // Calculate total amount
  const totalAmount = amount + taxAmount + lateFee;

  // Generate invoice number
  const timestamp = Date.now();
  const invoiceNumber = `INV-${timestamp}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Create the invoice
  const invoiceId = await ctx.db.insert('invoices', {
    propertyId,
    unitId,
    tenantId,
    invoiceNumber,
    invoiceType,
    description,
    amount,
    taxAmount,
    totalAmount,
    dueDate,
    status: 'pending',
    items,
    lateFee,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return {
    _id: invoiceId,
    invoiceNumber,
    totalAmount,
    status: 'pending',
    createdAt: timestamp,
  };
};
