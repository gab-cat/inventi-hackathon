import { QueryCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const mobileGetDeliveryByPiiHashArgs = v.object({
  piiHash: v.string(),
});

export const mobileGetDeliveryByPiiHashReturns = v.union(
  v.null(),
  v.object({
    _id: v.id('deliveries'),
    _creationTime: v.number(),
    propertyId: v.id('properties'),
    unitId: v.optional(v.id('units')),
    deliveryType: v.string(),
    senderName: v.string(),
    senderCompany: v.optional(v.string()),
    recipientName: v.string(),
    recipientPhone: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    description: v.string(),
    estimatedDelivery: v.number(),
    actualDelivery: v.optional(v.number()),
    status: v.string(),
    deliveryLocation: v.optional(v.string()),
    deliveryNotes: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    blockchainTxHash: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    piiHash: v.optional(v.string()),
  })
);

export const mobileGetDeliveryByPiiHashHandler = async (
  ctx: QueryCtx,
  args: Infer<typeof mobileGetDeliveryByPiiHashArgs>
) => {
  const delivery = await ctx.db
    .query('deliveries')
    .withIndex('by_pii_hash', q => q.eq('piiHash', args.piiHash))
    .unique();

  return delivery;
};
