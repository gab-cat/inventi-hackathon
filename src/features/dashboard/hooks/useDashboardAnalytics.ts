import { useAuthenticatedQuery } from '@/hooks/use-authenticated-query';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';

interface UseDashboardAnalyticsProps {
  propertyId: Id<'properties'>;
  startDate?: number;
  endDate?: number;
}

export function useDashboardAnalytics({ propertyId, startDate, endDate }: UseDashboardAnalyticsProps) {
  const analytics = useAuthenticatedQuery(
    api.dashboard.getDashboardAnalytics,
    propertyId
      ? {
          propertyId,
          startDate,
          endDate,
        }
      : 'skip'
  );

  return {
    analytics,
    isLoading: analytics === undefined,
    error: analytics === null,
  };
}
