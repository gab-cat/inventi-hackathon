'use client';

import { Filter } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ChatThreadWithDetails } from '../types';

interface ChatHeaderProps {
  thread: ChatThreadWithDetails;
  currentUserId: string;
  onShowDetails: () => void;
}

export function ChatHeader({ thread, currentUserId, onShowDetails }: ChatHeaderProps) {
  const getThreadTitle = () => {
    if (thread.threadType === 'individual') {
      const otherParticipant = thread.participantDetails.find(p => p._id !== currentUserId);
      return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Individual Chat';
    }
    return thread.title || `${thread.threadType.charAt(0).toUpperCase() + thread.threadType.slice(1)} Chat`;
  };

  return (
    <div className='p-4 border-b flex items-center justify-between'>
      <div className='flex items-center space-x-3'>
        <div>
          <h3 className='font-medium'>{getThreadTitle()}</h3>
          <p className='text-sm text-gray-500'>
            {thread.participantDetails.length} participant
            {thread.participantDetails.length !== 1 ? 's' : ''}
          </p>
        </div>
        {thread.priority && <Badge variant='secondary'>{thread.priority}</Badge>}
      </div>
      <Button variant='outline' size='sm' onClick={onShowDetails}>
        <Filter className='h-4 w-4 mr-1' />
        Details
      </Button>
    </div>
  );
}
