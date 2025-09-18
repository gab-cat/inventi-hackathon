import { useQuery } from 'convex/react';
import { useCallback } from 'react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { NoticeWithFullDetails, UseNoticeDetailReturn } from '../types';

export function useNoticeDetail(noticeId: Id<'notices'> | null): UseNoticeDetailReturn {
  const notice = useQuery(api.noticeboard.webGetNoticeById, noticeId ? { noticeId } : 'skip') as
    | NoticeWithFullDetails
    | null
    | undefined;

  const isLoading = notice === undefined;
  const error = notice === null ? 'Notice not found' : undefined;

  const refetch = useCallback(() => {
    // Convex queries automatically refetch when dependencies change
    // This is just for consistency with the interface
  }, []);

  return {
    notice: notice || null,
    isLoading,
    error,
    refetch,
  };
}
