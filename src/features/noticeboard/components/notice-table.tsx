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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { NoticeWithDetails } from '../types';
import { UserAvatar } from '@/components/custom/user-avatar';

interface NoticeTableProps {
  notices: NoticeWithDetails[];
  isLoading?: boolean;
  onNoticeAction?: (action: 'view' | 'edit' | 'delete' | 'acknowledge', notice: NoticeWithDetails) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
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
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0,
}: NoticeTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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
                    <Badge variant={getPriorityColor(notice.priority)} className='text-xs'>
                      {notice.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeColor(notice.noticeType)} className='text-xs'>
                      {notice.noticeType.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col gap-1'>
                      <Badge variant={notice.isActive ? 'default' : 'secondary'} className='text-xs'>
                        {notice.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {isScheduled(notice) && (
                        <Badge variant='outline' className='text-xs'>
                          <Clock className='w-3 h-3 mr-1' />
                          Scheduled
                        </Badge>
                      )}
                      {isExpired(notice) && (
                        <Badge variant='secondary' className='text-xs'>
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

      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            Page {currentPage} of {totalPages}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href='#'
                  onClick={e => {
                    e.preventDefault();
                    if (currentPage > 1 && onPageChange) {
                      onPageChange(currentPage - 1);
                    }
                  }}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href='#'
                      onClick={e => {
                        e.preventDefault();
                        if (onPageChange) {
                          onPageChange(pageNum);
                        }
                      }}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href='#'
                  onClick={e => {
                    e.preventDefault();
                    if (currentPage < totalPages && onPageChange) {
                      onPageChange(currentPage + 1);
                    }
                  }}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
