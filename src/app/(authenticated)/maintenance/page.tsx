'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AssignmentDialog } from '@/features/maintenance/components/AssignmentDialog';
import { KanbanBoard } from '@/features/maintenance/components/KanbanBoard';
import { MaintenanceDetailSheet } from '@/features/maintenance/components/MaintenanceDetailSheet';
import { useMaintenanceRequests } from '@/features/maintenance/hooks/useMaintenanceRequests';
import { useMaintenanceKPIs } from '@/features/maintenance/hooks/useMaintenanceKPIs';
import { useMaintenanceMutations } from '@/features/maintenance/hooks/useMaintenanceMutations';
import { MaintenanceFilters, STATUSES, PRIORITIES, REQUEST_TYPES } from '@/features/maintenance/types';
import { Id } from '@convex/_generated/dataModel';
import {
  MaintenancePageSkeleton,
  MaintenanceTablePageSkeleton,
  MaintenanceDetailSheetSkeleton,
  AssignmentDialogSkeleton,
} from '@/features/maintenance/components/skeletons';

export default function MaintenancePage() {
  const [filters, setFilters] = useState<MaintenanceFilters>({});
  const [pagination, setPagination] = useState({ numItems: 20, cursor: null as string | null });
  const [search, setSearch] = useState('');
  const [assignmentDialog, setAssignmentDialog] = useState<{
    isOpen: boolean;
    requestId: Id<'maintenanceRequests'> | null;
  }>({ isOpen: false, requestId: null });
  const [detailSheet, setDetailSheet] = useState<{
    isOpen: boolean;
    requestId: Id<'maintenanceRequests'> | null;
  }>({ isOpen: false, requestId: null });
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const requests = useMaintenanceRequests(filters, pagination);
  const kpis = useMaintenanceKPIs();
  const { updateStatus } = useMaintenanceMutations();

  const handleFilterChange = (key: keyof MaintenanceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination({ numItems: 20, cursor: null });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    handleFilterChange('search', value);
  };

  const loadMore = () => {
    if (requests && !requests.isDone && requests.continueCursor) {
      setPagination(prev => ({ ...prev, cursor: requests.continueCursor }));
    }
  };

  const handleAssign = (requestId: string) => {
    setAssignmentDialog({ isOpen: true, requestId: requestId as Id<'maintenanceRequests'> });
  };

  const handleViewDetails = (requestId: string) => {
    setDetailSheet({ isOpen: true, requestId: requestId as Id<'maintenanceRequests'> });
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      await updateStatus(requestId as Id<'maintenanceRequests'>, newStatus);
      // Refresh the data
      setPagination({ numItems: 20, cursor: null });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className='space-y-4 sm:space-y-6'>
      <div>
        <h1 className='text-lg sm:text-xl font-bold tracking-tight'>Maintenance</h1>
        <p className='text-sm sm:text-base text-muted-foreground'>
          Manage and track maintenance requests across all properties
        </p>
      </div>

      {/* View Mode Tabs */}
      <div className='flex w-full items-center gap-2 sm:gap-4 overflow-x-auto'>
        <div className='flex w-full border-b min-w-max'>
          <button
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'kanban'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => setViewMode('kanban')}
          >
            Requests Board
          </button>
          <button
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'table'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => setViewMode('table')}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Request Board Overview */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-lg sm:text-xl font-semibold'>
            Request Board {requests ? requests.page.length : 0} total
          </h2>
        </div>
        <div className='flex items-center gap-2 sm:gap-4'>
          <div className='relative flex-1 sm:flex-none'>
            <Input
              placeholder='Search tenants'
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className='w-full sm:w-64'
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!requests ? (
        // Show skeleton while loading
        viewMode === 'kanban' ? (
          <MaintenancePageSkeleton />
        ) : (
          <MaintenanceTablePageSkeleton />
        )
      ) : viewMode === 'kanban' ? (
        <div className='rounded-lg'>
          <KanbanBoard
            requests={requests.page}
            onAssign={handleAssign}
            onViewDetails={handleViewDetails}
            onStatusChange={handleStatusChange}
          />
        </div>
      ) : (
        /* Table View */
        <div className='rounded-lg border bg-card'>
          <div className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>Maintenance Requests</h3>
            <div className='space-y-4'>
              {requests.page.map(request => (
                <div key={request._id} className='border rounded-lg p-4 hover:bg-muted/50 transition-colors'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <h4 className='font-semibold'>{request.title}</h4>
                      </div>
                      <p className='text-sm text-muted-foreground'>{request.description}</p>
                      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <span>Tenant: {request.tenantName || 'Unknown'}</span>
                        <span>Unit: {request.unitNumber || 'N/A'}</span>
                        <span>Type: {request.requestType}</span>
                        <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button variant='outline' size='sm' onClick={() => handleViewDetails(request._id)}>
                        View Details
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setAssignmentDialog({ isOpen: true, requestId: request._id })}
                      >
                        Assign
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {requests.page.length === 0 && (
                <div className='text-center py-8 text-muted-foreground'>No maintenance requests found</div>
              )}

              {!requests.isDone && (
                <div className='text-center pt-4'>
                  <Button onClick={loadMore} variant='outline'>
                    Load More
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assignment Dialog */}
      {assignmentDialog.requestId && (
        <AssignmentDialog
          requestId={assignmentDialog.requestId}
          isOpen={assignmentDialog.isOpen}
          onClose={() => setAssignmentDialog({ isOpen: false, requestId: null })}
          onSuccess={() => {
            // Refresh the data or show success message
            setPagination({ numItems: 20, cursor: null });
          }}
        />
      )}

      {/* Detail Sheet */}
      {detailSheet.requestId &&
        (requests ? (
          <MaintenanceDetailSheet
            request={requests.page.find(r => r._id === detailSheet.requestId) || null}
            isOpen={detailSheet.isOpen}
            onClose={() => setDetailSheet({ isOpen: false, requestId: null })}
            onAssign={handleAssign}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className='fixed inset-0 z-50'>
            <div className='fixed right-0 top-0 h-full w-full max-w-2xl bg-background border-l shadow-lg'>
              <MaintenanceDetailSheetSkeleton />
            </div>
          </div>
        ))}
    </div>
  );
}
