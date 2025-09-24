'use client';

import { MessageCircle, Plus, Search } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { ChatThreadList } from './chat-thread-list';
import { ChatThreadWithDetails } from '../types';

interface ChatSidebarProps {
  threads: ChatThreadWithDetails[];
  threadsLoading: boolean;
  selectedThreadId?: string;
  currentUserId: string;
  totalUnread: number;
  threadTypeFilter: string;
  isArchivedFilter?: boolean;
  onThreadSelect: (threadId: string) => void;
  onStartNewChat: () => void;
  onThreadTypeFilterChange: (value: string) => void;
  onArchivedFilterChange: (value: string) => void;
  isMobile?: boolean;
}

export function ChatSidebar({
  threads,
  threadsLoading,
  selectedThreadId,
  currentUserId,
  totalUnread,
  threadTypeFilter,
  isArchivedFilter,
  onThreadSelect,
  onStartNewChat,
  onThreadTypeFilterChange,
  onArchivedFilterChange,
  isMobile = false,
}: ChatSidebarProps) {
  return (
    <div className={`${isMobile ? 'w-full' : 'w-full border-r'} flex flex-col h-full`}>
      {/* Header */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} border-b`}>
        <div className={`flex ${isMobile ? 'mb-2' : 'mb-3'} items-center justify-between`}>
          <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold flex items-center`}>
            <MessageCircle className={`${isMobile ? 'h-4 w-4 mr-1' : 'h-5 w-5 mr-2'}`} />
            Messages
            {totalUnread > 0 && (
              <Badge variant='destructive' className={`${isMobile ? 'ml-1 text-xs' : 'ml-2'}`}>
                {totalUnread}
              </Badge>
            )}
          </h2>
          <Button
            size={isMobile ? 'sm' : 'sm'}
            onClick={onStartNewChat}
            className={`bg-blue-500 text-white hover:bg-blue-600 ${isMobile ? 'px-2' : ''}`}
          >
            <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${isMobile ? '' : 'mr-1'}`} />
            {!isMobile && 'New'}
          </Button>
        </div>

        <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
          <div className='flex space-x-2'>
            <Input placeholder={isMobile ? 'Search...' : 'Search conversations...'} className='flex-1 text-sm' />
            <Button variant='outline' size='sm' className={isMobile ? 'px-2' : ''}>
              <Search className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
          </div>

          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
            <Select value={threadTypeFilter} onValueChange={onThreadTypeFilterChange}>
              <SelectTrigger className='flex-1 text-sm'>
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
              onValueChange={onArchivedFilterChange}
            >
              <SelectTrigger className='flex-1 text-sm'>
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

      {/* Thread List */}
      <div className='flex-1 overflow-y-auto'>
        <ChatThreadList
          threads={threads}
          isLoading={threadsLoading}
          onThreadSelect={onThreadSelect}
          selectedThreadId={selectedThreadId}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
