'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { FileText, Filter, Search, User, Clock, Package } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { DeliveryLogsListProps } from '../types';

const actionColors = {
  registered: 'bg-blue-100 text-blue-800',
  assigned: 'bg-yellow-100 text-yellow-800',
  delivered: 'bg-green-100 text-green-800',
  collected: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
};

export function DeliveryLogsList({
  logs,
  isLoading,
  onLoadMore,
  hasMore,
  filters,
  onFiltersChange,
}: DeliveryLogsListProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof typeof filters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      propertyId: filters.propertyId, // Keep the current property
    });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'propertyId' && value !== undefined && value !== ''
  );

  const getActionBadge = (action: string) => {
    const colorClass = actionColors[action as keyof typeof actionColors] || 'bg-gray-100 text-gray-800';
    return <Badge className={colorClass}>{action.toUpperCase()}</Badge>;
  };

  if (isLoading && logs.length === 0) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center py-8'>
            <div className='text-center space-y-2'>
              <div className='w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin' />
              <p className='text-sm text-muted-foreground'>Loading delivery logs...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Filter className='w-5 h-5' />
              Log Filters
            </CardTitle>
            <div className='flex items-center gap-2'>
              {hasActiveFilters && (
                <Button variant='outline' size='sm' onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
              <Button variant='outline' size='sm' onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Select
              value={filters.action || undefined}
              onValueChange={value => handleFilterChange('action', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='All actions' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All actions</SelectItem>
                <SelectItem value='registered'>Registered</SelectItem>
                <SelectItem value='arrived'>Arrived</SelectItem>
                <SelectItem value='collected'>Collected</SelectItem>
                <SelectItem value='failed'>Failed</SelectItem>
              </SelectContent>
            </Select>

            {showAdvanced && (
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  type='date'
                  placeholder='From date'
                  value={filters.dateFrom ? new Date(filters.dateFrom).toISOString().split('T')[0] : ''}
                  onChange={e =>
                    handleFilterChange(
                      'dateFrom',
                      e.target.value ? new Date(e.target.value).getTime().toString() : undefined
                    )
                  }
                />
                <Input
                  type='date'
                  placeholder='To date'
                  value={filters.dateTo ? new Date(filters.dateTo).toISOString().split('T')[0] : ''}
                  onChange={e =>
                    handleFilterChange(
                      'dateTo',
                      e.target.value ? new Date(e.target.value).getTime().toString() : undefined
                    )
                  }
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='w-5 h-5' />
            Delivery Audit Logs ({logs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center space-y-4'>
                <div className='w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center'>
                  <FileText className='w-8 h-8 text-muted-foreground' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-muted-foreground'>No logs found</h3>
                  <p className='text-sm text-muted-foreground'>No delivery logs match your current filters.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              {/* Desktop Table View */}
              <div className='hidden md:block'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map(log => (
                      <TableRow key={log._id}>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='flex items-center gap-2'>
                              <Package className='w-4 h-4' />
                              <span className='font-medium'>{log.delivery.deliveryType}</span>
                            </div>
                            <p className='text-sm text-muted-foreground'>
                              {log.delivery.senderName} → {log.delivery.recipientName}
                            </p>
                            {log.delivery.trackingNumber && (
                              <p className='text-xs text-muted-foreground'>{log.delivery.trackingNumber}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.performer ? (
                            <div className='flex items-center gap-2'>
                              <User className='w-4 h-4 text-muted-foreground' />
                              <div>
                                <p className='font-medium'>
                                  {log.performer.firstName} {log.performer.lastName}
                                </p>
                                <p className='text-sm text-muted-foreground'>{log.performer.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className='text-sm text-muted-foreground'>System</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1 text-sm'>
                            <Clock className='w-3 h-3' />
                            {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className='text-sm'>{log.notes || '-'}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className='md:hidden space-y-4'>
                {logs.map(log => (
                  <Card key={log._id} className='p-4'>
                    <div className='space-y-3'>
                      <div className='flex items-start justify-between'>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <Package className='w-4 h-4' />
                            <span className='font-medium'>{log.delivery.deliveryType}</span>
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {log.delivery.senderName} → {log.delivery.recipientName}
                          </p>
                        </div>
                        {getActionBadge(log.action)}
                      </div>

                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <p className='font-medium'>Performed By</p>
                          {log.performer ? (
                            <p className='text-muted-foreground'>
                              {log.performer.firstName} {log.performer.lastName}
                            </p>
                          ) : (
                            <p className='text-muted-foreground'>System</p>
                          )}
                        </div>
                        <div>
                          <p className='font-medium'>Timestamp</p>
                          <p className='text-muted-foreground'>{format(new Date(log.timestamp), 'MMM dd, HH:mm')}</p>
                        </div>
                      </div>

                      {log.notes && (
                        <div className='text-sm'>
                          <p className='font-medium'>Notes</p>
                          <p className='text-muted-foreground'>{log.notes}</p>
                        </div>
                      )}

                      {log.delivery.trackingNumber && (
                        <div className='text-sm'>
                          <p className='font-medium'>Tracking Number</p>
                          <p className='text-muted-foreground font-mono'>{log.delivery.trackingNumber}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className='flex justify-center pt-4'>
                  <Button variant='outline' onClick={onLoadMore} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
