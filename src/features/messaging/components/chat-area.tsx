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
}: ChatAreaProps) {
  return (
    <>
      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4'>
        <MessageList
          messages={messages}
          isLoading={messagesLoading}
          onLoadMore={hasMore ? onLoadMore : undefined}
          hasMore={hasMore}
          currentUserId={currentUserId}
        />
      </div>

      {/* Message Input */}
      <div className='p-4 border-t'>
        <MessageInput
          threadId={selectedThreadId}
          onSendMessage={onSendMessage}
          onUploadAttachment={onUploadAttachment}
          replyTo={replyToMessage || undefined}
          onCancelReply={onCancelReply}
          disabled={!selectedThreadId}
        />
      </div>
    </>
  );
}
