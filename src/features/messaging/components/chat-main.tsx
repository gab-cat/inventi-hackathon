'use client';

import { ChatHeader } from './chat-header';
import { ChatArea } from './chat-area';
import { ChatThreadWithDetails, MessageWithDetails } from '../types';

interface ChatMainProps {
  selectedThread: ChatThreadWithDetails;
  messages: MessageWithDetails[];
  messagesLoading: boolean;
  hasMore: boolean;
  currentUserId: string;
  onLoadMore?: () => void;
  onSendMessage: (
    content: string,
    messageType: 'text' | 'image' | 'file',
    attachments?: any[],
    replyTo?: string
  ) => Promise<void>;
  onUploadAttachment: (file: File) => Promise<string>;
  onShowThreadDetail: () => void;
  replyToMessage?: MessageWithDetails | null;
  onCancelReply?: () => void;
}

export function ChatMain({
  selectedThread,
  messages,
  messagesLoading,
  hasMore,
  currentUserId,
  onLoadMore,
  onSendMessage,
  onUploadAttachment,
  onShowThreadDetail,
  replyToMessage,
  onCancelReply,
}: ChatMainProps) {
  return (
    <div className='flex-1 flex flex-col'>
      {/* Chat Header */}
      <ChatHeader thread={selectedThread} currentUserId={currentUserId} onShowDetails={onShowThreadDetail} />

      {/* Chat Area */}
      <ChatArea
        messages={messages}
        messagesLoading={messagesLoading}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        currentUserId={currentUserId}
        selectedThreadId={selectedThread._id}
        onSendMessage={onSendMessage}
        onUploadAttachment={onUploadAttachment}
        replyToMessage={replyToMessage}
        onCancelReply={onCancelReply}
      />
    </div>
  );
}
