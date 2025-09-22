'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Id } from '../../../../convex/_generated/dataModel';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { NoticeFormProps } from '../types';

const noticeFormSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content must be less than 5000 characters'),
  noticeType: z.enum(['announcement', 'maintenance', 'payment_reminder', 'emergency', 'event', 'general']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  targetAudience: z.enum(['all', 'tenants', 'specific_units', 'managers']),
  targetUnits: z.array(z.string()).optional(),
  scheduledAt: z.string().optional(),
  expiresAt: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

type NoticeFormData = z.infer<typeof noticeFormSchema>;

export function NoticeForm({ initialData, onSubmit, onCancel, isLoading, mode, properties, units }: NoticeFormProps) {
  const form = useForm<NoticeFormData>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: {
      propertyId: initialData?.propertyId || '',
      unitId: initialData?.unitId || '',
      title: initialData?.title || '',
      content: initialData?.content || '',
      noticeType: initialData?.noticeType || 'announcement',
      priority: initialData?.priority || 'medium',
      targetAudience: initialData?.targetAudience || 'all',
      targetUnits: initialData?.targetUnits || [],
      scheduledAt: initialData?.scheduledAt ? format(new Date(initialData.scheduledAt), "yyyy-MM-dd'T'HH:mm") : '',
      expiresAt: initialData?.expiresAt ? format(new Date(initialData.expiresAt), "yyyy-MM-dd'T'HH:mm") : '',
      attachments: initialData?.attachments || [],
    },
  });

  const handleSubmit = (data: NoticeFormData) => {
    if (mode === 'create') {
      const submitData = {
        ...data,
        propertyId: data.propertyId as Id<'properties'>,
        unitId: data.unitId ? (data.unitId as Id<'units'>) : undefined,
        targetUnits: data.targetUnits?.map(id => id as Id<'units'>),
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).getTime() : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).getTime() : undefined,
      };
      onSubmit(submitData);
    } else {
      // For updates, exclude propertyId and unitId as they shouldn't be changed
      const submitData = {
        title: data.title,
        content: data.content,
        noticeType: data.noticeType,
        priority: data.priority,
        targetAudience: data.targetAudience,
        targetUnits: data.targetUnits?.map(id => id as Id<'units'>),
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).getTime() : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).getTime() : undefined,
        attachments: data.attachments,
      };
      onSubmit(submitData);
    }
  };

  const addAttachment = () => {
    const currentAttachments = form.getValues('attachments') || [];
    form.setValue('attachments', [...currentAttachments, '']);
  };

  const removeAttachment = (index: number) => {
    const currentAttachments = form.getValues('attachments') || [];
    form.setValue(
      'attachments',
      currentAttachments.filter((_, i) => i !== index)
    );
  };

  const updateAttachment = (index: number, value: string) => {
    const currentAttachments = form.getValues('attachments') || [];
    const newAttachments = [...currentAttachments];
    newAttachments[index] = value;
    form.setValue('attachments', newAttachments);
  };

  return (
    <Card className='border-none bg-background shadow-none p-0'>
      <CardHeader className='p-0'>
        <CardTitle>{mode === 'create' ? 'Create New Notice' : 'Edit Notice'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Create a new notice to be sent to all tenants'
            : 'Edit the notice to be sent to all tenants'}
        </CardDescription>
      </CardHeader>
      <CardContent className='p-0'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='propertyId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select property' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map(property => (
                          <SelectItem key={property._id} value={property._id}>
                            {property.name}
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
                name='unitId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit (Optional)</FormLabel>
                    <Select
                      onValueChange={value => field.onChange(value === 'all' ? undefined : value)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select unit' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='all'>All Units</SelectItem>
                        {units
                          .filter(unit => !form.watch('propertyId') || unit.propertyId === form.watch('propertyId'))
                          .map(unit => (
                            <SelectItem key={unit._id} value={unit._id}>
                              {unit.unitNumber}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter notice title' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Enter notice content' className='min-h-[120px]' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='noticeType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='announcement'>Announcement</SelectItem>
                        <SelectItem value='maintenance'>Maintenance</SelectItem>
                        <SelectItem value='payment_reminder'>Payment Reminder</SelectItem>
                        <SelectItem value='emergency'>Emergency</SelectItem>
                        <SelectItem value='event'>Event</SelectItem>
                        <SelectItem value='general'>General</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='priority'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='low'>Low</SelectItem>
                        <SelectItem value='medium'>Medium</SelectItem>
                        <SelectItem value='high'>High</SelectItem>
                        <SelectItem value='urgent'>Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='targetAudience'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='all'>All Tenants</SelectItem>
                        <SelectItem value='tenants'>Tenants Only</SelectItem>
                        <SelectItem value='specific_units'>Specific Units</SelectItem>
                        <SelectItem value='managers'>Managers Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='scheduledAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule (Optional)</FormLabel>
                    <FormControl>
                      <Input type='datetime-local' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='expiresAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires (Optional)</FormLabel>
                    <FormControl>
                      <Input type='datetime-local' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='attachments'
              render={() => (
                <FormItem>
                  <FormLabel>Attachments</FormLabel>
                  <div className='space-y-2'>
                    {form.watch('attachments')?.map((attachment, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <Input
                          placeholder='Attachment URL'
                          value={attachment}
                          onChange={e => updateAttachment(index, e.target.value)}
                        />
                        <Button type='button' variant='outline' size='sm' onClick={() => removeAttachment(index)}>
                          <X className='w-4 h-4' />
                        </Button>
                      </div>
                    ))}
                    <Button type='button' variant='outline' size='sm' onClick={addAttachment}>
                      <Plus className='w-4 h-4 mr-2' />
                      Add Attachment
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={onCancel}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading} className='bg-blue-500 hover:bg-blue-600'>
                {isLoading ? 'Saving...' : mode === 'create' ? 'Create Notice' : 'Update Notice'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
