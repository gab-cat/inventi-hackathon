import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Id } from '@convex/_generated/dataModel';

interface AssetStore {
  // Tab state
  selectedTab: string;
  setSelectedTab: (tab: string) => void;

  // Asset table pagination
  assetPagination: {
    cursor: string | null;
    hasMore: boolean;
  };
  setAssetPagination: (pagination: { cursor: string | null; hasMore: boolean }) => void;

  // Asset filters
  assetFilters: {
    category?: string;
    status?: string;
    condition?: string;
    search?: string;
  };
  setAssetFilters: (filters: { category?: string; status?: string; condition?: string; search?: string }) => void;

  // Selected property
  selectedPropertyId: Id<'properties'> | undefined;
  setSelectedPropertyId: (propertyId: Id<'properties'> | undefined) => void;

  // Reset store
  reset: () => void;
}

export const useAssetStore = create<AssetStore>()(
  persist(
    (set, get) => ({
      // Tab state
      selectedTab: 'dashboard',
      setSelectedTab: tab => set({ selectedTab: tab }),

      // Asset table pagination
      assetPagination: {
        cursor: null,
        hasMore: true,
      },
      setAssetPagination: pagination => set({ assetPagination: pagination }),

      // Asset filters
      assetFilters: {},
      setAssetFilters: filters => set({ assetFilters: filters }),

      // Selected property
      selectedPropertyId: undefined,
      setSelectedPropertyId: propertyId => set({ selectedPropertyId: propertyId }),

      // Reset store
      reset: () =>
        set({
          selectedTab: 'dashboard',
          assetPagination: {
            cursor: null,
            hasMore: true,
          },
          assetFilters: {},
          selectedPropertyId: undefined,
        }),
    }),
    {
      name: 'asset-store',
      partialize: state => ({
        selectedTab: state.selectedTab,
        assetFilters: state.assetFilters,
        selectedPropertyId: state.selectedPropertyId,
      }),
    }
  )
);
