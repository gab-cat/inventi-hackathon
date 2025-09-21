'use client';

import { NoticeListProps } from '../types';
import { NoticeTable } from './notice-table';

export function NoticeList({
  notices,
  isLoading,
  onLoadMore,
  hasMore,
  onNoticeAction,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0,
}: NoticeListProps) {
  // Calculate pagination state
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Simple pagination handlers
  const handleNextPage = () => onPageChange?.(currentPage + 1);
  const handlePreviousPage = () => onPageChange?.(currentPage - 1);
  const handleFirstPage = () => onPageChange?.(1);
  const handleLastPage = () => onPageChange?.(totalPages);

  return (
    <NoticeTable
      notices={notices}
      isLoading={isLoading}
      onNoticeAction={onNoticeAction}
      currentPage={currentPage}
      totalPages={totalPages}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      onPageChange={onPageChange}
      onNextPage={handleNextPage}
      onPreviousPage={handlePreviousPage}
      onFirstPage={handleFirstPage}
      onLastPage={handleLastPage}
      itemsPerPage={itemsPerPage}
      totalItems={totalItems}
    />
  );
}
