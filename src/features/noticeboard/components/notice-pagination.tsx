'use client';

import { TablePagination } from '@/components/ui/table-pagination';

interface NoticePaginationProps {
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
  total?: number;
  limit?: number;
}

export function NoticePagination(props: NoticePaginationProps) {
  return <TablePagination {...props} />;
}
