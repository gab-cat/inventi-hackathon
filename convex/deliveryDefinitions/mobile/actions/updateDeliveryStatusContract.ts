import { v } from 'convex/values';
import { ActionCtx } from '../../../_generated/server';
import { internal } from '../../../_generated/api';

export const mobileUpdateDeliveryStatusContractArgs = v.object({
  piiHash: v.string(), // Will be converted to bytes32
  newStatus: v.union(
    v.literal('registered'),
    v.literal('arrived'),
    v.literal('collected'),
    v.literal('failed'),
    v.literal('returned')
  ),
  notes: v.optional(v.string()),
});

export const mobileUpdateDeliveryStatusContractReturns = v.object({
  success: v.boolean(),
  transactionHash: v.optional(v.string()),
  message: v.optional(v.string()),
});

type DeliveryStatus = 'registered' | 'arrived' | 'collected' | 'failed' | 'returned';

const CONTRACT_FUNCTIONS: Record<DeliveryStatus, string> = {
  registered: 'registerDelivery',
  arrived: 'markArrived',
  collected: 'markCollected',
  failed: 'markFailed',
  returned: 'markReturned',
};

const VALID_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  registered: ['arrived', 'failed', 'registered'], // Can only move to arrived or failed
  arrived: ['collected', 'failed', 'returned', 'arrived'], // Can be collected, fail, or returned
  collected: [], // Terminal state - cannot change
  failed: [], // Terminal state - cannot change
  returned: [], // Terminal state - cannot change
};

export const mobileUpdateDeliveryStatusContractHandler = async (
  ctx: ActionCtx,
  args: { piiHash: string; newStatus: DeliveryStatus; notes?: string }
) => {
  try {
    // First, find the delivery to validate current status
    const delivery = await ctx.runQuery(internal.delivery.mobileGetDeliveryByPiiHash, {
      piiHash: args.piiHash,
    });

    if (!delivery) {
      return {
        success: false,
        message: `Delivery with piiHash ${args.piiHash} not found`,
      };
    }

    // Validate status transition
    const currentStatus = delivery.status as DeliveryStatus;
    if (!VALID_TRANSITIONS[currentStatus].includes(args.newStatus)) {
      return {
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${args.newStatus}`,
      };
    }

    // Import contract utilities (need to be imported inside the handler for Node.js modules)
    const { writeContract, deliveryManagementContract, waitForTransactionReceipt } = await import(
      '../../../lib/contracts'
    );

    // Convert string to bytes32 format
    const piiHashBytes32 = args.piiHash as `0x${string}`;

    // Get the appropriate contract function
    const contractFunction = CONTRACT_FUNCTIONS[args.newStatus];

    // Call smart contract
    const hash = await writeContract({
      address: deliveryManagementContract.address,
      abi: deliveryManagementContract.abi,
      functionName: contractFunction,
      args: [piiHashBytes32],
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(hash);

    // Update database with delivery status change
    const updateResult = await ctx.runMutation(internal.delivery.updateDeliveryStatus, {
      piiHash: args.piiHash,
      status: args.newStatus,
      blockchainTxHash: hash,
      blockNumber: Number(receipt.blockNumber),
    });

    if (!updateResult.success) {
      console.error('Failed to update delivery status:', updateResult.message);
    }

    // Log the delivery action
    const logResult = await ctx.runMutation(internal.delivery.logDeliveryAction, {
      piiHash: args.piiHash,
      action: args.newStatus,
      blockchainTxHash: hash,
      notes: args.notes || `Delivery status updated to ${args.newStatus} via blockchain transaction`,
    });

    if (!logResult.success) {
      console.error('Failed to log delivery action:', logResult.message);
    }

    console.log(
      `Delivery status updated to ${args.newStatus} for piiHash: ${args.piiHash}, tx: ${hash}, block: ${receipt.blockNumber}`
    );

    return {
      success: true,
      transactionHash: hash,
    };
  } catch (error) {
    console.error('Contract call failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Contract call failed',
    };
  }
};
