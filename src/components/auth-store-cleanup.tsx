'use client';

import { useAuthStoreCleanup } from '@/hooks/use-auth-store-cleanup';

/**
 * Client component that handles automatic store cleanup on authentication state changes
 * This should be included in the authenticated layout
 */
export function AuthStoreCleanup() {
  useAuthStoreCleanup();
  return null; // This component doesn't render anything
}
