import { v } from 'convex/values';
import { Doc, Id } from '../../../_generated/dataModel';

export const webGetReceiptByIdArgs = v.object({
  receiptId: v.id('receipts'),
});

export const webGetReceiptByIdReturns = v.union(
  v.null(),
  v.object({
    _id: v.id('receipts'),
    _creationTime: v.number(),
    paymentId: v.id('payments'),
    invoiceId: v.id('invoices'),
    propertyId: v.id('properties'),
    tenantId: v.id('users'),
    receiptNumber: v.string(),
    amount: v.number(),
    nftTokenId: v.optional(v.string()),
    nftContractAddress: v.optional(v.string()),
    blockchainTxHash: v.string(),
    blockNumber: v.number(),
    metadata: v.optional(
      v.object({
        description: v.string(),
        items: v.array(v.string()),
        timestamp: v.number(),
      })
    ),
    createdAt: v.number(),
    // Joined data
    tenant: v.object({
      _id: v.id('users'),
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
    }),
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
      totalAmount: v.number(),
      dueDate: v.number(),
    }),
    payment: v.object({
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
      paymentReference: v.optional(v.string()),
      blockchainTxHash: v.optional(v.string()),
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
  })
);

export const webGetReceiptByIdHandler = async (
  ctx: any,
  args: typeof webGetReceiptByIdArgs.type
): Promise<typeof webGetReceiptByIdReturns.type> => {
  const { receiptId } = args;

  const receipt = await ctx.db.get(receiptId);
  if (!receipt) {
    return null;
  }

  // Get related data
  const [tenant, invoiceDoc, payment, property] = await Promise.all([
    ctx.db.get(receipt.tenantId),
    ctx.db.get(receipt.invoiceId),
    ctx.db.get(receipt.paymentId),
    ctx.db.get(receipt.propertyId),
  ]);

  const unit = invoiceDoc?.unitId ? await ctx.db.get(invoiceDoc.unitId) : null;

  return {
    ...receipt,
    tenant: {
      _id: tenant!._id,
      firstName: tenant!.firstName,
      lastName: tenant!.lastName,
      email: tenant!.email,
      phone: tenant!.phone,
    },
    invoice: {
      _id: invoiceDoc!._id,
      invoiceNumber: invoiceDoc!.invoiceNumber,
      invoiceType: invoiceDoc!.invoiceType,
      description: invoiceDoc!.description,
      totalAmount: invoiceDoc!.totalAmount,
      dueDate: invoiceDoc!.dueDate,
    },
    payment: {
      _id: payment!._id,
      amount: payment!.amount,
      paymentMethod: payment!.paymentMethod,
      status: payment!.status,
      processedAt: payment!.processedAt,
      paymentReference: payment!.paymentReference,
      blockchainTxHash: payment!.blockchainTxHash,
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
  };
};
