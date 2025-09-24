'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { DeliveryFiltersProps } from '../types';

export function DeliveryFilters({ filters, onFiltersChange, properties, units }: DeliveryFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof typeof filters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      propertyId: filters.propertyId, // Keep the current property
    });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'propertyId' && value !== undefined && value !== ''
  );

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg flex items-center gap-2'>
            <Filter className='w-5 h-5' />
            Filters
          </CardTitle>
          <div className='flex items-center gap-2'>
            {hasActiveFilters && (
              <Button variant='outline' size='sm' onClick={clearFilters}>
                <X className='w-4 h-4 mr-1' />
                Clear
              </Button>
            )}
            <Button variant='outline' size='sm' onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Basic Filters */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
            <Input
              placeholder='Search deliveries...'
              value={filters.search || ''}
              onChange={e => handleFilterChange('search', e.target.value)}
              className='pl-10'
            />
          </div>

          <Select
            value={filters.deliveryType || undefined}
            onValueChange={value => handleFilterChange('deliveryType', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder='All delivery types' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All delivery types</SelectItem>
              <SelectItem value='package'>Package</SelectItem>
              <SelectItem value='food'>Food</SelectItem>
              <SelectItem value='grocery'>Grocery</SelectItem>
              <SelectItem value='mail'>Mail</SelectItem>
              <SelectItem value='other'>Other</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || undefined}
            onValueChange={value => handleFilterChange('status', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder='All statuses' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All statuses</SelectItem>
              <SelectItem value='registered'>Registered</SelectItem>
              <SelectItem value='arrived'>Arrived</SelectItem>
              <SelectItem value='collected'>Collected</SelectItem>
              <SelectItem value='failed'>Failed</SelectItem>
              <SelectItem value='returned'>Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t'>
            <Select
              value={filters.unitId || undefined}
              onValueChange={value => handleFilterChange('unitId', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='All units' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All units</SelectItem>
                {units.map(unit => (
                  <SelectItem key={unit._id} value={unit._id}>
                    Unit {unit.unitNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder='Tracking number'
              value={filters.trackingNumber || ''}
              onChange={e => handleFilterChange('trackingNumber', e.target.value)}
            />

            <div className='grid grid-cols-2 gap-2'>
              <Input
                type='date'
                placeholder='From date'
                value={filters.dateFrom ? new Date(filters.dateFrom).toISOString().split('T')[0] : ''}
                onChange={e =>
                  handleFilterChange(
                    'dateFrom',
                    e.target.value ? new Date(e.target.value).getTime().toString() : undefined
                  )
                }
              />
              <Input
                type='date'
                placeholder='To date'
                value={filters.dateTo ? new Date(filters.dateTo).toISOString().split('T')[0] : ''}
                onChange={e =>
                  handleFilterChange(
                    'dateTo',
                    e.target.value ? new Date(e.target.value).getTime().toString() : undefined
                  )
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
