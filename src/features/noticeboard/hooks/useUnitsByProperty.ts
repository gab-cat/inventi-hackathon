import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { UnitWithTenant } from '../types';

export function useUnitsByProperty(propertyId: Id<'properties'> | undefined): {
  units: UnitWithTenant[];
  isLoading: boolean;
  error?: string;
} {
  const units = useQuery(api.noticeboard.getUnitsByProperty, propertyId ? { propertyId } : 'skip') as
    | UnitWithTenant[]
    | undefined;

  const isLoading = units === undefined;
  const error = units === null ? 'Failed to load units' : undefined;

  return {
    units: units || [],
    isLoading,
    error,
  };
}
