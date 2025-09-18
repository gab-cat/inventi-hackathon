import { query, mutation } from './_generated/server';

// Import query definitions and handlers
import {
  getMaintenanceDashboardArgs,
  getMaintenanceDashboardHandler,
  getAssetInventoryArgs,
  getAssetInventoryHandler,
  getAssignedRequestsArgs,
  getAssignedRequestsHandler,
  getRequestDetailsArgs,
  getRequestDetailsHandler,
  getAvailableAssetsArgs,
  getAvailableAssetsHandler,
  getCheckedOutAssetsArgs,
  getCheckedOutAssetsHandler,
} from './techDefinitions/mobile';

// Import mutation definitions and handlers
import {
  updateRequestStatusArgs,
  updateRequestStatusHandler,
  addMaintenancePhotoArgs,
  addMaintenancePhotoHandler,
  updateMaintenanceCostArgs,
  updateMaintenanceCostHandler,
  requestTenantApprovalArgs,
  requestTenantApprovalHandler,
  checkoutAssetArgs,
  checkoutAssetHandler,
  checkinAssetArgs,
  checkinAssetHandler,
  scheduleAssetMaintenanceArgs,
  scheduleAssetMaintenanceHandler,
  reportAssetIssueArgs,
  reportAssetIssueHandler,
  generateUploadUrlArgs,
  generateUploadUrlHandler,
  saveUploadedPhotoArgs,
  saveUploadedPhotoHandler,
} from './techDefinitions/mobile';

// Queries
export const getMaintenanceDashboard = query({
  args: getMaintenanceDashboardArgs,
  handler: getMaintenanceDashboardHandler,
});

export const getAssetInventory = query({
  args: getAssetInventoryArgs,
  handler: getAssetInventoryHandler,
});

export const getAssignedRequests = query({
  args: getAssignedRequestsArgs,
  handler: getAssignedRequestsHandler,
});

export const getRequestDetails = query({
  args: getRequestDetailsArgs,
  handler: getRequestDetailsHandler,
});

export const getAvailableAssets = query({
  args: getAvailableAssetsArgs,
  handler: getAvailableAssetsHandler,
});

export const getCheckedOutAssets = query({
  args: getCheckedOutAssetsArgs,
  handler: getCheckedOutAssetsHandler,
});

// Mutations
export const updateRequestStatus = mutation({
  args: updateRequestStatusArgs,
  handler: updateRequestStatusHandler,
});

export const addMaintenancePhoto = mutation({
  args: addMaintenancePhotoArgs,
  handler: addMaintenancePhotoHandler,
});

export const updateMaintenanceCost = mutation({
  args: updateMaintenanceCostArgs,
  handler: updateMaintenanceCostHandler,
});

export const requestTenantApproval = mutation({
  args: requestTenantApprovalArgs,
  handler: requestTenantApprovalHandler,
});

export const checkoutAsset = mutation({
  args: checkoutAssetArgs,
  handler: checkoutAssetHandler,
});

export const checkinAsset = mutation({
  args: checkinAssetArgs,
  handler: checkinAssetHandler,
});

export const scheduleAssetMaintenance = mutation({
  args: scheduleAssetMaintenanceArgs,
  handler: scheduleAssetMaintenanceHandler,
});

export const reportAssetIssue = mutation({
  args: reportAssetIssueArgs,
  handler: reportAssetIssueHandler,
});

export const generateUploadUrl = mutation({
  args: generateUploadUrlArgs,
  handler: generateUploadUrlHandler,
});

export const saveUploadedPhoto = mutation({
  args: saveUploadedPhotoArgs,
  handler: saveUploadedPhotoHandler,
});
