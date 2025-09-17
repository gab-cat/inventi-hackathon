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
  return (
    <NoticeTable
      notices={notices}
      isLoading={isLoading}
      onNoticeAction={onNoticeAction}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      itemsPerPage={itemsPerPage}
      totalItems={totalItems}
    />
  );
}
