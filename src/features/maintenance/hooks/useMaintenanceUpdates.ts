import { useQuery } from 'convex/react';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { api } from '@convex/_generated/api';
import { MaintenanceUpdateFilters, MaintenanceUpdate, UseMaintenanceUpdatesReturn } from '../types';

export function useMaintenanceUpdates(initialFilters: MaintenanceUpdateFilters = {}): UseMaintenanceUpdatesReturn {
  // Memoize the initial filters to create a stable reference
  const memoizedInitialFilters = useMemo(
    () => initialFilters,
    [
      initialFilters.requestId,
      initialFilters.propertyId,
      initialFilters.status,
      initialFilters.updatedBy,
      initialFilters.dateFrom,
      initialFilters.dateTo,
    ]
  );

  const [filters, setFilters] = useState<MaintenanceUpdateFilters>(memoizedInitialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [cursors, setCursors] = useState<(string | null)[]>([null]); // Store cursors for each page

  const paginationOpts = {
    numItems: itemsPerPage,
    cursor: cursors[currentPage - 1] || null,
  };

  const paginatedResult = useQuery(api.maintenance.webGetMaintenanceUpdates, {
    paginationOpts,
    ...filters,
  });

  // Get total count with the same filters
  const countResult = useQuery(api.maintenance.webGetMaintenanceUpdatesCount, filters);

  const updates = paginatedResult?.page || [];
  const isLoading = paginatedResult === undefined;
  const hasMore = paginatedResult ? !paginatedResult.isDone : false;
  const totalCount = countResult?.count || 0;

  // Calculate total pages using the accurate total count
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const totalItems = totalCount; // Now we have the actual total count

  const handleLoadMore = useCallback(() => {
    if (hasMore && paginatedResult?.continueCursor) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, paginatedResult?.continueCursor]);

  const handlePageChange = useCallback(
    (page: number) => {
      // Don't allow navigation to pages beyond what we know exists
      if (page < 1 || page > totalPages) {
        return; // Don't navigate to invalid pages
      }

      if (page > currentPage && hasMore) {
        // Moving forward - we need to ensure we have the cursor for this page
        setCursors(prev => {
          const newCursors = [...prev];
          // Fill in any missing cursors up to the requested page
          for (let i = prev.length; i < page; i++) {
            newCursors[i] = null; // Will be filled by the query
          }
          return newCursors;
        });
      }
      setCurrentPage(page);
    },
    [currentPage, hasMore, totalPages]
  );

  const refetch = useCallback(() => {
    setCurrentPage(1);
    setCursors([null]);
  }, []);

  const handleFiltersChange = useCallback((newFilters: MaintenanceUpdateFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setCursors([null]);
  }, []);

  // Update filters when initialFilters change (e.g., when property changes)
  useEffect(() => {
    setFilters(memoizedInitialFilters);
    setCurrentPage(1);
    setCursors([null]);
  }, [memoizedInitialFilters]);

  // Update cursors when we get new data
  useEffect(() => {
    if (paginatedResult?.continueCursor) {
      setCursors(prev => {
        const newCursors = [...prev];
        newCursors[currentPage] = paginatedResult.continueCursor;
        return newCursors;
      });
    }
  }, [paginatedResult?.continueCursor, currentPage]);

  return {
    updates: updates as MaintenanceUpdate[],
    isLoading,
    hasMore,
    loadMore: handleLoadMore,
    refetch,
    filters,
    setFilters: handleFiltersChange,
    // Pagination props
    currentPage,
    totalPages,
    onPageChange: handlePageChange,
    itemsPerPage,
    totalItems,
  };
}
