import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { DeliveryFilters, DeliveryWithDetails } from '../types';

interface UseDeliveriesOptions {
  propertyId?: string;
  initialFilters?: Partial<DeliveryFilters>;
}

export function useDeliveries({ propertyId, initialFilters = {} }: UseDeliveriesOptions) {
  const [filters, setFilters] = useState<DeliveryFilters>({
    propertyId,
    ...initialFilters,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Update filters when propertyId changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, propertyId }));
  }, [propertyId]);

  const paginationOpts = {
    numItems: itemsPerPage,
    cursor: null as string | null,
  };

  const deliveriesData = useQuery(
    api.delivery.webSearchDeliveryHistory,
    filters.propertyId
      ? {
          paginationOpts,
          propertyId: filters.propertyId as Id<'properties'>,
          unitId: filters.unitId as Id<'units'> | undefined,
          deliveryType: filters.deliveryType,
          status: filters.status,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          search: filters.search,
          trackingNumber: filters.trackingNumber,
        }
      : 'skip'
  );

  const isLoading = deliveriesData === undefined;
  const error = null; // Convex handles errors differently

  const deliveries: DeliveryWithDetails[] = deliveriesData?.page || [];
  const hasMore = !deliveriesData?.isDone;
  const totalItems = deliveries.length; // This would need to be calculated properly in a real implementation
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      // In a real implementation, you would handle pagination here
      console.log('Loading more deliveries...');
    }
  }, [hasMore, isLoading]);

  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // In a real implementation, you would handle pagination here
  }, []);

  const onFiltersChange = useCallback((newFilters: DeliveryFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  return {
    deliveries,
    isLoading,
    error,
    hasMore,
    loadMore,
    filters,
    setFilters: onFiltersChange,
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
  };
}
