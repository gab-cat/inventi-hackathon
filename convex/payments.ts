import { query, mutation } from './_generated/server';
import {
  // Mobile imports
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
  // Web imports
  webGetAllReceiptsArgs,
  webGetAllReceiptsHandler,
  webGetAllReceiptsReturns,
  webGetInvoiceByIdArgs,
  webGetInvoiceByIdHandler,
  webGetInvoiceByIdReturns,
  webGetInvoicesByPropertyArgs,
  webGetInvoicesByPropertyHandler,
  webGetInvoicesByPropertyReturns,
  webGetPaymentHistoryArgs,
  webGetPaymentHistoryHandler,
  webGetPaymentHistoryReturns,
  webGetReceiptByIdArgs,
  webGetReceiptByIdHandler,
  webGetReceiptByIdReturns,
  webSearchInvoicesArgs,
  webSearchInvoicesHandler,
  webSearchInvoicesReturns,
  webVerifyReceiptOnChainArgs,
  webVerifyReceiptOnChainHandler,
  webVerifyReceiptOnChainReturns,
  webCreateInvoiceArgs,
  webCreateInvoiceHandler,
  webCreateInvoiceReturns,
  webDeleteInvoiceArgs,
  webDeleteInvoiceHandler,
  webDeleteInvoiceReturns,
  webSendPaymentRequestArgs,
  webSendPaymentRequestHandler,
  webSendPaymentRequestReturns,
  webUpdateInvoiceArgs,
  webUpdateInvoiceHandler,
  webUpdateInvoiceReturns,
  webUpdateInvoiceStatusArgs,
  webUpdateInvoiceStatusHandler,
  webUpdateInvoiceStatusReturns,
  webExportTransactionReportArgs,
  webExportTransactionReportHandler,
  webExportTransactionReportReturns,
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

// Web Queries
export const webGetAllReceipts = query({
  args: webGetAllReceiptsArgs,
  returns: webGetAllReceiptsReturns,
  handler: webGetAllReceiptsHandler,
});

export const webGetInvoiceById = query({
  args: webGetInvoiceByIdArgs,
  returns: webGetInvoiceByIdReturns,
  handler: webGetInvoiceByIdHandler,
});

export const webGetInvoicesByProperty = query({
  args: webGetInvoicesByPropertyArgs,
  returns: webGetInvoicesByPropertyReturns,
  handler: webGetInvoicesByPropertyHandler,
});

export const webGetPaymentHistory = query({
  args: webGetPaymentHistoryArgs,
  returns: webGetPaymentHistoryReturns,
  handler: webGetPaymentHistoryHandler,
});

export const webGetReceiptById = query({
  args: webGetReceiptByIdArgs,
  returns: webGetReceiptByIdReturns,
  handler: webGetReceiptByIdHandler,
});

export const webSearchInvoices = query({
  args: webSearchInvoicesArgs,
  returns: webSearchInvoicesReturns,
  handler: webSearchInvoicesHandler,
});

export const webVerifyReceiptOnChain = query({
  args: webVerifyReceiptOnChainArgs,
  returns: webVerifyReceiptOnChainReturns,
  handler: webVerifyReceiptOnChainHandler,
});

// Web Mutations
export const webCreateInvoice = mutation({
  args: webCreateInvoiceArgs,
  returns: webCreateInvoiceReturns,
  handler: webCreateInvoiceHandler,
});

export const webSendPaymentRequest = mutation({
  args: webSendPaymentRequestArgs,
  returns: webSendPaymentRequestReturns,
  handler: webSendPaymentRequestHandler,
});

export const webUpdateInvoice = mutation({
  args: webUpdateInvoiceArgs,
  returns: webUpdateInvoiceReturns,
  handler: webUpdateInvoiceHandler,
});

export const webUpdateInvoiceStatus = mutation({
  args: webUpdateInvoiceStatusArgs,
  returns: webUpdateInvoiceStatusReturns,
  handler: webUpdateInvoiceStatusHandler,
});

export const webDeleteInvoice = mutation({
  args: webDeleteInvoiceArgs,
  returns: webDeleteInvoiceReturns,
  handler: webDeleteInvoiceHandler,
});

export const webExportTransactionReport = mutation({
  args: webExportTransactionReportArgs,
  returns: webExportTransactionReportReturns,
  handler: webExportTransactionReportHandler,
});
