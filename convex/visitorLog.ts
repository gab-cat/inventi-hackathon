import { query, mutation } from './_generated/server';
import {
  webCheckInVisitorArgs,
  webCheckInVisitorHandler,
  webCheckInVisitorReturns,
  webCheckOutVisitorArgs,
  webCheckOutVisitorHandler,
  webCheckOutVisitorReturns,
  webGetVisitorLogArgs,
  webGetVisitorLogHandler,
  webGetVisitorLogReturns,
  webMarkVisitorNoShowArgs,
  webMarkVisitorNoShowHandler,
  webMarkVisitorNoShowReturns,
} from './visitorLogDefinitions';

// Web Queries
export const webGetVisitorLog = query({
  args: webGetVisitorLogArgs,
  handler: webGetVisitorLogHandler,
});

// Web Mutations
export const webCheckInVisitor = mutation({
  args: webCheckInVisitorArgs,
  handler: webCheckInVisitorHandler,
});

export const webCheckOutVisitor = mutation({
  args: webCheckOutVisitorArgs,
  handler: webCheckOutVisitorHandler,
});

export const webMarkVisitorNoShow = mutation({
  args: webMarkVisitorNoShowArgs,
  handler: webMarkVisitorNoShowHandler,
});
