'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Users,
  Archive,
  ArchiveRestore,
  UserPlus,
  Shield,
  MoreVertical,
  MessageCircle,
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { ChatThreadDetailProps } from '../types';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Skeleton } from '../../../components/ui/skeleton';

const threadTypeIcons = {
  individual: MessageCircle,
  group: Users,
  maintenance: Wrench,
  emergency: AlertTriangle,
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

function ThreadDetailSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center space-x-3'>
        <Skeleton className='h-12 w-12 rounded-full' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-3 w-24' />
        </div>
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
      </div>
    </div>
  );
}

export function ChatThreadDetail({
  threadId,
  isOpen,
  onClose,
  onAssign,
  onArchive,
  onModerate,
  currentUserId,
}: ChatThreadDetailProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showModerateDialog, setShowModerateDialog] = useState(false);

  const thread = useQuery(api.chatThreads.webGetChatThreadById, { threadId });

  if (!isOpen) return null;

  if (!thread) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className='w-96'>
          <SheetHeader>
            <SheetTitle>Thread Details</SheetTitle>
          </SheetHeader>
          <div className='mt-6'>
            <ThreadDetailSkeleton />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const Icon = threadTypeIcons[thread.threadType as keyof typeof threadTypeIcons] || MessageCircle;
  const priorityColor = thread.priority
    ? priorityColors[thread.priority as keyof typeof priorityColors] || priorityColors.medium
    : priorityColors.medium;

  const getThreadTitle = () => {
    if (thread.title) return thread.title;

    if (thread.threadType === 'individual') {
      // Find the other participant (not the current user)
      const otherParticipant = thread.participantDetails.find(p => p._id !== currentUserId);
      return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Individual Chat';
    }

    return `${thread.threadType.charAt(0).toUpperCase() + thread.threadType.slice(1)} Chat`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='w-96'>
        <SheetHeader>
          <SheetTitle className='flex items-center space-x-2'>
            <Icon className='h-5 w-5' />
            <span>Thread Details</span>
          </SheetTitle>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          {/* Thread Info */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-3'>
              <Avatar className='h-12 w-12'>
                <AvatarImage src={thread.participantDetails[0]?.profileImage} />
                <AvatarFallback>
                  <Icon className='h-6 w-6' />
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <h3 className='font-medium text-gray-900'>{getThreadTitle()}</h3>
                <p className='text-sm text-gray-500'>
                  {thread.threadType} • {thread.participantDetails.length} participant
                  {thread.participantDetails.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className='flex flex-wrap gap-2'>
              {thread.priority && (
                <Badge variant='secondary' className={priorityColor}>
                  {thread.priority}
                </Badge>
              )}
              {thread.isArchived && (
                <Badge variant='outline'>
                  <Archive className='h-3 w-3 mr-1' />
                  Archived
                </Badge>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className='space-y-3'>
            <h4 className='font-medium text-gray-900'>Participants</h4>
            <div className='space-y-2'>
              {thread.participantDetails.map(participant => (
                <div key={participant._id} className='flex items-center space-x-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={participant.profileImage} />
                    <AvatarFallback>
                      {participant.firstName[0]}
                      {participant.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      {participant.firstName} {participant.lastName}
                    </p>
                    <p className='text-xs text-gray-500'>{participant.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned To */}
          {thread.assignedToDetails && (
            <div className='space-y-3'>
              <h4 className='font-medium text-gray-900'>Assigned To</h4>
              <div className='flex items-center space-x-3'>
                <Avatar className='h-8 w-8'>
                  <AvatarFallback>
                    {thread.assignedToDetails.firstName[0]}
                    {thread.assignedToDetails.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    {thread.assignedToDetails.firstName} {thread.assignedToDetails.lastName}
                  </p>
                  <p className='text-xs text-gray-500'>{thread.assignedToDetails.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Thread Stats */}
          <div className='space-y-3'>
            <h4 className='font-medium text-gray-900'>Thread Information</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Created</span>
                <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
              </div>
              {thread.lastMessageAt && (
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Last message</span>
                  <span>{formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className='space-y-3'>
            <h4 className='font-medium text-gray-900'>Actions</h4>
            <div className='space-y-2'>
              {onAssign && (
                <Button variant='outline' className='w-full justify-start' onClick={() => setShowAssignDialog(true)}>
                  <UserPlus className='h-4 w-4 mr-2' />
                  Assign to Employee
                </Button>
              )}

              {onArchive && (
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => onArchive(!thread.isArchived)}
                >
                  {thread.isArchived ? (
                    <>
                      <ArchiveRestore className='h-4 w-4 mr-2' />
                      Unarchive Thread
                    </>
                  ) : (
                    <>
                      <Archive className='h-4 w-4 mr-2' />
                      Archive Thread
                    </>
                  )}
                </Button>
              )}

              {onModerate && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' className='w-full justify-start'>
                      <Shield className='h-4 w-4 mr-2' />
                      Moderate Chat
                      <MoreVertical className='h-4 w-4 ml-auto' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-48'>
                    <DropdownMenuItem onClick={() => onModerate('warn')}>Issue Warning</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onModerate('mute')}>Mute User</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onModerate('suspend')}>Suspend User</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
