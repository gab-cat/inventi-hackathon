'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { DeliveryFormProps } from '../types';

const deliveryFormSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional(),
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
  photos: z.array(z.string()).optional(),
});

type DeliveryFormData = z.infer<typeof deliveryFormSchema>;

export function DeliveryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  mode,
  properties,
  units,
}: DeliveryFormProps) {
  const form = useForm<DeliveryFormData>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      propertyId: initialData?.propertyId || '',
      unitId: initialData?.unitId || '',
      deliveryType: initialData?.deliveryType || 'package',
      senderName: initialData?.senderName || '',
      senderCompany: initialData?.senderCompany || '',
      recipientName: initialData?.recipientName || '',
      recipientPhone: initialData?.recipientPhone || '',
      recipientEmail: initialData?.recipientEmail || '',
      trackingNumber: initialData?.trackingNumber || '',
      description: initialData?.description || '',
      estimatedDelivery: initialData?.estimatedDelivery || '',
      deliveryLocation: initialData?.deliveryLocation || '',
      deliveryNotes: initialData?.deliveryNotes || '',
      photos: initialData?.photos || [],
    },
  });

  const selectedPropertyId = form.watch('propertyId');
  const availableUnits = units.filter(unit => unit.propertyId === selectedPropertyId);

  const handleSubmit = (data: DeliveryFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Property Selection */}
          <FormField
            control={form.control}
            name='propertyId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a property' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {properties.map(property => (
                      <SelectItem key={property._id} value={property._id}>
                        {property.name} - {property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Unit Selection */}
          <FormField
            control={form.control}
            name='unitId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit (Optional)</FormLabel>
                <Select
                  onValueChange={value => field.onChange(value === 'none' ? undefined : value)}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a unit (optional)' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='none'>No specific unit</SelectItem>
                    {availableUnits.map(unit => (
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
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Sender Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
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
            </CardContent>
          </Card>

          {/* Recipient Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Recipient Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
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
            </CardContent>
          </Card>
        </div>

        {/* Delivery Details */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Delivery Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
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
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className='flex justify-end gap-2'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Saving...' : mode === 'create' ? 'Register Delivery' : 'Update Delivery'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
