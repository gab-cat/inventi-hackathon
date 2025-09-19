'use client';

import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Clock, MapPin } from 'lucide-react';
import { ActiveVisitor } from '../types/api';
import { useVisitorMutations } from '../hooks/useVisitorMutations';
import { Id } from '@convex/_generated/dataModel';

interface ActiveVisitorsCardProps {
  activeVisitors: ActiveVisitor[];
  onRefresh: () => void;
}

export function ActiveVisitorsCard({ activeVisitors, onRefresh }: ActiveVisitorsCardProps) {
  const { handleCheckOutVisitor } = useVisitorMutations();

  const handleCheckOut = async (visitorId: Id<'visitorRequests'>) => {
    try {
      const location = prompt('Check-out location (optional):');
      const notes = prompt('Notes (optional):');
      await handleCheckOutVisitor(visitorId, location || undefined, notes || undefined);
      onRefresh();
    } catch (error) {
      console.error('Failed to check out visitor:', error);
    }
  };

  if (activeVisitors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='w-5 h-5' />
            Active Visitors
          </CardTitle>
          <CardDescription>Currently checked-in visitors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-muted-foreground'>
            <User className='w-12 h-12 mx-auto mb-4 opacity-50' />
            <p>No active visitors at the moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <User className='w-5 h-5' />
          Active Visitors ({activeVisitors.length})
        </CardTitle>
        <CardDescription>Currently checked-in visitors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {activeVisitors.map(visitor => (
            <div key={visitor._id} className='flex items-center justify-between p-4 border rounded-lg'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <h4 className='font-medium'>{visitor.visitorName}</h4>
                  <Badge variant='default'>Active</Badge>
                </div>

                <div className='space-y-1 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='w-3 h-3' />
                    Unit {visitor.unit?.unitNumber}
                  </div>

                  <div className='flex items-center gap-2'>
                    <Clock className='w-3 h-3' />
                    Checked in: {format(new Date(visitor.checkInTime), 'MMM dd, HH:mm')}
                  </div>

                  {visitor.checkInLocation && <div className='text-xs'>Location: {visitor.checkInLocation}</div>}

                  <div className='text-xs'>Purpose: {visitor.purpose}</div>
                </div>
              </div>

              <Button size='sm' variant='outline' onClick={() => handleCheckOut(visitor._id)}>
                Check Out
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
