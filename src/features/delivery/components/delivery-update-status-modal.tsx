'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Id } from '@convex/_generated/dataModel';

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'in_transit', 'delivered', 'collected', 'failed', 'returned']),
  notes: z.string().optional(),
  actualDelivery: z.string().optional(),
});

type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;

interface DeliveryUpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateStatusFormData) => void;
  isLoading: boolean;
  currentStatus: string;
  deliveryId: Id<'deliveries'>;
}

export function DeliveryUpdateStatusModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  currentStatus,
  deliveryId,
}: DeliveryUpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const form = useForm<UpdateStatusFormData>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: currentStatus as any,
      notes: '',
      actualDelivery: '',
    },
  });

  const handleSubmit = (data: UpdateStatusFormData) => {
    onSubmit(data);
  };

  // Define valid status transitions
  const getValidStatuses = (currentStatus: string) => {
    const validTransitions: Record<string, string[]> = {
      registered: ['arrived', 'failed', 'returned'],
      arrived: ['collected', 'failed', 'returned'],
      collected: [], // Final state
      failed: ['registered', 'returned'],
      returned: [], // Final state
    };
    return validTransitions[currentStatus] || [];
  };

  const validStatuses = getValidStatuses(currentStatus);
  const showActualDeliveryField = ['arrived', 'collected'].includes(selectedStatus);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Update Delivery Status</DialogTitle>
          <DialogDescription>
            Update the status for delivery {deliveryId}. Only valid status transitions are allowed.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Status *</FormLabel>
                  <Select
                    onValueChange={value => {
                      field.onChange(value);
                      setSelectedStatus(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select new status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {validStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showActualDeliveryField && (
              <FormField
                control={form.control}
                name='actualDelivery'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Delivery Time</FormLabel>
                    <FormControl>
                      <Input type='datetime-local' placeholder='Select actual delivery time' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Add any notes about this status change'
                      className='min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2 pt-4'>
              <Button type='button' variant='outline' onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
