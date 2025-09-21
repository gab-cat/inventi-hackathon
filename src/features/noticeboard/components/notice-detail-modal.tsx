'use client';

import { format } from 'date-fns';
import { Calendar, Clock, Download, Edit, MessageSquare, Trash2, Users, X } from 'lucide-react';
import { Id } from '../../../../convex/_generated/dataModel';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Separator } from '../../../components/ui/separator';
import { NoticeDetailProps } from '../types';

export function NoticeDetailModal({ notice, onEdit, onDelete, onClose }: NoticeDetailProps) {
  if (!notice) return null;

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <DialogTitle className='text-2xl'>{notice.title}</DialogTitle>
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
            <div className='flex items-center gap-2'>
              {onEdit && (
                <Button variant='outline' size='sm' onClick={onEdit}>
                  <Edit className='w-4 h-4 mr-2' />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant='outline' size='sm' onClick={onDelete}>
                  <Trash2 className='w-4 h-4 mr-2' />
                  Delete
                </Button>
              )}
              <Button variant='ghost' size='sm' onClick={onClose}>
                <X className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Content */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>Content</h3>
            <div className='prose max-w-none'>
              <p className='whitespace-pre-wrap'>{notice.content}</p>
            </div>
          </div>

          <Separator />

          {/* Attachments */}
          {notice.attachments && notice.attachments.length > 0 && (
            <div>
              <h3 className='text-lg font-semibold mb-2'>Attachments</h3>
              <div className='space-y-2'>
                {notice.attachments.map((attachment, index) => (
                  <div key={index} className='flex items-center gap-2 p-2 border rounded'>
                    <Download className='w-4 h-4' />
                    <span className='flex-1 truncate'>{attachment}</span>
                    <Button variant='outline' size='sm'>
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Details */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-lg font-semibold mb-3'>Notice Details</h3>
              <div className='space-y-3'>
                <div>
                  <span className='text-sm font-medium text-muted-foreground'>Property:</span>
                  <p className='font-medium'>{notice.property.name}</p>
                  <p className='text-sm text-muted-foreground'>{notice.property.address}</p>
                </div>

                {notice.unit && (
                  <div>
                    <span className='text-sm font-medium text-muted-foreground'>Target Unit:</span>
                    <p className='font-medium'>{notice.unit.unitNumber}</p>
                  </div>
                )}

                <div>
                  <span className='text-sm font-medium text-muted-foreground'>Target Audience:</span>
                  <p className='font-medium capitalize'>{notice.targetAudience.replace('_', ' ')}</p>
                </div>

                <div>
                  <span className='text-sm font-medium text-muted-foreground'>Created by:</span>
                  <p className='font-medium'>
                    {notice.creator.firstName} {notice.creator.lastName}
                  </p>
                  <p className='text-sm text-muted-foreground'>{notice.creator.email}</p>
                </div>

                <div>
                  <span className='text-sm font-medium text-muted-foreground'>Created:</span>
                  <p className='font-medium'>{formatDate(notice.createdAt)}</p>
                </div>

                {notice.scheduledAt && (
                  <div>
                    <span className='text-sm font-medium text-muted-foreground'>Scheduled for:</span>
                    <p className='font-medium'>{formatDate(notice.scheduledAt)}</p>
                  </div>
                )}

                {notice.expiresAt && (
                  <div>
                    <span className='text-sm font-medium text-muted-foreground'>Expires:</span>
                    <p className='font-medium'>{formatDate(notice.expiresAt)}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-3'>Target Units</h3>
              {notice.targetUnitsDetails && notice.targetUnitsDetails.length > 0 ? (
                <div className='space-y-2'>
                  {notice.targetUnitsDetails.map(unit => (
                    <div key={unit._id} className='p-3 border rounded'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>Unit {unit.unitNumber}</p>
                          {unit.tenant && (
                            <p className='text-sm text-muted-foreground'>
                              {unit.tenant.firstName} {unit.tenant.lastName}
                            </p>
                          )}
                        </div>
                        <Badge variant='outline'>{unit.tenant ? 'Occupied' : 'Vacant'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground'>No specific units targeted</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Acknowledgments */}
          <div>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-lg font-semibold flex items-center gap-2'>
                <MessageSquare className='w-5 h-5' />
                Acknowledgments ({notice.acknowledgments.length})
              </h3>
            </div>

            {notice.acknowledgments.length > 0 ? (
              <div className='space-y-2'>
                {notice.acknowledgments.map(ack => (
                  <div key={ack._id} className='flex items-center justify-between p-3 border rounded'>
                    <div>
                      <p className='font-medium'>
                        {ack.user.firstName} {ack.user.lastName}
                      </p>
                      <p className='text-sm text-muted-foreground'>{ack.user.email}</p>
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
      </DialogContent>
    </Dialog>
  );
}
