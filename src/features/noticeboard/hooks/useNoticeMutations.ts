import { useMutation } from 'convex/react';
import { useState } from 'react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import {
  CreateNoticeForm,
  UpdateNoticeForm,
  SendNoticeToAllForm,
  SendNoticeToUnitForm,
  ScheduleNoticeForm,
  UseNoticeMutationsReturn,
} from '../types';

export function useNoticeMutations(): UseNoticeMutationsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const createNoticeMutation = useMutation(api.noticeboard.webCreateNotice);
  const updateNoticeMutation = useMutation(api.noticeboard.webUpdateNotice);
  const deleteNoticeMutation = useMutation(api.noticeboard.webDeleteNotice);
  const sendNoticeToAllMutation = useMutation(api.noticeboard.webSendNoticeToAll);
  const sendNoticeToUnitMutation = useMutation(api.noticeboard.webSendNoticeToUnit);
  const scheduleNoticeMutation = useMutation(api.noticeboard.webScheduleNotice);
  const acknowledgeNoticeMutation = useMutation(api.noticeboard.webAcknowledgeNotice);

  const handleMutation = async <T>(mutationFn: (args: T) => Promise<any>, args: T, successMessage?: string) => {
    try {
      setIsLoading(true);
      setError(undefined);
      await mutationFn(args);
      if (successMessage) {
        // You could add a toast notification here
        console.log(successMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createNotice = async (data: CreateNoticeForm) => {
    await handleMutation(createNoticeMutation, data, 'Notice created successfully');
  };

  const updateNotice = async (noticeId: Id<'notices'>, data: UpdateNoticeForm) => {
    await handleMutation(updateNoticeMutation, { noticeId, ...data }, 'Notice updated successfully');
  };

  const deleteNotice = async (noticeId: Id<'notices'>) => {
    await handleMutation(deleteNoticeMutation, { noticeId }, 'Notice deleted successfully');
  };

  const sendNoticeToAll = async (data: SendNoticeToAllForm) => {
    await handleMutation(sendNoticeToAllMutation, data, 'Notice sent to all tenants');
  };

  const sendNoticeToUnit = async (data: SendNoticeToUnitForm) => {
    await handleMutation(sendNoticeToUnitMutation, data, 'Notice sent to unit');
  };

  const scheduleNotice = async (noticeId: Id<'notices'>, data: ScheduleNoticeForm) => {
    await handleMutation(scheduleNoticeMutation, { noticeId, ...data }, 'Notice scheduled successfully');
  };

  const acknowledgeNotice = async (noticeId: Id<'notices'>) => {
    await handleMutation(acknowledgeNoticeMutation, { noticeId }, 'Notice acknowledged');
  };

  return {
    createNotice,
    updateNotice,
    deleteNotice,
    sendNoticeToAll,
    sendNoticeToUnit,
    scheduleNotice,
    acknowledgeNotice,
    isLoading,
    error,
  };
}
