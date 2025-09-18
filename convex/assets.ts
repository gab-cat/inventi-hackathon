import { query, mutation } from './_generated/server';
import {
  // Queries
  getAssetsArgs,
  getAssetsHandler,
  getAssetsReturns,
  getAssetByIdArgs,
  getAssetByIdHandler,
  getAssetByIdReturns,
  getAssetHistoryArgs,
  getAssetHistoryHandler,
  getAssetHistoryReturns,
  getAssetAnalyticsArgs,
  getAssetAnalyticsHandler,
  getAssetAnalyticsReturns,
  getAssetDashboardDataArgs,
  getAssetDashboardDataHandler,
  getAssetDashboardDataReturns,
  getAssetAlertsArgs,
  getAssetAlertsHandler,
  getAssetAlertsReturns,
  getInventoryLevelsArgs,
  getInventoryLevelsHandler,
  getInventoryLevelsReturns,
  getMaintenanceScheduleArgs,
  getMaintenanceScheduleHandler,
  getMaintenanceScheduleReturns,
  getAssetUtilizationArgs,
  getAssetUtilizationHandler,
  getAssetUtilizationReturns,
  getAssetReportsArgs,
  getAssetReportsHandler,
  getAssetReportsReturns,
  getManagerPropertiesArgs,
  getManagerPropertiesHandler,
  getManagerPropertiesReturns,

  // Mutations
  addAssetArgs,
  addAssetHandler,
  addAssetReturns,
  editAssetDetailsArgs,
  editAssetDetailsHandler,
  editAssetDetailsReturns,
  updateAssetStatusArgs,
  updateAssetStatusHandler,
  updateAssetStatusReturns,
  assignAssetToUserArgs,
  assignAssetToUserHandler,
  assignAssetToUserReturns,
  unassignAssetFromUserArgs,
  unassignAssetFromUserHandler,
  unassignAssetFromUserReturns,
  transferAssetArgs,
  transferAssetHandler,
  transferAssetReturns,
  checkOutAssetArgs,
  checkOutAssetHandler,
  checkOutAssetReturns,
  checkInAssetArgs,
  checkInAssetHandler,
  checkInAssetReturns,
  scheduleMaintenanceArgs,
  scheduleMaintenanceHandler,
  scheduleMaintenanceReturns,
  completeMaintenanceArgs,
  completeMaintenanceHandler,
  completeMaintenanceReturns,
  performAssetAuditArgs,
  performAssetAuditHandler,
  performAssetAuditReturns,
  reorderSuppliesArgs,
  reorderSuppliesHandler,
  reorderSuppliesReturns,
  bulkUpdateAssetsArgs,
  bulkUpdateAssetsHandler,
  bulkUpdateAssetsReturns,
  generateAssetBarcodeArgs,
  generateAssetBarcodeHandler,
  generateAssetBarcodeReturns,
  retireAssetArgs,
  retireAssetHandler,
  retireAssetReturns,
  reactivateAssetArgs,
  reactivateAssetHandler,
  reactivateAssetReturns,
} from './assetDefinitions/index';

// Queries
export const getAssets = query({
  args: getAssetsArgs,
  returns: getAssetsReturns,
  handler: getAssetsHandler,
});

export const getAssetById = query({
  args: getAssetByIdArgs,
  returns: getAssetByIdReturns,
  handler: getAssetByIdHandler,
});

export const getAssetHistory = query({
  args: getAssetHistoryArgs,
  returns: getAssetHistoryReturns,
  handler: getAssetHistoryHandler,
});

export const getAssetAnalytics = query({
  args: getAssetAnalyticsArgs,
  returns: getAssetAnalyticsReturns,
  handler: getAssetAnalyticsHandler,
});

export const getAssetDashboardData = query({
  args: getAssetDashboardDataArgs,
  returns: getAssetDashboardDataReturns,
  handler: getAssetDashboardDataHandler,
});

export const getAssetAlerts = query({
  args: getAssetAlertsArgs,
  returns: getAssetAlertsReturns,
  handler: getAssetAlertsHandler,
});

export const getInventoryLevels = query({
  args: getInventoryLevelsArgs,
  returns: getInventoryLevelsReturns,
  handler: getInventoryLevelsHandler,
});

export const getMaintenanceSchedule = query({
  args: getMaintenanceScheduleArgs,
  returns: getMaintenanceScheduleReturns,
  handler: getMaintenanceScheduleHandler,
});

export const getAssetUtilization = query({
  args: getAssetUtilizationArgs,
  returns: getAssetUtilizationReturns,
  handler: getAssetUtilizationHandler,
});

export const getAssetReports = query({
  args: getAssetReportsArgs,
  returns: getAssetReportsReturns,
  handler: getAssetReportsHandler,
});

export const getManagerProperties = query({
  args: getManagerPropertiesArgs,
  returns: getManagerPropertiesReturns,
  handler: getManagerPropertiesHandler,
});

// Mutations
export const addAsset = mutation({
  args: addAssetArgs,
  returns: addAssetReturns,
  handler: addAssetHandler,
});

export const editAssetDetails = mutation({
  args: editAssetDetailsArgs,
  returns: editAssetDetailsReturns,
  handler: editAssetDetailsHandler,
});

export const updateAssetStatus = mutation({
  args: updateAssetStatusArgs,
  returns: updateAssetStatusReturns,
  handler: updateAssetStatusHandler,
});

export const assignAssetToUser = mutation({
  args: assignAssetToUserArgs,
  returns: assignAssetToUserReturns,
  handler: assignAssetToUserHandler,
});

export const unassignAssetFromUser = mutation({
  args: unassignAssetFromUserArgs,
  returns: unassignAssetFromUserReturns,
  handler: unassignAssetFromUserHandler,
});

export const transferAsset = mutation({
  args: transferAssetArgs,
  returns: transferAssetReturns,
  handler: transferAssetHandler,
});

export const checkOutAsset = mutation({
  args: checkOutAssetArgs,
  returns: checkOutAssetReturns,
  handler: checkOutAssetHandler,
});

export const checkInAsset = mutation({
  args: checkInAssetArgs,
  returns: checkInAssetReturns,
  handler: checkInAssetHandler,
});

export const scheduleMaintenance = mutation({
  args: scheduleMaintenanceArgs,
  returns: scheduleMaintenanceReturns,
  handler: scheduleMaintenanceHandler,
});

export const completeMaintenance = mutation({
  args: completeMaintenanceArgs,
  returns: completeMaintenanceReturns,
  handler: completeMaintenanceHandler,
});

export const performAssetAudit = mutation({
  args: performAssetAuditArgs,
  returns: performAssetAuditReturns,
  handler: performAssetAuditHandler,
});

export const reorderSupplies = mutation({
  args: reorderSuppliesArgs,
  returns: reorderSuppliesReturns,
  handler: reorderSuppliesHandler,
});

export const bulkUpdateAssets = mutation({
  args: bulkUpdateAssetsArgs,
  returns: bulkUpdateAssetsReturns,
  handler: bulkUpdateAssetsHandler,
});

export const generateAssetBarcode = mutation({
  args: generateAssetBarcodeArgs,
  returns: generateAssetBarcodeReturns,
  handler: generateAssetBarcodeHandler,
});

export const retireAsset = mutation({
  args: retireAssetArgs,
  returns: retireAssetReturns,
  handler: retireAssetHandler,
});

export const reactivateAsset = mutation({
  args: reactivateAssetArgs,
  returns: reactivateAssetReturns,
  handler: reactivateAssetHandler,
});
