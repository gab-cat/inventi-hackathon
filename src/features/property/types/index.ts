import { Id } from '@convex/_generated/dataModel';

export interface Property {
  _id: Id<'properties'>;
  name: string;
  address: string;
  city: string;
  state: string;
  propertyType: 'apartment' | 'condo' | 'house' | 'commercial';
  totalUnits: number;
  occupiedUnits: number;
  totalAssets?: number;
  availableAssets?: number;
  checkedOutAssets?: number;
  maintenanceAssets?: number;
}

export interface PropertyWithStats extends Property {
  totalAssets: number;
  availableAssets: number;
  checkedOutAssets: number;
  maintenanceAssets: number;
}

export interface CreatePropertyData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  propertyType: 'apartment' | 'condo' | 'house' | 'commercial';
  totalUnits: number;
  settings?: {
    visitorLimitPerUnit?: number;
    deliveryHours?: {
      start: string;
      end: string;
    };
    maintenanceHours?: {
      start: string;
      end: string;
    };
  };
}

