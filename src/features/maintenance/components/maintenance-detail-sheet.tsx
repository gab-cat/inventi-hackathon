'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { DialogTitle } from '@/components/ui/dialog';
import { MaintenanceRequest } from '../types';
import { PriorityBadge } from './priority-badge';
import {
  MapPin,
  User,
  DollarSign,
  Clock,
  FileText,
  Calendar,
  Download,
  Plus,
  Paperclip,
  Tag,
  CheckCircle,
} from 'lucide-react';

interface MaintenanceDetailSheetProps {
  request: MaintenanceRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign?: (requestId: string) => void;
  onStatusChange?: (requestId: string, newStatus: string) => void;
}

export function MaintenanceDetailSheet({
  request,
  isOpen,
  onClose,
  onAssign,
  onStatusChange,
}: MaintenanceDetailSheetProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  if (!request) return null;

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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='px-0 overflow-y-auto'>
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className='sr-only'>{request.title}</DialogTitle>

        {/* Header with actions */}
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Maintenance Request / {request.status}</span>
          </div>
        </div>

        <div className='px-6 pb-6 space-y-6'>
          {/* Title */}
          <div>
            <h1 className='text-2xl font-bold text-foreground mb-2'>{request.title}</h1>
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
                <span className='text-sm font-medium capitalize'>{request.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Due date</span>
            </div>
            <div className='text-sm text-foreground'>
              {request.estimatedCompletion ? formatDate(request.estimatedCompletion) : 'Not set'}
            </div>
          </div>

          {/* Assignee */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Assignee</span>
            </div>
            <div className='flex items-center gap-3'>
              {request.assignedTo && request.assignedTechnicianName ? (
                <div className='flex items-center gap-3'>
                  <Avatar className='w-8 h-8'>
                    <AvatarFallback className={`text-xs text-white ${getRandomColor(request.assignedTechnicianName)}`}>
                      {getInitials(request.assignedTechnicianName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className='text-sm font-medium text-foreground'>{request.assignedTechnicianName}</span>
                </div>
              ) : (
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center'>
                    <span className='text-xs text-gray-500'>?</span>
                  </div>
                  <span className='text-sm text-muted-foreground'>Unassigned</span>
                </div>
              )}
              <Button variant='outline' size='sm' className='ml-auto'>
                <Plus className='h-4 w-4 mr-1' />
                Invite
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <Tag className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Tags</span>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='secondary' className='flex items-center gap-1'>
                <div className='w-2 h-2 rounded-full bg-blue-500'></div>
                {request.requestType}
              </Badge>
              <PriorityBadge priority={request.priority as 'low' | 'medium' | 'high' | 'emergency'} />
            </div>
          </div>

          {/* Description */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <FileText className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Description</span>
            </div>
            <div className='bg-sidebar rounded-lg p-4 max-h-32 overflow-y-auto'>
              <p className='text-sm text-foreground leading-relaxed'>{request.description}</p>
            </div>
          </div>

          {/* Attachments */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Paperclip className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>
                  Attachment {request.photos?.length || 0}
                </span>
              </div>
              {(request.photos?.length || 0) > 0 && (
                <Button variant='link' size='sm' className='p-0 h-auto'>
                  <Download className='h-4 w-4 mr-1' />
                  Download All
                </Button>
              )}
            </div>

            <div className='grid grid-cols-2 gap-3'>
              {request.photos && request.photos.length > 0 ? (
                request.photos.map((photo, index) => (
                  <div key={index} className='border rounded-lg p-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-red-100 rounded flex items-center justify-center'>
                        <span className='text-xs font-medium text-red-600'>PDF</span>
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
                  <p className='text-sm'>No attachments</p>
                </div>
              )}

              {/* Add attachment button */}
              <div className='border-2 border-dashed border-gray-200 rounded-lg p-3 flex items-center justify-center hover:border-gray-300 transition-colors cursor-pointer'>
                <Plus className='h-6 w-6 text-gray-400' />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className='space-y-4 pt-4 border-t'>
            {/* Location */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <MapPin className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>Location</span>
              </div>
              <p className='text-sm text-foreground'>{request.location}</p>
              {request.unitNumber && <p className='text-sm text-muted-foreground'>Unit {request.unitNumber}</p>}
            </div>

            {/* Tenant */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <User className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>Requested by</span>
              </div>
              <div className='flex items-center gap-3'>
                <Avatar className='w-6 h-6'>
                  <AvatarFallback className={`text-xs text-white ${getRandomColor(request.tenantName)}`}>
                    {getInitials(request.tenantName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='text-sm font-medium text-foreground'>{request.tenantName || 'Unknown'}</p>
                  {request.tenantEmail && <p className='text-xs text-muted-foreground'>{request.tenantEmail}</p>}
                </div>
              </div>
            </div>

            {/* Cost Information */}
            {(request.estimatedCost || request.actualCost) && (
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <DollarSign className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium text-muted-foreground'>Cost</span>
                </div>
                <div className='space-y-1'>
                  {request.estimatedCost && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Estimated:</span>
                      <span className='font-medium'>${request.estimatedCost}</span>
                    </div>
                  )}
                  {request.actualCost && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Actual:</span>
                      <span className='font-medium'>${request.actualCost}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>Timeline</span>
              </div>
              <div className='space-y-1'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Created:</span>
                  <span>{formatDate(request.createdAt)}</span>
                </div>
                {request.assignedAt && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Assigned:</span>
                    <span>{formatDate(request.assignedAt)}</span>
                  </div>
                )}
                {request.actualCompletion && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Completed:</span>
                    <span>{formatDate(request.actualCompletion)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='space-y-4 pt-6 border-t'>
            {onAssign && !request.assignedTo && (
              <Button onClick={() => onAssign(request._id)} className='w-full'>
                Assign Technician
              </Button>
            )}

            {onStatusChange && (
              <div className='space-y-3'>
                <label className='text-sm text-foreground'>Change Status</label>
                <div className='flex gap-2'>
                  <select
                    className='flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                  >
                    <option value=''>Select status...</option>
                    <option value='pending'>Pending</option>
                    <option value='assigned'>Assigned</option>
                    <option value='in_progress'>In Progress</option>
                    <option value='completed'>Completed</option>
                    <option value='cancelled'>Cancelled</option>
                    <option value='rejected'>Rejected</option>
                  </select>
                  <Button variant='outline' onClick={handleStatusUpdate} disabled={!selectedStatus}>
                    Update
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
