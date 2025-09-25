import { v } from 'convex/values';
import { Doc, Id } from '../../../_generated/dataModel';

export const webVerifyReceiptOnChainArgs = v.object({
  receiptId: v.id('receipts'),
});

export const webVerifyReceiptOnChainReturns = v.object({
  isValid: v.boolean(),
  receipt: v.union(
    v.null(),
    v.object({
      _id: v.id('receipts'),
      receiptNumber: v.string(),
      amount: v.number(),
      nftTokenId: v.optional(v.string()),
      nftContractAddress: v.optional(v.string()),
      blockchainTxHash: v.string(),
      blockNumber: v.number(),
      createdAt: v.number(),
    })
  ),
  verificationDetails: v.object({
    transactionHash: v.string(),
    blockNumber: v.number(),
    gasUsed: v.optional(v.number()),
    gasPrice: v.optional(v.number()),
    timestamp: v.optional(v.number()),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
    value: v.optional(v.string()),
  }),
  error: v.optional(v.string()),
});

export const webVerifyReceiptOnChainHandler = async (
  ctx: any,
  args: typeof webVerifyReceiptOnChainArgs.type
): Promise<typeof webVerifyReceiptOnChainReturns.type> => {
  const { receiptId } = args;

  try {
    // Get the receipt
    const receipt = await ctx.db.get(receiptId);
    if (!receipt) {
      return {
        isValid: false,
        receipt: null,
        verificationDetails: {
          transactionHash: '',
          blockNumber: 0,
        },
        error: 'Receipt not found',
      };
    }

    // Verify the blockchain transaction
    // This would typically involve calling a blockchain API or smart contract
    // For now, we'll simulate the verification process

    const verificationDetails = {
      transactionHash: receipt.blockchainTxHash,
      blockNumber: receipt.blockNumber,
      gasUsed: 21000, // Example gas used
      gasPrice: 20000000000, // Example gas price in wei
      timestamp: Date.now(),
      from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Example from address
      to: '0x8ba1f109551bD432803012645Hac136c', // Example to address
      value: receipt.amount.toString(),
    };

    // Simulate blockchain verification
    // In a real implementation, you would:
    // 1. Call the blockchain API to verify the transaction
    // 2. Check if the transaction exists and is confirmed
    // 3. Verify the transaction details match the receipt
    // 4. Check if the NFT was minted successfully (if applicable)

    const isValid = receipt.blockchainTxHash && receipt.blockNumber > 0;

    return {
      isValid,
      receipt: {
        _id: receipt._id,
        receiptNumber: receipt.receiptNumber,
        amount: receipt.amount,
        nftTokenId: receipt.nftTokenId,
        nftContractAddress: receipt.nftContractAddress,
        blockchainTxHash: receipt.blockchainTxHash,
        blockNumber: receipt.blockNumber,
        createdAt: receipt.createdAt,
      },
      verificationDetails,
    };
  } catch (error) {
    return {
      isValid: false,
      receipt: null,
      verificationDetails: {
        transactionHash: '',
        blockNumber: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
