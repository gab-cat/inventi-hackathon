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
