import { v } from 'convex/values';
import { MutationCtx, internalMutation } from '../../../_generated/server';

export const mobileLogDeliveryActionArgs = v.object({
  piiHash: v.string(),
  action: v.union(
    v.literal('registered'),
    v.literal('arrived'),
    v.literal('collected'),
    v.literal('failed'),
    v.literal('returned')
  ),
  blockchainTxHash: v.string(),
  notes: v.optional(v.string()),
});

export const mobileLogDeliveryActionReturns = v.object({
  success: v.boolean(),
  message: v.optional(v.string()),
});

type LogDeliveryActionArgs = {
  piiHash: string;
  action: 'registered' | 'arrived' | 'collected' | 'failed' | 'returned';
  blockchainTxHash: string;
  notes?: string;
};

export const mobileLogDeliveryActionHandler = async (ctx: MutationCtx, args: LogDeliveryActionArgs) => {
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

    // Create delivery log entry
    await ctx.db.insert('deliveryLogs', {
      deliveryId: delivery._id,
      propertyId: delivery.propertyId,
      action: args.action,
      timestamp: Date.now(),
      notes: args.notes || `Blockchain transaction: ${args.blockchainTxHash}`,
      blockchainTxHash: args.blockchainTxHash,
      createdAt: Date.now(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error logging delivery action:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to log delivery action',
    };
  }
};
