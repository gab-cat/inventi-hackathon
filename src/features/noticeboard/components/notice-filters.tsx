'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NoticeFiltersProps } from '../types';

export function NoticeFilters({ filters, onFiltersChange, properties, units }: NoticeFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' || value === 'all' ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '' && value !== 'all');

  // Count active filters for display
  const activeFilterCount = Object.values(filters).filter(
    value => value !== undefined && value !== '' && value !== 'all'
  ).length;

  return (
    <div className='space-y-4'>
      {/* Search and Filter Toggle Row */}
      <div className='flex items-center gap-4 p-4 bg-card rounded-lg border'>
        {/* Search Bar */}
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
          <Input
            placeholder='Search notices...'
            value={filters.search || ''}
            onChange={e => handleFilterChange('search', e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Filter Toggle Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
          <Button variant='outline' className='flex items-center gap-2' onClick={() => setIsExpanded(!isExpanded)}>
            <Filter className='w-4 h-4' />
            Filters
            {activeFilterCount > 0 && (
              <motion.span
                className='ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {activeFilterCount}
              </motion.span>
            )}
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className='w-4 h-4' />
            </motion.div>
          </Button>
        </motion.div>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <Button variant='ghost' size='sm' onClick={clearFilters}>
            <X className='w-4 h-4 mr-2' />
            Clear All
          </Button>
        )}
      </div>

      {/* Expandable Filter Options */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1],
              height: { duration: 0.3 },
              opacity: { duration: 0.2 },
            }}
            className='p-4 bg-card rounded-lg border space-y-4 overflow-hidden'
          >
            <motion.div
              className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              {/* Property Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                <Select
                  value={filters.propertyId || 'all'}
                  onValueChange={value => handleFilterChange('propertyId', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All Properties' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Properties</SelectItem>
                    {properties.map(property => (
                      <SelectItem key={property._id} value={property._id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Unit Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.2 }}
              >
                <Select
                  value={filters.unitId || 'all'}
                  onValueChange={value => handleFilterChange('unitId', value === 'all' ? undefined : value)}
                  disabled={!filters.propertyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All Units' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Units</SelectItem>
                    {units
                      .filter(unit => !filters.propertyId || unit.propertyId === filters.propertyId)
                      .map(unit => (
                        <SelectItem key={unit._id} value={unit._id}>
                          {unit.unitNumber}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Notice Type Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.2 }}
              >
                <Select
                  value={filters.noticeType || 'all'}
                  onValueChange={value => handleFilterChange('noticeType', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All Types' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    <SelectItem value='announcement'>Announcement</SelectItem>
                    <SelectItem value='maintenance'>Maintenance</SelectItem>
                    <SelectItem value='payment_reminder'>Payment Reminder</SelectItem>
                    <SelectItem value='emergency'>Emergency</SelectItem>
                    <SelectItem value='event'>Event</SelectItem>
                    <SelectItem value='general'>General</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Priority Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.2 }}
              >
                <Select
                  value={filters.priority || 'all'}
                  onValueChange={value => handleFilterChange('priority', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All Priorities' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Priorities</SelectItem>
                    <SelectItem value='low'>Low</SelectItem>
                    <SelectItem value='medium'>Medium</SelectItem>
                    <SelectItem value='high'>High</SelectItem>
                    <SelectItem value='urgent'>Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Target Audience Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.2 }}
              >
                <Select
                  value={filters.targetAudience || 'all'}
                  onValueChange={value => handleFilterChange('targetAudience', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All Audiences' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Audiences</SelectItem>
                    <SelectItem value='all_tenants'>All Tenants</SelectItem>
                    <SelectItem value='tenants'>Tenants Only</SelectItem>
                    <SelectItem value='specific_units'>Specific Units</SelectItem>
                    <SelectItem value='managers'>Managers Only</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Status Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.2 }}
              >
                <Select
                  value={filters.isActive?.toString() || 'all'}
                  onValueChange={value =>
                    handleFilterChange('isActive', value === 'all' ? undefined : value === 'true')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='true'>Active</SelectItem>
                    <SelectItem value='false'>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </motion.div>

            {/* Date Range Filters */}
            <motion.div
              className='grid grid-cols-1 md:grid-cols-2 gap-4'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45, duration: 0.2 }}
              >
                <label className='text-sm font-medium mb-2 block'>From Date</label>
                <Input
                  type='date'
                  value={filters.dateFrom ? new Date(filters.dateFrom).toISOString().split('T')[0] : ''}
                  onChange={e =>
                    handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value).getTime() : undefined)
                  }
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.2 }}
              >
                <label className='text-sm font-medium mb-2 block'>To Date</label>
                <Input
                  type='date'
                  value={filters.dateTo ? new Date(filters.dateTo).toISOString().split('T')[0] : ''}
                  onChange={e =>
                    handleFilterChange('dateTo', e.target.value ? new Date(e.target.value).getTime() : undefined)
                  }
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            className='flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <span className='text-sm text-muted-foreground mr-2'>Active filters:</span>
            {filters.search && (
              <motion.span
                className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary'
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                layout
              >
                Search: {filters.search}
                <Button
                  variant='ghost'
                  size='sm'
                  className='ml-1 h-auto p-0'
                  onClick={() => handleFilterChange('search', undefined)}
                >
                  <X className='w-3 h-3' />
                </Button>
              </motion.span>
            )}
            {filters.propertyId && (
              <motion.span
                className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary'
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                layout
              >
                Property: {properties.find(p => p._id === filters.propertyId)?.name}
                <Button
                  variant='ghost'
                  size='sm'
                  className='ml-1 h-auto p-0'
                  onClick={() => handleFilterChange('propertyId', undefined)}
                >
                  <X className='w-3 h-3' />
                </Button>
              </motion.span>
            )}
            {filters.noticeType && (
              <motion.span
                className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary'
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                layout
              >
                Type: {filters.noticeType}
                <Button
                  variant='ghost'
                  size='sm'
                  className='ml-1 h-auto p-0'
                  onClick={() => handleFilterChange('noticeType', undefined)}
                >
                  <X className='w-3 h-3' />
                </Button>
              </motion.span>
            )}
            {filters.priority && (
              <motion.span
                className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary'
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                layout
              >
                Priority: {filters.priority}
                <Button
                  variant='ghost'
                  size='sm'
                  className='ml-1 h-auto p-0'
                  onClick={() => handleFilterChange('priority', undefined)}
                >
                  <X className='w-3 h-3' />
                </Button>
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
