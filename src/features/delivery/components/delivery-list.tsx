'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Package, Eye, User, Clock, MapPin, MoreHorizontal, Edit } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { DeliveryListProps } from '../types';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_transit: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  collected: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
};

const deliveryTypeIcons = {
  package: Package,
  food: Package,
  grocery: Package,
  mail: Package,
  other: Package,
};

export function DeliveryList({
  deliveries,
  isLoading,
  onLoadMore,
  hasMore,
  onDeliveryAction,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: DeliveryListProps) {
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
    return <Badge className={colorClass}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const getDeliveryTypeIcon = (type: string) => {
    const IconComponent = deliveryTypeIcons[type as keyof typeof deliveryTypeIcons] || Package;
    return <IconComponent className='w-4 h-4' />;
  };

  if (isLoading && deliveries.length === 0) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center py-8'>
            <div className='text-center space-y-2'>
              <div className='w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin' />
              <p className='text-sm text-muted-foreground'>Loading deliveries...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (deliveries.length === 0) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center py-12'>
            <div className='text-center space-y-4'>
              <div className='w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center'>
                <Package className='w-8 h-8 text-muted-foreground' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-muted-foreground'>No deliveries found</h3>
                <p className='text-sm text-muted-foreground'>
                  No deliveries match your current filters. Try adjusting your search criteria.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Package className='w-5 h-5' />
          Deliveries ({totalItems})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* Desktop Table View */}
          <div className='hidden md:block'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Estimated Delivery</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className='w-[50px]'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map(delivery => (
                  <TableRow key={delivery._id}>
                    <TableCell>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2'>
                          {getDeliveryTypeIcon(delivery.deliveryType)}
                          <span className='font-medium'>{delivery.deliveryType}</span>
                        </div>
                        <p className='text-sm text-muted-foreground'>{delivery.description}</p>
                        {delivery.trackingNumber && (
                          <p className='text-xs text-muted-foreground'>Tracking: {delivery.trackingNumber}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='space-y-1'>
                        <p className='font-medium'>{delivery.recipientName}</p>
                        <p className='text-sm text-muted-foreground'>{delivery.senderName}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1 text-sm'>
                        <Clock className='w-3 h-3' />
                        {format(new Date(delivery.estimatedDelivery), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {delivery.unit ? (
                        <div className='flex items-center gap-1 text-sm'>
                          <MapPin className='w-3 h-3' />
                          Unit {delivery.unit.unitNumber}
                        </div>
                      ) : (
                        <span className='text-sm text-muted-foreground'>Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreHorizontal className='w-4 h-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => onDeliveryAction('view', delivery)}>
                            <Eye className='w-4 h-4 mr-2' />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeliveryAction('edit', delivery)}>
                            <Edit className='w-4 h-4 mr-2' />
                            Edit Delivery
                          </DropdownMenuItem>
                          {delivery.status === 'pending' && (
                            <DropdownMenuItem onClick={() => onDeliveryAction('assign', delivery)}>
                              <User className='w-4 h-4 mr-2' />
                              Assign to Unit
                            </DropdownMenuItem>
                          )}
                          {['in_transit', 'delivered'].includes(delivery.status) && (
                            <DropdownMenuItem onClick={() => onDeliveryAction('collect', delivery)}>
                              <Package className='w-4 h-4 mr-2' />
                              Mark as Collected
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onDeliveryAction('update_status', delivery)}>
                            <Clock className='w-4 h-4 mr-2' />
                            Update Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className='md:hidden space-y-4'>
            {deliveries.map(delivery => (
              <Card key={delivery._id} className='p-4'>
                <div className='space-y-3'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        {getDeliveryTypeIcon(delivery.deliveryType)}
                        <span className='font-medium'>{delivery.deliveryType}</span>
                      </div>
                      <p className='text-sm text-muted-foreground'>{delivery.description}</p>
                    </div>
                    {getStatusBadge(delivery.status)}
                  </div>

                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='font-medium'>Recipient</p>
                      <p className='text-muted-foreground'>{delivery.recipientName}</p>
                    </div>
                    <div>
                      <p className='font-medium'>Sender</p>
                      <p className='text-muted-foreground'>{delivery.senderName}</p>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='font-medium'>Estimated Delivery</p>
                      <p className='text-muted-foreground'>
                        {format(new Date(delivery.estimatedDelivery), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                    <div>
                      <p className='font-medium'>Unit</p>
                      <p className='text-muted-foreground'>
                        {delivery.unit ? `Unit ${delivery.unit.unitNumber}` : 'Not assigned'}
                      </p>
                    </div>
                  </div>

                  {delivery.trackingNumber && (
                    <div className='text-sm'>
                      <p className='font-medium'>Tracking Number</p>
                      <p className='text-muted-foreground'>{delivery.trackingNumber}</p>
                    </div>
                  )}

                  <div className='flex gap-2 pt-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onDeliveryAction('view', delivery)}
                      className='flex-1'
                    >
                      <Eye className='w-4 h-4 mr-1' />
                      View
                    </Button>
                    {delivery.status === 'pending' && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => onDeliveryAction('assign', delivery)}
                        className='flex-1'
                      >
                        <User className='w-4 h-4 mr-1' />
                        Assign
                      </Button>
                    )}
                    {['in_transit', 'delivered'].includes(delivery.status) && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => onDeliveryAction('collect', delivery)}
                        className='flex-1'
                      >
                        <Package className='w-4 h-4 mr-1' />
                        Collect
                      </Button>
                    )}
                  </div>
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
      </CardContent>
    </Card>
  );
}
