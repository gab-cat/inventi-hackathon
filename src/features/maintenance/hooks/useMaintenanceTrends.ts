import { useAuthenticatedQuery } from '@/hooks/use-authenticated-query';
import { MaintenanceTrends } from '../types';
import { Id } from '@convex/_generated/dataModel';
import { api } from '@convex/_generated/api';

export function useMaintenanceTrends(filters?: {
  propertyId?: Id<'properties'>;
  bucketDays?: number;
  dateFrom?: number;
  dateTo?: number;
}) {
  return useAuthenticatedQuery(api.maintenance.webGetMaintenanceTrends, filters || {}) as MaintenanceTrends | undefined;
}
