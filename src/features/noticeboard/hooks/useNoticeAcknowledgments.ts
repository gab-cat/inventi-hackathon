import { useQuery } from 'convex/react';
import { useCallback, useState } from 'react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { NoticeAcknowledgmentWithUser, UseNoticeAcknowledgmentsReturn } from '../types';

export function useNoticeAcknowledgments(noticeId: Id<'notices'>): UseNoticeAcknowledgmentsReturn {
  const [paginationOpts, setPaginationOpts] = useState<{ numItems: number; cursor: string | null }>({
    numItems: 20,
    cursor: null,
  });

  const paginatedResult = useQuery(api.noticeboard.webGetNoticeAcknowledgments, {
    noticeId,
    paginationOpts,
  });

  const acknowledgments = paginatedResult?.page || [];
  const isLoading = paginatedResult === undefined;
  const hasMore = paginatedResult ? !paginatedResult.isDone : false;

  const handleLoadMore = useCallback(() => {
    if (hasMore && paginatedResult?.continueCursor) {
      setPaginationOpts(prev => ({
        ...prev,
        cursor: paginatedResult.continueCursor,
      }));
    }
  }, [hasMore, paginatedResult?.continueCursor]);

  const refetch = useCallback(() => {
    setPaginationOpts({ numItems: 20, cursor: null });
  }, []);

  return {
    acknowledgments: acknowledgments as NoticeAcknowledgmentWithUser[],
    isLoading,
    hasMore,
    loadMore: handleLoadMore,
    refetch,
  };
}
