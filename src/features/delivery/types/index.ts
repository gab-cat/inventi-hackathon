import { Id } from '@convex/_generated/dataModel';

// Base delivery type from schema
export interface Delivery {
  _id: Id<'deliveries'>;
  _creationTime: number;
  propertyId: Id<'properties'>;
  unitId?: Id<'units'>;
  deliveryType: 'package' | 'food' | 'grocery' | 'mail' | 'other';
  senderName: string;
  senderCompany?: string;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  trackingNumber?: string;
  description: string;
  estimatedDelivery: number;
  actualDelivery?: number;
  status: 'registered' | 'arrived' | 'collected' | 'failed' | 'returned';
  deliveryLocation?: string;
  deliveryNotes?: string;
  photos?: string[];
  blockchainTxHash?: string;
  createdAt: number;
  updatedAt: number;
}

// Delivery with joined data
export interface DeliveryWithDetails extends Delivery {
  property: {
    _id: Id<'properties'>;
    name: string;
    address: string;
  };
  unit?: {
    _id: Id<'units'>;
    unitNumber: string;
  };
}

// Delivery log type from schema
export interface DeliveryLog {
  _id: Id<'deliveryLogs'>;
  _creationTime: number;
  deliveryId: Id<'deliveries'>;
  propertyId: Id<'properties'>;
  action: 'registered' | 'arrived' | 'collected' | 'failed';
  timestamp: number;
  performedBy?: Id<'users'>;
  notes?: string;
  blockchainTxHash?: string;
  createdAt: number;
}

// Delivery log with joined data
export interface DeliveryLogWithDetails extends DeliveryLog {
  performer?: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
    email: string;
  };
  delivery: {
    _id: Id<'deliveries'>;
    deliveryType: string;
    senderName: string;
    recipientName: string;
    trackingNumber?: string;
    status: string;
  };
}

// Form types
export interface CreateDeliveryForm {
  propertyId: string;
  unitId?: string;
  deliveryType: 'package' | 'food' | 'grocery' | 'mail' | 'other';
  senderName: string;
  senderCompany?: string;
  recipientId?: string;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  trackingNumber?: string;
  description: string;
  estimatedDelivery: string; // ISO string for form
  deliveryLocation?: string;
  deliveryNotes?: string;
  photos?: string[];
}

export interface UpdateDeliveryForm {
  unitId?: string;
  status: 'registered' | 'arrived' | 'collected' | 'failed' | 'returned';
  notes?: string;
  actualDelivery?: string; // ISO string for form
}

export interface AssignDeliveryForm {
  deliveryId: string;
  unitId: string;
  notes?: string;
}

export interface CollectDeliveryForm {
  deliveryId: string;
  notes?: string;
  photos?: string[];
}

// Filter types
export interface DeliveryFilters {
  propertyId?: string;
  unitId?: string;
  deliveryType?: 'package' | 'food' | 'grocery' | 'mail' | 'other';
  status?: 'registered' | 'arrived' | 'collected' | 'failed' | 'returned';
  dateFrom?: number;
  dateTo?: number;
  search?: string;
  trackingNumber?: string;
}

export interface DeliveryLogFilters {
  propertyId?: string;
  action?: 'registered' | 'arrived' | 'collected' | 'failed' | 'returned';
  dateFrom?: number;
  dateTo?: number;
}

// Component props
export interface DeliveryFormProps {
  initialData?: Partial<CreateDeliveryForm>;
  onSubmit: (data: CreateDeliveryForm) => void;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
  properties: Array<{ _id: string; name: string; address: string }>;
  units: Array<{ _id: string; unitNumber: string; propertyId: string }>;
}

export interface DeliveryListProps {
  deliveries: DeliveryWithDetails[];
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  onDeliveryAction: (
    action: 'view' | 'assign' | 'collect' | 'update_status' | 'edit',
    delivery: DeliveryWithDetails | { _id: Id<'deliveries'> }
  ) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export interface DeliveryFiltersProps {
  filters: DeliveryFilters;
  onFiltersChange: (filters: DeliveryFilters) => void;
  properties: Array<{ _id: string; name: string; address: string }>;
  units: Array<{ _id: string; unitNumber: string; propertyId: string }>;
}

export interface DeliveryDetailSheetProps {
  deliveryId: Id<'deliveries'> | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (deliveryId: Id<'deliveries'>) => void;
  onCollect: (deliveryId: Id<'deliveries'>) => void;
  onUpdateStatus: (deliveryId: Id<'deliveries'>) => void;
}

export interface DeliveryLogsListProps {
  logs: DeliveryLogWithDetails[];
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  filters: DeliveryLogFilters;
  onFiltersChange: (filters: DeliveryLogFilters) => void;
}
