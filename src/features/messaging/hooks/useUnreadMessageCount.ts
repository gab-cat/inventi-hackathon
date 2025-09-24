import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';

interface UseUnreadMessageCountProps {
  propertyId?: Id<'properties'>;
  threadId?: Id<'chatThreads'>;
}

export function useUnreadMessageCount({ propertyId, threadId }: UseUnreadMessageCountProps) {
  const result = useQuery(api.messages.webGetUnreadMessageCount, {
    propertyId,
    threadId,
  });

  return {
    totalUnread: result?.totalUnread || 0,
    unreadByThread: result?.unreadByThread || [],
    isLoading: result === undefined,
  };
}
