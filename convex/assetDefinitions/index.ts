// Web Queries
export * from './web/queries/getAssets';
export * from './web/queries/getAssetById';
export * from './web/queries/getAssetHistory';
export * from './web/queries/getAssetAnalytics';
export * from './web/queries/getAssetDashboardData';
export * from './web/queries/getAssetAlerts';
export * from './web/queries/getInventoryLevels';
export * from './web/queries/getMaintenanceSchedule';
export * from './web/queries/getAssetUtilization';
export * from './web/queries/getAssetReports';

// Web Mutations
export * from './web/mutations/addAsset';
export * from './web/mutations/editAssetDetails';
export * from './web/mutations/updateAssetStatus';
export * from './web/mutations/assignAssetToUser';
export * from './web/mutations/unassignAssetFromUser';
export * from './web/mutations/transferAsset';
export * from './web/mutations/checkOutAsset';
export * from './web/mutations/checkInAsset';
export * from './web/mutations/scheduleMaintenance';
export * from './web/mutations/completeMaintenance';
export * from './web/mutations/performAssetAudit';
export * from './web/mutations/reorderSupplies';
export * from './web/mutations/bulkUpdateAssets';
export * from './web/mutations/generateAssetBarcode';
export * from './web/mutations/retireAsset';
export * from './web/mutations/reactivateAsset';
