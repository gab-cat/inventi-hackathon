import { query, mutation, action, internalMutation, internalQuery } from './_generated/server';
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
  // Internal mutations for contract operations
  mobileUpdateDeliveryStatusArgs,
  mobileUpdateDeliveryStatusHandler,
  mobileUpdateDeliveryStatusReturns,
  mobileLogDeliveryActionArgs,
  mobileLogDeliveryActionHandler,
  mobileLogDeliveryActionReturns,
  // Query for getting delivery by piiHash
  mobileGetDeliveryByPiiHashArgs,
  mobileGetDeliveryByPiiHashHandler,
  mobileGetDeliveryByPiiHashReturns,
  // Mutation for updating delivery actual time
  mobileUpdateDeliveryActualTimeArgs,
  mobileUpdateDeliveryActualTimeHandler,
  mobileUpdateDeliveryActualTimeReturns,
  // Mutation for registering delivery
  mobileRegisterDeliveryArgs,
  mobileRegisterDeliveryHandler,
  mobileRegisterDeliveryReturns,
  // Internal mutation for database delivery registration
  mobileRegisterDeliveryDbArgs,
  mobileRegisterDeliveryDbHandler,
  mobileRegisterDeliveryDbReturns,
  // Contract actions
  registerDeliveryContractArgs,
  registerDeliveryContractHandler,
  registerDeliveryContractReturns,
  updateDeliveryStatusContractArgs,
  updateDeliveryStatusContractHandler,
  updateDeliveryStatusContractReturns,
  getDeliveryContractArgs,
  getDeliveryContractHandler,
  getDeliveryContractReturns,
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

export const confirmDeliveryReceipt = action({
  args: confirmDeliveryReceiptArgs,
  returns: confirmDeliveryReceiptReturns,
  handler: confirmDeliveryReceiptHandler,
});

export const reportDeliveryIssue = mutation({
  args: reportDeliveryIssueArgs,
  returns: reportDeliveryIssueReturns,
  handler: reportDeliveryIssueHandler,
});

export const registerDelivery = action({
  args: mobileRegisterDeliveryArgs,
  returns: mobileRegisterDeliveryReturns,
  handler: mobileRegisterDeliveryHandler,
});

// Internal mutations for contract operations
export const updateDeliveryStatus = internalMutation({
  args: mobileUpdateDeliveryStatusArgs,
  returns: mobileUpdateDeliveryStatusReturns,
  handler: mobileUpdateDeliveryStatusHandler,
});

export const logDeliveryAction = internalMutation({
  args: mobileLogDeliveryActionArgs,
  returns: mobileLogDeliveryActionReturns,
  handler: mobileLogDeliveryActionHandler,
});

export const registerDeliveryDb = internalMutation({
  args: mobileRegisterDeliveryDbArgs,
  returns: mobileRegisterDeliveryDbReturns,
  handler: mobileRegisterDeliveryDbHandler,
});

// Internal query for getting delivery by piiHash
export const mobileGetDeliveryByPiiHash = internalQuery({
  args: mobileGetDeliveryByPiiHashArgs,
  returns: mobileGetDeliveryByPiiHashReturns,
  handler: mobileGetDeliveryByPiiHashHandler,
});

// Internal mutation for updating delivery actual time
export const updateDeliveryActualTime = internalMutation({
  args: mobileUpdateDeliveryActualTimeArgs,
  returns: mobileUpdateDeliveryActualTimeReturns,
  handler: mobileUpdateDeliveryActualTimeHandler,
});

// Mobile Contract Actions
export const registerDeliveryContract = action({
  args: registerDeliveryContractArgs,
  returns: registerDeliveryContractReturns,
  handler: registerDeliveryContractHandler,
});

export const updateDeliveryStatusContract = action({
  args: updateDeliveryStatusContractArgs,
  returns: updateDeliveryStatusContractReturns,
  handler: updateDeliveryStatusContractHandler,
});

export const getDeliveryContract = action({
  args: getDeliveryContractArgs,
  returns: getDeliveryContractReturns,
  handler: getDeliveryContractHandler,
});
