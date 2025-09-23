'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { DeliveryWithDetails } from '../types';

const editDeliverySchema = z.object({
  deliveryType: z.enum(['package', 'food', 'grocery', 'mail', 'other']),
  senderName: z.string().min(1, 'Sender name is required').max(100, 'Sender name must be less than 100 characters'),
  senderCompany: z.string().optional(),
  recipientName: z
    .string()
    .min(1, 'Recipient name is required')
    .max(100, 'Recipient name must be less than 100 characters'),
  recipientPhone: z.string().optional(),
  recipientEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  trackingNumber: z.string().optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  estimatedDelivery: z.string().min(1, 'Estimated delivery time is required'),
  deliveryLocation: z.string().optional(),
  deliveryNotes: z.string().optional(),
});

type EditDeliveryFormData = z.infer<typeof editDeliverySchema>;

interface DeliveryEditModalProps {
  delivery: DeliveryWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditDeliveryFormData) => void;
  isLoading: boolean;
  units: Array<{ _id: string; unitNumber: string; propertyId: string }>;
}

export function DeliveryEditModal({ delivery, isOpen, onClose, onSubmit, isLoading, units }: DeliveryEditModalProps) {
  const form = useForm<EditDeliveryFormData>({
    resolver: zodResolver(editDeliverySchema),
    defaultValues: {
      deliveryType: delivery?.deliveryType || 'package',
      senderName: delivery?.senderName || '',
      senderCompany: delivery?.senderCompany || '',
      recipientName: delivery?.recipientName || '',
      recipientPhone: delivery?.recipientPhone || '',
      recipientEmail: delivery?.recipientEmail || '',
      trackingNumber: delivery?.trackingNumber || '',
      description: delivery?.description || '',
      estimatedDelivery: delivery?.estimatedDelivery
        ? format(new Date(delivery.estimatedDelivery), "yyyy-MM-dd'T'HH:mm")
        : '',
      deliveryLocation: delivery?.deliveryLocation || '',
      deliveryNotes: delivery?.deliveryNotes || '',
    },
  });

  const handleSubmit = (data: EditDeliveryFormData) => {
    onSubmit(data);
  };

  if (!delivery) return null;

  const availableUnits = units.filter(unit => unit.propertyId === delivery.propertyId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Edit Delivery</DialogTitle>
          <DialogDescription>Update the delivery information for {delivery.deliveryType} delivery.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Delivery Type */}
              <FormField
                control={form.control}
                name='deliveryType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select delivery type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='package'>Package</SelectItem>
                        <SelectItem value='food'>Food</SelectItem>
                        <SelectItem value='grocery'>Grocery</SelectItem>
                        <SelectItem value='mail'>Mail</SelectItem>
                        <SelectItem value='other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Location */}
              <FormField
                control={form.control}
                name='deliveryLocation'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select delivery location' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='lobby'>Lobby</SelectItem>
                        <SelectItem value='mailroom'>Mailroom</SelectItem>
                        <SelectItem value='storage'>Storage</SelectItem>
                        <SelectItem value='unit'>Unit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Sender Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>Sender Information</h3>
                <FormField
                  control={form.control}
                  name='senderName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender Name *</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter sender name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='senderCompany'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter company name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Recipient Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>Recipient Information</h3>
                <FormField
                  control={form.control}
                  name='recipientName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Name *</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter recipient name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='recipientPhone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter phone number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='recipientEmail'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter email address' type='email' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Delivery Details */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Delivery Details</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='trackingNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter tracking number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='estimatedDelivery'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Delivery Time *</FormLabel>
                      <FormControl>
                        <Input type='datetime-local' placeholder='Select estimated delivery time' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Describe the delivery contents' className='min-h-[100px]' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='deliveryNotes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Add any special delivery instructions or notes'
                        className='min-h-[80px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className='flex justify-end gap-2 pt-4 border-t'>
              <Button type='button' variant='outline' onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
