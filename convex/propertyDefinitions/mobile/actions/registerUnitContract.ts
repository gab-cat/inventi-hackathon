import { v } from 'convex/values';
import { ActionCtx } from '../../../_generated/server';
import { internal } from '../../../_generated/api';

export const mobileRegisterUnitContractArgs = v.object({
  unitOwner: v.string(), // Ethereum address
  unitId: v.string(),
  maxVisitors: v.number(),
});

export const mobileRegisterUnitContractReturns = v.object({
  success: v.boolean(),
  transactionHash: v.optional(v.string()),
  message: v.optional(v.string()),
});

export const mobileRegisterUnitContractHandler = async (
  ctx: ActionCtx,
  args: { unitOwner: string; unitId: string; maxVisitors: number }
) => {
  try {
    // Import contract utilities (need to be imported inside the handler for Node.js modules)
    const { writeContract, propertyContract, waitForTransactionReceipt } = await import('../../../lib/contracts');

    // Convert parameters to correct types
    const unitOwnerAddress = args.unitOwner as `0x${string}`;
    const maxVisitorsBigInt = BigInt(args.maxVisitors);

    // Call smart contract
    const hash = await writeContract({
      address: propertyContract.address,
      abi: propertyContract.abi,
      functionName: 'registerUnit',
      args: [unitOwnerAddress, args.unitId, maxVisitorsBigInt],
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(hash);

    // TODO: Update database with new unit registration
    // This would require creating an internal mutation to register unit
    console.log(
      `Unit registered: ${args.unitId} for owner ${args.unitOwner}, tx: ${hash}, block: ${receipt.blockNumber}`
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
