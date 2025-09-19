'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { BarChart3, Users, Calendar, MoreVertical, Edit, Trash2, Eye, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Poll } from '../types';
import { usePollMutations } from '../hooks/usePollMutations';
import { DeleteConfirmationModal } from './delete-confirmation-modal';
import { useProgress } from '@bprogress/next';

interface PollCardProps {
  poll: Poll;
  responseCount?: number;
  onEditPoll: (poll: Poll) => void;
  onViewResults: (poll: Poll) => void;
  onRefresh: () => void;
}

export function PollCard({ poll, responseCount = 0, onEditPoll, onViewResults, onRefresh }: PollCardProps) {
  const { updatePoll, deletePoll, isLoading } = usePollMutations();
  const { toast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { start, stop } = useProgress();

  const handleToggleActive = async () => {
    start();
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
      stop();
    }
  };

  const handleDelete = async () => {
    start();
    try {
      await deletePoll(poll._id);
      setShowDeleteModal(false);
      onRefresh();
    } catch (error) {
      // Error toast is handled by the usePollMutations hook
    } finally {
      stop();
    }
  };

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
      return (
        <Badge variant='secondary' className='bg-red-200 text-red-800'>
          Expired
        </Badge>
      );
    }
    if (poll.isActive) {
      return (
        <Badge variant='default' className='bg-green-200 text-green-800'>
          Active
        </Badge>
      );
    }
    return (
      <Badge variant='outline' className='bg-gray-200 text-gray-800'>
        Inactive
      </Badge>
    );
  };

  return (
    <Card
      key={poll._id}
      className='hover:shadow-md transition-shadow cursor-pointer'
      onClick={() => onViewResults(poll)}
    >
      <CardHeader className='pb-3'>
        <div className='flex flex-col space-y-3 md:flex-row md:items-start md:justify-between md:space-y-0'>
          <div className='space-y-1 flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <CardTitle className='text-base md:text-lg truncate'>{poll.title}</CardTitle>
            </div>
            <p className='text-sm text-muted-foreground line-clamp-2'>{poll.question}</p>
          </div>
          <div className='flex items-center justify-between md:justify-end gap-2' onClick={e => e.stopPropagation()}>
            <div className='md:hidden'>{getStatusBadge()}</div>
            <div className='hidden md:block'>{getStatusBadge()}</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='shrink-0'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => onViewResults(poll)}>
                  <BarChart3 className='h-4 w-4 mr-2' />
                  View Results
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditPoll(poll)}>
                  <Edit className='h-4 w-4 mr-2' />
                  Edit Poll
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleActive}>
                  {poll.isActive ? (
                    <>
                      <Pause className='h-4 w-4 mr-2' />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Play className='h-4 w-4 mr-2' />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteModal(true)} className='text-destructive'>
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm'>
          <div className='flex items-center gap-2'>
            <Users className='h-4 w-4 text-muted-foreground shrink-0' />
            <span className='text-muted-foreground'>Type:</span>
            <span className='truncate'>{getPollTypeLabel(poll.pollType)}</span>
          </div>
          <div className='flex items-center gap-2'>
            <BarChart3 className='h-4 w-4 text-muted-foreground shrink-0' />
            <span className='text-muted-foreground'>Responses:</span>
            <span className='font-medium'>{responseCount}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-muted-foreground shrink-0' />
            <span className='text-muted-foreground'>Created:</span>
            <span className='truncate'>{format(new Date(poll.createdAt), 'MMM dd, yyyy')}</span>
          </div>
          {poll.expiresAt && (
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-muted-foreground shrink-0' />
              <span className='text-muted-foreground'>Expires:</span>
              <span className={`truncate ${isExpired() ? 'text-destructive' : ''}`}>
                {format(new Date(poll.expiresAt), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
          <div className='flex items-center gap-2 sm:col-span-2 lg:col-span-1'>
            <Eye className='h-4 w-4 text-muted-foreground shrink-0' />
            <span className='text-muted-foreground'>Anonymous:</span>
            <span>{poll.allowAnonymous ? 'Yes' : 'No'}</span>
          </div>
        </div>

        {poll.description && (
          <div className='mt-3'>
            <p className='text-sm text-muted-foreground line-clamp-2'>{poll.description}</p>
          </div>
        )}

        {poll.options.length > 0 && poll.pollType !== 'text' && (
          <div className='mt-3'>
            <p className='text-sm font-medium mb-2'>Options:</p>
            <div className='flex flex-wrap gap-1.5'>
              {poll.options.slice(0, 3).map((option, index) => (
                <Badge key={index} variant='outline' className='text-xs truncate max-w-[120px]'>
                  {option}
                </Badge>
              ))}
              {poll.options.length > 3 && (
                <Badge variant='outline' className='text-xs'>
                  +{poll.options.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        poll={poll}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isLoading}
      />
    </Card>
  );
}
