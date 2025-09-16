'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { X, MapPin, User, DollarSign, Clock, FileText, Image } from 'lucide-react';
import { MaintenanceRequest } from '../types';

interface MaintenanceDetailModalProps {
  request: MaintenanceRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign?: (requestId: string) => void;
  onStatusChange?: (requestId: string, newStatus: string) => void;
}

export function MaintenanceDetailModal({
  request,
  isOpen,
  onClose,
  onAssign,
  onStatusChange,
}: MaintenanceDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  if (!isOpen || !request) return null;

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name?: string) => {
    if (!name) return 'bg-gray-500';

    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusUpdate = () => {
    if (selectedStatus && onStatusChange) {
      onStatusChange(request._id, selectedStatus);
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4'>
      <div className='bg-background border rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 sm:p-6 border-b'>
          <div className='min-w-0 flex-1'>
            <h2 className='text-lg sm:text-2xl font-bold text-foreground truncate'>{request.title}</h2>
            <p className='text-sm sm:text-base text-muted-foreground'>Request #{request._id.slice(-8)}</p>
          </div>
          <Button variant='ghost' size='sm' onClick={onClose} className='flex-shrink-0 ml-2'>
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='p-4 sm:p-6 space-y-4 sm:space-y-6'>
          {/* Status and Priority */}
          <div className='flex flex-wrap items-center gap-2 sm:gap-4'>
            <div className='flex items-center gap-2'>
              <span className='text-xs sm:text-sm font-medium text-muted-foreground'>Status:</span>
              <StatusBadge
                status={
                  request.status as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
                }
              />
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-xs sm:text-sm font-medium text-muted-foreground'>Priority:</span>
              <PriorityBadge priority={request.priority as 'low' | 'medium' | 'high' | 'emergency'} />
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-xs sm:text-sm font-medium text-muted-foreground'>Type:</span>
              <Badge variant='outline'>{request.requestType}</Badge>
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-4 w-4' />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-foreground'>{request.description}</p>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4' />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-foreground'>{request.location}</p>
                {request.unitNumber && <p className='text-sm text-muted-foreground mt-1'>Unit {request.unitNumber}</p>}
              </CardContent>
            </Card>

            {/* Tenant */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-4 w-4' />
                  Tenant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-3'>
                  <Avatar className='w-8 h-8'>
                    <AvatarFallback className={`text-xs text-white ${getRandomColor(request.tenantName)}`}>
                      {getInitials(request.tenantName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium text-foreground'>{request.tenantName || 'Unknown'}</p>
                    {request.tenantEmail && <p className='text-sm text-muted-foreground'>{request.tenantEmail}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assigned Technician */}
            {request.assignedTo && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    Assigned Technician
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-3'>
                    <Avatar className='w-8 h-8'>
                      <AvatarFallback
                        className={`text-xs text-white ${getRandomColor(request.assignedTechnicianName)}`}
                      >
                        {getInitials(request.assignedTechnicianName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-medium text-foreground'>{request.assignedTechnicianName || 'Unknown'}</p>
                      {request.assignedTechnicianEmail && (
                        <p className='text-sm text-muted-foreground'>{request.assignedTechnicianEmail}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cost Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <DollarSign className='h-4 w-4' />
                  Cost Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {request.estimatedCost && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Estimated:</span>
                      <span className='font-medium text-foreground'>${request.estimatedCost}</span>
                    </div>
                  )}
                  {request.actualCost && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Actual:</span>
                      <span className='font-medium text-foreground'>${request.actualCost}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Created:</span>
                  <span className='text-foreground'>{formatDate(request.createdAt)}</span>
                </div>
                {request.assignedAt && (
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Assigned:</span>
                    <span className='text-foreground'>{formatDate(request.assignedAt)}</span>
                  </div>
                )}
                {request.estimatedCompletion && (
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Estimated Completion:</span>
                    <span className='text-foreground'>{formatDate(request.estimatedCompletion)}</span>
                  </div>
                )}
                {request.actualCompletion && (
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Actual Completion:</span>
                    <span className='text-foreground'>{formatDate(request.actualCompletion)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          {request.photos && request.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Image className='h-4 w-4' />
                  Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                  {request.photos.map((photo, index) => (
                    <div key={index} className='aspect-square bg-muted rounded-lg flex items-center justify-center'>
                      <span className='text-muted-foreground text-sm'>Photo {index + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 sm:pt-6 border-t'>
            <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
              {onAssign && !request.assignedTo && (
                <Button onClick={() => onAssign(request._id)} className='w-full sm:w-auto'>
                  Assign Technician
                </Button>
              )}

              {onStatusChange && (
                <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2'>
                  <select
                    className='flex h-10 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                  >
                    <option value=''>Change Status</option>
                    <option value='pending'>Pending</option>
                    <option value='assigned'>Assigned</option>
                    <option value='in_progress'>In Progress</option>
                    <option value='completed'>Completed</option>
                    <option value='cancelled'>Cancelled</option>
                    <option value='rejected'>Rejected</option>
                  </select>
                  <Button
                    variant='outline'
                    onClick={handleStatusUpdate}
                    disabled={!selectedStatus}
                    className='w-full sm:w-auto'
                  >
                    Update
                  </Button>
                </div>
              )}
            </div>

            <Button variant='outline' onClick={onClose} className='w-full sm:w-auto'>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
