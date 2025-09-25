import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { resetAllStores } from '@/lib/store-reset';

/**
 * Hook that automatically resets all Zustand stores when the user signs out
 * This prevents data leakage between different user accounts
 */
export function useAuthStoreCleanup() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    // Only run when auth is loaded and user is not signed in
    if (isLoaded && !isSignedIn) {
      // Reset all stores when user is not authenticated
      resetAllStores();
    }
  }, [isLoaded, isSignedIn]);
}
