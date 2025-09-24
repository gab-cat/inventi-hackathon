import { query, mutation } from './_generated/server';
import {
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
  webGetAssetsNearingMaintenanceArgs,
  webGetAssetsNearingMaintenanceHandler,
  webGetAssetsNearingMaintenanceReturns,
  webGetTechniciansArgs,
  webGetTechniciansHandler,
  webGetTechniciansReturns,
  webAddAssetArgs,
  webAddAssetHandler,
  webEditAssetDetailsArgs,
  webEditAssetDetailsHandler,
  webUpdateAssetStatusArgs,
  webUpdateAssetStatusHandler,
  webAssignAssetToUserArgs,
  webAssignAssetToUserHandler,
  webUnassignAssetFromUserArgs,
  webUnassignAssetFromUserHandler,
  webTransferAssetArgs,
  webTransferAssetHandler,
  webCheckOutAssetArgs,
  webCheckOutAssetHandler,
  webCheckInAssetArgs,
  webCheckInAssetHandler,
  webScheduleMaintenanceArgs,
  webScheduleMaintenanceHandler,
  webCompleteMaintenanceArgs,
  webCompleteMaintenanceHandler,
  webPerformAssetAuditArgs,
  webPerformAssetAuditHandler,
  webReorderSuppliesArgs,
  webReorderSuppliesHandler,
  webBulkUpdateAssetsArgs,
  webBulkUpdateAssetsHandler,
  webGenerateAssetBarcodeArgs,
  webGenerateAssetBarcodeHandler,
  webRetireAssetArgs,
  webRetireAssetHandler,
  webReactivateAssetArgs,
  webReactivateAssetHandler,
  webAssignAssetMaintenanceArgs,
  webAssignAssetMaintenanceHandler,
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

export const webGetAssetsNearingMaintenance = query({
  args: webGetAssetsNearingMaintenanceArgs,
  returns: webGetAssetsNearingMaintenanceReturns,
  handler: webGetAssetsNearingMaintenanceHandler,
});

export const webGetTechnicians = query({
  args: webGetTechniciansArgs,
  returns: webGetTechniciansReturns,
  handler: webGetTechniciansHandler,
});

// Web Mutations
export const webAddAsset = mutation({
  args: webAddAssetArgs,
  handler: webAddAssetHandler,
});

export const webEditAssetDetails = mutation({
  args: webEditAssetDetailsArgs,
  handler: webEditAssetDetailsHandler,
});

export const webUpdateAssetStatus = mutation({
  args: webUpdateAssetStatusArgs,
  handler: webUpdateAssetStatusHandler,
});

export const webAssignAssetToUser = mutation({
  args: webAssignAssetToUserArgs,
  handler: webAssignAssetToUserHandler,
});

export const webUnassignAssetFromUser = mutation({
  args: webUnassignAssetFromUserArgs,
  handler: webUnassignAssetFromUserHandler,
});

export const webTransferAsset = mutation({
  args: webTransferAssetArgs,
  handler: webTransferAssetHandler,
});

export const webCheckOutAsset = mutation({
  args: webCheckOutAssetArgs,
  handler: webCheckOutAssetHandler,
});

export const webCheckInAsset = mutation({
  args: webCheckInAssetArgs,
  handler: webCheckInAssetHandler,
});

export const webScheduleMaintenance = mutation({
  args: webScheduleMaintenanceArgs,
  handler: webScheduleMaintenanceHandler,
});

export const webCompleteMaintenance = mutation({
  args: webCompleteMaintenanceArgs,
  handler: webCompleteMaintenanceHandler,
});

export const webPerformAssetAudit = mutation({
  args: webPerformAssetAuditArgs,
  handler: webPerformAssetAuditHandler,
});

export const webReorderSupplies = mutation({
  args: webReorderSuppliesArgs,
  handler: webReorderSuppliesHandler,
});

export const webBulkUpdateAssets = mutation({
  args: webBulkUpdateAssetsArgs,
  handler: webBulkUpdateAssetsHandler,
});

export const webGenerateAssetBarcode = mutation({
  args: webGenerateAssetBarcodeArgs,
  handler: webGenerateAssetBarcodeHandler,
});

export const webRetireAsset = mutation({
  args: webRetireAssetArgs,
  handler: webRetireAssetHandler,
});

export const webReactivateAsset = mutation({
  args: webReactivateAssetArgs,
  handler: webReactivateAssetHandler,
});

export const webAssignAssetMaintenance = mutation({
  args: webAssignAssetMaintenanceArgs,
  handler: webAssignAssetMaintenanceHandler,
});
