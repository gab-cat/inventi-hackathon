'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { DeliveryForm } from './delivery-form';
import { CreateDeliveryForm } from '../types';

interface DeliveryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDeliveryForm) => void;
  isLoading: boolean;
  properties: Array<{ _id: string; name: string; address: string }>;
  units: Array<{ _id: string; unitNumber: string; propertyId: string }>;
}

export function DeliveryCreateModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  properties,
  units,
}: DeliveryCreateModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Register New Delivery</DialogTitle>
          <DialogDescription>
            Register a new delivery for tracking and management. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <DeliveryForm
          onSubmit={onSubmit}
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
