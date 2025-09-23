import { query, mutation } from './_generated/server';
import {
  webGetActiveVisitorsArgs,
  webGetActiveVisitorsHandler,
  webSearchVisitorHistoryArgs,
  webSearchVisitorHistoryHandler,
  webExportVisitorReportsArgs,
  webExportVisitorReportsHandler,
  webCreateVisitorEntryArgs,
  webCreateVisitorEntryHandler,
  webApproveVisitorRequestArgs,
  webApproveVisitorRequestHandler,
  webDenyVisitorRequestArgs,
  webDenyVisitorRequestHandler,
  webGenerateVisitorBadgeArgs,
  webGenerateVisitorBadgeHandler,
  webGetActiveVisitorsReturns,
  webSearchVisitorHistoryReturns,
  webExportVisitorReportsReturns,
  webCreateVisitorEntryReturns,
  webApproveVisitorRequestReturns,
  webDenyVisitorRequestReturns,
  webGenerateVisitorBadgeReturns,
} from './visitorRequestDefinitions';

// Web Queries
export const webGetActiveVisitors = query({
  args: webGetActiveVisitorsArgs,
  handler: webGetActiveVisitorsHandler,
});

export const webSearchVisitorHistory = query({
  args: webSearchVisitorHistoryArgs,
  handler: webSearchVisitorHistoryHandler,
});

export const webExportVisitorReports = query({
  args: webExportVisitorReportsArgs,
  handler: webExportVisitorReportsHandler,
});

// Web Mutations
export const webCreateVisitorEntry = mutation({
  args: webCreateVisitorEntryArgs,
  handler: webCreateVisitorEntryHandler,
});

export const webApproveVisitorRequest = mutation({
  args: webApproveVisitorRequestArgs,
  handler: webApproveVisitorRequestHandler,
});

export const webDenyVisitorRequest = mutation({
  args: webDenyVisitorRequestArgs,
  handler: webDenyVisitorRequestHandler,
});

export const webGenerateVisitorBadge = mutation({
  args: webGenerateVisitorBadgeArgs,
  handler: webGenerateVisitorBadgeHandler,
});

// Mobile Visitor Management Functions
import {
  requestVisitorPassArgs,
  requestVisitorPassHandler,
  requestVisitorPassReturns,
  cancelVisitorRequestArgs,
  cancelVisitorRequestHandler,
  cancelVisitorRequestReturns,
  uploadVisitorDocumentArgs,
  uploadVisitorDocumentHandler,
  uploadVisitorDocumentReturns,
  saveUploadedVisitorDocumentArgs,
  saveUploadedVisitorDocumentHandler,
  saveUploadedVisitorDocumentReturns,
  getMyVisitorsArgs,
  getMyVisitorsHandler,
  getMyVisitorsReturns,
  getVisitorStatusArgs,
  getVisitorStatusHandler,
  getVisitorStatusReturns,
} from './visitorRequestDefinitions';

export const requestVisitorPass = mutation({
  args: requestVisitorPassArgs,
  returns: requestVisitorPassReturns,
  handler: requestVisitorPassHandler,
});

export const cancelVisitorRequest = mutation({
  args: cancelVisitorRequestArgs,
  returns: cancelVisitorRequestReturns,
  handler: cancelVisitorRequestHandler,
});

export const uploadVisitorDocument = mutation({
  args: uploadVisitorDocumentArgs,
  handler: uploadVisitorDocumentHandler,
});

export const saveUploadedVisitorDocument = mutation({
  args: saveUploadedVisitorDocumentArgs,
  handler: saveUploadedVisitorDocumentHandler,
});

export const getMyVisitors = query({
  args: getMyVisitorsArgs,
  handler: getMyVisitorsHandler,
});

export const getVisitorStatus = query({
  args: getVisitorStatusArgs,
  handler: getVisitorStatusHandler,
});
