'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { cn } from '../../../lib/utils';
import { InvoiceFormProps } from '../types';

const invoiceFormSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional(),
  tenantId: z.string().min(1, 'Tenant is required'),
  invoiceType: z.enum(['rent', 'maintenance', 'utility', 'fine', 'other']),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  taxAmount: z.number().min(0).optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'Item description is required'),
        amount: z.number().min(0.01, 'Item amount must be greater than 0'),
        quantity: z.number().min(1).optional(),
      })
    )
    .min(1, 'At least one item is required'),
  lateFee: z.number().min(0).optional(),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

export function InvoiceForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  mode,
  properties,
  units,
  tenants,
}: InvoiceFormProps) {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      propertyId: initialData?.propertyId || '',
      unitId: initialData?.unitId || 'none',
      tenantId: initialData?.tenantId || '',
      invoiceType: initialData?.invoiceType || 'rent',
      description: initialData?.description || '',
      taxAmount: initialData?.taxAmount || 0,
      dueDate: initialData?.dueDate || '',
      items: initialData?.items || [{ description: '', amount: 0, quantity: 1 }],
      lateFee: initialData?.lateFee || 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const selectedPropertyId = form.watch('propertyId');
  const selectedUnitId = form.watch('unitId');

  // Fetch units for the selected property
  const unitsForProperty = useQuery(
    api.unit.webGetUnitsByProperty,
    selectedPropertyId ? { propertyId: selectedPropertyId as Id<'properties'> } : 'skip'
  );

  const availableUnits = unitsForProperty?.success ? unitsForProperty.units || [] : [];

  // Fetch tenants based on selected property and unit
  const tenantsForProperty = useQuery(
    api.user.webGetUsersByPropertyAndUnit,
    selectedPropertyId
      ? {
          propertyId: selectedPropertyId as Id<'properties'>,
          unitId: selectedUnitId && selectedUnitId !== 'none' ? (selectedUnitId as Id<'units'>) : undefined,
        }
      : 'skip'
  );

  const availableTenants = tenantsForProperty || [];

  const handleSubmit = (data: InvoiceFormData) => {
    // Calculate total amount from items
    const itemsTotal = data.items.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      return sum + item.amount * quantity;
    }, 0);

    const submitData = {
      ...data,
      unitId: data.unitId === 'none' ? undefined : data.unitId,
      amount: itemsTotal, // Use calculated amount from items
    };
    onSubmit(submitData);
  };

  const addItem = () => {
    append({ description: '', amount: 0, quantity: 1 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className='space-y-6'>
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
                  <FormLabel>Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a unit (optional)' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='none'>No specific unit</SelectItem>
                      {availableUnits.map((unit: any) => (
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

            {/* Tenant Selection */}
            <FormField
              control={form.control}
              name='tenantId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a tenant' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTenants.map(tenant => (
                        <SelectItem key={tenant._id} value={tenant._id}>
                          {tenant.firstName} {tenant.lastName} ({tenant.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Invoice Type */}
            <FormField
              control={form.control}
              name='invoiceType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select invoice type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='rent'>Rent</SelectItem>
                      <SelectItem value='maintenance'>Maintenance</SelectItem>
                      <SelectItem value='utility'>Utility</SelectItem>
                      <SelectItem value='fine'>Fine</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due Date */}
            <FormField
              control={form.control}
              name='dueDate'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Due Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                        >
                          {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={date => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                        disabled={date => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea placeholder='Enter invoice description...' className='resize-none' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Invoice Items */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium'>Invoice Items</h3>
              <Button type='button' variant='outline' size='sm' onClick={addItem}>
                <Plus className='h-4 w-4 mr-2' />
                Add Item
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id} className='p-4'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 items-end'>
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem className='md:col-span-2'>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Input placeholder='Item description' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min='1'
                            placeholder='1'
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount *</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.01'
                            min='0.01'
                            placeholder='0.00'
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => removeItem(index)}
                    disabled={fields.length === 1}
                    className='h-10'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Tax and Late Fee */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='taxAmount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Amount</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='0.00'
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='lateFee'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Late Fee</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='0.00'
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className='flex justify-end space-x-2 pt-6'>
            <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Invoice' : 'Update Invoice'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
