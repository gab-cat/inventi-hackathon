import { api } from '../../../../convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useQuery } from 'convex/react';

export function useGetUserById(id: Id<'users'>) {
  const user = useQuery(api.user.webGetUserById, { id });

  const isLoading = user === undefined;
  const error = user === null ? 'Failed to load user' : undefined;

  return {
    user: user || undefined,
    isLoading,
    error,
  };
}

// Export for backward compatibility
export const useUsers = useGetUserById;
