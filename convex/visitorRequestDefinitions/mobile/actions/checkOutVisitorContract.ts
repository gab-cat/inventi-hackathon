import { v } from 'convex/values';
import { ActionCtx } from '../../../_generated/server';
import { internal } from '../../../_generated/api';

export const mobileCheckOutVisitorContractArgs = v.object({
  piiHash: v.string(), // Will be converted to bytes32
});

export const mobileCheckOutVisitorContractReturns = v.object({
  success: v.boolean(),
  transactionHash: v.optional(v.string()),
  message: v.optional(v.string()),
});

export const mobileCheckOutVisitorContractHandler = async (ctx: ActionCtx, args: { piiHash: string }) => {
  try {
    // Import contract utilities (need to be imported inside the handler for Node.js modules)
    const { writeContract, visitorManagementContract, waitForTransactionReceipt } = await import(
      '../../../lib/contracts'
    );

    // Convert string to bytes32 format
    const piiHashBytes32 = args.piiHash as `0x${string}`;

    // Call smart contract
    const hash = await writeContract({
      address: visitorManagementContract.address,
      abi: visitorManagementContract.abi,
      functionName: 'checkOutVisitor',
      args: [piiHashBytes32],
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(hash);

    // TODO: Update database with visitor check-out status
    // This would require creating an internal mutation to update visitor status
    console.log(`Visitor checked out for piiHash: ${args.piiHash}, tx: ${hash}, block: ${receipt.blockNumber}`);

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
