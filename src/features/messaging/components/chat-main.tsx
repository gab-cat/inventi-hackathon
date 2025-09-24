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
  isMobile?: boolean;
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
  isMobile = false,
}: ChatMainProps) {
  return (
    <div className='h-full flex flex-col overflow-hidden'>
      {/* Chat Header - Only show on desktop */}
      {!isMobile && (
        <ChatHeader
          thread={selectedThread}
          currentUserId={currentUserId}
          onShowDetails={onShowThreadDetail}
          isMobile={isMobile}
        />
      )}

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
        isMobile={isMobile}
      />
    </div>
  );
}
