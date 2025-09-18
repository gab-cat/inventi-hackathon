import { MaintenanceFilters, PaginatedMaintenanceRequests } from '../types';
import { api } from '@convex/_generated/api';
import { useAuthenticatedQuery } from '@/hooks/use-authenticated-query';

export function useMaintenanceRequests(
  filters: MaintenanceFilters,
  paginationOpts: { numItems: number; cursor?: string | null }
) {
  return useAuthenticatedQuery(api.maintenance.getMaintenanceRequests, {
    ...filters,
    paginationOpts: {
      ...paginationOpts,
      cursor: paginationOpts.cursor ?? null,
    },
  }) as PaginatedMaintenanceRequests | undefined;
}
