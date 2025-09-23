'use client';

import { format } from 'date-fns';
import {
  Package,
  User,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building,
  Edit,
  CheckCircle,
  AlertCircle,
  Download,
  Plus,
  Paperclip,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Sheet, SheetContent } from '../../../components/ui/sheet';
import { DialogTitle } from '../../../components/ui/dialog';
import { DeliveryDetailSheetProps } from '../types';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_transit: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  collected: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
};

export function DeliveryDetailSheet({
  deliveryId,
  isOpen,
  onClose,
  onAssign,
  onCollect,
  onUpdateStatus,
}: DeliveryDetailSheetProps) {
  const delivery = useQuery(api.delivery.webGetDeliveryById, deliveryId ? { deliveryId } : 'skip');

  if (!delivery) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
    return <Badge className={colorClass}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const canAssign = delivery.status === 'pending';
  const canCollect = ['in_transit', 'delivered'].includes(delivery.status);
  const canUpdateStatus = true;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='px-0 overflow-y-auto'>
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className='sr-only'>Delivery Details</DialogTitle>

        {/* Header with actions */}
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Delivery / {delivery.status}</span>
          </div>
        </div>

        <div className='px-6 pb-6 space-y-6'>
          {/* Title */}
          <div>
            <h1 className='text-2xl font-bold text-foreground mb-2'>{delivery.deliveryType} Delivery</h1>
            <p className='text-muted-foreground'>{delivery.description}</p>
          </div>

          {/* Status */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Status</span>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <div className='w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-500'></div>
                {getStatusBadge(delivery.status)}
              </div>
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Estimated Delivery</span>
            </div>
            <div className='text-sm text-foreground'>
              {format(new Date(delivery.estimatedDelivery), 'MMM dd, yyyy HH:mm')}
            </div>
          </div>

          {/* Actual Delivery */}
          {delivery.actualDelivery && (
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <CheckCircle className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>Actual Delivery</span>
              </div>
              <div className='text-sm text-foreground'>
                {format(new Date(delivery.actualDelivery), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
          )}

          {/* Unit Assignment */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <MapPin className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Unit</span>
            </div>
            <div className='flex items-center gap-3'>
              {delivery.unit ? (
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center'>
                    <span className='text-xs font-medium text-blue-600'>{delivery.unit.unitNumber}</span>
                  </div>
                  <span className='text-sm font-medium text-foreground'>Unit {delivery.unit.unitNumber}</span>
                </div>
              ) : (
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center'>
                    <span className='text-xs text-gray-500'>?</span>
                  </div>
                  <span className='text-sm text-muted-foreground'>Not assigned</span>
                </div>
              )}
              {canAssign && (
                <Button variant='outline' size='sm' onClick={() => onAssign(delivery._id)}>
                  <Plus className='h-4 w-4 mr-1' />
                  Assign
                </Button>
              )}
            </div>
          </div>

          {/* Delivery Type & Location */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <Package className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Type & Location</span>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='secondary' className='flex items-center gap-1'>
                <div className='w-2 h-2 rounded-full bg-blue-500'></div>
                {delivery.deliveryType}
              </Badge>
              {delivery.deliveryLocation && <Badge variant='outline'>{delivery.deliveryLocation}</Badge>}
            </div>
          </div>

          {/* Description */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Package className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Description</span>
            </div>
            <div className='bg-sidebar rounded-lg p-4 max-h-32 overflow-y-auto'>
              <p className='text-sm text-foreground leading-relaxed'>{delivery.description}</p>
            </div>
          </div>

          {/* Tracking Number */}
          {delivery.trackingNumber && (
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <Package className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>Tracking Number</span>
              </div>
              <div className='text-sm font-mono text-foreground'>{delivery.trackingNumber}</div>
            </div>
          )}

          {/* Delivery Notes */}
          {delivery.deliveryNotes && (
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <AlertCircle className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>Delivery Notes</span>
              </div>
              <div className='bg-sidebar rounded-lg p-4'>
                <p className='text-sm text-foreground'>{delivery.deliveryNotes}</p>
              </div>
            </div>
          )}

          {/* Sender Information */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Building className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Sender</span>
            </div>
            <div className='bg-sidebar rounded-lg p-4'>
              <div className='space-y-2'>
                <p className='text-sm font-medium text-foreground'>{delivery.senderName}</p>
                {delivery.senderCompany && <p className='text-sm text-muted-foreground'>{delivery.senderCompany}</p>}
              </div>
            </div>
          </div>

          {/* Recipient Information */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Recipient</span>
            </div>
            <div className='bg-sidebar rounded-lg p-4'>
              <div className='space-y-2'>
                <p className='text-sm font-medium text-foreground'>{delivery.recipientName}</p>
                {delivery.recipientPhone && (
                  <div className='flex items-center gap-2'>
                    <Phone className='h-3 w-3 text-muted-foreground' />
                    <p className='text-sm text-muted-foreground'>{delivery.recipientPhone}</p>
                  </div>
                )}
                {delivery.recipientEmail && (
                  <div className='flex items-center gap-2'>
                    <Mail className='h-3 w-3 text-muted-foreground' />
                    <p className='text-sm text-muted-foreground'>{delivery.recipientEmail}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <MapPin className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Property</span>
            </div>
            <div className='bg-sidebar rounded-lg p-4'>
              <div className='space-y-1'>
                <p className='text-sm font-medium text-foreground'>{delivery.property.name}</p>
                <p className='text-sm text-muted-foreground'>{delivery.property.address}</p>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Paperclip className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>Photos {delivery.photos?.length || 0}</span>
              </div>
              {(delivery.photos?.length || 0) > 0 && (
                <Button variant='link' size='sm' className='p-0 h-auto'>
                  <Download className='h-4 w-4 mr-1' />
                  Download All
                </Button>
              )}
            </div>

            <div className='grid grid-cols-2 gap-3'>
              {delivery.photos && delivery.photos.length > 0 ? (
                delivery.photos.map((photo: string, index: number) => (
                  <div key={index} className='border rounded-lg p-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-blue-100 rounded flex items-center justify-center'>
                        <span className='text-xs font-medium text-blue-600'>IMG</span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-foreground truncate'>Photo {index + 1}.jpg</p>
                        <p className='text-xs text-muted-foreground'>2.5 MB</p>
                      </div>
                      <Button variant='link' size='sm' className='p-0 h-auto'>
                        <Download className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className='col-span-2 text-center py-8 text-muted-foreground'>
                  <Paperclip className='h-8 w-8 mx-auto mb-2 opacity-50' />
                  <p className='text-sm'>No photos</p>
                </div>
              )}

              {/* Add photo button */}
              <div className='border-2 border-dashed border-gray-200 rounded-lg p-3 flex items-center justify-center hover:border-gray-300 transition-colors cursor-pointer'>
                <Plus className='h-6 w-6 text-gray-400' />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap gap-2 pt-4 border-t'>
            {canCollect && (
              <Button onClick={() => onCollect(delivery._id)} className='flex items-center gap-2'>
                <CheckCircle className='w-4 h-4' />
                Mark as Collected
              </Button>
            )}
            {canUpdateStatus && (
              <Button
                variant='outline'
                onClick={() => onUpdateStatus(delivery._id)}
                className='flex items-center gap-2'
              >
                <Edit className='w-4 h-4' />
                Update Status
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
