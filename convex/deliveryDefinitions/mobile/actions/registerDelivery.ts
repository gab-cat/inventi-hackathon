import { v } from 'convex/values';
import { ActionCtx } from '../../../_generated/server';
import { Id } from '../../../_generated/dataModel';
import { internal, api } from '../../../_generated/api';

export const mobileRegisterDeliveryArgs = v.object({
  propertyId: v.id('properties'),
  unitId: v.optional(v.id('units')), // Optional for common area deliveries
  deliveryType: v.union(
    v.literal('package'),
    v.literal('food'),
    v.literal('grocery'),
    v.literal('mail'),
    v.literal('other')
  ),
  senderName: v.string(),
  senderCompany: v.optional(v.string()),
  recipientName: v.string(),
  recipientPhone: v.optional(v.string()),
  recipientEmail: v.optional(v.string()),
  trackingNumber: v.optional(v.string()),
  description: v.string(),
  estimatedDelivery: v.number(), // Timestamp
  deliveryLocation: v.optional(v.string()), // "unit", "lobby", "mailroom", "storage"
  deliveryNotes: v.optional(v.string()),
  photos: v.optional(v.array(v.string())), // Photo URLs
});

export const mobileRegisterDeliveryReturns = v.object({
  success: v.boolean(),
  deliveryId: v.optional(v.id('deliveries')),
  message: v.optional(v.string()),
});

type Args = {
  propertyId: Id<'properties'>;
  unitId?: Id<'units'>;
  deliveryType: 'package' | 'food' | 'grocery' | 'mail' | 'other';
  senderName: string;
  senderCompany?: string;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  trackingNumber?: string;
  description: string;
  estimatedDelivery: number;
  deliveryLocation?: string;
  deliveryNotes?: string;
  photos?: string[];
};

export const mobileRegisterDeliveryHandler = async (
  ctx: ActionCtx,
  args: Args
): Promise<{
  success: boolean;
  deliveryId?: Id<'deliveries'>;
  message?: string;
}> => {
  try {
    // Generate PII hash using the hash action
    const hashResult = await ctx.runAction(api.hash.hashPii, {
      recipientName: args.recipientName,
      recipientPhone: args.recipientPhone,
      recipientEmail: args.recipientEmail,
    });

    if (!hashResult.success || !hashResult.piiHash) {
      return {
        success: false,
        message: hashResult.message || 'Failed to generate PII hash',
      };
    }

    // Call smart contract to register delivery first
    try {
      // Import contract utilities (need to be imported inside the handler for Node.js modules)
      const { writeContract, deliveryManagementContract, waitForTransactionReceipt } = await import(
        '../../../lib/contracts'
      );

      // Convert string to bytes32 format
      const piiHashBytes32 = hashResult.piiHash as `0x${string}`;

      console.log(`Registering delivery on blockchain with piiHash: ${hashResult.piiHash}`);

      // Call smart contract registerDelivery function
      const hash = await writeContract({
        address: deliveryManagementContract.address,
        abi: deliveryManagementContract.abi,
        functionName: 'registerDelivery',
        args: [piiHashBytes32],
      });

      // Wait for transaction confirmation
      const receipt = await waitForTransactionReceipt(hash);

      console.log(`Delivery registered on blockchain: tx ${hash}, block ${receipt.blockNumber}`);

      // Register delivery in database with blockchain transaction details
      const dbResult = await ctx.runMutation(internal.delivery.registerDeliveryDb, {
        ...args,
        piiHash: hashResult.piiHash,
        blockchainTxHash: hash,
      });

      return dbResult;
    } catch (contractError) {
      console.error('Blockchain registration failed:', contractError);
      return {
        success: false,
        message: `Blockchain registration failed: ${contractError instanceof Error ? contractError.message : 'Unknown error'}`,
      };
    }
  } catch (error) {
    console.error('Delivery registration failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to register delivery',
    };
  }
};
