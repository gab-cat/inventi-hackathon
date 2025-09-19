import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { PropertyWithStats } from '../types';

export function useManagerProperties(): {
  properties: PropertyWithStats[];
  isLoading: boolean;
  error?: string;
} {
  const properties = useQuery(api.property.webGetManagerProperties) as PropertyWithStats[] | undefined;

  const isLoading = properties === undefined;
  const error = properties === null ? 'Failed to load properties' : undefined;

  return {
    properties: properties || [],
    isLoading,
    error,
  };
}
