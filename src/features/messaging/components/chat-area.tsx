'use client';

import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { MessageWithDetails } from '../types';

interface ChatAreaProps {
  messages: MessageWithDetails[];
  messagesLoading: boolean;
  hasMore: boolean;
  onLoadMore?: () => void;
  currentUserId: string;
  selectedThreadId: string;
  onSendMessage: (
    content: string,
    messageType: 'text' | 'image' | 'file',
    attachments?: any[],
    replyTo?: string
  ) => Promise<void>;
  onUploadAttachment: (file: File) => Promise<string>;
  replyToMessage?: MessageWithDetails | null;
  onCancelReply?: () => void;
  isMobile?: boolean;
}

export function ChatArea({
  messages,
  messagesLoading,
  hasMore,
  onLoadMore,
  currentUserId,
  selectedThreadId,
  onSendMessage,
  onUploadAttachment,
  replyToMessage,
  onCancelReply,
  isMobile = false,
}: ChatAreaProps) {
  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      {/* Messages */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'}`}>
        <MessageList
          messages={messages}
          isLoading={messagesLoading}
          onLoadMore={hasMore ? onLoadMore : undefined}
          hasMore={hasMore}
          currentUserId={currentUserId}
          isMobile={isMobile}
        />
      </div>

      {/* Message Input */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} border-t flex-shrink-0`}>
        <MessageInput
          threadId={selectedThreadId}
          onSendMessage={onSendMessage}
          onUploadAttachment={onUploadAttachment}
          replyTo={replyToMessage || undefined}
          onCancelReply={onCancelReply}
          disabled={!selectedThreadId}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
