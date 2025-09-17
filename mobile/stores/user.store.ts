import { create } from 'zustand';
import { Doc } from '@convex/_generated/dataModel';

type Unit = Doc<'units'> & {
  property?: Doc<'properties'> | null;
};

interface PropertyStore {
  selectedPropertyId: string | null;
  selectedUnit: Unit | null;
  setSelectedPropertyId: (id: string | null) => void;
  setSelectedUnit: (unit: Unit | null) => void;
  clearSelection: () => void;
  clearUnitSelection: () => void;
}

export const usePropertyStore = create<PropertyStore>()(set => ({
  selectedPropertyId: null,
  selectedUnit: null,
  setSelectedPropertyId: (id: string | null) => set({ selectedPropertyId: id }),
  setSelectedUnit: (unit: Unit | null) =>
    set({
      selectedUnit: unit,
      // Also set the property ID when selecting a unit
      selectedPropertyId: unit?.property?._id || null,
    }),
  clearSelection: () => set({ selectedPropertyId: null, selectedUnit: null }),
  clearUnitSelection: () => set({ selectedUnit: null }),
}));
