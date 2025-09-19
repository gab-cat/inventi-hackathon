'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface VisitorFiltersProps {
  onFiltersChange: (filters: {
    searchTerm: string;
    status: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
  }) => void;
  onClearFilters: () => void;
}

export function VisitorFilters({ onFiltersChange, onClearFilters }: VisitorFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleApplyFilters = () => {
    onFiltersChange({
      searchTerm,
      status: status === 'all' ? '' : status,
      startDate,
      endDate,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatus('all');
    setStartDate(undefined);
    setEndDate(undefined);
    onClearFilters();
  };

  const hasActiveFilters = searchTerm || (status && status !== 'all') || startDate || endDate;

  return (
    <div className='flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card'>
      <div className='flex-1'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Search visitors, purpose, or contact info...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='All Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          <SelectItem value='pending'>Pending</SelectItem>
          <SelectItem value='approved'>Approved</SelectItem>
          <SelectItem value='denied'>Denied</SelectItem>
          <SelectItem value='cancelled'>Cancelled</SelectItem>
          <SelectItem value='expired'>Expired</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn('w-[240px] justify-start text-left font-normal', !startDate && 'text-muted-foreground')}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {startDate ? format(startDate, 'PPP') : 'Start Date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar mode='single' selected={startDate} onSelect={setStartDate} initialFocus />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn('w-[240px] justify-start text-left font-normal', !endDate && 'text-muted-foreground')}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {endDate ? format(endDate, 'PPP') : 'End Date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar mode='single' selected={endDate} onSelect={setEndDate} initialFocus />
        </PopoverContent>
      </Popover>

      <div className='flex gap-2'>
        <Button onClick={handleApplyFilters} size='sm'>
          <Filter className='w-4 h-4 mr-2' />
          Apply
        </Button>
        {hasActiveFilters && (
          <Button onClick={handleClearFilters} variant='outline' size='sm'>
            <X className='w-4 h-4 mr-2' />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
