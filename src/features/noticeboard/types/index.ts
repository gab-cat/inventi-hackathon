import { Id } from '@convex/_generated/dataModel';

// Base types
export type NoticeType = 'announcement' | 'maintenance' | 'payment_reminder' | 'emergency' | 'event' | 'general';
export type NoticePriority = 'low' | 'medium' | 'high' | 'urgent';
export type TargetAudience = 'all' | 'tenants' | 'specific_units' | 'managers';

// Core Notice types
export interface Notice {
  _id: Id<'notices'>;
  _creationTime: number;
  propertyId: Id<'properties'>;
  unitId?: Id<'units'>;
  createdBy: Id<'users'>;
  title: string;
  content: string;
  noticeType: NoticeType;
  priority: NoticePriority;
  targetAudience: TargetAudience;
  targetUnits?: Id<'units'>[];
  isActive: boolean;
  scheduledAt?: number;
  expiresAt?: number;
  attachments?: string[];
  createdAt: number;
  updatedAt: number;
}

// Extended Notice with joined data
export interface NoticeWithDetails extends Notice {
  property: {
    _id: Id<'properties'>;
    name: string;
    address: string;
  };
  creator: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
    email: string;
  };
  unit?: {
    _id: Id<'units'>;
    unitNumber: string;
  };
  acknowledgmentCount: number;
  totalTargetUsers: number;
}

// Notice with full details (for detail view)
export interface NoticeWithFullDetails extends Notice {
  property: {
    _id: Id<'properties'>;
    name: string;
    address: string;
  };
  creator: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
    email: string;
  };
  unit?: {
    _id: Id<'units'>;
    unitNumber: string;
  };
  acknowledgmentCount: number;
  totalTargetUsers: number;
  acknowledgments: NoticeAcknowledgmentWithUser[];
  targetUnitsDetails?: TargetUnitDetail[];
}

// Notice acknowledgment types
export interface NoticeAcknowledgment {
  _id: Id<'noticeAcknowledgments'>;
  noticeId: Id<'notices'>;
  userId: Id<'users'>;
  acknowledgedAt: number;
}

export interface NoticeAcknowledgmentWithUser extends NoticeAcknowledgment {
  user: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profileImage?: string;
  };
}

// Target unit detail
export interface TargetUnitDetail {
  _id: Id<'units'>;
  unitNumber: string;
  tenant?: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Property types
export interface Property {
  _id: Id<'properties'>;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  propertyType: 'apartment' | 'condo' | 'house' | 'commercial';
  totalUnits: number;
  managerId: Id<'users'>;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PropertyWithStats extends Property {
  occupiedUnits: number;
  totalNotices: number;
  activeNotices: number;
}

// Unit types
export interface Unit {
  _id: Id<'units'>;
  propertyId: Id<'properties'>;
  unitNumber: string;
  unitType: 'apartment' | 'office' | 'retail' | 'storage';
  floor?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  rentAmount?: number;
  tenantId?: Id<'users'>;
  isOccupied: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UnitWithTenant extends Unit {
  tenant?: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Form types
export interface CreateNoticeForm {
  propertyId: Id<'properties'>;
  unitId?: Id<'units'>;
  title: string;
  content: string;
  noticeType: NoticeType;
  priority: NoticePriority;
  targetAudience: TargetAudience;
  targetUnits?: Id<'units'>[];
  scheduledAt?: number;
  expiresAt?: number;
  attachments?: string[];
}

export interface UpdateNoticeForm {
  title?: string;
  content?: string;
  noticeType?: NoticeType;
  priority?: NoticePriority;
  targetAudience?: TargetAudience;
  targetUnits?: Id<'units'>[];
  isActive?: boolean;
  scheduledAt?: number;
  expiresAt?: number;
  attachments?: string[];
}

export interface SendNoticeToAllForm {
  propertyId: Id<'properties'>;
  title: string;
  content: string;
  noticeType: NoticeType;
  priority: NoticePriority;
  scheduledAt?: number;
  expiresAt?: number;
  attachments?: string[];
}

export interface SendNoticeToUnitForm {
  propertyId: Id<'properties'>;
  unitId: Id<'units'>;
  title: string;
  content: string;
  noticeType: NoticeType;
  priority: NoticePriority;
  scheduledAt?: number;
  expiresAt?: number;
  attachments?: string[];
}

export interface ScheduleNoticeForm {
  scheduledAt: number;
  expiresAt?: number;
}

// Filter types
export interface NoticeFilters {
  propertyId?: Id<'properties'>;
  unitId?: Id<'units'>;
  noticeType?: NoticeType;
  priority?: NoticePriority;
  targetAudience?: TargetAudience;
  isActive?: boolean;
  dateFrom?: number;
  dateTo?: number;
  search?: string;
  createdBy?: Id<'users'>;
  status?: string;
  assignedTo?: Id<'users'>;
}

// API response types
export interface NoticeListResponse {
  page: NoticeWithDetails[];
  isDone: boolean;
  continueCursor?: string;
}

export interface NoticeAcknowledgmentsResponse {
  page: NoticeAcknowledgmentWithUser[];
  isDone: boolean;
  continueCursor?: string;
}

// Utility types
export interface NoticeStats {
  total: number;
  active: number;
  scheduled: number;
  expired: number;
  byType: Record<NoticeType, number>;
  byPriority: Record<NoticePriority, number>;
}

export interface NoticeFormState {
  isLoading: boolean;
  error?: string;
  success?: string;
}

// Component props types
export interface NoticeCardProps {
  notice: NoticeWithDetails;
  onEdit?: (notice: NoticeWithDetails) => void;
  onDelete?: (noticeId: Id<'notices'>) => void;
  onView?: (notice: NoticeWithDetails) => void;
  onAcknowledge?: (noticeId: Id<'notices'>) => void;
}

export interface NoticeFormProps {
  initialData?: Partial<CreateNoticeForm>;
  onSubmit: (data: CreateNoticeForm | UpdateNoticeForm) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
  properties: PropertyWithStats[];
  units: UnitWithTenant[];
}

export interface NoticeFiltersProps {
  filters: NoticeFilters;
  onFiltersChange: (filters: NoticeFilters) => void;
  properties: PropertyWithStats[];
  units: UnitWithTenant[];
}

export interface NoticeListProps {
  notices: NoticeWithDetails[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onNoticeAction?: (action: 'view' | 'edit' | 'delete' | 'acknowledge', notice: NoticeWithDetails) => void;
  // Table-specific props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

export interface NoticeDetailProps {
  notice: NoticeWithFullDetails;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}

// Hook return types
export interface UseNoticesReturn {
  notices: NoticeWithDetails[];
  isLoading: boolean;
  error?: string;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
  filters: NoticeFilters;
  setFilters: (filters: NoticeFilters) => void;
  // Pagination props
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export interface UseNoticeMutationsReturn {
  createNotice: (data: CreateNoticeForm) => Promise<void>;
  updateNotice: (noticeId: Id<'notices'>, data: UpdateNoticeForm) => Promise<void>;
  deleteNotice: (noticeId: Id<'notices'>) => Promise<void>;
  sendNoticeToAll: (data: SendNoticeToAllForm) => Promise<void>;
  sendNoticeToUnit: (data: SendNoticeToUnitForm) => Promise<void>;
  scheduleNotice: (noticeId: Id<'notices'>, data: ScheduleNoticeForm) => Promise<void>;
  acknowledgeNotice: (noticeId: Id<'notices'>) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export interface UseNoticeDetailReturn {
  notice: NoticeWithFullDetails | null;
  isLoading: boolean;
  error?: string;
  refetch: () => void;
}

export interface UseNoticeAcknowledgmentsReturn {
  acknowledgments: NoticeAcknowledgmentWithUser[];
  isLoading: boolean;
  error?: string;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}
