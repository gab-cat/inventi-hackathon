import { useState, useCallback } from 'react';

interface UseTablePaginationProps {
  initialPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

interface UseTablePaginationReturn {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setIsLoading: (loading: boolean) => void;
  handlePageChange: (page: number) => void;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  handleFirstPage: () => void;
  handleLastPage: () => void;
}

export function useTablePagination({
  initialPage = 1,
  totalPages: initialTotalPages = 1,
  onPageChange,
}: UseTablePaginationProps = {}): UseTablePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        setIsLoading(true);
        setCurrentPage(page);
        onPageChange?.(page);
        // Note: You should call setIsLoading(false) after your API call completes
      }
    },
    [currentPage, totalPages, onPageChange]
  );

  const handleNextPage = useCallback(() => {
    if (hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  }, [hasNextPage, currentPage, handlePageChange]);

  const handlePreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      handlePageChange(currentPage - 1);
    }
  }, [hasPreviousPage, currentPage, handlePageChange]);

  const handleFirstPage = useCallback(() => {
    handlePageChange(1);
  }, [handlePageChange]);

  const handleLastPage = useCallback(() => {
    handlePageChange(totalPages);
  }, [handlePageChange, totalPages]);

  return {
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    setCurrentPage,
    setTotalPages,
    setIsLoading,
    handlePageChange,
    handleNextPage,
    handlePreviousPage,
    handleFirstPage,
    handleLastPage,
  };
}
