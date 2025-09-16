import { useQuery } from 'convex/react';
import { MaintenanceKPIs } from '../types';
import { Id } from '@convex/_generated/dataModel';
import { api } from '@convex/_generated/api';

export function useMaintenanceKPIs(filters?: { propertyId?: Id<'properties'>; dateFrom?: number; dateTo?: number }) {
  return useQuery(api.maintenance.getMaintenanceKPIs, filters || {}) as MaintenanceKPIs | undefined;
}
