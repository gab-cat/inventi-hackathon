import { query, mutation } from './_generated/server';
import {
  getMaintenanceRequestsArgs,
  getMaintenanceRequestsHandler,
  getMaintenanceRequestsReturns,
  getMaintenanceKPIsArgs,
  getMaintenanceKPIsHandler,
  getMaintenanceKPIsReturns,
  getMaintenanceTrendsArgs,
  getMaintenanceTrendsHandler,
  getMaintenanceTrendsReturns,
  getTechnicianWorkloadArgs,
  getTechnicianWorkloadHandler,
  getTechnicianWorkloadReturns,
  getTechniciansArgs,
  getTechniciansHandler,
  getTechniciansReturns,
  getManagerPropertiesArgs,
  getManagerPropertiesHandler,
  getManagerPropertiesReturns,
  getUnitsByPropertyArgs,
  getUnitsByPropertyHandler,
  getUnitsByPropertyReturns,
  assignTechnicianArgs,
  assignTechnicianHandler,
  updateMaintenanceStatusArgs,
  updateMaintenanceStatusHandler,
  updateMaintenanceCostArgs,
  updateMaintenanceCostHandler,
  bulkUpdateStatusArgs,
  bulkUpdateStatusHandler,
} from './maintenanceDefinitions/index';

// Queries
export const getMaintenanceRequests = query({
  args: getMaintenanceRequestsArgs,
  returns: getMaintenanceRequestsReturns,
  handler: getMaintenanceRequestsHandler,
});

export const getMaintenanceKPIs = query({
  args: getMaintenanceKPIsArgs,
  returns: getMaintenanceKPIsReturns,
  handler: getMaintenanceKPIsHandler,
});

export const getMaintenanceTrends = query({
  args: getMaintenanceTrendsArgs,
  returns: getMaintenanceTrendsReturns,
  handler: getMaintenanceTrendsHandler,
});

export const getTechnicianWorkload = query({
  args: getTechnicianWorkloadArgs,
  returns: getTechnicianWorkloadReturns,
  handler: getTechnicianWorkloadHandler,
});

export const getTechnicians = query({
  args: getTechniciansArgs,
  returns: getTechniciansReturns,
  handler: getTechniciansHandler,
});

export const getManagerProperties = query({
  args: getManagerPropertiesArgs,
  returns: getManagerPropertiesReturns,
  handler: getManagerPropertiesHandler,
});

export const getUnitsByProperty = query({
  args: getUnitsByPropertyArgs,
  returns: getUnitsByPropertyReturns,
  handler: getUnitsByPropertyHandler,
});

// Mutations
export const assignTechnician = mutation({
  args: assignTechnicianArgs,
  handler: assignTechnicianHandler,
});

export const updateMaintenanceStatus = mutation({
  args: updateMaintenanceStatusArgs,
  handler: updateMaintenanceStatusHandler,
});

export const updateMaintenanceCost = mutation({
  args: updateMaintenanceCostArgs,
  handler: updateMaintenanceCostHandler,
});

export const bulkUpdateStatus = mutation({
  args: bulkUpdateStatusArgs,
  handler: bulkUpdateStatusHandler,
});
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
