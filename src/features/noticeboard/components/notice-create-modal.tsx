'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NoticeForm } from './notice-form';
import { CreateNoticeForm, NoticeFormProps, UpdateNoticeForm } from '../types';

interface NoticeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNoticeForm) => Promise<void>;
  isLoading?: boolean;
  properties: NoticeFormProps['properties'];
  units: NoticeFormProps['units'];
}

export function NoticeCreateModal({ isOpen, onClose, onSubmit, isLoading, properties, units }: NoticeCreateModalProps) {
  const handleSubmit = async (data: CreateNoticeForm | UpdateNoticeForm) => {
    await onSubmit(data as CreateNoticeForm);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            <span className='sr-only'>Create New Notice</span>
          </DialogTitle>
        </DialogHeader>

        <NoticeForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          mode='create'
          properties={properties}
          units={units}
        />
      </DialogContent>
    </Dialog>
  );
}
