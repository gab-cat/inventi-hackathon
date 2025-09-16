'use client';

import { MaintenanceRequest } from '../types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, UserPlus } from 'lucide-react';

interface KanbanCardProps {
  request: MaintenanceRequest;
  onAssign: (requestId: string) => void;
  onViewDetails: (requestId: string) => void;
  onStatusChange?: (requestId: string, newStatus: string) => void;
}

export function KanbanCard({ request, onAssign, onViewDetails, onStatusChange }: KanbanCardProps) {
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

    // Generate a consistent color based on the name
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

    // Use the name to consistently pick a color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'emergency':
        return 'bg-red-500';
      case 'medium':
        return 'bg-blue-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'emergency':
        return 'bg-red-50 text-red-700';
      case 'medium':
        return 'bg-blue-50 text-blue-700';
      case 'low':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', request._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger click if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onViewDetails(request._id);
  };

  return (
    <Card
      className='hover:shadow-md py-0 transition-shadow cursor-pointer rounded-md'
      draggable
      onDragStart={handleDragStart}
      onClick={handleCardClick}
    >
      <CardContent className='p-3'>
        {/* Request ID and Type */}
        <div className='flex items-center justify-between mb-2'>
          <span className='text-xs sm:text-xs font-medium uppercase text-muted-foreground'>
            #{request._id.slice(-6)}
          </span>
          <span className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded'>{request.requestType}</span>
        </div>

        {/* Title */}
        <h4 className='font-semibold text-foreground mb-2 line-clamp-2 text-sm sm:text-base'>{request.title}</h4>

        {/* Apartment Type */}
        <div className='text-xs sm:text-sm text-muted-foreground mb-3'>
          {request.unitNumber ? `Unit ${request.unitNumber}` : 'General'}
        </div>

        {/* Priority */}
        <div>
          <div
            className={`flex w-fit rounded-full px-2 items-center gap-1 font-medium ${getPriorityBgColor(request.priority)}`}
          >
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(request.priority)}`} />
            <span className={`text-xs  font-medium capitalize px-2 py-1 rounded-full`}>{request.priority}</span>
          </div>
        </div>

        {/* Assigned Person */}
        <div className='flex items-center justify-between border-t pt-2 mt-2'>
          <div className='flex items-center gap-2 min-w-0 flex-1'>
            <Avatar className='w-5 h-5 sm:w-8 sm:h-8 flex-shrink-0'>
              <AvatarFallback
                className={`text-xs text-white ${getRandomColor(request.assignedTechnicianName || request.tenantName)}`}
              >
                {getInitials(request.assignedTechnicianName || request.tenantName)}
              </AvatarFallback>
            </Avatar>
            <span className='text-xs sm:text-sm font-medium text-foreground truncate'>
              {request.assignedTechnicianName || request.tenantName || 'Unassigned'}
            </span>
          </div>
          <div className='flex items-center gap-1 flex-shrink-0'>
            {!request.assignedTo && (
              <Button
                variant='ghost'
                size='sm'
                className='h-5 w-5 sm:h-6 sm:w-6 p-0'
                onClick={() => onAssign(request._id)}
              >
                <UserPlus className='h-3 w-3' />
              </Button>
            )}
            <Button
              variant='ghost'
              size='sm'
              className='h-5 w-5 sm:h-6 sm:w-6 p-0'
              onClick={() => onViewDetails(request._id)}
            >
              <MessageSquare className='h-3 w-3' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
