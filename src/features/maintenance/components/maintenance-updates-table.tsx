'use client';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MaintenanceUpdate } from '../types';
import { Clock, User, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MaintenanceUpdatesTableProps {
  updates: MaintenanceUpdate[];
  isLoading?: boolean;
  onUpdateClick?: (update: MaintenanceUpdate) => void;
}

export function MaintenanceUpdatesTable({ updates, isLoading, onUpdateClick }: MaintenanceUpdatesTableProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className='border rounded-lg p-4 animate-pulse'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-gray-200 rounded-full'></div>
                <div className='space-y-1'>
                  <div className='h-4 bg-gray-200 rounded w-32'></div>
                  <div className='h-3 bg-gray-200 rounded w-24'></div>
                </div>
              </div>
              <div className='h-6 bg-gray-200 rounded w-20'></div>
            </div>
            <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
            <div className='h-3 bg-gray-200 rounded w-1/2'></div>
          </div>
        ))}
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className='text-center py-12 text-muted-foreground'>
        <Clock className='h-12 w-12 mx-auto mb-4 opacity-50' />
        <h3 className='text-lg font-medium mb-2'>No status updates found</h3>
        <p className='text-sm'>There are no maintenance status updates to display.</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {updates.map(update => (
        <div key={update._id} className='border rounded-lg p-4 hover:bg-muted/50 transition-colors'>
          <div className='flex items-start justify-between mb-3'>
            <div className='flex items-center gap-3'>
              <Avatar className='w-8 h-8'>
                <AvatarFallback className={`text-xs text-white ${getRandomColor(update.updatedByName)}`}>
                  {getInitials(update.updatedByName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='text-sm font-medium text-foreground'>{update.updatedByName || 'Unknown User'}</span>
                  <Badge variant='outline' className={`text-xs ${getStatusColor(update.status)}`}>
                    {update.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Clock className='h-3 w-3' />
                  <span>{formatDate(update.timestamp)}</span>
                </div>
              </div>
            </div>
            {onUpdateClick && (
              <Button variant='ghost' size='sm' onClick={() => onUpdateClick(update)} className='h-8 w-8 p-0'>
                <ExternalLink className='h-4 w-4' />
              </Button>
            )}
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-foreground'>{update.description}</p>

            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
              {update.requestTitle && (
                <div className='flex items-center gap-1'>
                  <span>Request:</span>
                  <span className='font-medium'>{update.requestTitle}</span>
                </div>
              )}
              {update.propertyName && (
                <div className='flex items-center gap-1'>
                  <span>Property:</span>
                  <span className='font-medium'>{update.propertyName}</span>
                </div>
              )}
              {update.photos && update.photos.length > 0 && (
                <div className='flex items-center gap-1'>
                  <FileText className='h-3 w-3' />
                  <span>{update.photos.length} photo(s)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
