import { useQuery } from 'convex/react';
import { MaintenanceTrends } from '../types';
import { Id } from '@convex/_generated/dataModel';
import { api } from '@convex/_generated/api';

export function useMaintenanceTrends(filters?: {
  propertyId?: Id<'properties'>;
  bucketDays?: number;
  dateFrom?: number;
  dateTo?: number;
}) {
  return useQuery(api.maintenance.getMaintenanceTrends, filters || {}) as MaintenanceTrends | undefined;
}
