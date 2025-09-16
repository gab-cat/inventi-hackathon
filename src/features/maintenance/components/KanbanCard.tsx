'use client';

import { MaintenanceRequest } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', request._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className='bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
      draggable
      onDragStart={handleDragStart}
    >
      {/* Request ID and Type */}
      <div className='flex items-center justify-between mb-2'>
        <span className='text-sm font-medium text-gray-600'>#{request._id.slice(-6)}</span>
        <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>{request.requestType}</span>
      </div>

      {/* Title */}
      <h4 className='font-semibold text-gray-900 mb-2 line-clamp-2'>{request.title}</h4>

      {/* Apartment Type */}
      <div className='text-sm text-gray-600 mb-3'>{request.unitNumber ? `Unit ${request.unitNumber}` : 'General'}</div>

      {/* Priority */}
      <div className='flex items-center gap-2 mb-3'>
        <div className={`w-2 h-2 rounded-full ${getPriorityColor(request.priority)}`} />
        <span className='text-sm font-medium capitalize'>{request.priority}</span>
      </div>

      {/* Assigned Person */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Avatar className='w-6 h-6'>
            <AvatarFallback className={`text-xs text-white ${getRandomColor(request.tenantName)}`}>
              {getInitials(request.tenantName)}
            </AvatarFallback>
          </Avatar>
          <span className='text-sm font-medium text-gray-700'>{request.tenantName || 'Unassigned'}</span>
        </div>
        <div className='flex items-center gap-1'>
          <Button variant='ghost' size='sm' className='h-6 w-6 p-0' onClick={() => onAssign(request._id)}>
            <UserPlus className='h-3 w-3' />
          </Button>
          <Button variant='ghost' size='sm' className='h-6 w-6 p-0' onClick={() => onViewDetails(request._id)}>
            <MessageSquare className='h-3 w-3' />
          </Button>
        </div>
      </div>
    </div>
  );
}
