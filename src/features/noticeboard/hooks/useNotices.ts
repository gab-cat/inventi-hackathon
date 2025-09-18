import { useQuery } from 'convex/react';
import { useCallback, useState } from 'react';
import { api } from '@convex/_generated/api';
import { NoticeFilters, NoticeWithDetails, UseNoticesReturn } from '../types';

export function useNotices(initialFilters: NoticeFilters = {}): UseNoticesReturn {
  const [filters, setFilters] = useState<NoticeFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const paginationOpts = {
    numItems: itemsPerPage,
    cursor: currentPage > 1 ? `page_${currentPage}` : null,
  };

  const paginatedResult = useQuery(api.noticeboard.webGetNotices, {
    paginationOpts,
    ...filters,
  });

  const notices = paginatedResult?.page || [];
  const isLoading = paginatedResult === undefined;
  const hasMore = paginatedResult ? !paginatedResult.isDone : false;

  // Calculate total pages (this is an approximation since we don't have total count)
  // In a real implementation, you'd want to get the total count from the backend
  const totalPages = Math.max(1, Math.ceil(notices.length / itemsPerPage));
  const totalItems = notices.length; // This is just the current page items, not total

  const handleLoadMore = useCallback(() => {
    if (hasMore && paginatedResult?.continueCursor) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, paginatedResult?.continueCursor]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const refetch = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handleFiltersChange = useCallback((newFilters: NoticeFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  return {
    notices: notices as NoticeWithDetails[],
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
