import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useQuery } from 'convex/react';

export function useUsers(id: Id<'users'>) {
  const user = useQuery(api.users.getUserById, { id });

  const isLoading = user === undefined;
  const error = user === null ? 'Failed to load user' : undefined;

  return {
    user: user || undefined,
    isLoading,
    error,
  };
}
