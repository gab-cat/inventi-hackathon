'use client';

import { format } from 'date-fns';
import { Calendar, Clock, Eye, MessageSquare, MoreHorizontal, Users } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { NoticeCardProps } from '../types';

export function NoticeCard({ notice, onEdit, onDelete, onView, onAcknowledge }: NoticeCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'destructive';
      case 'maintenance':
        return 'default';
      case 'payment_reminder':
        return 'secondary';
      case 'event':
        return 'default';
      case 'announcement':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
  };

  const isScheduled = notice.scheduledAt && notice.scheduledAt > Date.now();
  const isExpired = notice.expiresAt && notice.expiresAt < Date.now();

  return (
    <Card className='hover:shadow-md py-3 gap-2 transition-shadow'>
      <CardHeader className=''>
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <CardTitle className='text-lg line-clamp-2'>{notice.title}</CardTitle>
            <div className='flex items-center gap-2 flex-wrap'>
              <Badge variant={getPriorityColor(notice.priority)} className='text-xs'>
                {notice.priority}
              </Badge>
              <Badge variant={getTypeColor(notice.noticeType)} className='text-xs'>
                {notice.noticeType.replace('_', ' ')}
              </Badge>
              {isScheduled && (
                <Badge variant='outline' className='text-xs'>
                  <Clock className='w-3 h-3 mr-1' />
                  Scheduled
                </Badge>
              )}
              {isExpired && (
                <Badge variant='secondary' className='text-xs'>
                  Expired
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm'>
                <MoreHorizontal className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {onView && (
                <DropdownMenuItem onClick={() => onView(notice)}>
                  <Eye className='w-4 h-4 mr-2' />
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && <DropdownMenuItem onClick={() => onEdit(notice)}>Edit Notice</DropdownMenuItem>}
              {onAcknowledge && (
                <DropdownMenuItem onClick={() => onAcknowledge(notice._id)}>
                  <MessageSquare className='w-4 h-4 mr-2' />
                  Acknowledge
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(notice._id)}
                  className='text-destructive focus:text-destructive'
                >
                  Delete Notice
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        <p className='text-sm text-muted-foreground line-clamp-3'>{notice.content}</p>

        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1'>
              <Users className='w-3 h-3' />
              <span>
                {notice.acknowledgmentCount}/{notice.totalTargetUsers}
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <Calendar className='w-3 h-3' />
              <span>{formatDate(notice.createdAt)}</span>
            </div>
          </div>
          <div className='text-right'>
            <div className='font-medium'>
              {notice.creator.firstName} {notice.creator.lastName}
            </div>
            <div>{notice.property.name}</div>
          </div>
        </div>

        {notice.unit && <div className='text-xs text-muted-foreground'>Target Unit: {notice.unit.unitNumber}</div>}

        {notice.scheduledAt && (
          <div className='text-xs text-muted-foreground'>Scheduled for: {formatDate(notice.scheduledAt)}</div>
        )}

        {notice.expiresAt && (
          <div className='text-xs text-muted-foreground'>Expires: {formatDate(notice.expiresAt)}</div>
        )}
      </CardContent>
    </Card>
  );
}
