'use client';

import { Filter } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ChatThreadWithDetails } from '../types';

interface ChatHeaderProps {
  thread: ChatThreadWithDetails;
  currentUserId: string;
  onShowDetails: () => void;
  isMobile?: boolean;
}

export function ChatHeader({ thread, currentUserId, onShowDetails, isMobile = false }: ChatHeaderProps) {
  const getThreadTitle = () => {
    if (thread.threadType === 'individual') {
      const otherParticipant = thread.participantDetails.find(p => p._id !== currentUserId);
      return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Individual Chat';
    }
    return thread.title || `${thread.threadType.charAt(0).toUpperCase() + thread.threadType.slice(1)} Chat`;
  };

  return (
    <div className={`${isMobile ? 'p-3' : 'p-4'} border-b flex items-center justify-between`}>
      <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
        <div>
          <h3 className={`${isMobile ? 'text-sm' : ''} font-medium truncate`}>{getThreadTitle()}</h3>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
            {thread.participantDetails.length} participant
            {thread.participantDetails.length !== 1 ? 's' : ''}
          </p>
        </div>
        {thread.priority && (
          <Badge variant='secondary' className={isMobile ? 'text-xs' : ''}>
            {thread.priority}
          </Badge>
        )}
      </div>
      <Button
        variant='outline'
        size={isMobile ? 'sm' : 'sm'}
        onClick={onShowDetails}
        className={isMobile ? 'px-2' : ''}
      >
        <Filter className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${isMobile ? '' : 'mr-1'}`} />
        {!isMobile && 'Details'}
      </Button>
    </div>
  );
}
