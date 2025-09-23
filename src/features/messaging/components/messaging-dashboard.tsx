'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { MessageCircle, Plus, Filter, Search } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ChatThreadList } from './chat-thread-list';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
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
      <div className='w-80 border-r  flex flex-col'>
        <div className='p-4 border-b '>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold flex items-center'>
              <MessageCircle className='h-5 w-5 mr-2' />
              Messages
              {totalUnread > 0 && (
                <Badge variant='destructive' className='ml-2'>
                  {totalUnread}
                </Badge>
              )}
            </h2>
            <Button size='sm' onClick={() => setShowUserSelection(true)}>
              <Plus className='h-4 w-4 mr-1' />
              New
            </Button>
          </div>

          <div className='space-y-3'>
            <div className='flex space-x-2'>
              <Input placeholder='Search conversations...' className='flex-1' />
              <Button variant='outline' size='sm'>
                <Search className='h-4 w-4' />
              </Button>
            </div>

            <div className='flex space-x-2'>
              <Select value={threadTypeFilter} onValueChange={setThreadTypeFilter}>
                <SelectTrigger className='flex-1'>
                  <SelectValue placeholder='All types' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='individual'>Individual</SelectItem>
                  <SelectItem value='group'>Group</SelectItem>
                  <SelectItem value='maintenance'>Maintenance</SelectItem>
                  <SelectItem value='emergency'>Emergency</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={isArchivedFilter === undefined ? 'all' : isArchivedFilter ? 'archived' : 'active'}
                onValueChange={value => {
                  if (value === 'all') setIsArchivedFilter(undefined);
                  else setIsArchivedFilter(value === 'archived');
                }}
              >
                <SelectTrigger className='flex-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='archived'>Archived</SelectItem>
                  <SelectItem value='all'>All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto'>
          <ChatThreadList
            threads={threads}
            isLoading={threadsLoading}
            onThreadSelect={handleThreadSelect}
            selectedThreadId={selectedThreadId}
            currentUserId={currentUserId}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div className='flex-1 flex flex-col'>
        {selectedThread ? (
          <>
            {/* Chat Header */}
            <div className='p-4 border-b flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div>
                  <h3 className='font-medium'>
                    {selectedThread.threadType === 'individual'
                      ? (() => {
                          const otherParticipant = selectedThread.participantDetails.find(p => p._id !== currentUserId);
                          return otherParticipant
                            ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
                            : 'Individual Chat';
                        })()
                      : selectedThread.title ||
                        `${selectedThread.threadType.charAt(0).toUpperCase() + selectedThread.threadType.slice(1)} Chat`}
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {selectedThread.participantDetails.length} participant
                    {selectedThread.participantDetails.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button variant='outline' size='sm' onClick={() => setShowThreadDetail(true)}>
                <Filter className='h-4 w-4 mr-1' />
                Details
              </Button>
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
              <MessageList
                messages={messages}
                isLoading={messagesLoading}
                onLoadMore={hasMore ? loadMore : undefined}
                hasMore={hasMore}
                currentUserId={currentUserId}
              />
            </div>

            {/* Message Input */}
            <div className='p-4 border-t '>
              <MessageInput
                threadId={selectedThreadId!}
                onSendMessage={handleSendMessage}
                onUploadAttachment={handleUploadAttachment}
                replyTo={replyToMessage}
                onCancelReply={() => setReplyToMessage(null)}
              />
            </div>
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <MessageCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>Select a conversation</h3>
              <p className='text-gray-500'>Choose a conversation from the sidebar to start messaging.</p>
            </div>
          </div>
        )}
      </div>

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
