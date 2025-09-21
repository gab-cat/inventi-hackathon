'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { DialogTitle } from '@/components/ui/dialog';
import { NoticeWithFullDetails } from '../types';
import {
  Calendar,
  Clock,
  Download,
  Edit,
  FileText,
  MapPin,
  MessageSquare,
  Paperclip,
  Trash2,
  User,
  Users,
} from 'lucide-react';

interface NoticeDetailSheetProps {
  notice: NoticeWithFullDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (notice: NoticeWithFullDetails) => void;
  onDelete?: (noticeId: string) => void;
}

export function NoticeDetailSheet({ notice, isOpen, onClose, onEdit, onDelete }: NoticeDetailSheetProps) {
  if (!notice) return null;

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

  const isScheduled = notice.scheduledAt && notice.scheduledAt > Date.now();
  const isExpired = notice.expiresAt && notice.expiresAt < Date.now();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='px-0 overflow-y-auto'>
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className='sr-only'>{notice.title}</DialogTitle>

        {/* Header with actions */}
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Notice / {notice.noticeType.replace('_', ' ')}</span>
          </div>
          <div className='flex items-center gap-2'>
            {onEdit && (
              <Button variant='outline' size='sm' onClick={() => onEdit(notice)}>
                <Edit className='h-4 w-4 mr-1' />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant='outline' size='sm' onClick={() => onDelete(notice._id)}>
                <Trash2 className='h-4 w-4 mr-1' />
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className='px-6 pb-6 space-y-6'>
          {/* Title */}
          <div>
            <h1 className='text-2xl font-bold text-foreground mb-2'>{notice.title}</h1>
            <div className='flex items-center gap-2 flex-wrap'>
              <Badge variant={getPriorityColor(notice.priority)}>{notice.priority}</Badge>
              <Badge variant={getTypeColor(notice.noticeType)}>{notice.noticeType.replace('_', ' ')}</Badge>
              {isScheduled && (
                <Badge variant='outline'>
                  <Clock className='w-3 h-3 mr-1' />
                  Scheduled
                </Badge>
              )}
              {isExpired && <Badge variant='secondary'>Expired</Badge>}
            </div>
          </div>

          {/* Status */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <MessageSquare className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Status</span>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    notice.isActive ? 'bg-green-500 border-green-500' : 'bg-gray-400 border-gray-400'
                  }`}
                ></div>
                <span className='text-sm font-medium'>{notice.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Target Audience</span>
            </div>
            <div className='text-sm text-foreground capitalize'>{notice.targetAudience.replace('_', ' ')}</div>
          </div>

          {/* Scheduled/Expires */}
          {notice.scheduledAt && (
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>Scheduled for</span>
              </div>
              <div className='text-sm text-foreground'>{formatDate(notice.scheduledAt)}</div>
            </div>
          )}

          {notice.expiresAt && (
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>Expires</span>
              </div>
              <div className='text-sm text-foreground'>{formatDate(notice.expiresAt)}</div>
            </div>
          )}

          {/* Content */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <FileText className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Content</span>
            </div>
            <div className='bg-sidebar rounded-lg p-4 max-h-32 overflow-y-auto'>
              <p className='text-sm text-foreground leading-relaxed whitespace-pre-wrap'>{notice.content}</p>
            </div>
          </div>

          {/* Attachments */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Paperclip className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>
                  Attachments ({notice.attachments?.length || 0})
                </span>
              </div>
              {(notice.attachments?.length || 0) > 0 && (
                <Button variant='link' size='sm' className='p-0 h-auto'>
                  <Download className='h-4 w-4 mr-1' />
                  Download All
                </Button>
              )}
            </div>

            <div className='grid grid-cols-1 gap-3'>
              {notice.attachments && notice.attachments.length > 0 ? (
                notice.attachments.map((attachment, index) => (
                  <div key={index} className='border rounded-lg p-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-red-100 rounded flex items-center justify-center'>
                        <span className='text-xs font-medium text-red-600'>PDF</span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-foreground truncate'>{attachment}</p>
                        <p className='text-xs text-muted-foreground'>2.5 MB</p>
                      </div>
                      <Button variant='link' size='sm' className='p-0 h-auto'>
                        <Download className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  <Paperclip className='h-8 w-8 mx-auto mb-2 opacity-50' />
                  <p className='text-sm'>No attachments</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className='space-y-4 pt-4 border-t'>
            {/* Location */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <MapPin className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>Property</span>
              </div>
              <p className='text-sm text-foreground'>{notice.property.name}</p>
              <p className='text-sm text-muted-foreground'>{notice.property.address}</p>
              {notice.unit && <p className='text-sm text-muted-foreground'>Unit {notice.unit.unitNumber}</p>}
            </div>

            {/* Creator */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <User className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>Created by</span>
              </div>
              <div className='flex items-center gap-3'>
                <Avatar className='w-6 h-6'>
                  <AvatarFallback
                    className={`text-xs text-white ${getRandomColor(
                      `${notice.creator.firstName} ${notice.creator.lastName}`
                    )}`}
                  >
                    {getInitials(`${notice.creator.firstName} ${notice.creator.lastName}`)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='text-sm font-medium text-foreground'>
                    {notice.creator.firstName} {notice.creator.lastName}
                  </p>
                  <p className='text-xs text-muted-foreground'>{notice.creator.email}</p>
                </div>
              </div>
            </div>

            {/* Target Units */}
            {notice.targetUnitsDetails && notice.targetUnitsDetails.length > 0 && (
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium text-muted-foreground'>Target Units</span>
                </div>
                <div className='space-y-2'>
                  {notice.targetUnitsDetails.map(unit => (
                    <div key={unit._id} className='p-3 border rounded'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium'>Unit {unit.unitNumber}</p>
                          {unit.tenant && (
                            <p className='text-xs text-muted-foreground'>
                              {unit.tenant.firstName} {unit.tenant.lastName}
                            </p>
                          )}
                        </div>
                        <Badge variant='outline'>{unit.tenant ? 'Occupied' : 'Vacant'}</Badge>
                      </div>
                    </div>
                  ))}
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
                  <span>{formatDate(notice.createdAt)}</span>
                </div>
                {notice.updatedAt && notice.updatedAt !== notice.createdAt && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Updated:</span>
                    <span>{formatDate(notice.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acknowledgments */}
          <div className='space-y-4 pt-6 border-t'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold flex items-center gap-2'>
                <MessageSquare className='w-5 h-5' />
                Acknowledgments ({notice.acknowledgments.length})
              </h3>
            </div>

            {notice.acknowledgments.length > 0 ? (
              <div className='space-y-2'>
                {notice.acknowledgments.map(ack => (
                  <div key={ack._id} className='flex items-center justify-between p-3 border rounded'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='w-6 h-6'>
                        <AvatarFallback
                          className={`text-xs text-white ${getRandomColor(
                            `${ack.user.firstName} ${ack.user.lastName}`
                          )}`}
                        >
                          {getInitials(`${ack.user.firstName} ${ack.user.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='text-sm font-medium text-foreground'>
                          {ack.user.firstName} {ack.user.lastName}
                        </p>
                        <p className='text-xs text-muted-foreground'>{ack.user.email}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium'>{formatDate(ack.acknowledgedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground'>No acknowledgments yet</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
