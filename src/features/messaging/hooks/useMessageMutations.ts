import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useState } from 'react';
import { useProgress } from '@bprogress/next';
import { toast } from 'sonner';
import { UseMessageMutationsReturn, SendMessageForm } from '../types';

export function useMessageMutations(): UseMessageMutationsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { start, stop } = useProgress();

  const sendMessageMutation = useMutation(api.messages.webSendMessage);
  const markAsReadMutation = useMutation(api.messages.webMarkMessageRead);
  const editMessageMutation = useMutation(api.messages.webEditMessage);
  const deleteMessageMutation = useMutation(api.messages.webDeleteMessage);
  const uploadAttachmentMutation = useMutation(api.messages.webUploadChatAttachment);

  const sendMessage = async (data: SendMessageForm) => {
    try {
      setIsLoading(true);
      setError(null);
      start();

      await sendMessageMutation({
        threadId: data.threadId as Id<'chatThreads'>,
        content: data.content,
        messageType: data.messageType,
        attachments: data.attachments,
        replyTo: data.replyTo as Id<'messages'> | undefined,
      });

      toast.success('Message sent successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      toast.error('Failed to send message. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
      stop();
    }
  };

  const markAsRead = async (messageId?: string, threadId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await markAsReadMutation({
        messageId: messageId as Id<'messages'> | undefined,
        threadId: threadId as Id<'chatThreads'> | undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark message as read');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await editMessageMutation({
        messageId: messageId as Id<'messages'>,
        content,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit message');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await deleteMessageMutation({
        messageId: messageId as Id<'messages'>,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAttachment = async (threadId: string, file: File): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      start();

      // In a real implementation, you would upload the file to a storage service first
      // For now, we'll simulate this with a mock URL
      const mockFileUrl = `https://example.com/uploads/${file.name}`;

      await uploadAttachmentMutation({
        threadId: threadId as Id<'chatThreads'>,
        fileName: file.name,
        fileUrl: mockFileUrl,
        fileType: file.type,
        fileSize: file.size,
      });

      toast.success('File uploaded successfully');
      return mockFileUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload attachment');
      toast.error('Failed to upload file. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
      stop();
    }
  };

  return {
    sendMessage,
    markAsRead,
    editMessage,
    deleteMessage,
    uploadAttachment,
    isLoading,
    error,
  };
}
