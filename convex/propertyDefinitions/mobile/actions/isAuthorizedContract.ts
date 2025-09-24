import { v } from 'convex/values';
import { ActionCtx } from '../../../_generated/server';

export const mobileIsAuthorizedContractArgs = v.object({
  wallet: v.string(), // Ethereum address to check
});

export const mobileIsAuthorizedContractReturns = v.object({
  success: v.boolean(),
  isAuthorized: v.optional(v.boolean()),
  message: v.optional(v.string()),
});

export const mobileIsAuthorizedContractHandler = async (
  ctx: ActionCtx,
  args: { wallet: string }
) => {
  try {
    // Import contract utilities (need to be imported inside the handler for Node.js modules)
    const { readContract, propertyContract } = await import('../../../lib/contracts');
    
    // Convert string to address format
    const walletAddress = args.wallet as `0x${string}`;
    
    // Call smart contract read function
    const result = await readContract({
      address: propertyContract.address,
      abi: propertyContract.abi,
      functionName: 'isAuthorized',
      args: [walletAddress],
    });
    
    return {
      success: true,
      isAuthorized: Boolean(result),
    };
  } catch (error) {
    console.error('Contract read failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Contract read failed',
    };
  }
};
