import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Id } from '@convex/_generated/dataModel';

interface PropertyStore {
  selectedPropertyId: Id<'properties'> | undefined;
  setSelectedPropertyId: (propertyId: Id<'properties'> | undefined) => void;
  clearSelectedProperty: () => void;
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    set => ({
      selectedPropertyId: undefined,
      setSelectedPropertyId: propertyId => set({ selectedPropertyId: propertyId }),
      clearSelectedProperty: () => set({ selectedPropertyId: undefined }),
    }),
    {
      name: 'property-store',
      partialize: state => ({ selectedPropertyId: state.selectedPropertyId }),
    }
  )
);

