import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { UseChatThreadsReturn, ChatThreadWithDetails } from '../types';

interface UseChatThreadsProps {
  propertyId: Id<'properties'>;
  threadType?: string;
  isArchived?: boolean;
  limit?: number;
}

export function useChatThreads({
  propertyId,
  threadType,
  isArchived,
  limit = 50,
}: UseChatThreadsProps): UseChatThreadsReturn {
  const threads = useQuery(api.chatThreads.webGetAllChatThreads, {
    propertyId,
    threadType,
    isArchived,
    limit,
  }) as ChatThreadWithDetails[] | undefined;

  const isLoading = threads === undefined;
  const error = null; // Convex handles errors internally

  const refetch = () => {};

  const loadMore = () => {
    // For now, we'll implement pagination in the component level
    // This could be enhanced with cursor-based pagination
  };

  return {
    threads: threads || [],
    isLoading,
    error,
    refetch,
    loadMore,
    hasMore: false, // This would need to be implemented with proper pagination
  };
}
