import { v } from 'convex/values';
import { ActionCtx } from '../../../_generated/server';
import { internal } from '../../../_generated/api';

export const mobileRegisterDeliveryContractArgs = v.object({
  piiHash: v.string(), // Will be converted to bytes32
});

export const mobileRegisterDeliveryContractReturns = v.object({
  success: v.boolean(),
  transactionHash: v.optional(v.string()),
  message: v.optional(v.string()),
});

export const mobileRegisterDeliveryContractHandler = async (ctx: ActionCtx, args: { piiHash: string }) => {
  try {
    // Import contract utilities (need to be imported inside the handler for Node.js modules)
    const { writeContract, deliveryManagementContract, waitForTransactionReceipt } = await import(
      '../../../lib/contracts'
    );

    // Convert string to bytes32 format
    const piiHashBytes32 = args.piiHash as `0x${string}`;

    // Call smart contract
    const hash = await writeContract({
      address: deliveryManagementContract.address,
      abi: deliveryManagementContract.abi,
      functionName: 'registerDelivery',
      args: [piiHashBytes32],
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(hash);

    // Update database with delivery registration and blockchain transaction
    const updateResult = await ctx.runMutation(internal.delivery.updateDeliveryStatus, {
      piiHash: args.piiHash,
      status: 'registered',
      blockchainTxHash: hash,
      blockNumber: Number(receipt.blockNumber),
    });

    if (!updateResult.success) {
      console.error('Failed to update delivery status:', updateResult.message);
      // Note: Contract call succeeded but database update failed
      // This should be handled with proper error reporting
    }

    // Log the delivery action
    const logResult = await ctx.runMutation(internal.delivery.logDeliveryAction, {
      piiHash: args.piiHash,
      action: 'registered',
      blockchainTxHash: hash,
      notes: `Delivery registered via blockchain transaction`,
    });

    if (!logResult.success) {
      console.error('Failed to log delivery action:', logResult.message);
    }

    console.log(`Delivery registered for piiHash: ${args.piiHash}, tx: ${hash}, block: ${receipt.blockNumber}`);

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
