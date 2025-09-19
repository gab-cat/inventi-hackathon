'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Conversation } from './chat-sidebar';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50',
        isSelected && 'bg-accent'
      )}
      onClick={onClick}
    >
      <div className='relative'>
        <Avatar className='h-12 w-12'>
          <AvatarImage src={conversation.avatar} alt={conversation.name} />
          <AvatarFallback>
            {conversation.name
              .split(' ')
              .map(n => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        {conversation.isOnline && (
          <div className='absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background' />
        )}
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between'>
          <h3 className='font-medium text-sm truncate'>{conversation.name}</h3>
          <span className='text-xs text-muted-foreground'>{conversation.timestamp}</span>
        </div>
        <p className='text-sm text-muted-foreground truncate mt-1'>{conversation.lastMessage}</p>
      </div>
      {conversation.unreadCount > 0 && (
        <Badge
          variant='default'
          className='h-5 w-5 bg-blue-500 rounded-full p-0 flex items-center justify-center text-xs'
        >
          {conversation.unreadCount}
        </Badge>
      )}
    </div>
  );
}
