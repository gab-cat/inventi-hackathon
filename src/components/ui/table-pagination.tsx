'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  isLoading?: boolean;
  showPageInfo?: boolean;
  className?: string;
  // Additional props for result count display
  total?: number;
  limit?: number;
}

export function TablePagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onNextPage,
  onPreviousPage,
  onFirstPage,
  onLastPage,
  isLoading = false,
  showPageInfo = true,
  className = '',
  total,
  limit = 10,
}: TablePaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Don't show pagination if there's no navigation possible
  if (!hasNextPage && !hasPreviousPage && totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {showPageInfo && (
        <div className='text-sm text-gray-700'>
          {total && limit
            ? `Showing ${(currentPage - 1) * limit + 1} to ${Math.min(currentPage * limit, total)} of ${total} results`
            : `Showing ${(currentPage - 1) * limit + 1} to ${currentPage * limit} results`}
        </div>
      )}

      <div className='flex items-center space-x-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={onPreviousPage}
          disabled={!hasPreviousPage || isLoading}
          className='flex items-center gap-1'
        >
          <ChevronLeft className='h-4 w-4' />
          Previous
        </Button>

        <div className='flex items-center space-x-1'>
          {pageNumbers.map((pageNum, index) => (
            <div key={index}>
              {pageNum === '...' ? (
                <span className='px-3 py-2 text-gray-500'>...</span>
              ) : (
                <Button
                  variant={pageNum === currentPage ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => onPageChange(pageNum as number)}
                  disabled={isLoading}
                  className={`min-w-[40px] ${pageNum === currentPage ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                >
                  {pageNum}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant='outline'
          size='sm'
          onClick={onNextPage}
          disabled={!hasNextPage || isLoading}
          className='flex items-center gap-1'
        >
          Next
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
