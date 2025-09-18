'use client';

import { useState } from 'react';
import { Id } from '@convex/_generated/dataModel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Search, Filter } from 'lucide-react';

interface AssetFiltersProps {
  filters: {
    category?: string;
    status?: string;
    condition?: string;
    search?: string;
  };
  onFiltersChange: (filters: { category?: string; status?: string; condition?: string; search?: string }) => void;
  properties?: Array<{
    _id: Id<'properties'>;
    name: string;
    address: string;
  }>;
  selectedPropertyId?: Id<'properties'>;
  onPropertyChange: (propertyId?: Id<'properties'>) => void;
}

export function AssetFilters({
  filters,
  onFiltersChange,
  properties,
  selectedPropertyId,
  onPropertyChange,
}: AssetFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearch = () => {
    onFiltersChange({
      ...filters,
      search: searchValue.trim() || undefined,
    });
  };

  const handleClearFilters = () => {
    setSearchValue('');
    onFiltersChange({
      category: undefined,
      status: undefined,
      condition: undefined,
      search: undefined,
    });
  };

  const hasActiveFilters = filters.category || filters.status || filters.condition || filters.search;

  const categories = [
    { value: 'tool', label: 'Tools' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'material', label: 'Materials' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'appliance', label: 'Appliances' },
  ];

  const statuses = [
    { value: 'available', label: 'Available' },
    { value: 'checked_out', label: 'Checked Out' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retired', label: 'Retired' },
    { value: 'lost', label: 'Lost' },
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
    { value: 'broken', label: 'Broken' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Filter className='h-5 w-5' />
          Filters
        </CardTitle>
        <CardDescription>Filter assets by various criteria</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Property Filter */}
        {properties && properties.length > 1 && (
          <div className='space-y-2'>
            <Label>Property</Label>
            <Select
              value={selectedPropertyId || 'all'}
              onValueChange={value => onPropertyChange(value === 'all' ? undefined : (value as Id<'properties'>))}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select property' />
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
          </div>
        )}

        {/* Search */}
        <div className='space-y-2'>
          <Label>Search</Label>
          <div className='flex gap-2'>
            <Input
              placeholder='Search assets...'
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} size='sm'>
              <Search className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className='space-y-2'>
          <Label>Category</Label>
          <Select
            value={filters.category || 'all'}
            onValueChange={value => onFiltersChange({ ...filters, category: value === 'all' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder='All categories' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className='space-y-2'>
          <Label>Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={value => onFiltersChange({ ...filters, status: value === 'all' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder='All statuses' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition Filter */}
        <div className='space-y-2'>
          <Label>Condition</Label>
          <Select
            value={filters.condition || 'all'}
            onValueChange={value => onFiltersChange({ ...filters, condition: value === 'all' ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder='All conditions' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Conditions</SelectItem>
              {conditions.map(condition => (
                <SelectItem key={condition.value} value={condition.value}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className='space-y-2'>
            <Label>Active Filters</Label>
            <div className='flex flex-wrap gap-2'>
              {filters.category && (
                <Badge variant='secondary' className='gap-1'>
                  Category: {categories.find(c => c.value === filters.category)?.label}
                  <X
                    className='h-3 w-3 cursor-pointer'
                    onClick={() => onFiltersChange({ ...filters, category: undefined })}
                  />
                </Badge>
              )}
              {filters.status && (
                <Badge variant='secondary' className='gap-1'>
                  Status: {statuses.find(s => s.value === filters.status)?.label}
                  <X
                    className='h-3 w-3 cursor-pointer'
                    onClick={() => onFiltersChange({ ...filters, status: undefined })}
                  />
                </Badge>
              )}
              {filters.condition && (
                <Badge variant='secondary' className='gap-1'>
                  Condition: {conditions.find(c => c.value === filters.condition)?.label}
                  <X
                    className='h-3 w-3 cursor-pointer'
                    onClick={() => onFiltersChange({ ...filters, condition: undefined })}
                  />
                </Badge>
              )}
              {filters.search && (
                <Badge variant='secondary' className='gap-1'>
                  Search: {filters.search}
                  <X
                    className='h-3 w-3 cursor-pointer'
                    onClick={() => {
                      setSearchValue('');
                      onFiltersChange({ ...filters, search: undefined });
                    }}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant='outline' onClick={handleClearFilters} className='w-full'>
            <X className='mr-2 h-4 w-4' />
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
