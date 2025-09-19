import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { UnitWithTenant } from '../types';
import { Id } from '@convex/_generated/dataModel';

export function useAllUnits(propertyId?: Id<'properties'>): {
  units: UnitWithTenant[];
  isLoading: boolean;
  error?: string;
} {
  const units = useQuery(api.noticeboard.webGetAllUnits, { propertyId }) as UnitWithTenant[] | undefined;

  const isLoading = units === undefined;
  const error = units === null ? 'Failed to load units' : undefined;

  return {
    units: units || [],
    isLoading,
    error,
  };
}
