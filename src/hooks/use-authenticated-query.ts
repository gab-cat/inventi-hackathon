import { useQuery } from 'convex/react';
import { useAuth } from '@clerk/nextjs';
import { FunctionReference, FunctionArgs, FunctionReturnType } from 'convex/server';

/**
 * A wrapper around useQuery that only executes queries when the user is authenticated
 * This prevents "Unauthorized" errors when the page refreshes and authentication state
 * hasn't been restored yet.
 */
export function useAuthenticatedQuery<Query extends FunctionReference<'query'>, Args extends FunctionArgs<Query>>(
  query: Query,
  args: Args | 'skip'
): FunctionReturnType<Query> | undefined {
  const { isLoaded, isSignedIn } = useAuth();

  // Only make the query if authentication is loaded and user is signed in
  const shouldMakeQuery = isLoaded && isSignedIn;

  return useQuery(query, shouldMakeQuery ? args : 'skip');
}
