'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, X, Smile } from 'lucide-react';
import { MessageInputProps } from '../types';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

export function MessageInput({
  threadId,
  onSendMessage,
  onUploadAttachment,
  replyTo,
  onCancelReply,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!message.trim() || disabled) return;

    try {
      await onSendMessage(message.trim(), 'text');
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadAttachment) return;

    setIsUploading(true);
    try {
      const fileUrl = await onUploadAttachment(file);
      await onSendMessage(`Shared file: ${file.name}`, 'file', [
        {
          fileName: file.name,
          fileUrl,
          fileType: file.type,
          fileSize: file.size,
        },
      ]);
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='space-y-3'>
      {replyTo && (
        <Card className='bg-blue-50 border-blue-200'>
          <CardContent className='p-3'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <Badge variant='outline' className='mb-1'>
                  Replying to {replyTo.sender.firstName} {replyTo.sender.lastName}
                </Badge>
                <p className='text-sm text-gray-600 truncate'>{replyTo.content}</p>
              </div>
              <Button variant='ghost' size='sm' onClick={onCancelReply} className='h-6 w-6 p-0'>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className='flex items-end space-x-2'>
        <div className='flex-1'>
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Type your message...'
            className='min-h-[40px] max-h-32 resize-none'
            disabled={disabled || isUploading}
            rows={1}
          />
        </div>

        <div className='flex items-center space-x-1'>
          <input
            ref={fileInputRef}
            type='file'
            onChange={handleFileUpload}
            className='hidden'
            accept='image/*,.pdf,.doc,.docx,.txt'
          />

          <Button
            variant='ghost'
            size='sm'
            onClick={handleAttachmentClick}
            disabled={disabled || isUploading || !onUploadAttachment}
            className='h-10 w-10 p-0'
          >
            <Paperclip className='h-4 w-4' />
          </Button>

          <Button variant='ghost' size='sm' disabled={disabled || isUploading} className='h-10 w-10 p-0'>
            <Smile className='h-4 w-4' />
          </Button>

          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled || isUploading}
            className='h-10 w-10 p-0 bg-blue-500 text-white'
          >
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {isUploading && <div className='text-sm text-gray-500 text-center'>Uploading file...</div>}
    </div>
  );
}
