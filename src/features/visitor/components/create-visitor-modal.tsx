'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useVisitorMutations } from '../hooks/useVisitorMutations';
import { Id } from '@/convex/_generated/dataModel';

const createVisitorSchema = z.object({
  visitorName: z.string().min(1, 'Visitor name is required'),
  visitorEmail: z.string().email().optional().or(z.literal('')),
  visitorPhone: z.string().optional(),
  visitorIdNumber: z.string().optional(),
  visitorIdType: z.string().optional(),
  purpose: z.string().min(1, 'Purpose is required'),
  expectedArrival: z.date({
    required_error: 'Expected arrival date is required',
  }),
  expectedDeparture: z.date().optional(),
  numberOfVisitors: z.number().min(1, 'Number of visitors must be at least 1'),
});

type CreateVisitorFormData = z.infer<typeof createVisitorSchema>;

interface CreateVisitorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: Id<'properties'>;
  unitId: Id<'units'>;
  onSuccess: () => void;
}

export function CreateVisitorModal({ open, onOpenChange, propertyId, unitId, onSuccess }: CreateVisitorModalProps) {
  const [loading, setLoading] = useState(false);
  const { handleCreateVisitorEntry } = useVisitorMutations();

  const form = useForm<CreateVisitorFormData>({
    resolver: zodResolver(createVisitorSchema),
    defaultValues: {
      visitorName: '',
      visitorEmail: '',
      visitorPhone: '',
      visitorIdNumber: '',
      visitorIdType: '',
      purpose: '',
      numberOfVisitors: 1,
    },
  });

  const onSubmit = async (data: CreateVisitorFormData) => {
    setLoading(true);
    try {
      await handleCreateVisitorEntry({
        propertyId,
        unitId,
        visitorName: data.visitorName,
        visitorEmail: data.visitorEmail || undefined,
        visitorPhone: data.visitorPhone || undefined,
        visitorIdNumber: data.visitorIdNumber || undefined,
        visitorIdType: data.visitorIdType || undefined,
        purpose: data.purpose,
        expectedArrival: data.expectedArrival.getTime(),
        expectedDeparture: data.expectedDeparture?.getTime(),
        numberOfVisitors: data.numberOfVisitors,
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to create visitor entry:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Create Visitor Entry</DialogTitle>
          <DialogDescription>Create a new visitor entry for the selected unit.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='visitorName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visitor Name *</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter visitor name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='visitorEmail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type='email' placeholder='Enter email address' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='visitorPhone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter phone number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='numberOfVisitors'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Visitors *</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='1'
                        placeholder='1'
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='visitorIdType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select ID type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='driver_license'>Driver's License</SelectItem>
                        <SelectItem value='passport'>Passport</SelectItem>
                        <SelectItem value='national_id'>National ID</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='visitorIdNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter ID number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='purpose'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose of Visit *</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Describe the purpose of the visit' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='expectedArrival'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Expected Arrival *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='expectedDeparture'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Expected Departure</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date => {
                            const arrivalDate = form.getValues('expectedArrival');
                            return date < (arrivalDate || new Date());
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type='submit' disabled={loading}>
                {loading ? 'Creating...' : 'Create Visitor Entry'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
