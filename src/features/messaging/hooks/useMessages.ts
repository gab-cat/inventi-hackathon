import { useAuthenticatedQuery } from '@/hooks/use-authenticated-query';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { UseMessagesReturn, MessageWithDetails } from '../types';

interface UseMessagesProps {
  threadId: Id<'chatThreads'>;
  limit?: number;
  cursor?: string;
}

export function useMessages({ threadId, limit = 50, cursor }: UseMessagesProps): UseMessagesReturn {
  const result = useAuthenticatedQuery(
    api.messages.webGetMessagesByThreadId,
    threadId ? { threadId, limit, cursor } : 'skip'
  );

  const messages = result?.messages as MessageWithDetails[] | undefined;
  const hasMore = result?.hasMore || false;
  const isLoading = result === undefined;
  const error = null; // Convex handles errors internally

  const refetch = () => {
    // Convex queries are reactive, so refetch happens automatically
  };

  const loadMore = () => {
    // This would need to be implemented with cursor-based pagination
    // For now, we'll handle this at the component level
  };

  return {
    messages: messages || [],
    isLoading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
}
