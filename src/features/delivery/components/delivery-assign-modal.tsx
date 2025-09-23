'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Id } from '@convex/_generated/dataModel';

const assignDeliverySchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  notes: z.string().optional(),
});

type AssignDeliveryFormData = z.infer<typeof assignDeliverySchema>;

interface DeliveryAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssignDeliveryFormData) => void;
  isLoading: boolean;
  deliveryId: Id<'deliveries'>;
  units: Array<{ _id: string; unitNumber: string; propertyId: string }>;
  currentUnitId?: string;
}

export function DeliveryAssignModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  deliveryId,
  units,
  currentUnitId,
}: DeliveryAssignModalProps) {
  const form = useForm<AssignDeliveryFormData>({
    resolver: zodResolver(assignDeliverySchema),
    defaultValues: {
      unitId: currentUnitId || '',
      notes: '',
    },
  });

  const handleSubmit = (data: AssignDeliveryFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Assign Delivery to Unit</DialogTitle>
          <DialogDescription>
            Assign delivery {deliveryId} to a specific unit. This will change the status to "In Transit".
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='unitId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Unit *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a unit' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit._id} value={unit._id}>
                          Unit {unit.unitNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Add any notes about this assignment' className='min-h-[80px]' {...field} />
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
                {isLoading ? 'Assigning...' : 'Assign to Unit'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
