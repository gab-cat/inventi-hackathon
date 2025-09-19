'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Poll } from '../types';

interface DeleteConfirmationModalProps {
  poll: Poll | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  poll,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  if (!poll) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10'>
              <AlertTriangle className='h-5 w-5 text-destructive' />
            </div>
            <div>
              <DialogTitle>Delete Poll</DialogTitle>
              <DialogDescription className='text-sm text-muted-foreground'>
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='py-4'>
          <p className='text-sm text-foreground'>
            Are you sure you want to delete the poll <span className='font-semibold'>"{poll.title}"</span>?
          </p>
          <p className='text-sm text-muted-foreground mt-2'>
            This will permanently delete the poll and all its responses. This action cannot be undone.
          </p>
        </div>

        <DialogFooter className='flex-col sm:flex-row gap-2'>
          <Button variant='outline' onClick={onClose} disabled={isLoading} className='w-full sm:w-auto'>
            Cancel
          </Button>
          <Button variant='destructive' onClick={onConfirm} disabled={isLoading} className='w-full sm:w-auto'>
            {isLoading ? (
              <>
                <div className='h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className='h-4 w-4 mr-2' />
                Delete Poll
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
