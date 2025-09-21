import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Poll, PollFilters, UsePollsReturn } from '../types';

export function usePolls(propertyId: Id<'properties'>): UsePollsReturn {
  const polls = useQuery(api.noticeboard.webGetPollsByProperty, { propertyId });

  const isLoading = polls === undefined;
  const error = polls === null ? 'Failed to load polls' : undefined;

  return {
    polls: polls || [],
    isLoading,
    error,
    refetch: () => {
      // Convex queries automatically refetch when dependencies change
    },
  };
}

export function usePollWithResponses(pollId: Id<'polls'> | null | undefined) {
  const pollWithResponses = useQuery(api.noticeboard.webGetPollWithResponses, pollId ? { pollId } : 'skip');

  const isLoading = pollWithResponses === undefined;
  const error = pollWithResponses === null ? 'Failed to load poll' : undefined;

  return {
    poll: pollWithResponses || undefined,
    isLoading,
    error,
  };
}

export function usePollStats(pollId: Id<'polls'> | null | undefined) {
  const stats = useQuery(api.noticeboard.webGetPollStats, pollId ? { pollId } : 'skip');

  const isLoading = stats === undefined;
  const error = stats === null ? 'Failed to load poll stats' : undefined;

  return {
    stats: stats || undefined,
    isLoading,
    error,
  };
}

export function usePollResponseCounts(propertyId: Id<'properties'> | null | undefined) {
  const responseCounts = useQuery(api.noticeboard.webGetPollResponseCounts, propertyId ? { propertyId } : 'skip');

  const isLoading = responseCounts === undefined;
  const error = responseCounts === null ? 'Failed to load response counts' : undefined;

  return {
    responseCounts: responseCounts || {},
    isLoading,
    error,
  };
}
