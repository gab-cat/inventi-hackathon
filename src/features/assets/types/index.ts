import { Id } from '@convex/_generated/dataModel';

export interface Asset {
  _id: Id<'assets'>;
  _creationTime: number;
  propertyId: Id<'properties'>;
  assetTag: string;
  name: string;
  description: string;
  category: 'tool' | 'equipment' | 'material' | 'furniture' | 'appliance';
  subcategory?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: number;
  purchasePrice?: number;
  currentValue?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  status: 'available' | 'checked_out' | 'maintenance' | 'retired' | 'lost';
  location: string;
  assignedTo?: Id<'users'>;
  assignedAt?: number;
  maintenanceSchedule?: {
    interval: number;
    lastMaintenance?: number;
    nextMaintenance?: number;
  };
  warrantyExpiry?: number;
  photos?: string[];
  documents?: string[];
  createdAt: number;
  updatedAt: number;
  property: {
    _id: Id<'properties'>;
    name: string;
    address: string;
  };
  assignedUser?: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
    email: string;
  };
  maintenanceDue: boolean;
  warrantyExpiring: boolean;
  daysSinceLastMaintenance?: number;
  daysUntilNextMaintenance?: number;
  daysUntilWarrantyExpiry?: number;
}

export interface AssetFiltersType {
  category?: string;
  status?: string;
  condition?: string;
  search?: string;
}

export interface AssetAlert {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  assetId?: Id<'assets'>;
  assetName?: string;
}

export interface Property {
  _id: Id<'properties'>;
  name: string;
  address: string;
  totalAssets?: number;
  availableAssets?: number;
  checkedOutAssets?: number;
  maintenanceAssets?: number;
}
