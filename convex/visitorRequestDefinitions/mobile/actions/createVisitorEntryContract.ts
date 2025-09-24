import { v } from 'convex/values';
import { ActionCtx } from '../../../_generated/server';
import { internal } from '../../../_generated/api';

export const mobileCreateVisitorEntryContractArgs = v.object({
  unitOwner: v.string(), // Ethereum address
  unitId: v.string(),
  visitStart: v.number(), // Unix timestamp
  visitEnd: v.number(), // Unix timestamp
  piiHash: v.string(), // Will be converted to bytes32
});

export const mobileCreateVisitorEntryContractReturns = v.object({
  success: v.boolean(),
  transactionHash: v.optional(v.string()),
  createdPiiHash: v.optional(v.string()),
  message: v.optional(v.string()),
});

export const mobileCreateVisitorEntryContractHandler = async (
  ctx: ActionCtx,
  args: { unitOwner: string; unitId: string; visitStart: number; visitEnd: number; piiHash: string }
) => {
  try {
    // Import contract utilities (need to be imported inside the handler for Node.js modules)
    const { writeContract, visitorManagementContract, waitForTransactionReceipt } = await import(
      '../../../lib/contracts'
    );

    // Convert parameters to the correct types
    const unitOwnerAddress = args.unitOwner as `0x${string}`;
    const piiHashBytes32 = args.piiHash as `0x${string}`;
    const visitStartBigInt = BigInt(args.visitStart);
    const visitEndBigInt = BigInt(args.visitEnd);

    // Call smart contract
    const hash = await writeContract({
      address: visitorManagementContract.address,
      abi: visitorManagementContract.abi,
      functionName: 'createVisitorEntry',
      args: [unitOwnerAddress, args.unitId, visitStartBigInt, visitEndBigInt, piiHashBytes32],
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(hash);

    // TODO: Update database with new visitor entry
    // This would require creating an internal mutation to create visitor entry
    console.log(`Visitor entry created for piiHash: ${args.piiHash}, tx: ${hash}, block: ${receipt.blockNumber}`);

    return {
      success: true,
      transactionHash: hash,
      createdPiiHash: args.piiHash,
    };
  } catch (error) {
    console.error('Contract call failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Contract call failed',
    };
  }
};
