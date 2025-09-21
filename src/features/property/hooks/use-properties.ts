import { useAuthenticatedQuery } from '@/hooks/use-authenticated-query';
import { api } from '@convex/_generated/api';
import { PropertyWithStats } from '../types';

export function useManagerProperties(): {
  properties: PropertyWithStats[];
  isLoading: boolean;
  error?: string;
} {
  const properties = useAuthenticatedQuery(api.property.webGetManagerProperties, {}) as PropertyWithStats[] | undefined;

  const isLoading = properties === undefined;
  const error = properties === null ? 'Failed to load properties' : undefined;

  return {
    properties: properties || [],
    isLoading,
    error,
  };
}
