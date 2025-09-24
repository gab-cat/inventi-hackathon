'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { ChatSidebar } from './chat-sidebar';
import { ChatMain } from './chat-main';
import { NoThreadSelected } from './no-thread-selected';
import { ChatThreadDetail } from './chat-thread-detail';
import { UserSelectionModal } from './user-selection-modal';
import {
  useChatThreads,
  useMessages,
  useMessageMutations,
  useUnreadMessageCount,
  useChatThreadMutations,
} from '../hooks';

interface MessagingDashboardProps {
  propertyId: Id<'properties'>;
  currentUserId: string;
}

export function MessagingDashboard({ propertyId, currentUserId }: MessagingDashboardProps) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>();
  const [threadTypeFilter, setThreadTypeFilter] = useState<string>('all');
  const [isArchivedFilter, setIsArchivedFilter] = useState<boolean | undefined>(false);
  const [showThreadDetail, setShowThreadDetail] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<any>(null);
  const [showUserSelection, setShowUserSelection] = useState(false);

  // Get current user for permissions
  const currentUser = useQuery(api.user.webGetCurrentUser);

  // Get threads
  const { threads, isLoading: threadsLoading } = useChatThreads({
    propertyId,
    threadType: threadTypeFilter === 'all' ? undefined : threadTypeFilter,
    isArchived: isArchivedFilter,
  });

  // Get messages for selected thread
  const {
    messages,
    isLoading: messagesLoading,
    hasMore,
    loadMore,
  } = useMessages({
    threadId: selectedThreadId as Id<'chatThreads'>,
  });

  // Get unread count
  const { totalUnread } = useUnreadMessageCount({ propertyId });

  // Message mutations
  const { sendMessage, markAsRead, editMessage, deleteMessage, uploadAttachment } = useMessageMutations();

  // Chat thread mutations
  const { createThread } = useChatThreadMutations();

  const handleThreadSelect = (threadId: string) => {
    setSelectedThreadId(threadId);
    setShowThreadDetail(false);
    setReplyToMessage(null);

    // Mark messages as read when thread is selected
    markAsRead(undefined, threadId).catch(console.error);
  };

  const handleSendMessage = async (
    content: string,
    messageType: 'text' | 'image' | 'file',
    attachments?: any[],
    replyTo?: string
  ) => {
    if (!selectedThreadId) return;

    try {
      await sendMessage({
        threadId: selectedThreadId,
        content,
        messageType,
        attachments,
        replyTo,
      });
      setReplyToMessage(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleUploadAttachment = async (file: File): Promise<string> => {
    if (!selectedThreadId) throw new Error('No thread selected');
    return uploadAttachment(selectedThreadId, file);
  };

  const handleUserSelect = async (userId: string) => {
    try {
      const threadId = await createThread({
        propertyId: propertyId,
        threadType: 'individual',
        title: undefined,
        participants: [currentUserId, userId],
        priority: 'medium',
      });

      setSelectedThreadId(threadId);
      setShowUserSelection(false);
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  const handleGroupCreate = async (userIds: string[], groupName: string) => {
    try {
      const threadId = await createThread({
        propertyId: propertyId,
        threadType: 'group',
        title: groupName,
        participants: [currentUserId, ...userIds],
        priority: 'medium',
      });

      setSelectedThreadId(threadId);
      setShowUserSelection(false);
    } catch (error) {
      console.error('Failed to create group thread:', error);
    }
  };

  const selectedThread = threads.find(t => t._id === selectedThreadId);

  return (
    <div className='flex h-[calc(100vh-100px)] border rounded-lg overflow-hidden'>
      {/* Thread List Sidebar */}
      <ChatSidebar
        threads={threads}
        threadsLoading={threadsLoading}
        selectedThreadId={selectedThreadId}
        currentUserId={currentUserId}
        totalUnread={totalUnread}
        threadTypeFilter={threadTypeFilter}
        isArchivedFilter={isArchivedFilter}
        onThreadSelect={handleThreadSelect}
        onStartNewChat={() => setShowUserSelection(true)}
        onThreadTypeFilterChange={setThreadTypeFilter}
        onArchivedFilterChange={value => {
          if (value === 'all') setIsArchivedFilter(undefined);
          else setIsArchivedFilter(value === 'archived');
        }}
      />

      {/* Chat Area */}
      {selectedThread ? (
        <ChatMain
          selectedThread={selectedThread}
          messages={messages}
          messagesLoading={messagesLoading}
          hasMore={hasMore}
          currentUserId={currentUserId}
          onLoadMore={hasMore ? loadMore : undefined}
          onSendMessage={handleSendMessage}
          onUploadAttachment={handleUploadAttachment}
          onShowThreadDetail={() => setShowThreadDetail(true)}
          replyToMessage={replyToMessage}
          onCancelReply={() => setReplyToMessage(null)}
        />
      ) : (
        <NoThreadSelected />
      )}

      {/* Thread Detail Sheet */}
      {selectedThreadId && (
        <ChatThreadDetail
          threadId={selectedThreadId}
          isOpen={showThreadDetail}
          onClose={() => setShowThreadDetail(false)}
          onAssign={employeeId => {
            // Implement assign functionality
            console.log('Assign to:', employeeId);
          }}
          onArchive={isArchived => {
            // Implement archive functionality
            console.log('Archive:', isArchived);
          }}
          onModerate={(action, targetUserId, reason) => {
            // Implement moderation functionality
            console.log('Moderate:', action, targetUserId, reason);
          }}
          currentUserId={currentUserId}
        />
      )}

      {/* User Selection Modal */}
      <UserSelectionModal
        isOpen={showUserSelection}
        onClose={() => setShowUserSelection(false)}
        onUserSelect={handleUserSelect}
        onGroupCreate={handleGroupCreate}
        propertyId={propertyId}
        currentUserId={currentUserId}
        allowMultiple={true}
      />
    </div>
  );
}
