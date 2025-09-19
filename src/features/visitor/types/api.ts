import { Id } from '@convex/_generated/dataModel';

// Base types matching the database schema
export interface VisitorRequestBase {
  _id: Id<'visitorRequests'>;
  propertyId: Id<'properties'>;
  unitId: Id<'units'>;
  requestedBy: Id<'users'>;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitorIdNumber?: string;
  visitorIdType?: string;
  purpose: string;
  expectedArrival: number;
  expectedDeparture?: number;
  numberOfVisitors: number;
  status: string;
  approvedBy?: Id<'users'>;
  approvedAt?: number;
  deniedReason?: string;
  documents?: Array<{
    fileName: string;
    fileUrl: string;
    uploadedAt: number;
  }>;
  blockchainTxHash?: string;
  createdAt: number;
  updatedAt: number;
}

export interface VisitorLogBase {
  _id: Id<'visitorLogs'>;
  visitorRequestId: Id<'visitorRequests'>;
  propertyId: Id<'properties'>;
  unitId: Id<'units'>;
  visitorName: string;
  action: string;
  timestamp: number;
  location?: string;
  notes?: string;
  blockchainTxHash: string;
  blockNumber?: number;
  smartContractAddress?: string;
  createdAt: number;
}

// Joined data types
export interface UnitDetails {
  _id: Id<'units'>;
  unitNumber: string;
  propertyId: Id<'properties'>;
}

export interface UserDetails {
  _id: Id<'users'>;
  firstName: string;
  lastName: string;
  email: string;
}

export interface VisitorLogDetails {
  _id: Id<'visitorLogs'>;
  action: string;
  timestamp: number;
  location?: string;
  notes?: string;
}

// API return types (matching actual Convex return types)
export interface VisitorRequestWithDetails extends Omit<VisitorRequestBase, 'requestedBy' | 'approvedBy'> {
  unit?: UnitDetails | null;
  requestedByUser?: UserDetails | null;
  approvedByUser?: UserDetails | null;
  logs?: VisitorLogDetails[];
}

export interface ActiveVisitor extends Omit<VisitorRequestBase, 'requestedBy' | 'approvedBy'> {
  unit?: UnitDetails | null;
  requestedByUser?: UserDetails | null;
  checkInTime: number;
  checkInLocation?: string;
}

export interface VisitorLogWithDetails extends VisitorLogBase {
  visitorRequest?: {
    _id: Id<'visitorRequests'>;
    visitorName: string;
    purpose: string;
    expectedArrival: number;
    expectedDeparture?: number;
    status: string;
  } | null;
  unit?: UnitDetails | null;
  verifiedBy?: UserDetails | null;
}

export interface VisitorReport {
  property?: {
    _id: Id<'properties'>;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  period: {
    start: number;
    end: number;
  };
  summary?: {
    totalRequests: number;
    approvedRequests: number;
    deniedRequests: number;
    pendingRequests: number;
    totalCheckIns: number;
    totalCheckOuts: number;
    noShows: number;
  };
  requests?: VisitorRequestWithDetails[];
  securityLogs?: VisitorLogWithDetails[];
}

// Mutation return types
export interface CheckInResult {
  success: boolean;
  visitorLogId: Id<'visitorLogs'>;
}

export interface CheckOutResult {
  success: boolean;
  visitorLogId: Id<'visitorLogs'>;
}

export interface MarkNoShowResult {
  success: boolean;
  visitorLogId: Id<'visitorLogs'>;
}

export interface ApproveRequestResult {
  success: boolean;
  visitorRequestId: Id<'visitorRequests'>;
}

export interface DenyRequestResult {
  success: boolean;
  visitorRequestId: Id<'visitorRequests'>;
}

export interface VisitorBadge {
  badgeId: string;
  visitorName: string;
  propertyId: Id<'properties'>;
  unitId: Id<'units'>;
  validFrom: number;
  validUntil: number;
  qrCode: string;
}

export interface WatchlistResult {
  success: boolean;
  action: string;
  watchlistEntry: any;
}
