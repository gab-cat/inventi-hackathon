'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Users, Wrench, AlertTriangle, Archive } from 'lucide-react';
import { ChatThreadListProps, ChatThreadItemProps } from '../types';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Skeleton } from '../../../components/ui/skeleton';

const threadTypeIcons = {
  individual: MessageCircle,
  group: Users,
  maintenance: Wrench,
  emergency: AlertTriangle,
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

function ChatThreadItem({ thread, isSelected, onClick, currentUserId }: ChatThreadItemProps) {
  const Icon = threadTypeIcons[thread.threadType];
  const priorityColor = thread.priority ? priorityColors[thread.priority] : priorityColors.medium;

  const getDisplayParticipant = () => {
    if (thread.threadType === 'individual') {
      // For individual chats, always show the other participant (not current user)
      return thread.participantDetails.find(p => p._id !== currentUserId);
    }
    // For group chats, show the first participant
    return thread.participantDetails[0];
  };

  const getThreadTitle = () => {
    if (thread.threadType === 'individual') {
      // For individual chats, always show the other participant's name (like Messenger)
      const otherParticipant = getDisplayParticipant();
      return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Individual Chat';
    }

    // For group chats, use title if available, otherwise use thread type
    if (thread.title) return thread.title;
    return `${thread.threadType.charAt(0).toUpperCase() + thread.threadType.slice(1)} Chat`;
  };

  const getLastMessageTime = () => {
    if (!thread.lastMessageAt) return null;
    return formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true });
  };

  return (
    <Card
      className={`cursor-pointer rounded-none bg-transparent shadow-none border-b border-t-0 border-l-0 border-r-0 hover:bg-accent/50 transition-colors ${isSelected ? 'bg-accent/50 ' : ''}`}
      onClick={onClick}
    >
      <CardContent>
        <div className='relative flex items-start space-x-3'>
          <div className='relative'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src={getDisplayParticipant()?.profileImage} />
              <AvatarFallback>
                {getDisplayParticipant() ? (
                  `${getDisplayParticipant()?.firstName[0]}${getDisplayParticipant()?.lastName[0]}`
                ) : (
                  <Icon className='h-5 w-5' />
                )}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-medium truncate'>{getThreadTitle()}</h3>
              <div className='flex items-center space-x-2'>
                {thread.isArchived && <Archive className='h-4 w-4 text-gray-400' />}
              </div>
            </div>

            <div className='flex items-center justify-between mt-1'>
              {getLastMessageTime() && <p className='text-xs text-gray-400'>{getLastMessageTime()}</p>}
            </div>

            {thread.assignedToDetails && (
              <div className='mt-1'>
                <Badge variant='outline' className='text-xs'>
                  Assigned to: {thread.assignedToDetails.firstName} {thread.assignedToDetails.lastName}
                </Badge>
              </div>
            )}
            {thread.unreadCount > 0 && (
              <Badge
                variant='destructive'
                className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center'
              >
                {thread.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatThreadSkeleton() {
  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-start space-x-3'>
          <Skeleton className='h-10 w-10 rounded-full' />
          <div className='flex-1 space-y-2'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-5 w-16' />
            </div>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-3 w-24' />
              <Skeleton className='h-3 w-16' />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChatThreadList({
  threads,
  isLoading,
  onThreadSelect,
  selectedThreadId,
  onLoadMore,
  hasMore,
  currentUserId,
}: ChatThreadListProps) {
  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <ChatThreadSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className='text-center py-8'>
        <MessageCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>No conversations yet</h3>
        <p className='text-gray-500'>Start a new conversation to get started.</p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {threads.map(thread => (
        <ChatThreadItem
          key={thread._id}
          thread={thread}
          isSelected={selectedThreadId === thread._id}
          onClick={() => onThreadSelect(thread._id)}
          currentUserId={currentUserId}
        />
      ))}

      {hasMore && onLoadMore && (
        <div className='text-center pt-4'>
          <Button variant='outline' onClick={onLoadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
