import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { DeliveryLogFilters, DeliveryLogWithDetails } from '../types';

interface UseDeliveryLogsOptions {
  propertyId?: string;
  initialFilters?: Partial<DeliveryLogFilters>;
}

export function useDeliveryLogs({ propertyId, initialFilters = {} }: UseDeliveryLogsOptions) {
  const [filters, setFilters] = useState<DeliveryLogFilters>({
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

  const logsData = useQuery(
    api.deliveryLog.webGetDeliveryLogsByProperty,
    filters.propertyId
      ? {
          paginationOpts,
          propertyId: filters.propertyId as Id<'properties'>,
          action: filters.action,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        }
      : 'skip'
  );

  const isLoading = logsData === undefined;
  const error = null; // Convex handles errors differently

  const deliveryLogs: DeliveryLogWithDetails[] = logsData?.page || [];
  const hasMore = !logsData?.isDone;
  const totalItems = deliveryLogs.length; // This would need to be calculated properly in a real implementation
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      // In a real implementation, you would handle pagination here
      console.log('Loading more delivery logs...');
    }
  }, [hasMore, isLoading]);

  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // In a real implementation, you would handle pagination here
  }, []);

  const onFiltersChange = useCallback((newFilters: DeliveryLogFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  return {
    deliveryLogs,
    isLoading,
    error,
    hasMore,
    loadMore,
    filters: filters,
    setFilters: onFiltersChange,
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
  };
}
