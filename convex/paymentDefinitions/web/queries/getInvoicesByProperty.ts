import { v } from 'convex/values';
import { Doc, Id } from '../../../_generated/dataModel';

export const webGetInvoicesByPropertyArgs = v.object({
  propertyId: v.id('properties'),
  limit: v.optional(v.number()),
  status: v.optional(
    v.union(
      v.literal('pending'),
      v.literal('paid'),
      v.literal('overdue'),
      v.literal('cancelled'),
      v.literal('refunded')
    )
  ),
  invoiceType: v.optional(
    v.union(v.literal('rent'), v.literal('maintenance'), v.literal('utility'), v.literal('fine'), v.literal('other'))
  ),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
});

export const webGetInvoicesByPropertyReturns = v.array(
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
    property: v.object({
      _id: v.id('properties'),
      name: v.string(),
      address: v.string(),
    }),
    tenant: v.object({
      _id: v.id('users'),
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
    }),
    unit: v.optional(
      v.object({
        _id: v.id('units'),
        unitNumber: v.string(),
        floor: v.optional(v.number()),
      })
    ),
    paymentCount: v.number(),
    totalPaid: v.number(),
  })
);

export const webGetInvoicesByPropertyHandler = async (
  ctx: any,
  args: typeof webGetInvoicesByPropertyArgs.type
): Promise<typeof webGetInvoicesByPropertyReturns.type> => {
  const { propertyId, limit = 50, status, invoiceType, startDate, endDate } = args;

  // Get invoices with filters
  let invoicesQuery = ctx.db
    .query('invoices')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .order('desc');

  if (startDate || endDate) {
    invoicesQuery = invoicesQuery.filter((q: any) => {
      let filter = q.gte('createdAt', startDate || 0);
      if (endDate) {
        filter = filter.and(q.lte('createdAt', endDate));
      }
      return filter;
    });
  }

  const invoices = await invoicesQuery.take(limit);

  // Get related data and apply filters
  const invoicesWithDetails = await Promise.all(
    invoices.map(async (invoice: Doc<'invoices'>) => {
      // Apply filters
      if (status && invoice.status !== status) {
        return null;
      }
      if (invoiceType && invoice.invoiceType !== invoiceType) {
        return null;
      }

      const [property, tenant, unit, payments] = await Promise.all([
        ctx.db.get(invoice.propertyId),
        ctx.db.get(invoice.tenantId),
        invoice.unitId ? ctx.db.get(invoice.unitId) : null,
        ctx.db
          .query('payments')
          .withIndex('by_invoice', (q: any) => q.eq('invoiceId', invoice._id))
          .collect(),
      ]);

      const totalPaid = payments.reduce((sum: number, payment: Doc<'payments'>) => {
        return payment.status === 'completed' ? sum + payment.amount : sum;
      }, 0);

      return {
        ...invoice,
        property: {
          _id: property!._id,
          name: property!.name,
          address: property!.address,
        },
        tenant: {
          _id: tenant!._id,
          firstName: tenant!.firstName,
          lastName: tenant!.lastName,
          email: tenant!.email,
        },
        unit: unit
          ? {
              _id: unit._id,
              unitNumber: unit.unitNumber,
              floor: unit.floor,
            }
          : undefined,
        paymentCount: payments.length,
        totalPaid,
      };
    })
  );

  return invoicesWithDetails.filter(Boolean) as typeof webGetInvoicesByPropertyReturns.type;
};
