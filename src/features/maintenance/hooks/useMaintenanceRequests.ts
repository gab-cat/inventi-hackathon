import { useQuery } from 'convex/react';
import { MaintenanceFilters, PaginatedMaintenanceRequests } from '../types';
import { api } from '@convex/_generated/api';

export function useMaintenanceRequests(
  filters: MaintenanceFilters,
  paginationOpts: { numItems: number; cursor?: string | null }
) {
  return useQuery(api.maintenance.getMaintenanceRequests, {
    ...filters,
    paginationOpts: {
      ...paginationOpts,
      cursor: paginationOpts.cursor ?? null,
    },
  }) as PaginatedMaintenanceRequests | undefined;
}
