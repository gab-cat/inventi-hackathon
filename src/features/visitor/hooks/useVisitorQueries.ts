import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';

export const useVisitorQueries = () => {
  const fetchVisitorLog = (params: {
    propertyId: Id<'properties'>;
    startDate?: number;
    endDate?: number;
    limit?: number;
  }) => {
    return { query: api.visitorLog.webGetVisitorLog, args: params };
  };

  const fetchActiveVisitors = (propertyId: Id<'properties'>) => {
    return { query: api.visitorRequest.webGetActiveVisitors, args: { propertyId } };
  };

  const fetchVisitorHistory = (params: {
    propertyId: Id<'properties'>;
    searchTerm?: string;
    startDate?: number;
    endDate?: number;
    status?: string;
    limit?: number;
  }) => {
    return { query: api.visitorRequest.webSearchVisitorHistory, args: params };
  };

  const fetchVisitorReport = (params: {
    propertyId: Id<'properties'>;
    startDate: number;
    endDate: number;
    reportType: 'summary' | 'detailed' | 'security';
  }) => {
    return { query: api.visitorRequest.webExportVisitorReports, args: params };
  };

  return {
    fetchVisitorLog,
    fetchActiveVisitors,
    fetchVisitorHistory,
    fetchVisitorReport,
  };
};
