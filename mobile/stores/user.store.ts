import { create } from 'zustand';
import { Doc } from '@convex/_generated/dataModel';
import * as SecureStore from 'expo-secure-store';

type Unit = Doc<'units'> & {
  property?: Doc<'properties'> | null;
};

interface PropertyStore {
  selectedPropertyId: string | null;
  selectedUnit: Unit | null;
  isInitialized: boolean;
  setSelectedPropertyId: (id: string | null) => Promise<void>;
  setSelectedUnit: (unit: Unit | null) => Promise<void>;
  clearSelection: () => Promise<void>;
  clearUnitSelection: () => Promise<void>;
  initializeStore: () => Promise<void>;
}

const STORAGE_KEYS = {
  SELECTED_PROPERTY_ID: 'selectedPropertyId',
  SELECTED_UNIT: 'selectedUnit',
} as const;

// Helper functions for AsyncStorage
const saveToStorage = async (key: string, value: string | null): Promise<void> => {
  try {
    if (value) {
      await SecureStore.setItemAsync(key, value);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

const loadFromStorage = async (key: string): Promise<string | null> => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return null;
  }
};

const saveUnitToStorage = async (unit: Unit | null): Promise<void> => {
  try {
    if (unit) {
      await SecureStore.setItemAsync(STORAGE_KEYS.SELECTED_UNIT, JSON.stringify(unit));
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.SELECTED_UNIT);
    }
  } catch (error) {
    console.error('Error saving unit to storage:', error);
  }
};

const loadUnitFromStorage = async (): Promise<Unit | null> => {
  try {
    const value = await SecureStore.getItemAsync(STORAGE_KEYS.SELECTED_UNIT);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error('Error loading unit from storage:', error);
    return null;
  }
};

export const usePropertyStore = create<PropertyStore>()((set, get) => ({
  selectedPropertyId: null,
  selectedUnit: null,
  isInitialized: false,

  initializeStore: async () => {
    try {
      const [propertyId, unit] = await Promise.all([
        loadFromStorage(STORAGE_KEYS.SELECTED_PROPERTY_ID),
        loadUnitFromStorage(),
      ]);

      set({
        selectedPropertyId: propertyId,
        selectedUnit: unit,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Error initializing store:', error);
      set({ isInitialized: true });
    }
  },

  setSelectedPropertyId: async (id: string | null) => {
    set({ selectedPropertyId: id });
    await saveToStorage(STORAGE_KEYS.SELECTED_PROPERTY_ID, id);
  },

  setSelectedUnit: async (unit: Unit | null) => {
    set({
      selectedUnit: unit,
      // Also set the property ID when selecting a unit
      selectedPropertyId: unit?.property?._id || null,
    });

    await Promise.all([
      saveUnitToStorage(unit),
      saveToStorage(STORAGE_KEYS.SELECTED_PROPERTY_ID, unit?.property?._id || null),
    ]);
  },

  clearSelection: async () => {
    set({ selectedPropertyId: null, selectedUnit: null });
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.SELECTED_PROPERTY_ID),
      SecureStore.deleteItemAsync(STORAGE_KEYS.SELECTED_UNIT),
    ]);
  },

  clearUnitSelection: async () => {
    set({ selectedUnit: null });
    await SecureStore.deleteItemAsync(STORAGE_KEYS.SELECTED_UNIT);
  },
}));
