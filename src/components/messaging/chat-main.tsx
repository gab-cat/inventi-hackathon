'use client';

import { useState } from 'react';
import { MessageSquare, Phone, Video, Info, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from './chat-sidebar';
import { MessageBubble } from './message-bubble';

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface ChatMainProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function ChatMain({ conversation, messages, onSendMessage }: ChatMainProps) {
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center'>
          <MessageSquare className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
          <h3 className='text-lg font-medium mb-2'>Select a conversation</h3>
          <p className='text-muted-foreground'>Choose a conversation from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col'>
      {/* Chat Header */}
      <div className='p-4 border-b bg-background'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <Avatar className='h-10 w-10'>
                <AvatarImage src={conversation.avatar} alt={conversation.name} />
                <AvatarFallback>
                  {conversation.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              {conversation.isOnline && (
                <div className='absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background' />
              )}
            </div>
            <div>
              <h2 className='font-medium'>{conversation.name}</h2>
              <p className='text-sm text-muted-foreground'>{conversation.isOnline ? 'Online' : 'Last seen recently'}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button size='sm' variant='ghost'>
              <Phone className='h-4 w-4' />
            </Button>
            <Button size='sm' variant='ghost'>
              <Video className='h-4 w-4' />
            </Button>
            <Button size='sm' variant='ghost'>
              <Info className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Message Input */}
      <div className='p-4 border-t bg-background'>
        <div className='flex items-center gap-2'>
          <Input
            placeholder='Type a message...'
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className='flex-1'
          />
          <Button size='sm' onClick={handleSendMessage} disabled={!messageInput.trim()}>
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
