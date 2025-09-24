'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AssignmentDialog } from '@/features/maintenance/components/assignment-dialog';
import { KanbanBoard } from '@/features/maintenance/components/kanban-board';
import { MaintenanceDetailSheet } from '@/features/maintenance/components/maintenance-detail-sheet';
import { useMaintenanceRequests } from '@/features/maintenance/hooks/useMaintenanceRequests';
import { useMaintenanceKPIs } from '@/features/maintenance/hooks/useMaintenanceKPIs';
import { useMaintenanceMutations } from '@/features/maintenance/hooks/useMaintenanceMutations';
import { MaintenanceFilters, STATUSES, PRIORITIES, REQUEST_TYPES } from '@/features/maintenance/types';
import { usePropertyStore } from '@/features/property';
import { Id } from '@convex/_generated/dataModel';
import {
  MaintenancePageSkeleton,
  MaintenanceTablePageSkeleton,
  MaintenanceDetailSheetSkeleton,
  AssignmentDialogSkeleton,
} from '@/features/maintenance/components/skeletons';
import { MaintenanceRequestStatus } from '../../../../mobile/lib/tech.types';
import { motion } from 'framer-motion';

export default function MaintenancePage() {
  const { selectedPropertyId } = usePropertyStore();
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

  // Filter maintenance requests by selected property
  const maintenanceFilters = {
    ...filters,
    propertyId: selectedPropertyId,
  };

  const requests = useMaintenanceRequests(maintenanceFilters, pagination);
  const kpis = useMaintenanceKPIs({ propertyId: selectedPropertyId });
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
      await updateStatus(requestId as Id<'maintenanceRequests'>, newStatus as MaintenanceRequestStatus);
      // Refresh the data
      setPagination({ numItems: 20, cursor: null });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Show message if no property is selected
  if (!selectedPropertyId) {
    return (
      <div className='space-y-4 sm:space-y-6'>
        <div>
          <h1 className='text-lg sm:text-xl font-bold tracking-tight'>Maintenance</h1>
          <p className='text-sm sm:text-base text-muted-foreground'>
            Please select a property from the sidebar to view maintenance requests
          </p>
        </div>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center space-y-4'>
            <div className='w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center'>
              <svg className='w-8 h-8 text-muted-foreground' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                />
              </svg>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-muted-foreground'>No Property Selected</h3>
              <p className='text-sm text-muted-foreground'>
                Use the property selector in the sidebar to choose a property and view its maintenance requests.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className='space-y-4 sm:space-y-6'
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h1 className='text-lg sm:text-xl font-bold tracking-tight'>Maintenance</h1>
        <p className='text-sm sm:text-base text-muted-foreground'>
          Manage and track maintenance requests for the selected property
        </p>
      </motion.div>

      {/* View Mode Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className='flex w-full items-center gap-2 sm:gap-4 overflow-x-auto'
      >
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
      </motion.div>

      {/* Request Board Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'
      >
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
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
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
      </motion.div>
    </motion.div>
  );
}
