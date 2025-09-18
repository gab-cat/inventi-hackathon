import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { AssetFilters } from '../types';
import { useAuthenticatedQuery } from '@/hooks/use-authenticated-query';

export function useAssets(filters: AssetFilters & { propertyId?: Id<'properties'> }) {
  return useAuthenticatedQuery(api.assets.webGetAssets, {
    paginationOpts: { numItems: 50, cursor: null },
    propertyId: filters.propertyId,
    category: filters.category as any,
    status: filters.status as any,
    condition: filters.condition as any,
    search: filters.search,
  });
}

export function useAssetById(assetId: Id<'assets'>) {
  return useAuthenticatedQuery(api.assets.webGetAssetById, { assetId });
}

export function useAssetHistory(assetId: Id<'assets'>) {
  return useAuthenticatedQuery(api.assets.webGetAssetHistory, {
    paginationOpts: { numItems: 20, cursor: null },
    assetId,
  });
}

export function useAssetDashboard(propertyId?: Id<'properties'>) {
  return useAuthenticatedQuery(api.assets.webGetAssetDashboardData, { propertyId });
}

export function useAssetAlerts(propertyId?: Id<'properties'>) {
  return useAuthenticatedQuery(api.assets.webGetAssetAlerts, { propertyId });
}

export function useManagerProperties() {
  return useAuthenticatedQuery(api.assets.webGetManagerProperties, {});
}
