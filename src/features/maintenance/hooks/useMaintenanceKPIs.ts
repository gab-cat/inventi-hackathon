import { useAuthenticatedQuery } from '@/hooks/use-authenticated-query';
import { MaintenanceKPIs } from '../types';
import { Id } from '@convex/_generated/dataModel';
import { api } from '@convex/_generated/api';

export function useMaintenanceKPIs(filters?: { propertyId?: Id<'properties'>; dateFrom?: number; dateTo?: number }) {
  return useAuthenticatedQuery(api.maintenance.webGetMaintenanceKPIs, filters || {}) as MaintenanceKPIs | undefined;
}
