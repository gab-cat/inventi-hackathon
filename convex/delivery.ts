import { query, mutation } from './_generated/server';
import {
  webRegisterDeliveryArgs,
  webRegisterDeliveryHandler,
  webRegisterDeliveryReturns,
  webAssignDeliveryToRecipientArgs,
  webAssignDeliveryToRecipientHandler,
  webAssignDeliveryToRecipientReturns,
  webMarkDeliveryAsCollectedArgs,
  webMarkDeliveryAsCollectedHandler,
  webMarkDeliveryAsCollectedReturns,
  webUpdateDeliveryStatusArgs,
  webUpdateDeliveryStatusHandler,
  webUpdateDeliveryStatusReturns,
  webGetDeliveryByIdArgs,
  webGetDeliveryByIdHandler,
  webGetDeliveryByIdReturns,
  webGetDeliveryLogArgs,
  webGetDeliveryLogHandler,
  webGetDeliveryLogReturns,
  webSearchDeliveryHistoryArgs,
  webSearchDeliveryHistoryHandler,
  webSearchDeliveryHistoryReturns,
  webExportDeliveryReportsArgs,
  webExportDeliveryReportsHandler,
  webExportDeliveryReportsReturns,
  getMyDeliveriesArgs,
  getMyDeliveriesHandler,
  getDeliveryStatusArgs,
  getDeliveryStatusHandler,
  getDeliveryLogArgs,
  getDeliveryLogHandler,
  notifyIncomingDeliveryArgs,
  notifyIncomingDeliveryHandler,
  notifyIncomingDeliveryReturns,
  confirmDeliveryReceiptArgs,
  confirmDeliveryReceiptHandler,
  confirmDeliveryReceiptReturns,
  reportDeliveryIssueArgs,
  reportDeliveryIssueHandler,
  reportDeliveryIssueReturns,
} from './deliveryDefinitions/index';

// Web Mutations
export const webRegisterDelivery = mutation({
  args: webRegisterDeliveryArgs,
  returns: webRegisterDeliveryReturns,
  handler: webRegisterDeliveryHandler,
});

export const webAssignDeliveryToRecipient = mutation({
  args: webAssignDeliveryToRecipientArgs,
  returns: webAssignDeliveryToRecipientReturns,
  handler: webAssignDeliveryToRecipientHandler,
});

export const webMarkDeliveryAsCollected = mutation({
  args: webMarkDeliveryAsCollectedArgs,
  returns: webMarkDeliveryAsCollectedReturns,
  handler: webMarkDeliveryAsCollectedHandler,
});

export const webUpdateDeliveryStatus = mutation({
  args: webUpdateDeliveryStatusArgs,
  returns: webUpdateDeliveryStatusReturns,
  handler: webUpdateDeliveryStatusHandler,
});

// Web Queries
export const webGetDeliveryById = query({
  args: webGetDeliveryByIdArgs,
  returns: webGetDeliveryByIdReturns,
  handler: webGetDeliveryByIdHandler,
});

export const webGetDeliveryLog = query({
  args: webGetDeliveryLogArgs,
  returns: webGetDeliveryLogReturns,
  handler: webGetDeliveryLogHandler,
});

export const webSearchDeliveryHistory = query({
  args: webSearchDeliveryHistoryArgs,
  returns: webSearchDeliveryHistoryReturns,
  handler: webSearchDeliveryHistoryHandler,
});

export const webExportDeliveryReports = query({
  args: webExportDeliveryReportsArgs,
  returns: webExportDeliveryReportsReturns,
  handler: webExportDeliveryReportsHandler,
});

// Mobile APIs
// Mobile Queries
export const getMyDeliveries = query({
  args: getMyDeliveriesArgs,
  handler: getMyDeliveriesHandler,
});

export const getDeliveryStatus = query({
  args: getDeliveryStatusArgs,
  handler: getDeliveryStatusHandler,
});

export const getDeliveryLog = query({
  args: getDeliveryLogArgs,
  handler: getDeliveryLogHandler,
});

// Mobile Mutations
export const notifyIncomingDelivery = mutation({
  args: notifyIncomingDeliveryArgs,
  returns: notifyIncomingDeliveryReturns,
  handler: notifyIncomingDeliveryHandler,
});

export const confirmDeliveryReceipt = mutation({
  args: confirmDeliveryReceiptArgs,
  returns: confirmDeliveryReceiptReturns,
  handler: confirmDeliveryReceiptHandler,
});

export const reportDeliveryIssue = mutation({
  args: reportDeliveryIssueArgs,
  returns: reportDeliveryIssueReturns,
  handler: reportDeliveryIssueHandler,
});
