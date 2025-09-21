import { useMutation } from 'convex/react';
import { useState } from 'react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useToast } from '@/hooks/use-toast';
import { CreatePollForm, UpdatePollForm, UsePollMutationsReturn } from '../types';

export function usePollMutations(): UsePollMutationsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { toast } = useToast();

  const createPollMutation = useMutation(api.noticeboard.webCreatePoll);
  const updatePollMutation = useMutation(api.noticeboard.webUpdatePoll);
  const deletePollMutation = useMutation(api.noticeboard.webDeletePoll);
  const submitResponseMutation = useMutation(api.noticeboard.webSubmitPollResponse);

  const handleMutation = async <T>(mutationFn: (args: T) => Promise<any>, args: T, successMessage?: string) => {
    try {
      setIsLoading(true);
      setError(undefined);
      await mutationFn(args);
      if (successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createPoll = async (data: CreatePollForm) => {
    await handleMutation(createPollMutation, data, 'Poll created successfully');
  };

  const updatePoll = async (pollId: Id<'polls'>, data: UpdatePollForm) => {
    await handleMutation(updatePollMutation, { pollId, ...data }, 'Poll updated successfully');
  };

  const deletePoll = async (pollId: Id<'polls'>) => {
    await handleMutation(deletePollMutation, { pollId }, 'Poll deleted successfully');
  };

  const submitResponse = async (pollId: Id<'polls'>, selectedOptions?: number[], textResponse?: string) => {
    await handleMutation(
      submitResponseMutation,
      { pollId, selectedOptions, textResponse },
      'Response submitted successfully'
    );
  };

  return {
    createPoll,
    updatePoll,
    deletePoll,
    submitResponse,
    isLoading,
    error,
  };
}
