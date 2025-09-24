import { query } from './_generated/server';

import {
  webGetDashboardAnalyticsArgs,
  webGetDashboardAnalyticsHandler,
  webGetDashboardAnalyticsReturns,
} from './dashboardDefinitions/index';

export const getDashboardAnalytics = query({
  args: webGetDashboardAnalyticsArgs,
  handler: webGetDashboardAnalyticsHandler,
  returns: webGetDashboardAnalyticsReturns,
});
