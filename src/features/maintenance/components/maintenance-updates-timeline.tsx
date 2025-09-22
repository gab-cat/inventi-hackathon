'use client';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MaintenanceUpdate } from '../types';
import { Clock, User, FileText } from 'lucide-react';
import { useGetUserById } from '@/features/user/hooks/useGetUserById';

interface MaintenanceUpdatesTimelineProps {
  updates: MaintenanceUpdate[];
  isLoading?: boolean;
}

interface UpdateItemProps {
  update: MaintenanceUpdate;
  isLast: boolean;
}

function UpdateItem({ update, isLast }: UpdateItemProps) {
  const { user, isLoading: userLoading } = useGetUserById(update.updatedBy);

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

  const displayName =
    user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : update.updatedByName || 'Unknown User';

  return (
    <div className='flex gap-3'>
      {/* Timeline line */}
      <div className='flex flex-col items-center'>
        <Avatar className='w-8 h-8'>
          <AvatarImage src={user?.profileImage} />
          <AvatarFallback className={`text-xs text-white ${getRandomColor(displayName)}`}>
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        {!isLast && <div className='w-px h-8 bg-border mt-2'></div>}
      </div>

      {/* Content */}
      <div className='flex-1 space-y-2'>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge variant='outline' className={`text-xs ${getStatusColor(update.status)}`}>
            {update.status.replace('_', ' ')}
          </Badge>
          <span className='text-xs text-muted-foreground'>{formatDate(update.timestamp)}</span>
        </div>

        <div className='space-y-1'>
          <p className='text-sm text-foreground'>{update.description}</p>
          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
            <User className='h-3 w-3' />
            <span>by {displayName}</span>
            {user?.email && <span className='text-muted-foreground/70'>• {user.email}</span>}
          </div>
        </div>

        {update.photos && update.photos.length > 0 && (
          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
            <FileText className='h-3 w-3' />
            <span>{update.photos.length} photo(s) attached</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function MaintenanceUpdatesTimeline({ updates, isLoading }: MaintenanceUpdatesTimelineProps) {
  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Clock className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium text-muted-foreground'>Status Updates</span>
        </div>
        <div className='space-y-3'>
          {[1, 2, 3].map(i => (
            <div key={i} className='flex gap-3 animate-pulse'>
              <div className='w-8 h-8 bg-gray-200 rounded-full'></div>
              <div className='flex-1 space-y-2'>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                <div className='h-3 bg-gray-200 rounded w-1/2'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Clock className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium text-muted-foreground'>Status Updates</span>
        </div>
        <div className='text-center py-8 text-muted-foreground'>
          <Clock className='h-8 w-8 mx-auto mb-2 opacity-50' />
          <p className='text-sm'>No status updates yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Clock className='h-4 w-4 text-muted-foreground' />
        <span className='text-sm font-medium text-muted-foreground'>Status Updates</span>
      </div>

      <div className='space-y-4'>
        {updates.map((update, index) => (
          <UpdateItem key={update._id} update={update} isLast={index === updates.length - 1} />
        ))}
      </div>
    </div>
  );
}
