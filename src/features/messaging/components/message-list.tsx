'use client';

import { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Reply, Edit, Trash2, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { MessageListProps, MessageItemProps } from '../types';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

function MessageItem({ message, currentUserId, onReply, onEdit, onDelete }: MessageItemProps) {
  const isOwnMessage = message.senderId === currentUserId;
  const isSystemMessage = message.messageType === 'system';
  const isDeleted = !!message.deletedAt;
  const isEdited = !!message.editedAt;

  const getReadStatus = () => {
    if (isOwnMessage) {
      const readCount = message.readBy?.length || 0;
      if (readCount > 1) {
        return <CheckCheck className='h-3 w-3 text-blue-500' />;
      } else if (readCount === 1) {
        return <Check className='h-3 w-3 text-gray-400' />;
      }
    }
    return null;
  };

  const getMessageContent = () => {
    if (isDeleted) {
      return <div className='text-gray-400 italic'>{message.content}</div>;
    }

    if (isSystemMessage) {
      return (
        <div className='text-center'>
          <Badge variant='secondary' className='text-xs'>
            {message.content}
          </Badge>
        </div>
      );
    }

    return (
      <div className='space-y-2'>
        {message.replyToMessage && (
          <div className='bg-gray-100 rounded-lg p-2 border-l-4 border-blue-500'>
            <p className='text-xs text-gray-600 font-medium'>
              {message.replyToMessage.sender.firstName} {message.replyToMessage.sender.lastName}
            </p>
            <p className='text-xs text-gray-500 truncate'>{message.replyToMessage.content}</p>
          </div>
        )}

        <div className='whitespace-pre-wrap break-words'>{message.content}</div>

        {message.attachments && message.attachments.length > 0 && (
          <div className='space-y-2'>
            {message.attachments.map((attachment, index) => (
              <div key={index} className='border rounded-lg p-3'>
                <div className='flex items-center space-x-2'>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>{attachment.fileName}</p>
                    <p className='text-xs text-gray-500'>{(attachment.fileSize / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button size='sm' variant='outline'>
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isEdited && <p className='text-xs text-gray-400 italic'>(edited)</p>}
      </div>
    );
  };

  if (isSystemMessage) {
    return <div className='flex justify-center my-4'>{getMessageContent()}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}
    >
      <div className={`flex max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
        {/* Only show avatar for other participants' messages */}
        {!isOwnMessage && (
          <Avatar className='h-8 w-8 flex-shrink-0'>
            <AvatarImage src={message.sender.profileImage} />
            <AvatarFallback>
              {message.sender.firstName[0]}
              {message.sender.lastName[0]}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={`space-y-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {/* Only show sender name for other participants' messages */}
          {!isOwnMessage && (
            <div className='flex items-center space-x-2'>
              <p className='text-xs font-medium'>
                {message.sender.firstName} {message.sender.lastName}
              </p>
              <Badge variant='outline' className='text-xs'>
                {message.sender.role}
              </Badge>
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`rounded-2xl px-4 py-2 w-fit  ${
              isOwnMessage
                ? 'bg-blue-500 text-white rounded-br-md justify-self-end'
                : isSystemMessage
                  ? 'bg-gray-100 text-gray-700 justify-self-start'
                  : 'bg-gray-200 text-gray-900 rounded-bl-md'
            }`}
          >
            {getMessageContent()}
          </div>

          {/* Timestamp and actions - only show for own messages */}
          {isOwnMessage && (
            <div className='flex items-center space-x-1 text-xs text-gray-400 justify-end'>
              <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
              {getReadStatus()}

              {!isSystemMessage && !isDeleted && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm' className='h-4 w-4 p-0'>
                      <MoreVertical className='h-3 w-3' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    {onReply && (
                      <DropdownMenuItem onClick={() => onReply(message._id)}>
                        <Reply className='h-4 w-4 mr-2' />
                        Reply
                      </DropdownMenuItem>
                    )}
                    {onEdit && !isDeleted && (
                      <DropdownMenuItem onClick={() => onEdit(message._id)}>
                        <Edit className='h-4 w-4 mr-2' />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && !isDeleted && (
                      <DropdownMenuItem onClick={() => onDelete(message._id)} className='text-red-600'>
                        <Trash2 className='h-4 w-4 mr-2' />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* For other participants' messages, show timestamp below without actions */}
          {!isOwnMessage && !isSystemMessage && (
            <div className='text-xs text-gray-400'>
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MessageSkeleton() {
  return (
    <div className='flex space-x-2 mb-4'>
      <Skeleton className='h-8 w-8 rounded-full' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-16 w-64 rounded-lg' />
        <Skeleton className='h-3 w-20' />
      </div>
    </div>
  );
}

export function MessageList({
  messages,
  isLoading,
  onLoadMore,
  hasMore,
  currentUserId,
  isMobile = false,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <MessageSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-500'>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {hasMore && onLoadMore && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className='text-center'
        >
          <Button variant='outline' onClick={onLoadMore}>
            Load More Messages
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={message._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <MessageItem
              message={message}
              currentUserId={currentUserId}
              onReply={() => {}} // Will be implemented in parent component
              onEdit={() => {}} // Will be implemented in parent component
              onDelete={() => {}} // Will be implemented in parent component
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}
