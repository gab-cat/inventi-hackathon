import { query, mutation } from './_generated/server';
import {
  webGetMaintenanceRequestsArgs,
  webGetMaintenanceRequestsHandler,
  webGetMaintenanceRequestsReturns,
  webGetMaintenanceKPIsArgs,
  webGetMaintenanceKPIsHandler,
  webGetMaintenanceKPIsReturns,
  webGetMaintenanceTrendsArgs,
  webGetMaintenanceTrendsHandler,
  webGetMaintenanceTrendsReturns,
  webGetTechnicianWorkloadArgs,
  webGetTechnicianWorkloadHandler,
  webGetTechnicianWorkloadReturns,
  webGetTechniciansArgs,
  webGetTechniciansHandler,
  webGetTechniciansReturns,
  webGetManagerPropertiesArgs,
  webGetManagerPropertiesHandler,
  webGetManagerPropertiesReturns,
  webGetUnitsByPropertyArgs,
  webGetUnitsByPropertyHandler,
  webGetUnitsByPropertyReturns,
  webAssignTechnicianArgs,
  webAssignTechnicianHandler,
  webUpdateMaintenanceStatusArgs,
  webUpdateMaintenanceStatusHandler,
  webUpdateMaintenanceCostArgs,
  webUpdateMaintenanceCostHandler,
  webBulkUpdateStatusArgs,
  webBulkUpdateStatusHandler,
  tenantConfirmCompletionArgs,
  tenantConfirmCompletionHandler,
} from './maintenanceDefinitions/index';

// Web Queries
export const webGetMaintenanceRequests = query({
  args: webGetMaintenanceRequestsArgs,
  returns: webGetMaintenanceRequestsReturns,
  handler: webGetMaintenanceRequestsHandler,
});

export const webGetMaintenanceKPIs = query({
  args: webGetMaintenanceKPIsArgs,
  returns: webGetMaintenanceKPIsReturns,
  handler: webGetMaintenanceKPIsHandler,
});

export const webGetMaintenanceTrends = query({
  args: webGetMaintenanceTrendsArgs,
  returns: webGetMaintenanceTrendsReturns,
  handler: webGetMaintenanceTrendsHandler,
});

export const webGetTechnicianWorkload = query({
  args: webGetTechnicianWorkloadArgs,
  returns: webGetTechnicianWorkloadReturns,
  handler: webGetTechnicianWorkloadHandler,
});

export const webGetTechnicians = query({
  args: webGetTechniciansArgs,
  returns: webGetTechniciansReturns,
  handler: webGetTechniciansHandler,
});

export const webGetManagerProperties = query({
  args: webGetManagerPropertiesArgs,
  returns: webGetManagerPropertiesReturns,
  handler: webGetManagerPropertiesHandler,
});

export const webGetUnitsByProperty = query({
  args: webGetUnitsByPropertyArgs,
  returns: webGetUnitsByPropertyReturns,
  handler: webGetUnitsByPropertyHandler,
});

// Web Mutations
export const webAssignTechnician = mutation({
  args: webAssignTechnicianArgs,
  handler: webAssignTechnicianHandler,
});

export const webUpdateMaintenanceStatus = mutation({
  args: webUpdateMaintenanceStatusArgs,
  handler: webUpdateMaintenanceStatusHandler,
});

export const webUpdateMaintenanceCost = mutation({
  args: webUpdateMaintenanceCostArgs,
  handler: webUpdateMaintenanceCostHandler,
});

export const webBulkUpdateStatus = mutation({
  args: webBulkUpdateStatusArgs,
  handler: webBulkUpdateStatusHandler,
});

// Mobile Maintenance Function
import {
  createRequestArgs,
  createRequestHandler,
  updateRequestArgs,
  updateRequestHandler,
  deleteRequestArgs,
  deleteRequestHandler,
  cancelRequestArgs,
  cancelRequestHandler,
  getRequestStatusArgs,
  getRequestStatusHandler,
  getRequestsArgs,
  getRequestsHandler,
  getRequestsByIdArgs,
  getRequestsByIdHandler,
  getMyCurrentRequestsArgs,
  getMyCurrentRequestsHandler,
} from './maintenanceDefinitions';

export const createRequest = mutation({
  args: createRequestArgs,
  handler: createRequestHandler,
});

export const updateRequest = mutation({
  args: updateRequestArgs,
  handler: updateRequestHandler,
});

export const deleteRequest = mutation({
  args: deleteRequestArgs,
  handler: deleteRequestHandler,
});

export const cancelRequest = mutation({
  args: cancelRequestArgs,
  handler: cancelRequestHandler,
});

export const getRequestStatus = query({
  args: getRequestStatusArgs,
  handler: getRequestStatusHandler,
});

export const getRequests = query({
  args: getRequestsArgs,
  handler: getRequestsHandler,
});

export const getRequestsById = query({
  args: getRequestsByIdArgs,
  handler: getRequestsByIdHandler,
});

export const getMyCurrentRequests = query({
  args: getMyCurrentRequestsArgs,
  handler: getMyCurrentRequestsHandler,
});

export const tenantConfirmCompletion = mutation({
  args: tenantConfirmCompletionArgs,
  handler: tenantConfirmCompletionHandler,
});
