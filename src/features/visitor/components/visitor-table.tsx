'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { VisitorRequestWithDetails } from '../types/api';
import { useVisitorMutations } from '../hooks/useVisitorMutations';
import { Id } from '@/convex/_generated/dataModel';

interface VisitorTableProps {
  visitors: VisitorRequestWithDetails[];
  onRefresh: () => void;
}

export function VisitorTable({ visitors, onRefresh }: VisitorTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const {
    handleApproveVisitorRequest,
    handleDenyVisitorRequest,
    handleCheckInVisitor,
    handleCheckOutVisitor,
    handleMarkVisitorNoShow,
    handleGenerateVisitorBadge,
  } = useVisitorMutations();

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      denied: 'destructive',
      cancelled: 'outline',
      expired: 'secondary',
    } as const;

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      denied: XCircle,
      cancelled: XCircle,
      expired: Clock,
    };

    const Icon = icons[status as keyof typeof icons];

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        <Icon className='w-3 h-3 mr-1' />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleAction = async (action: string, visitorId: Id<'visitorRequests'>, data?: any) => {
    setLoading(visitorId);
    try {
      switch (action) {
        case 'approve':
          await handleApproveVisitorRequest(visitorId);
          break;
        case 'deny':
          await handleDenyVisitorRequest(visitorId, data?.reason || 'No reason provided');
          break;
        case 'checkin':
          await handleCheckInVisitor(visitorId, data?.location, data?.notes);
          break;
        case 'checkout':
          await handleCheckOutVisitor(visitorId, data?.location, data?.notes);
          break;
        case 'noshow':
          await handleMarkVisitorNoShow(visitorId, data?.notes);
          break;
        case 'badge':
          await handleGenerateVisitorBadge(visitorId);
          break;
      }
      onRefresh();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Visitor</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Expected Arrival</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requested By</TableHead>
            <TableHead className='w-[70px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitors.map(visitor => (
            <TableRow key={visitor._id}>
              <TableCell>
                <div className='flex items-center space-x-2'>
                  <User className='w-4 h-4' />
                  <div>
                    <div className='font-medium'>{visitor.visitorName}</div>
                    {visitor.visitorPhone && (
                      <div className='text-sm text-muted-foreground'>{visitor.visitorPhone}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>{visitor.unit?.unitNumber || 'N/A'}</TableCell>
              <TableCell>
                <div className='max-w-[200px] truncate'>{visitor.purpose}</div>
              </TableCell>
              <TableCell>{format(new Date(visitor.expectedArrival), 'MMM dd, yyyy HH:mm')}</TableCell>
              <TableCell>{getStatusBadge(visitor.status)}</TableCell>
              <TableCell>
                {visitor.requestedBy ? (
                  <div>
                    <div className='font-medium'>
                      {visitor.requestedBy.firstName} {visitor.requestedBy.lastName}
                    </div>
                    <div className='text-sm text-muted-foreground'>{visitor.requestedBy.email}</div>
                  </div>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='h-8 w-8 p-0' disabled={loading === visitor._id}>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    {visitor.status === 'pending' && (
                      <>
                        <DropdownMenuItem onClick={() => handleAction('approve', visitor._id)}>
                          <CheckCircle className='w-4 h-4 mr-2' />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const reason = prompt('Reason for denial:');
                            if (reason) {
                              handleAction('deny', visitor._id, { reason });
                            }
                          }}
                        >
                          <XCircle className='w-4 h-4 mr-2' />
                          Deny
                        </DropdownMenuItem>
                      </>
                    )}
                    {visitor.status === 'approved' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            const location = prompt('Check-in location (optional):');
                            const notes = prompt('Notes (optional):');
                            handleAction('checkin', visitor._id, { location, notes });
                          }}
                        >
                          <User className='w-4 h-4 mr-2' />
                          Check In
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('badge', visitor._id)}>
                          <User className='w-4 h-4 mr-2' />
                          Generate Badge
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => {
                        const notes = prompt('Notes (optional):');
                        handleAction('noshow', visitor._id, { notes });
                      }}
                    >
                      <Clock className='w-4 h-4 mr-2' />
                      Mark No Show
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
