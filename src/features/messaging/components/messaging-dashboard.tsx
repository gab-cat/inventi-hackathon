'use client';

import { useState, useEffect } from 'react';
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
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../../../components/ui/resizable';
import { Menu, X, ArrowLeft } from 'lucide-react';
import { useProgress } from '@bprogress/next';
import { toast } from 'sonner';
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

  // Mobile state management
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentView, setCurrentView] = useState<'sidebar' | 'chat'>('sidebar');

  // Progress and toast
  const { start, stop } = useProgress();

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

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleThreadSelect = (threadId: string) => {
    setSelectedThreadId(threadId);
    setShowThreadDetail(false);
    setReplyToMessage(null);

    // On mobile, switch to chat view when thread is selected
    if (isMobile) {
      setCurrentView('chat');
      setShowSidebar(false);
    }

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

    start();
    try {
      await sendMessage({
        threadId: selectedThreadId,
        content,
        messageType,
        attachments,
        replyTo,
      });
      setReplyToMessage(null);
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      stop();
    }
  };

  const handleUploadAttachment = async (file: File): Promise<string> => {
    if (!selectedThreadId) throw new Error('No thread selected');

    start();
    try {
      const result = await uploadAttachment(selectedThreadId, file);
      toast.success('File uploaded successfully');
      return result;
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file. Please try again.');
      throw error;
    } finally {
      stop();
    }
  };

  const handleUserSelect = async (userId: string) => {
    start();
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

      // On mobile, switch to chat view
      if (isMobile) {
        setCurrentView('chat');
        setShowSidebar(false);
      }

      toast.success('Conversation started successfully');
    } catch (error) {
      console.error('Failed to create thread:', error);
      toast.error('Failed to start conversation. Please try again.');
    } finally {
      stop();
    }
  };

  const handleGroupCreate = async (userIds: string[], groupName: string) => {
    start();
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

      // On mobile, switch to chat view
      if (isMobile) {
        setCurrentView('chat');
        setShowSidebar(false);
      }

      toast.success('Group conversation created successfully');
    } catch (error) {
      console.error('Failed to create group thread:', error);
      toast.error('Failed to create group conversation. Please try again.');
    } finally {
      stop();
    }
  };

  const selectedThread = threads.find(t => t._id === selectedThreadId);

  // Mobile layout
  if (isMobile) {
    return (
      <div className='h-[calc(100vh-100px)] border rounded-lg overflow-hidden bg-white flex flex-col'>
        {/* Mobile Header - Fixed */}
        <div className='flex items-center justify-between p-4 border-b bg-white flex-shrink-0'>
          {currentView === 'chat' ? (
            <div className='flex items-center space-x-3'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setCurrentView('sidebar');
                  setShowSidebar(true);
                }}
                className='p-2'
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <div className='flex-1'>
                <h2 className='font-semibold text-sm truncate'>{selectedThread?.title || 'Messages'}</h2>
                {selectedThread && (
                  <p className='text-xs text-gray-500 truncate'>
                    {selectedThread.participants.length} participant
                    {selectedThread.participants.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-between w-full'>
              <h2 className='text-lg font-semibold'>Messages</h2>
              <Button size='sm' onClick={() => setShowUserSelection(true)} className='p-2'>
                <Menu className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Content - Scrollable */}
        <div className='flex-1 overflow-hidden flex flex-col'>
          {currentView === 'sidebar' ? (
            <div className='h-full overflow-hidden'>
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
                isMobile={true}
              />
            </div>
          ) : (
            <div className='h-full overflow-hidden flex flex-col'>
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
                  isMobile={true}
                />
              ) : (
                <NoThreadSelected />
              )}
            </div>
          )}
        </div>

        {/* Mobile Modals */}
        {selectedThreadId && (
          <ChatThreadDetail
            threadId={selectedThreadId}
            isOpen={showThreadDetail}
            onClose={() => setShowThreadDetail(false)}
            onAssign={employeeId => {
              console.log('Assign to:', employeeId);
            }}
            onArchive={isArchived => {
              console.log('Archive:', isArchived);
            }}
            onModerate={(action, targetUserId, reason) => {
              console.log('Moderate:', action, targetUserId, reason);
            }}
            currentUserId={currentUserId}
          />
        )}

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

  // Desktop layout with resizable panels
  return (
    <div className='h-[calc(100vh-100px)] border rounded-lg overflow-hidden'>
      <ResizablePanelGroup direction='horizontal' className='h-full'>
        {/* Thread List Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={50}>
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
            isMobile={false}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Chat Area */}
        <ResizablePanel defaultSize={80} minSize={50}>
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
              isMobile={false}
            />
          ) : (
            <NoThreadSelected />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Thread Detail Sheet */}
      {selectedThreadId && (
        <ChatThreadDetail
          threadId={selectedThreadId}
          isOpen={showThreadDetail}
          onClose={() => setShowThreadDetail(false)}
          onAssign={employeeId => {
            console.log('Assign to:', employeeId);
          }}
          onArchive={isArchived => {
            console.log('Archive:', isArchived);
          }}
          onModerate={(action, targetUserId, reason) => {
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
