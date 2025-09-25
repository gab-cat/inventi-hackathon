import { v } from 'convex/values';
import { Doc, Id } from '../../../_generated/dataModel';

export const webSearchInvoicesArgs = v.object({
  propertyId: v.id('properties'),
  searchTerm: v.string(),
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
});

export const webSearchInvoicesReturns = v.array(
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
    }),
    unit: v.optional(
      v.object({
        _id: v.id('units'),
        unitNumber: v.string(),
        floor: v.optional(v.number()),
      })
    ),
  })
);

export const webSearchInvoicesHandler = async (
  ctx: any,
  args: typeof webSearchInvoicesArgs.type
): Promise<typeof webSearchInvoicesReturns.type> => {
  const { propertyId, searchTerm, limit = 50, status, invoiceType } = args;

  // Get all invoices for the property
  const invoices = await ctx.db
    .query('invoices')
    .withIndex('by_property', (q: any) => q.eq('propertyId', propertyId))
    .collect();

  // Filter invoices based on search term and other criteria
  const filteredInvoices = invoices.filter((invoice: Doc<'invoices'>) => {
    // Apply status filter
    if (status && invoice.status !== status) {
      return false;
    }

    // Apply invoice type filter
    if (invoiceType && invoice.invoiceType !== invoiceType) {
      return false;
    }

    // Apply search term filter
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.description.toLowerCase().includes(searchLower) ||
      invoice.items.some((item: any) => item.description.toLowerCase().includes(searchLower))
    );
  });

  // Sort by creation time (newest first) and limit results
  const sortedInvoices = filteredInvoices
    .sort((a: Doc<'invoices'>, b: Doc<'invoices'>) => b.createdAt - a.createdAt)
    .slice(0, limit);

  // Get related data
  const invoicesWithDetails = await Promise.all(
    sortedInvoices.map(async (invoice: Doc<'invoices'>) => {
      const [tenant, unit] = await Promise.all([
        ctx.db.get(invoice.tenantId),
        invoice.unitId ? ctx.db.get(invoice.unitId) : null,
      ]);

      return {
        ...invoice,
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
      };
    })
  );

  return invoicesWithDetails;
};
