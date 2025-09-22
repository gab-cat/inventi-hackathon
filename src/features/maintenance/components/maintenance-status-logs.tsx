'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MaintenanceUpdatesTable } from './maintenance-updates-table';
import { useMaintenanceUpdates } from '../hooks/useMaintenanceUpdates';
import { MaintenanceUpdate, Status } from '../types';
import { TablePagination } from '@/components/ui/table-pagination';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';

interface MaintenanceStatusLogsProps {
  propertyId?: string;
  initialFilters?: {
    status?: Status;
    updatedBy?: string;
    dateFrom?: number;
    dateTo?: number;
  };
}

export function MaintenanceStatusLogs({ propertyId, initialFilters = {} }: MaintenanceStatusLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const {
    updates,
    isLoading,
    filters,
    setFilters,
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
    refetch,
  } = useMaintenanceUpdates({
    propertyId,
    status: statusFilter === 'all' ? undefined : statusFilter,
    dateFrom: dateFrom ? new Date(dateFrom).getTime() : undefined,
    dateTo: dateTo ? new Date(dateTo).getTime() : undefined,
    ...initialFilters,
  });

  const handleSearch = () => {
    // For now, we'll just refetch with current filters
    // In a real implementation, you might want to add search functionality
    refetch();
  };

  const handleFilterChange = () => {
    setFilters({
      propertyId,
      status: statusFilter === 'all' ? undefined : statusFilter,
      dateFrom: dateFrom ? new Date(dateFrom).getTime() : undefined,
      dateTo: dateTo ? new Date(dateTo).getTime() : undefined,
      ...initialFilters,
    });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export maintenance updates');
  };

  const handleUpdateClick = (update: MaintenanceUpdate) => {
    // TODO: Navigate to maintenance request detail or show update details
    console.log('Update clicked:', update);
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Maintenance Status Logs</h1>
          <p className='text-muted-foreground'>Track all maintenance request status updates and changes</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={handleExport}>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button variant='outline' onClick={refetch}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-4 w-4' />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Search</label>
              <div className='flex gap-2'>
                <Input
                  placeholder='Search updates...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <Button variant='outline' size='sm' onClick={handleSearch}>
                  <Search className='h-4 w-4' />
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Status</label>
              <Select value={statusFilter} onValueChange={value => setStatusFilter(value as Status | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Date From</label>
              <Input type='date' value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Date To</label>
              <Input type='date' value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>

          <div className='flex justify-end mt-4'>
            <Button onClick={handleFilterChange}>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className='flex items-center justify-between text-sm text-muted-foreground'>
        <span>
          Showing {updates.length} of {totalItems} status updates
        </span>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Updates Table */}
      <Card>
        <CardContent className='p-6'>
          <MaintenanceUpdatesTable updates={updates} isLoading={isLoading} onUpdateClick={handleUpdateClick} />
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center'>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={currentPage < totalPages}
            hasPreviousPage={currentPage > 1}
            onPageChange={onPageChange}
            onNextPage={() => onPageChange(currentPage + 1)}
            onPreviousPage={() => onPageChange(currentPage - 1)}
            onFirstPage={() => onPageChange(1)}
            onLastPage={() => onPageChange(totalPages)}
            isLoading={isLoading}
            total={totalItems}
            limit={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
}
