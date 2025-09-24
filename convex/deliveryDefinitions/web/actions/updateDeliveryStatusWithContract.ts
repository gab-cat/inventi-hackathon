import { v } from 'convex/values';
import { ActionCtx } from '../../../_generated/server';
import { Doc, Id } from '../../../_generated/dataModel';
import { api } from '../../../_generated/api';

export const webUpdateDeliveryStatusWithContractArgs = {
  deliveryId: v.id('deliveries'),
  status: v.union(
    v.literal('registered'),
    v.literal('arrived'),
    v.literal('collected'),
    v.literal('failed'),
    v.literal('returned')
  ),
  notes: v.optional(v.string()),
  actualDelivery: v.optional(v.number()),
} as const;

export const webUpdateDeliveryStatusWithContractReturns = v.object({
  success: v.boolean(),
  delivery: v.optional(
    v.object({
      _id: v.id('deliveries'),
      _creationTime: v.number(),
      piiHash: v.optional(v.string()),
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
      status: v.union(
        v.literal('registered'),
        v.literal('arrived'),
        v.literal('collected'),
        v.literal('failed'),
        v.literal('returned')
      ),
      deliveryLocation: v.optional(v.string()),
      deliveryNotes: v.optional(v.string()),
      photos: v.optional(v.array(v.string())),
      blockchainTxHash: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  transactionHash: v.optional(v.string()),
  message: v.optional(v.string()),
});

type Args = {
  deliveryId: Id<'deliveries'>;
  status: 'registered' | 'arrived' | 'collected' | 'failed' | 'returned';
  notes?: string;
  actualDelivery?: number;
};

export const webUpdateDeliveryStatusWithContractHandler = async (
  ctx: ActionCtx,
  args: Args
): Promise<{
  success: boolean;
  delivery?: Doc<'deliveries'>;
  transactionHash?: string;
  message?: string;
}> => {
  try {
    console.log(`Starting delivery status update with contract integration for delivery: ${args.deliveryId}`);

    // First, get the delivery to extract the piiHash for blockchain operations
    const delivery = await ctx.runQuery(api.delivery.webGetDeliveryById, {
      deliveryId: args.deliveryId,
    });

    if (!delivery) {
      return {
        success: false,
        message: 'Delivery not found',
      };
    }

    // Check if delivery has a piiHash for blockchain operations
    const piiHash: string | undefined = delivery.piiHash; // Assuming this field contains the piiHash

    if (!piiHash) {
      console.log('No piiHash found, skipping blockchain update and proceeding with database update only');

      // If no piiHash, just update the database using the existing mutation
      const updatedDelivery = await ctx.runMutation(api.delivery.webUpdateDeliveryStatus, {
        deliveryId: args.deliveryId,
        status: args.status,
        notes: args.notes,
        actualDelivery: args.actualDelivery,
      });

      return {
        success: true,
        delivery: updatedDelivery,
        message: 'Delivery updated in database only (no blockchain hash available)',
      };
    }

    console.log(`Found piiHash: ${piiHash}, proceeding with blockchain update`);

    // Step 1: Update the blockchain contract first
    const contractResult = await ctx.runAction(api.delivery.updateDeliveryStatusContract, {
      piiHash: piiHash,
      newStatus: args.status,
      notes: args.notes,
    });

    if (!contractResult.success) {
      console.error('Blockchain contract update failed:', contractResult.message);
      return {
        success: false,
        message: `Blockchain update failed: ${contractResult.message}`,
      };
    }

    console.log(`Blockchain update successful, transaction hash: ${contractResult.transactionHash}`);

    // Step 2: Update the database with the existing mutation
    const updatedDelivery = await ctx.runMutation(api.delivery.webUpdateDeliveryStatus, {
      deliveryId: args.deliveryId,
      status: args.status,
      notes: args.notes,
      actualDelivery: args.actualDelivery,
    });

    console.log(`Database update successful for delivery: ${args.deliveryId}`);

    return {
      success: true,
      delivery: updatedDelivery,
      transactionHash: contractResult.transactionHash,
      message: 'Delivery updated successfully on both blockchain and database',
    };
  } catch (error) {
    console.error('Error in webUpdateDeliveryStatusWithContract:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
