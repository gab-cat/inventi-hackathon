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
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

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
    setStartDateOpen(false);
    setEndDateOpen(false);
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

      <div className='relative flex gap-2'>
        <Input
          value={startDate ? format(startDate, 'PPP') : ''}
          placeholder='Start Date'
          className='w-[240px] bg-background pr-10'
          onChange={e => {
            const date = new Date(e.target.value);
            if (!isNaN(date.getTime())) {
              setStartDate(date);
            }
          }}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setStartDateOpen(true);
            }
          }}
        />
        <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
          <PopoverTrigger asChild>
            <Button variant='ghost' className='absolute top-1/2 right-2 size-6 -translate-y-1/2'>
              <CalendarIcon className='size-3.5' />
              <span className='sr-only'>Select start date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto overflow-hidden p-0' align='end' alignOffset={-8} sideOffset={10}>
            <Calendar
              mode='single'
              selected={startDate}
              captionLayout='dropdown'
              onSelect={date => {
                setStartDate(date);
                setStartDateOpen(false);
              }}
              disabled={date => (endDate ? date > endDate : false)}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className='relative flex gap-2'>
        <Input
          value={endDate ? format(endDate, 'PPP') : ''}
          placeholder='End Date'
          className='w-[240px] bg-background pr-10'
          onChange={e => {
            const date = new Date(e.target.value);
            if (!isNaN(date.getTime())) {
              setEndDate(date);
            }
          }}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setEndDateOpen(true);
            }
          }}
        />
        <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
          <PopoverTrigger asChild>
            <Button variant='ghost' className='absolute top-1/2 right-2 size-6 -translate-y-1/2'>
              <CalendarIcon className='size-3.5' />
              <span className='sr-only'>Select end date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto overflow-hidden p-0' align='end' alignOffset={-8} sideOffset={10}>
            <Calendar
              mode='single'
              selected={endDate}
              captionLayout='dropdown'
              onSelect={date => {
                setEndDate(date);
                setEndDateOpen(false);
              }}
              disabled={date => (startDate ? date < startDate : false)}
            />
          </PopoverContent>
        </Popover>
      </div>

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
