'use client';

import { format } from 'date-fns';
import { Clock, Eye, MessageSquare, MoreHorizontal, Users, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NoticePagination } from './notice-pagination';
import { NoticeWithDetails } from '../types';
import { UserAvatar } from '@/components/custom/user-avatar';

interface NoticeTableProps {
  notices: NoticeWithDetails[];
  isLoading?: boolean;
  onNoticeAction?: (action: 'view' | 'edit' | 'delete' | 'acknowledge', notice: NoticeWithDetails) => void;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  onPageChange?: (page: number) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onFirstPage?: () => void;
  onLastPage?: () => void;
  itemsPerPage?: number;
  totalItems?: number;
}

type SortField = 'title' | 'priority' | 'noticeType' | 'createdAt' | 'creator' | 'property';
type SortDirection = 'asc' | 'desc';

export function NoticeTable({
  notices,
  isLoading,
  onNoticeAction,
  currentPage = 1,
  totalPages = 1,
  hasNextPage = false,
  hasPreviousPage = false,
  onPageChange = () => {},
  onNextPage = () => {},
  onPreviousPage = () => {},
  onFirstPage = () => {},
  onLastPage = () => {},
  itemsPerPage = 10,
  totalItems = 0,
}: NoticeTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200/80';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200/80';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200/80';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200/80';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200/80';
    }
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200/80';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200/80';
      case 'payment_reminder':
        return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200/80';
      case 'event':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200/80';
      case 'announcement':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200/80';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200/80';
    }
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM dd, yyyy');
  };

  const formatDateTime = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className='w-4 h-4' />;
    }
    return sortDirection === 'asc' ? <ArrowUp className='w-4 h-4' /> : <ArrowDown className='w-4 h-4' />;
  };

  const handleNoticeAction = (action: 'view' | 'edit' | 'delete' | 'acknowledge', notice: NoticeWithDetails) => {
    if (onNoticeAction) {
      onNoticeAction(action, notice);
    }
  };

  const isScheduled = (notice: NoticeWithDetails) => notice.scheduledAt && notice.scheduledAt > Date.now();
  const isExpired = (notice: NoticeWithDetails) => notice.expiresAt && notice.expiresAt < Date.now();

  if (isLoading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center space-x-4'>
                <div className='h-4 bg-muted rounded w-1/4'></div>
                <div className='h-4 bg-muted rounded w-1/6'></div>
                <div className='h-4 bg-muted rounded w-1/6'></div>
                <div className='h-4 bg-muted rounded w-1/6'></div>
                <div className='h-4 bg-muted rounded w-1/6'></div>
                <div className='h-4 bg-muted rounded w-1/12'></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (notices.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <div className='text-center space-y-4'>
            <div className='w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center'>
              <MessageSquare className='w-8 h-8 text-muted-foreground' />
            </div>
            <div>
              <h3 className='text-lg font-semibold'>No notices found</h3>
              <p className='text-muted-foreground'>Get started by creating your first notice.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Notices ({totalItems})</span>
            <div className='text-sm text-muted-foreground'>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of{' '}
              {totalItems} results
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='cursor-pointer hover:bg-muted/50' onClick={() => handleSort('title')}>
                  <div className='flex items-center gap-2'>
                    Title
                    {getSortIcon('title')}
                  </div>
                </TableHead>
                <TableHead className='cursor-pointer hover:bg-muted/50' onClick={() => handleSort('priority')}>
                  <div className='flex items-center gap-2'>
                    Priority
                    {getSortIcon('priority')}
                  </div>
                </TableHead>
                <TableHead className='cursor-pointer hover:bg-muted/50' onClick={() => handleSort('noticeType')}>
                  <div className='flex items-center gap-2'>
                    Type
                    {getSortIcon('noticeType')}
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target</TableHead>
                <TableHead className='cursor-pointer hover:bg-muted/50' onClick={() => handleSort('createdAt')}>
                  <div className='flex items-center gap-2'>
                    Created
                    {getSortIcon('createdAt')}
                  </div>
                </TableHead>
                <TableHead className='cursor-pointer hover:bg-muted/50' onClick={() => handleSort('creator')}>
                  <div className='flex items-center gap-2'>
                    Creator
                    {getSortIcon('creator')}
                  </div>
                </TableHead>
                <TableHead className='cursor-pointer hover:bg-muted/50' onClick={() => handleSort('property')}>
                  <div className='flex items-center gap-2'>
                    Property
                    {getSortIcon('property')}
                  </div>
                </TableHead>
                <TableHead className='w-[50px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices.map(notice => (
                <TableRow key={notice._id} className='hover:bg-muted/50'>
                  <TableCell className='font-medium max-w-[300px]'>
                    <div className='space-y-1'>
                      <div className='line-clamp-2'>{notice.title}</div>
                      <div className='text-xs text-muted-foreground line-clamp-1'>{notice.content}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-xs cursor-default ${getPriorityBadgeStyle(notice.priority)}`}
                      variant='outline'
                    >
                      {notice.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-xs cursor-default ${getTypeBadgeStyle(notice.noticeType)}`}
                      variant='outline'
                    >
                      {notice.noticeType.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col gap-1'>
                      <Badge
                        className={`text-xs w-fit cursor-default ${notice.isActive ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200/80' : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200/80'}`}
                        variant='outline'
                      >
                        {notice.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {isScheduled(notice) && (
                        <Badge
                          className='text-xs bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200/80 cursor-default'
                          variant='outline'
                        >
                          <Clock className='w-3 h-3 mr-1' />
                          Scheduled
                        </Badge>
                      )}
                      {isExpired(notice) && (
                        <Badge
                          className='text-xs bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200/80 cursor-default'
                          variant='outline'
                        >
                          Expired
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-1 text-xs'>
                        <Users className='w-3 h-3' />
                        <span>
                          {notice.acknowledgmentCount || 0}/{notice.totalTargetUsers || 0}
                        </span>
                      </div>
                      {notice.unit?.unitNumber && (
                        <div className='text-xs text-muted-foreground'>Unit: {notice.unit.unitNumber}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      <div className='text-sm'>{formatDate(notice.createdAt)}</div>
                      {notice.scheduledAt && (
                        <div className='text-xs text-muted-foreground'>
                          Scheduled: {formatDateTime(notice.scheduledAt)}
                        </div>
                      )}
                      {notice.expiresAt && (
                        <div className='text-xs text-muted-foreground'>Expires: {formatDateTime(notice.expiresAt)}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {notice.creator?._id ? (
                      <UserAvatar id={notice.creator._id} />
                    ) : (
                      <div className='text-sm text-muted-foreground'>Loading...</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>{notice.property?.name || 'Loading...'}</div>
                    <div className='text-xs text-muted-foreground'>{notice.property?.address || ''}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreHorizontal className='w-4 h-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => handleNoticeAction('view', notice)}>
                          <Eye className='w-4 h-4 mr-2' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNoticeAction('edit', notice)}>
                          Edit Notice
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNoticeAction('acknowledge', notice)}>
                          <MessageSquare className='w-4 h-4 mr-2' />
                          Acknowledge
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleNoticeAction('delete', notice)}
                          className='text-destructive focus:text-destructive'
                        >
                          Delete Notice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='border-t pt-4'>
          <NoticePagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={onPageChange}
            onNextPage={onNextPage}
            onPreviousPage={onPreviousPage}
            onFirstPage={onFirstPage}
            onLastPage={onLastPage}
            isLoading={isLoading}
            total={totalItems}
            limit={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
}
