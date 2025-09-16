'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/features/maintenance/components/StatusBadge';
import { PriorityBadge } from '@/features/maintenance/components/PriorityBadge';
import { AssignmentDialog } from '@/features/maintenance/components/AssignmentDialog';
import { useMaintenanceRequests } from '@/features/maintenance/hooks/useMaintenanceRequests';
import { useMaintenanceKPIs } from '@/features/maintenance/hooks/useMaintenanceKPIs';
import { MaintenanceFilters, STATUSES, PRIORITIES, REQUEST_TYPES } from '@/features/maintenance/types';
import { Id } from '@convex/_generated/dataModel';

export default function MaintenancePage() {
  const [filters, setFilters] = useState<MaintenanceFilters>({});
  const [pagination, setPagination] = useState({ numItems: 20, cursor: null as string | null });
  const [search, setSearch] = useState('');
  const [assignmentDialog, setAssignmentDialog] = useState<{
    isOpen: boolean;
    requestId: Id<'maintenanceRequests'> | null;
  }>({ isOpen: false, requestId: null });

  const requests = useMaintenanceRequests(filters, pagination);
  const kpis = useMaintenanceKPIs();

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

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Maintenance Requests</h1>
        <p className='text-muted-foreground'>Manage and track maintenance requests across all properties</p>
      </div>

      {/* KPIs Dashboard */}
      {kpis && (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <h3 className='tracking-tight text-sm font-medium'>Total Open</h3>
            </div>
            <div>
              <div className='text-2xl font-bold'>{kpis.totalOpen}</div>
            </div>
          </div>
          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <h3 className='tracking-tight text-sm font-medium'>Overdue</h3>
            </div>
            <div>
              <div className='text-2xl font-bold text-red-600'>{kpis.overdueCount}</div>
            </div>
          </div>
          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <h3 className='tracking-tight text-sm font-medium'>Avg Resolution</h3>
            </div>
            <div>
              <div className='text-2xl font-bold'>
                {kpis.avgResolutionTimeMs ? `${Math.round(kpis.avgResolutionTimeMs / (1000 * 60 * 60 * 24))}d` : 'N/A'}
              </div>
            </div>
          </div>
          <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-6'>
            <div className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <h3 className='tracking-tight text-sm font-medium'>Completed</h3>
            </div>
            <div>
              <div className='text-2xl font-bold'>{kpis.byStatus.completed || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className='rounded-lg border bg-card p-6'>
        <h3 className='text-lg font-semibold mb-4'>Filters</h3>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <div>
            <Label htmlFor='search'>Search</Label>
            <Input
              id='search'
              placeholder='Search requests...'
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor='status'>Status</Label>
            <select
              id='status'
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              value={filters.status || ''}
              onChange={e => handleFilterChange('status', e.target.value || undefined)}
            >
              <option value=''>All Statuses</option>
              {STATUSES.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor='priority'>Priority</Label>
            <select
              id='priority'
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              value={filters.priority || ''}
              onChange={e => handleFilterChange('priority', e.target.value || undefined)}
            >
              <option value=''>All Priorities</option>
              {PRIORITIES.map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor='type'>Type</Label>
            <select
              id='type'
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              value={filters.requestType || ''}
              onChange={e => handleFilterChange('requestType', e.target.value || undefined)}
            >
              <option value=''>All Types</option>
              {REQUEST_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className='rounded-lg border bg-card'>
        <div className='p-6'>
          <h3 className='text-lg font-semibold mb-4'>Maintenance Requests</h3>
          {requests ? (
            <div className='space-y-4'>
              {requests.page.map(request => (
                <div key={request._id} className='border rounded-lg p-4 hover:bg-muted/50 transition-colors'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <h4 className='font-semibold'>{request.title}</h4>
                        <StatusBadge status={request.status as any} />
                        <PriorityBadge priority={request.priority as any} />
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
                      <Button variant='outline' size='sm'>
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
          ) : (
            <div className='text-center py-8 text-muted-foreground'>Loading maintenance requests...</div>
          )}
        </div>
      </div>

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
    </div>
  );
}
