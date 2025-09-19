'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { BarChart3, Users, Calendar, MessageSquare, Eye, EyeOff, Edit, Trash2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { PollWithResponses, PollStats } from '../types';
import { usePollMutations } from '../hooks/usePollMutations';
import { DeleteConfirmationModal } from './delete-confirmation-modal';

interface PollDetailSheetProps {
  poll: PollWithResponses | null;
  stats: PollStats | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (poll: PollWithResponses) => void;
  onRefresh: () => void;
  onPollDeleted?: () => void;
}

export function PollDetailSheet({
  poll,
  stats,
  isOpen,
  onClose,
  onEdit,
  onRefresh,
  onPollDeleted,
}: PollDetailSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { updatePoll, deletePoll } = usePollMutations();
  const { toast } = useToast();

  if (!poll || !stats) return null;

  const getPollTypeLabel = (type: string) => {
    switch (type) {
      case 'single_choice':
        return 'Single Choice';
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'rating':
        return 'Rating Scale';
      case 'text':
        return 'Text Response';
      default:
        return type;
    }
  };

  const isExpired = () => {
    return poll.expiresAt && Date.now() > poll.expiresAt;
  };

  const getStatusBadge = () => {
    if (isExpired()) {
      return <Badge variant='secondary'>Expired</Badge>;
    }
    if (poll.isActive) {
      return <Badge variant='default'>Active</Badge>;
    }
    return <Badge variant='outline'>Inactive</Badge>;
  };

  const getOptionPercentage = (optionIndex: number) => {
    if (stats.totalResponses === 0) return 0;
    const count = stats.optionCounts[optionIndex.toString()] || 0;
    return Math.round((count / stats.totalResponses) * 100);
  };

  const handleToggleActive = async () => {
    setIsLoading(true);
    try {
      await updatePoll(poll._id, { isActive: !poll.isActive });
      toast({
        title: 'Success',
        description: `Poll ${poll.isActive ? 'deactivated' : 'activated'} successfully.`,
      });
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update poll status.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deletePoll(poll._id);
      setShowDeleteModal(false);
      onClose();
      onPollDeleted?.(); // Call the onPollDeleted callback if provided
    } catch (error) {
      // Error toast is handled by the usePollMutations hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='w-full sm:max-w-2xl'>
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className='sr-only'>{poll.title}</DialogTitle>

        {/* Header with actions */}
        <div className='flex gap-4 flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-4 border-b'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Poll Results / {getStatusBadge()}</span>
          </div>
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onEdit(poll)}
              disabled={isLoading}
              className='w-full sm:w-auto'
            >
              <Edit className='h-4 w-4 mr-1' />
              Edit
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleToggleActive}
              disabled={isLoading}
              className='w-full sm:w-auto'
            >
              {poll.isActive ? (
                <>
                  <Pause className='h-4 w-4 mr-1' />
                  Deactivate
                </>
              ) : (
                <>
                  <Play className='h-4 w-4 mr-1' />
                  Activate
                </>
              )}
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => setShowDeleteModal(true)}
              disabled={isLoading}
              className='w-full sm:w-auto'
            >
              <Trash2 className='h-4 w-4 mr-1' />
              Delete
            </Button>
          </div>
        </div>

        <div className='px-4 sm:px-6 pb-6 space-y-4 sm:space-y-6'>
          {/* Title */}
          <div>
            <h1 className='text-xl sm:text-2xl font-bold text-foreground mb-2 break-words'>{poll.title}</h1>
            <p className='text-base sm:text-lg text-muted-foreground break-words'>{poll.question}</p>
            {poll.description && <p className='text-sm text-muted-foreground mt-2 break-words'>{poll.description}</p>}
          </div>

          {/* Poll Info */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              <BarChart3 className='h-4 w-4 text-muted-foreground' />
              <span className='text-muted-foreground'>Type:</span>
              <span>{getPollTypeLabel(poll.pollType)}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <span className='text-muted-foreground'>Responses:</span>
              <span className='font-medium'>{stats.totalResponses}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-muted-foreground' />
              <span className='text-muted-foreground'>Created:</span>
              <span>{format(new Date(poll.createdAt), 'MMM dd, yyyy')}</span>
            </div>
            <div className='flex items-center gap-2'>
              {poll.allowAnonymous ? (
                <Eye className='h-4 w-4 text-muted-foreground' />
              ) : (
                <EyeOff className='h-4 w-4 text-muted-foreground' />
              )}
              <span className='text-muted-foreground'>Anonymous:</span>
              <span>{poll.allowAnonymous ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {/* Results */}
          {stats.totalResponses > 0 ? (
            <div className='space-y-6'>
              {/* Choice-based poll results */}
              {poll.pollType !== 'text' && poll.options.length > 0 && (
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold'>Response Distribution</h3>
                  {poll.options.map((option, index) => {
                    const count = stats.optionCounts[index.toString()] || 0;
                    const percentage = getOptionPercentage(index);

                    return (
                      <div key={index} className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='font-medium'>{option}</span>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm text-muted-foreground'>
                              {count} response{count !== 1 ? 's' : ''}
                            </span>
                            <Badge variant='outline'>{percentage}%</Badge>
                          </div>
                        </div>
                        <Progress value={percentage} className='h-2' />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Text responses */}
              {poll.pollType === 'text' && stats.textResponses.length > 0 && (
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold'>Text Responses</h3>
                  <div className='space-y-4'>
                    {stats.textResponses.map((response, index) => (
                      <div key={index} className='p-4 border rounded-lg'>
                        <p className='text-sm'>{response}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual responses (if not anonymous) */}
              {!poll.allowAnonymous && poll.responses && poll.responses.length > 0 && (
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold'>Individual Responses</h3>
                  <div className='space-y-4'>
                    {poll.responses?.map(response => (
                      <div key={response._id} className='p-4 border rounded-lg'>
                        <div className='flex items-center justify-between mb-2'>
                          <div>
                            <span className='font-medium'>{response.userName}</span>
                            <span className='text-sm text-muted-foreground ml-2'>({response.userEmail})</span>
                          </div>
                          <span className='text-sm text-muted-foreground'>
                            {format(new Date(response.submittedAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>

                        {response.selectedOptions.length > 0 && (
                          <div className='mb-2'>
                            <span className='text-sm font-medium'>Selected: </span>
                            {response.selectedOptions.map((optionIndex, idx) => (
                              <Badge key={idx} variant='outline' className='mr-1'>
                                {poll.options[optionIndex]}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {response.textResponse && (
                          <div>
                            <span className='text-sm font-medium'>Response: </span>
                            <p className='text-sm mt-1'>{response.textResponse}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12'>
              <MessageSquare className='h-12 w-12 text-muted-foreground mb-4' />
              <h3 className='text-lg font-medium mb-2'>No responses yet</h3>
              <p className='text-muted-foreground text-center'>
                This poll hasn't received any responses yet. Share it with your tenants to start collecting feedback.
              </p>
            </div>
          )}
        </div>
      </SheetContent>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        poll={poll}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isLoading}
      />
    </Sheet>
  );
}
