import { query, mutation } from './_generated/server';
import {
  // Web Queries
  webGetAssetsArgs,
  webGetAssetsHandler,
  webGetAssetsReturns,
  webGetAssetByIdArgs,
  webGetAssetByIdHandler,
  webGetAssetByIdReturns,
  webGetAssetHistoryArgs,
  webGetAssetHistoryHandler,
  webGetAssetHistoryReturns,
  webGetAssetAnalyticsArgs,
  webGetAssetAnalyticsHandler,
  webGetAssetAnalyticsReturns,
  webGetAssetDashboardDataArgs,
  webGetAssetDashboardDataHandler,
  webGetAssetDashboardDataReturns,
  webGetAssetAlertsArgs,
  webGetAssetAlertsHandler,
  webGetAssetAlertsReturns,
  webGetInventoryLevelsArgs,
  webGetInventoryLevelsHandler,
  webGetInventoryLevelsReturns,
  webGetMaintenanceScheduleArgs,
  webGetMaintenanceScheduleHandler,
  webGetMaintenanceScheduleReturns,
  webGetAssetUtilizationArgs,
  webGetAssetUtilizationHandler,
  webGetAssetUtilizationReturns,
  webGetAssetReportsArgs,
  webGetAssetReportsHandler,
  webGetAssetReportsReturns,
  webGetManagerPropertiesArgs,
  webGetManagerPropertiesHandler,
  webGetManagerPropertiesReturns,

  // Web Mutations
  webAddAssetArgs,
  webAddAssetHandler,
  webAddAssetReturns,
  webEditAssetDetailsArgs,
  webEditAssetDetailsHandler,
  webEditAssetDetailsReturns,
  webUpdateAssetStatusArgs,
  webUpdateAssetStatusHandler,
  webUpdateAssetStatusReturns,
  webAssignAssetToUserArgs,
  webAssignAssetToUserHandler,
  webAssignAssetToUserReturns,
  webUnassignAssetFromUserArgs,
  webUnassignAssetFromUserHandler,
  webUnassignAssetFromUserReturns,
  webTransferAssetArgs,
  webTransferAssetHandler,
  webTransferAssetReturns,
  webCheckOutAssetArgs,
  webCheckOutAssetHandler,
  webCheckOutAssetReturns,
  webCheckInAssetArgs,
  webCheckInAssetHandler,
  webCheckInAssetReturns,
  webScheduleMaintenanceArgs,
  webScheduleMaintenanceHandler,
  webScheduleMaintenanceReturns,
  webCompleteMaintenanceArgs,
  webCompleteMaintenanceHandler,
  webCompleteMaintenanceReturns,
  webPerformAssetAuditArgs,
  webPerformAssetAuditHandler,
  webPerformAssetAuditReturns,
  webReorderSuppliesArgs,
  webReorderSuppliesHandler,
  webReorderSuppliesReturns,
  webBulkUpdateAssetsArgs,
  webBulkUpdateAssetsHandler,
  webBulkUpdateAssetsReturns,
  webGenerateAssetBarcodeArgs,
  webGenerateAssetBarcodeHandler,
  webGenerateAssetBarcodeReturns,
  webRetireAssetArgs,
  webRetireAssetHandler,
  webRetireAssetReturns,
  webReactivateAssetArgs,
  webReactivateAssetHandler,
  webReactivateAssetReturns,
} from './assetDefinitions/index';

// Web Queries
export const webGetAssets = query({
  args: webGetAssetsArgs,
  returns: webGetAssetsReturns,
  handler: webGetAssetsHandler,
});

export const webGetAssetById = query({
  args: webGetAssetByIdArgs,
  returns: webGetAssetByIdReturns,
  handler: webGetAssetByIdHandler,
});

export const webGetAssetHistory = query({
  args: webGetAssetHistoryArgs,
  returns: webGetAssetHistoryReturns,
  handler: webGetAssetHistoryHandler,
});

export const webGetAssetAnalytics = query({
  args: webGetAssetAnalyticsArgs,
  returns: webGetAssetAnalyticsReturns,
  handler: webGetAssetAnalyticsHandler,
});

export const webGetAssetDashboardData = query({
  args: webGetAssetDashboardDataArgs,
  returns: webGetAssetDashboardDataReturns,
  handler: webGetAssetDashboardDataHandler,
});

export const webGetAssetAlerts = query({
  args: webGetAssetAlertsArgs,
  returns: webGetAssetAlertsReturns,
  handler: webGetAssetAlertsHandler,
});

export const webGetInventoryLevels = query({
  args: webGetInventoryLevelsArgs,
  returns: webGetInventoryLevelsReturns,
  handler: webGetInventoryLevelsHandler,
});

export const webGetMaintenanceSchedule = query({
  args: webGetMaintenanceScheduleArgs,
  returns: webGetMaintenanceScheduleReturns,
  handler: webGetMaintenanceScheduleHandler,
});

export const webGetAssetUtilization = query({
  args: webGetAssetUtilizationArgs,
  returns: webGetAssetUtilizationReturns,
  handler: webGetAssetUtilizationHandler,
});

export const webGetAssetReports = query({
  args: webGetAssetReportsArgs,
  returns: webGetAssetReportsReturns,
  handler: webGetAssetReportsHandler,
});

export const webGetManagerProperties = query({
  args: webGetManagerPropertiesArgs,
  returns: webGetManagerPropertiesReturns,
  handler: webGetManagerPropertiesHandler,
});

// Web Mutations
export const webAddAsset = mutation({
  args: webAddAssetArgs,
  returns: webAddAssetReturns,
  handler: webAddAssetHandler,
});

export const webEditAssetDetails = mutation({
  args: webEditAssetDetailsArgs,
  returns: webEditAssetDetailsReturns,
  handler: webEditAssetDetailsHandler,
});

export const webUpdateAssetStatus = mutation({
  args: webUpdateAssetStatusArgs,
  returns: webUpdateAssetStatusReturns,
  handler: webUpdateAssetStatusHandler,
});

export const webAssignAssetToUser = mutation({
  args: webAssignAssetToUserArgs,
  returns: webAssignAssetToUserReturns,
  handler: webAssignAssetToUserHandler,
});

export const webUnassignAssetFromUser = mutation({
  args: webUnassignAssetFromUserArgs,
  returns: webUnassignAssetFromUserReturns,
  handler: webUnassignAssetFromUserHandler,
});

export const webTransferAsset = mutation({
  args: webTransferAssetArgs,
  returns: webTransferAssetReturns,
  handler: webTransferAssetHandler,
});

export const webCheckOutAsset = mutation({
  args: webCheckOutAssetArgs,
  returns: webCheckOutAssetReturns,
  handler: webCheckOutAssetHandler,
});

export const webCheckInAsset = mutation({
  args: webCheckInAssetArgs,
  returns: webCheckInAssetReturns,
  handler: webCheckInAssetHandler,
});

export const webScheduleMaintenance = mutation({
  args: webScheduleMaintenanceArgs,
  returns: webScheduleMaintenanceReturns,
  handler: webScheduleMaintenanceHandler,
});

export const webCompleteMaintenance = mutation({
  args: webCompleteMaintenanceArgs,
  returns: webCompleteMaintenanceReturns,
  handler: webCompleteMaintenanceHandler,
});

export const webPerformAssetAudit = mutation({
  args: webPerformAssetAuditArgs,
  returns: webPerformAssetAuditReturns,
  handler: webPerformAssetAuditHandler,
});

export const webReorderSupplies = mutation({
  args: webReorderSuppliesArgs,
  returns: webReorderSuppliesReturns,
  handler: webReorderSuppliesHandler,
});

export const webBulkUpdateAssets = mutation({
  args: webBulkUpdateAssetsArgs,
  returns: webBulkUpdateAssetsReturns,
  handler: webBulkUpdateAssetsHandler,
});

export const webGenerateAssetBarcode = mutation({
  args: webGenerateAssetBarcodeArgs,
  returns: webGenerateAssetBarcodeReturns,
  handler: webGenerateAssetBarcodeHandler,
});

export const webRetireAsset = mutation({
  args: webRetireAssetArgs,
  returns: webRetireAssetReturns,
  handler: webRetireAssetHandler,
});

export const webReactivateAsset = mutation({
  args: webReactivateAssetArgs,
  returns: webReactivateAssetReturns,
  handler: webReactivateAssetHandler,
});
