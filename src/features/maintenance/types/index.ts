import { Id } from '../../../../convex/_generated/dataModel';

export interface MaintenanceRequest {
  _id: Id<'maintenanceRequests'>;
  _creationTime: number;
  propertyId: Id<'properties'>;
  unitId?: Id<'units'>;
  requestedBy: Id<'users'>;
  requestType: string;
  priority: string;
  title: string;
  description: string;
  location: string;
  status: string;
  assignedTo?: Id<'users'>;
  assignedAt?: number;
  estimatedCost?: number;
  actualCost?: number;
  estimatedCompletion?: number;
  actualCompletion?: number;
  photos?: string[];
  documents?: string[];
  tenantApproval?: boolean;
  tenantApprovalAt?: number;
  createdAt: number;
  updatedAt: number;
  // Denormalized fields
  tenantName?: string;
  tenantEmail?: string;
  unitNumber?: string;
  assignedTechnicianName?: string;
  assignedTechnicianEmail?: string;
}

export interface MaintenanceKPIs {
  totalOpen: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  avgResolutionTimeMs?: number;
  overdueCount: number;
}

export interface MaintenanceTrend {
  start: number;
  end: number;
  createdCount: number;
  completedCount: number;
}

export interface MaintenanceTrends {
  buckets: MaintenanceTrend[];
}

export interface TechnicianWorkload {
  userId: Id<'users'>;
  firstName?: string;
  lastName?: string;
  activeAssignments: number;
}

export interface MaintenanceFilters {
  propertyId?: Id<'properties'>;
  unitId?: Id<'units'>;
  status?: string;
  priority?: string;
  requestType?: string;
  dateFrom?: number;
  dateTo?: number;
  search?: string;
  assignedTo?: Id<'users'>;
}

export interface PaginatedMaintenanceRequests {
  page: MaintenanceRequest[];
  isDone: boolean;
  continueCursor: string | null;
}

export const REQUEST_TYPES = ['plumbing', 'electrical', 'hvac', 'appliance', 'general', 'emergency'] as const;

export const PRIORITIES = ['low', 'medium', 'high', 'emergency'] as const;

export const STATUSES = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'rejected'] as const;

export type RequestType = (typeof REQUEST_TYPES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];
