'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NoticeForm } from './notice-form';
import { CreateNoticeForm, UpdateNoticeForm, NoticeFormProps, NoticeWithDetails } from '../types';

interface NoticeEditModalProps {
  notice: NoticeWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (noticeId: string, data: UpdateNoticeForm) => Promise<void>;
  isLoading?: boolean;
  properties: NoticeFormProps['properties'];
  units: NoticeFormProps['units'];
}

export function NoticeEditModal({
  notice,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  properties,
  units,
}: NoticeEditModalProps) {
  const handleSubmit = async (data: CreateNoticeForm | UpdateNoticeForm) => {
    if (!notice) return;
    await onSubmit(notice._id, data as UpdateNoticeForm);
    onClose();
  };

  if (!notice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Edit Notice</DialogTitle>
        </DialogHeader>

        <NoticeForm
          initialData={notice}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          mode='edit'
          properties={properties}
          units={units}
        />
      </DialogContent>
    </Dialog>
  );
}
