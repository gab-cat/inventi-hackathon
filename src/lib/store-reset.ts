import { usePropertyStore } from '@/features/property/stores/property-store';
import { useAssetStore } from '@/stores/asset-store';

/**
 * Resets all Zustand stores to their initial state and clears persisted data
 * This should be called when a user signs out to prevent data leakage between accounts
 */
export function resetAllStores() {
  // Reset property store
  usePropertyStore.getState().reset();

  // Reset asset store
  useAssetStore.getState().reset();

  // Clear persisted data from localStorage
  // Note: Zustand persist middleware automatically clears localStorage when reset() is called
  // but we can also manually clear it to be extra sure
  try {
    localStorage.removeItem('property-store');
    localStorage.removeItem('asset-store');
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
}

/**
 * Hook to reset all stores - useful in React components
 */
export function useResetAllStores() {
  return resetAllStores;
}
