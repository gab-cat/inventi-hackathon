import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';

interface UseMessageAnalyticsProps {
  propertyId: Id<'properties'>;
  startDate?: number;
  endDate?: number;
}

export function useMessageAnalytics({ propertyId, startDate, endDate }: UseMessageAnalyticsProps) {
  const result = useQuery(api.chatThreads.webGetMessageAnalytics, {
    propertyId,
    startDate,
    endDate,
  });

  return {
    analytics: result,
    isLoading: result === undefined,
  };
}
