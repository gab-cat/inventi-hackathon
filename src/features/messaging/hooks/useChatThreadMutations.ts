import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useState } from 'react';
import { UseChatThreadMutationsReturn, CreateChatThreadForm, SendGroupMessageForm } from '../types';

export function useChatThreadMutations(): UseChatThreadMutationsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createThreadMutation = useMutation(api.chatThreads.webCreateChatThread);
  const assignThreadMutation = useMutation(api.chatThreads.webAssignThreadToEmployee);
  const sendGroupMessageMutation = useMutation(api.chatThreads.webSendGroupMessage);
  const moderateChatMutation = useMutation(api.chatThreads.webModerateChat);
  const archiveThreadMutation = useMutation(api.chatThreads.webArchiveChatThread);

  const createThread = async (data: CreateChatThreadForm): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await createThreadMutation({
        propertyId: data.propertyId as Id<'properties'>,
        threadType: data.threadType,
        title: data.title,
        participants: data.participants as Id<'users'>[],
        priority: data.priority,
        initialMessage: data.initialMessage,
      });

      return result.threadId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const assignThread = async (threadId: string, employeeId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await assignThreadMutation({
        threadId: threadId as Id<'chatThreads'>,
        employeeId: employeeId as Id<'users'>,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign thread');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendGroupMessage = async (data: SendGroupMessageForm): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await sendGroupMessageMutation({
        propertyId: data.propertyId as Id<'properties'>,
        title: data.title,
        content: data.content,
        targetAudience: data.targetAudience,
        targetUnits: data.targetUnits as Id<'units'>[] | undefined,
        priority: data.priority,
        attachments: data.attachments,
      });

      return result.threadId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send group message');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const moderateChat = async (threadId: string, action: string, targetUserId?: string, reason?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await moderateChatMutation({
        threadId: threadId as Id<'chatThreads'>,
        action: action as 'mute' | 'unmute' | 'warn' | 'suspend',
        targetUserId: targetUserId as Id<'users'> | undefined,
        reason,
        duration: undefined, // Could be added to the form if needed
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to moderate chat');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const archiveThread = async (threadId: string, isArchived: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      await archiveThreadMutation({
        threadId: threadId as Id<'chatThreads'>,
        isArchived,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive thread');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createThread,
    assignThread,
    sendGroupMessage,
    moderateChat,
    archiveThread,
    isLoading,
    error,
  };
}
