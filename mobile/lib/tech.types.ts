import { Doc, Id } from '@convex/_generated/dataModel';

// Maintenance Request Types
export type MaintenanceRequest = Doc<'maintenanceRequests'> & {
  // Enriched fields from the handler
  propertyName: string;
  unitNumber?: string;
  requesterName: string;
};

// Simplified maintenance request for dashboard
export type DashboardMaintenanceRequest = {
  _id: Id<'maintenanceRequests'>;
  title: string;
  description: string;
  priority: MaintenanceRequestPriority;
  status: MaintenanceRequestStatus;
  estimatedCompletion?: number;
  createdAt: number;
  propertyName: string;
  unitNumber?: string;
  requestType: MaintenanceRequestType;
};

// Detailed maintenance request for request details
export type DetailedMaintenanceRequest = MaintenanceRequest & {
  requesterPhone?: string;
  requesterEmail: string;
  assignedToName?: string;
};

export type MaintenanceUpdate = {
  _id: Id<'maintenanceUpdates'>;
  status: string;
  description: string;
  updatedBy: Id<'users'>;
  photos?: string[];
  timestamp: number;
  updatedByName: string;
};

export type RequestDetailsData = {
  request: DetailedMaintenanceRequest;
  updates: MaintenanceUpdate[];
};

export type MaintenanceRequestStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';

// Status values that can be set via the updateRequestStatus mutation
export type UpdateableMaintenanceRequestStatus = 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export type MaintenanceRequestPriority = 'low' | 'medium' | 'high' | 'emergency';

export type MaintenanceRequestType = 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'general' | 'emergency';

// Asset Types
export type Asset = {
  _id: Id<'assets'>;
  assetTag: string;
  name: string;
  category: string;
  subcategory?: string;
  status: string;
  condition: string;
  location: string;
  assignedTo?: Id<'users'>;
  assignedAt?: number;
  maintenanceSchedule?: {
    interval: number;
    lastMaintenance?: number;
    nextMaintenance?: number;
  };
  photos?: string[];
};

// Available Asset Types (subset for getAvailableAssets)
export type AvailableAsset = {
  _id: Id<'assets'>;
  assetTag: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  condition: string;
  location: string;
  photos?: string[];
  maintenanceSchedule?: {
    interval: number;
    lastMaintenance?: number;
    nextMaintenance?: number;
  };
};

// Checked Out Asset Types (subset for getCheckedOutAssets)
export type CheckedOutAsset = {
  _id: Id<'assets'>;
  assetTag: string;
  name: string;
  category: string;
  brand?: string;
  condition: string;
  checkedOutAt?: number;
  checkedOutLocation: string;
};

export type AssetStatus = 'available' | 'checked_out' | 'maintenance' | 'retired' | 'lost';

export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'broken';

// Dashboard Types
export type MaintenanceDashboardData = {
  assignedRequests: DashboardMaintenanceRequest[];
  priorityCounts: {
    emergency: number;
    high: number;
    medium: number;
    low: number;
  };
  overdueCount: number;
  todaysCount: number;
  thisWeekCount: number;
};

// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type MaintenanceRequestsResponse = ApiResponse<MaintenanceRequest[]>;
export type MaintenanceDashboardResponse = ApiResponse<MaintenanceDashboardData>;
export type AssetInventoryResponse = ApiResponse<Asset[]>;
export type AvailableAssetsResponse = ApiResponse<AvailableAsset[]>;
export type CheckedOutAssetsResponse = ApiResponse<CheckedOutAsset[]>;
export type RequestDetailsResponse = ApiResponse<RequestDetailsData>;

// Filter Types
export type RequestStatusFilter = MaintenanceRequestStatus | null;
export type RequestPriorityFilter = MaintenanceRequestPriority | null;

// Mutation Args Types
export type UpdateRequestStatusArgs = {
  requestId: Id<'maintenanceRequests'>;
  status: UpdateableMaintenanceRequestStatus;
  notes?: string;
};

export type AddMaintenancePhotoArgs = {
  requestId: Id<'maintenanceRequests'>;
  photoUrl: string;
  description?: string;
  photoType: 'before' | 'during' | 'after';
};

export type UpdateMaintenanceCostArgs = {
  requestId: Id<'maintenanceRequests'>;
  materialsCost?: number;
  laborHours?: number;
  laborRate?: number;
  notes?: string;
};

export type RequestTenantApprovalArgs = {
  requestId: Id<'maintenanceRequests'>;
  message?: string;
};

// Asset-related mutation args
export type CheckoutAssetArgs = {
  assetId: Id<'assets'>;
  requestId?: Id<'maintenanceRequests'>;
  notes?: string;
};

export type CheckinAssetArgs = {
  assetId: Id<'assets'>;
  condition: AssetCondition;
  notes?: string;
};

export type ScheduleAssetMaintenanceArgs = {
  assetId: Id<'assets'>;
  maintenanceDate: number;
  description: string;
};

export type ReportAssetIssueArgs = {
  assetId: Id<'assets'>;
  issue: string;
  priority: MaintenanceRequestPriority;
};
