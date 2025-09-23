import { query, mutation } from './_generated/server';
import {
  getMyInvoicesArgs,
  getMyInvoicesHandler,
  getMyReceiptsArgs,
  getMyReceiptsHandler,
  getReceiptByIdArgs,
  getReceiptByIdHandler,
  payInvoiceArgs,
  payInvoiceHandler,
  downloadReceiptNFTArgs,
  downloadReceiptNFTHandler,
} from './paymentDefinitions';

// Mobile Queries
export const getMyInvoices = query({
  args: getMyInvoicesArgs,
  handler: getMyInvoicesHandler,
});

export const getMyReceipts = query({
  args: getMyReceiptsArgs,
  handler: getMyReceiptsHandler,
});

export const getReceiptById = query({
  args: getReceiptByIdArgs,
  handler: getReceiptByIdHandler,
});

// Mobile Mutations
export const payInvoice = mutation({
  args: payInvoiceArgs,
  handler: payInvoiceHandler,
});

export const downloadReceiptNFT = mutation({
  args: downloadReceiptNFTArgs,
  handler: downloadReceiptNFTHandler,
});
