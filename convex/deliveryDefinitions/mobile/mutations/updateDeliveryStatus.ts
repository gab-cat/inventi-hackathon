import { v } from 'convex/values';
import { MutationCtx, internalMutation } from '../../../_generated/server';

export const mobileUpdateDeliveryStatusArgs = v.object({
  piiHash: v.string(),
  status: v.union(
    v.literal('registered'),
    v.literal('arrived'),
    v.literal('collected'),
    v.literal('failed'),
    v.literal('returned')
  ),
  blockchainTxHash: v.string(),
  blockNumber: v.number(),
});

export const mobileUpdateDeliveryStatusReturns = v.object({
  success: v.boolean(),
  deliveryId: v.optional(v.id('deliveries')),
  message: v.optional(v.string()),
});

type UpdateDeliveryStatusArgs = {
  piiHash: string;
  status: 'registered' | 'arrived' | 'collected' | 'failed' | 'returned';
  blockchainTxHash: string;
  blockNumber: number;
};

export const mobileUpdateDeliveryStatusHandler = async (ctx: MutationCtx, args: UpdateDeliveryStatusArgs) => {
  try {
    // Find delivery by piiHash
    const delivery = await ctx.db
      .query('deliveries')
      .withIndex('by_pii_hash', q => q.eq('piiHash', args.piiHash))
      .unique();

    if (!delivery) {
      return {
        success: false,
        message: `Delivery with piiHash ${args.piiHash} not found`,
      };
    }

    // Update delivery status and blockchain info
    await ctx.db.patch(delivery._id, {
      status: args.status,
      blockchainTxHash: args.blockchainTxHash,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      deliveryId: delivery._id,
    };
  } catch (error) {
    console.error('Error updating delivery status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update delivery status',
    };
  }
};
