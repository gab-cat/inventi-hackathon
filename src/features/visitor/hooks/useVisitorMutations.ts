import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { toast } from 'sonner';

export const useVisitorMutations = () => {
  const createVisitorEntry = useMutation(api.visitorRequest.webCreateVisitorEntry);
  const approveVisitorRequest = useMutation(api.visitorRequest.webApproveVisitorRequest);
  const denyVisitorRequest = useMutation(api.visitorRequest.webDenyVisitorRequest);
  const generateVisitorBadge = useMutation(api.visitorRequest.webGenerateVisitorBadge);
  const checkInVisitor = useMutation(api.visitorLog.webCheckInVisitor);
  const checkOutVisitor = useMutation(api.visitorLog.webCheckOutVisitor);
  const markVisitorNoShow = useMutation(api.visitorLog.webMarkVisitorNoShow);
  const manageWatchlist = useMutation(api.watchList.webManageWatchlist);

  const handleCreateVisitorEntry = async (data: {
    propertyId: Id<'properties'>;
    unitId: Id<'units'>;
    visitorName: string;
    visitorEmail?: string;
    visitorPhone?: string;
    visitorIdNumber?: string;
    visitorIdType?: string;
    purpose: string;
    expectedArrival: number;
    expectedDeparture?: number;
    numberOfVisitors: number;
    documents?: Array<{
      fileName: string;
      fileUrl: string;
      uploadedAt: number;
    }>;
  }) => {
    try {
      const result = await createVisitorEntry(data);
      toast.success('Visitor entry created successfully');
      return result;
    } catch (error) {
      toast.error('Failed to create visitor entry');
      throw error;
    }
  };

  const handleApproveVisitorRequest = async (visitorRequestId: Id<'visitorRequests'>) => {
    try {
      await approveVisitorRequest({ visitorRequestId });
      toast.success('Visitor request approved');
    } catch (error) {
      toast.error('Failed to approve visitor request');
      throw error;
    }
  };

  const handleDenyVisitorRequest = async (visitorRequestId: Id<'visitorRequests'>, deniedReason: string) => {
    try {
      await denyVisitorRequest({ visitorRequestId, deniedReason });
      toast.success('Visitor request denied');
    } catch (error) {
      toast.error('Failed to deny visitor request');
      throw error;
    }
  };

  const handleGenerateVisitorBadge = async (visitorRequestId: Id<'visitorRequests'>) => {
    try {
      const badge = await generateVisitorBadge({ visitorRequestId });
      toast.success('Visitor badge generated');
      return badge;
    } catch (error) {
      toast.error('Failed to generate visitor badge');
      throw error;
    }
  };

  const handleCheckInVisitor = async (visitorRequestId: Id<'visitorRequests'>, location?: string, notes?: string) => {
    try {
      await checkInVisitor({ visitorRequestId, location, notes });
      toast.success('Visitor checked in successfully');
    } catch (error) {
      toast.error('Failed to check in visitor');
      throw error;
    }
  };

  const handleCheckOutVisitor = async (visitorRequestId: Id<'visitorRequests'>, location?: string, notes?: string) => {
    try {
      await checkOutVisitor({ visitorRequestId, location, notes });
      toast.success('Visitor checked out successfully');
    } catch (error) {
      toast.error('Failed to check out visitor');
      throw error;
    }
  };

  const handleMarkVisitorNoShow = async (visitorRequestId: Id<'visitorRequests'>, notes?: string) => {
    try {
      await markVisitorNoShow({ visitorRequestId, notes });
      toast.success('Visitor marked as no-show');
    } catch (error) {
      toast.error('Failed to mark visitor as no-show');
      throw error;
    }
  };

  const handleManageWatchlist = async (data: {
    propertyId: Id<'properties'>;
    action: 'add' | 'remove';
    visitorName: string;
    visitorIdNumber?: string;
    reason: string;
  }) => {
    try {
      await manageWatchlist(data);
      toast.success(`Visitor ${data.action === 'add' ? 'added to' : 'removed from'} watchlist`);
    } catch (error) {
      toast.error('Failed to manage watchlist');
      throw error;
    }
  };

  return {
    handleCreateVisitorEntry,
    handleApproveVisitorRequest,
    handleDenyVisitorRequest,
    handleGenerateVisitorBadge,
    handleCheckInVisitor,
    handleCheckOutVisitor,
    handleMarkVisitorNoShow,
    handleManageWatchlist,
  };
};
