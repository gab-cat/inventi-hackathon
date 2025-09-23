import { MutationCtx } from '../../../_generated/server';
import { Infer, v } from 'convex/values';

export const downloadReceiptNFTArgs = v.object({
  receiptId: v.id('receipts'),
});

export const downloadReceiptNFTReturns = v.object({
  success: v.boolean(),
  message: v.string(),
  nftData: v.optional(
    v.object({
      tokenId: v.string(),
      contractAddress: v.string(),
      blockchainTxHash: v.string(),
      receiptNumber: v.string(),
      amount: v.number(),
      metadata: v.object({
        name: v.string(),
        description: v.string(),
        image: v.string(),
        attributes: v.array(
          v.object({
            trait_type: v.string(),
            value: v.string(),
          })
        ),
      }),
      downloadUrl: v.string(),
    })
  ),
});

export const downloadReceiptNFTHandler = async (ctx: MutationCtx, args: Infer<typeof downloadReceiptNFTArgs>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return { success: false, message: 'User not authenticated' };
  }

  const me = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('clerkId'), identity.subject))
    .first();
  if (!me) {
    return { success: false, message: 'User not found' };
  }

  // Get the receipt
  const receipt = await ctx.db.get(args.receiptId);
  if (!receipt) {
    return { success: false, message: 'Receipt not found' };
  }

  // Verify the receipt belongs to the authenticated user
  if (receipt.tenantId !== me._id) {
    return { success: false, message: 'Unauthorized access to receipt' };
  }

  // Get invoice details for metadata
  const invoice = await ctx.db.get(receipt.invoiceId);
  if (!invoice) {
    return { success: false, message: 'Invoice data not found' };
  }

  // Simulate NFT metadata generation
  const nftMetadata = {
    name: `Payment Receipt #${receipt.receiptNumber}`,
    description: `Blockchain-verified payment receipt for invoice ${invoice.invoiceNumber}. Amount: $${receipt.amount}. Paid on ${new Date(receipt.createdAt).toLocaleDateString()}.`,
    image: `https://api.dicebear.com/7.x/shapes/svg?seed=${receipt.receiptNumber}`, // Placeholder NFT image
    attributes: [
      {
        trait_type: 'Invoice Type',
        value: invoice.invoiceType,
      },
      {
        trait_type: 'Amount',
        value: `$${receipt.amount}`,
      },
      {
        trait_type: 'Payment Date',
        value: new Date(receipt.createdAt).toLocaleDateString(),
      },
      {
        trait_type: 'Blockchain',
        value: 'Ethereum', // Simulated
      },
      {
        trait_type: 'Verified',
        value: 'True',
      },
    ],
  };

  // Simulate download URL generation
  const downloadUrl = `https://nft-receipts.example.com/download/${receipt.receiptNumber}`;

  return {
    success: true,
    message: 'NFT receipt data retrieved successfully',
    nftData: {
      tokenId: receipt.nftTokenId || '',
      contractAddress: receipt.nftContractAddress || '',
      blockchainTxHash: receipt.blockchainTxHash,
      receiptNumber: receipt.receiptNumber,
      amount: receipt.amount,
      metadata: nftMetadata,
      downloadUrl,
    },
  };
};
