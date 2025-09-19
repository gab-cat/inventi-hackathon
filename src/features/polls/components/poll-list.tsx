'use client';

import { MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Poll } from '../types';
import { PollCard } from './poll-card';

interface PollListProps {
  polls: Poll[];
  onEditPoll: (poll: Poll) => void;
  onViewResults: (poll: Poll) => void;
  onRefresh: () => void;
  responseCounts?: { [pollId: string]: number };
}

export function PollList({ polls, onEditPoll, onViewResults, onRefresh, responseCounts }: PollListProps) {
  if (polls.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <MessageSquare className='h-12 w-12 text-muted-foreground mb-4' />
          <h3 className='text-lg font-medium mb-2'>No polls yet</h3>
          <p className='text-muted-foreground text-center'>
            Create your first poll to start gathering feedback from your tenants.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {polls.map(poll => (
        <PollCard
          key={poll._id}
          poll={poll}
          responseCount={responseCounts?.[poll._id] || 0}
          onEditPoll={onEditPoll}
          onViewResults={onViewResults}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
