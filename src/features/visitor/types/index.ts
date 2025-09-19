// Re-export API types as the main types
export * from './api';

// Legacy type aliases for backward compatibility (can be removed later)
export type {
  VisitorRequestWithDetails,
  ActiveVisitor,
  VisitorLogWithDetails,
  VisitorReport,
  VisitorBadge,
  CheckInResult,
  CheckOutResult,
  MarkNoShowResult,
  ApproveRequestResult,
  DenyRequestResult,
  WatchlistResult,
} from './api';
