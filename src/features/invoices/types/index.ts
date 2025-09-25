import { Id } from '@convex/_generated/dataModel';

export interface Invoice {
  _id: Id<'invoices'>;
  _creationTime: number;
  propertyId: Id<'properties'>;
  unitId?: Id<'units'>;
  tenantId: Id<'users'>;
  invoiceNumber: string;
  invoiceType: 'rent' | 'maintenance' | 'utility' | 'fine' | 'other';
  description: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  dueDate: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  paidAt?: number;
  paidAmount?: number;
  paymentMethod?: string;
  lateFee?: number;
  items: InvoiceItem[];
  blockchainTxHash?: string;
  createdAt: number;
  updatedAt: number;
  // Joined data
  property: {
    _id: Id<'properties'>;
    name: string;
    address: string;
  };
  tenant: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
    email: string;
  };
  unit?: {
    _id: Id<'units'>;
    unitNumber: string;
    floor?: number;
  };
  paymentCount: number;
  totalPaid: number;
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity?: number;
}

export interface InvoiceWithDetails extends Invoice {
  tenant: {
    _id: Id<'users'>;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  property: {
    _id: Id<'properties'>;
    name: string;
    address: string;
  };
  unit?: {
    _id: Id<'units'>;
    unitNumber: string;
    floor?: number;
  };
  paymentCount: number;
  totalPaid: number;
}

export interface CreateInvoiceForm {
  propertyId: string;
  unitId?: string;
  tenantId: string;
  invoiceType: 'rent' | 'maintenance' | 'utility' | 'fine' | 'other';
  description: string;
  taxAmount?: number;
  dueDate: string;
  items: InvoiceItem[];
  lateFee?: number;
}

export interface InvoiceFormProps {
  initialData?: Partial<CreateInvoiceForm>;
  onSubmit: (data: CreateInvoiceForm) => void;
  onCancel: () => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
  properties: Array<{ _id: string; name: string; address: string }>;
  units: Array<{ _id: string; unitNumber: string; propertyId: string }>;
  tenants: Array<{ _id: string; firstName: string; lastName: string; email: string }>;
}

export interface InvoiceListProps {
  invoices: InvoiceWithDetails[];
  isLoading: boolean;
  onEdit?: (invoice: InvoiceWithDetails) => void;
  onView?: (invoice: InvoiceWithDetails) => void;
  onDelete?: (invoice: InvoiceWithDetails) => void;
  onStatusChange?: (invoice: InvoiceWithDetails, status: string) => void;
  properties?: Array<{ _id: string; name: string; address: string }>;
  units?: Array<{ _id: string; unitNumber: string; propertyId: string }>;
  tenants?: Array<{ _id: string; firstName: string; lastName: string; email: string }>;
}

export interface InvoiceFilters {
  status?: string;
  invoiceType?: string;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  dateFrom?: number;
  dateTo?: number;
}
