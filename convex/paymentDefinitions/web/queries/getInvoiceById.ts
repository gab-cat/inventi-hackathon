import { v } from 'convex/values';
import { Doc, Id } from '../../../_generated/dataModel';

export const webGetInvoiceByIdArgs = v.object({
  invoiceId: v.id('invoices'),
});

export const webGetInvoiceByIdReturns = v.union(
  v.null(),
  v.object({
    _id: v.id('invoices'),
    _creationTime: v.number(),
    propertyId: v.id('properties'),
    unitId: v.optional(v.id('units')),
    tenantId: v.id('users'),
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
    taxAmount: v.optional(v.number()),
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
    paidAmount: v.optional(v.number()),
    paymentMethod: v.optional(v.string()),
    lateFee: v.optional(v.number()),
    items: v.array(
      v.object({
        description: v.string(),
        amount: v.number(),
        quantity: v.optional(v.number()),
      })
    ),
    blockchainTxHash: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Joined data
    tenant: v.object({
      _id: v.id('users'),
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
    }),
    property: v.object({
      _id: v.id('properties'),
      name: v.string(),
      address: v.string(),
    }),
    unit: v.optional(
      v.object({
        _id: v.id('units'),
        unitNumber: v.string(),
        floor: v.optional(v.number()),
      })
    ),
    payments: v.array(
      v.object({
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
        createdAt: v.number(),
      })
    ),
  })
);

export const webGetInvoiceByIdHandler = async (
  ctx: any,
  args: typeof webGetInvoiceByIdArgs.type
): Promise<typeof webGetInvoiceByIdReturns.type> => {
  const { invoiceId } = args;

  const invoice = await ctx.db.get(invoiceId);
  if (!invoice) {
    return null;
  }

  // Get related data
  const [tenant, property, unit, payments] = await Promise.all([
    ctx.db.get(invoice.tenantId),
    ctx.db.get(invoice.propertyId),
    invoice.unitId ? ctx.db.get(invoice.unitId) : null,
    ctx.db
      .query('payments')
      .withIndex('by_invoice', (q: any) => q.eq('invoiceId', invoiceId))
      .collect(),
  ]);

  return {
    ...invoice,
    tenant: {
      _id: tenant!._id,
      firstName: tenant!.firstName,
      lastName: tenant!.lastName,
      email: tenant!.email,
      phone: tenant!.phone,
    },
    property: {
      _id: property!._id,
      name: property!.name,
      address: property!.address,
    },
    unit: unit
      ? {
          _id: unit._id,
          unitNumber: unit.unitNumber,
          floor: unit.floor,
        }
      : undefined,
    payments: payments.map((payment: Doc<'payments'>) => ({
      _id: payment._id,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      processedAt: payment.processedAt,
      createdAt: payment.createdAt,
    })),
  };
};
