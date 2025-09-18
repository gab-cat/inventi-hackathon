import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { UnitWithTenant } from '../types';

export function useAllUnits(): {
  units: UnitWithTenant[];
  isLoading: boolean;
  error?: string;
} {
  const units = useQuery(api.noticeboard.webGetAllUnits) as UnitWithTenant[] | undefined;

  const isLoading = units === undefined;
  const error = units === null ? 'Failed to load units' : undefined;

  return {
    units: units || [],
    isLoading,
    error,
  };
}
