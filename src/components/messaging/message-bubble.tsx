'use client';

import { cn } from '@/lib/utils';
import { Message } from './chat-main';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={cn('flex', message.isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2',
          message.isOwn ? 'bg-blue-500 text-primary-foreground' : 'bg-muted'
        )}
      >
        <p className='text-sm'>{message.content}</p>
        <p className={cn('text-xs mt-1', message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}
