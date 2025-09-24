import { v } from 'convex/values';
import { ActionCtx } from '../../../_generated/server';
import { internal } from '../../../_generated/api';

export const mobileAuthorizeWalletContractArgs = v.object({
  wallet: v.string(), // Ethereum address to authorize
});

export const mobileAuthorizeWalletContractReturns = v.object({
  success: v.boolean(),
  transactionHash: v.optional(v.string()),
  message: v.optional(v.string()),
});

export const mobileAuthorizeWalletContractHandler = async (ctx: ActionCtx, args: { wallet: string }) => {
  try {
    // Import contract utilities (need to be imported inside the handler for Node.js modules)
    const { writeContract, propertyContract, waitForTransactionReceipt } = await import('../../../lib/contracts');

    // Convert string to address format
    const walletAddress = args.wallet as `0x${string}`;

    // Call smart contract
    const hash = await writeContract({
      address: propertyContract.address,
      abi: propertyContract.abi,
      functionName: 'authorizeWallet',
      args: [walletAddress],
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(hash);

    // TODO: Update database with wallet authorization
    // This would require creating an internal mutation to update wallet authorization
    console.log(`Wallet authorized: ${args.wallet}, tx: ${hash}, block: ${receipt.blockNumber}`);

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
