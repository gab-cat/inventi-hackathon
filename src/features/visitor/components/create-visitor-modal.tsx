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
import { Id } from '@convex/_generated/dataModel';

const createVisitorSchema = z.object({
  visitorName: z.string().min(1, 'Visitor name is required'),
  visitorEmail: z.string().email().optional().or(z.literal('')),
  visitorPhone: z.string().optional(),
  visitorIdNumber: z.string().optional(),
  visitorIdType: z.string().optional(),
  purpose: z.string().min(1, 'Purpose is required'),
  expectedArrival: z.date({
    error: 'Expected arrival date is required',
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
                render={({ field }) => {
                  const [open, setOpen] = useState(false);
                  const [month, setMonth] = useState<Date | undefined>(field.value);
                  const [value, setValue] = useState(field.value ? format(field.value, 'PPP') : '');

                  const formatDate = (date: Date | undefined) => {
                    if (!date) return '';
                    return format(date, 'PPP');
                  };

                  const isValidDate = (date: Date | undefined) => {
                    if (!date) return false;
                    return !isNaN(date.getTime());
                  };

                  return (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Expected Arrival *</FormLabel>
                      <div className='relative flex gap-2'>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              value={value}
                              placeholder='Pick a date'
                              className='bg-background pr-10'
                              onChange={e => {
                                const date = new Date(e.target.value);
                                setValue(e.target.value);
                                if (isValidDate(date)) {
                                  field.onChange(date);
                                  setMonth(date);
                                }
                              }}
                              onKeyDown={e => {
                                if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  setOpen(true);
                                }
                              }}
                            />
                            <Popover open={open} onOpenChange={setOpen}>
                              <PopoverTrigger asChild>
                                <Button variant='ghost' className='absolute top-1/2 right-2 size-6 -translate-y-1/2'>
                                  <CalendarIcon className='size-3.5' />
                                  <span className='sr-only'>Select date</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className='w-auto overflow-hidden p-0'
                                align='end'
                                alignOffset={-8}
                                sideOffset={10}
                              >
                                <Calendar
                                  mode='single'
                                  selected={field.value}
                                  captionLayout='dropdown'
                                  month={month}
                                  onMonthChange={setMonth}
                                  onSelect={date => {
                                    field.onChange(date);
                                    setValue(formatDate(date));
                                    setOpen(false);
                                  }}
                                  disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name='expectedDeparture'
                render={({ field }) => {
                  const [open, setOpen] = useState(false);
                  const [month, setMonth] = useState<Date | undefined>(field.value);
                  const [value, setValue] = useState(field.value ? format(field.value, 'PPP') : '');

                  const formatDate = (date: Date | undefined) => {
                    if (!date) return '';
                    return format(date, 'PPP');
                  };

                  const isValidDate = (date: Date | undefined) => {
                    if (!date) return false;
                    return !isNaN(date.getTime());
                  };

                  return (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Expected Departure</FormLabel>
                      <div className='relative flex gap-2'>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              value={value}
                              placeholder='Pick a date'
                              className='bg-background pr-10'
                              onChange={e => {
                                const date = new Date(e.target.value);
                                setValue(e.target.value);
                                if (isValidDate(date)) {
                                  field.onChange(date);
                                  setMonth(date);
                                }
                              }}
                              onKeyDown={e => {
                                if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  setOpen(true);
                                }
                              }}
                            />
                            <Popover open={open} onOpenChange={setOpen}>
                              <PopoverTrigger asChild>
                                <Button variant='ghost' className='absolute top-1/2 right-2 size-6 -translate-y-1/2'>
                                  <CalendarIcon className='size-3.5' />
                                  <span className='sr-only'>Select date</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className='w-auto overflow-hidden p-0'
                                align='end'
                                alignOffset={-8}
                                sideOffset={10}
                              >
                                <Calendar
                                  mode='single'
                                  selected={field.value}
                                  captionLayout='dropdown'
                                  month={month}
                                  onMonthChange={setMonth}
                                  onSelect={date => {
                                    field.onChange(date);
                                    setValue(formatDate(date));
                                    setOpen(false);
                                  }}
                                  disabled={date => {
                                    const arrivalDate = form.getValues('expectedArrival');
                                    const today = new Date(new Date().setHours(0, 0, 0, 0));
                                    return date < (arrivalDate || today);
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
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
