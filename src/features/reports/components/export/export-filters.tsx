'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X, Download } from 'lucide-react';
import { ExportFilters, ExportOptions } from '../../types';
import { format } from 'date-fns';
import { applyExportFilters } from '../../lib/export-utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ExportFiltersProps {
  filters: ExportFilters;
  onFiltersChange: (filters: ExportFilters) => void;
  onExport: (options: ExportOptions) => void;
  availableCategories: string[];
  availableStatuses: string[];
  availableConditions: string[];
  availableLocations: string[];
  assets: Array<Record<string, unknown>>;
  loading?: boolean;
}

export function ExportFiltersComponent({
  filters,
  onFiltersChange,
  onExport,
  availableCategories,
  availableStatuses,
  availableConditions,
  availableLocations,
  assets,
  loading = false,
}: ExportFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [includeCharts, setIncludeCharts] = useState(false);

  const updateFilter = (key: keyof ExportFilters, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const addArrayFilter = (key: 'categories' | 'statuses' | 'conditions' | 'locations', value: string) => {
    const currentArray = filters[key] || [];
    if (!currentArray.includes(value)) {
      updateFilter(key, [...currentArray, value]);
    }
  };

  const removeArrayFilter = (key: 'categories' | 'statuses' | 'conditions' | 'locations', value: string) => {
    const currentArray = filters[key] || [];
    updateFilter(
      key,
      currentArray.filter(item => item !== value)
    );
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = () => {
    return Object.keys(filters).some(key => {
      const value = filters[key as keyof ExportFilters];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null && value !== '';
    });
  };

  const handleExport = () => {
    onExport({
      format: exportFormat,
      includeCharts,
      template: 'inventory',
    });
  };

  // Get filtered assets for preview
  const filteredAssets = applyExportFilters(assets, filters);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Export Assets
          </CardTitle>
          <CardDescription>Filter and export your asset data in various formats</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Export Format Selection */}
          <div className='space-y-2'>
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'excel' | 'pdf') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='csv'>CSV (Spreadsheet)</SelectItem>
                <SelectItem value='excel'>Excel (Advanced)</SelectItem>
                <SelectItem value='pdf'>PDF (Report)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Basic Filters */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Categories */}
            <div className='space-y-2'>
              <Label>Categories</Label>
              <Select onValueChange={value => addArrayFilter('categories', value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select category' />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.categories && filters.categories.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                  {filters.categories.map(category => (
                    <Badge key={category} variant='secondary' className='flex items-center gap-1'>
                      {category}
                      <X className='h-3 w-3 cursor-pointer' onClick={() => removeArrayFilter('categories', category)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Statuses */}
            <div className='space-y-2'>
              <Label>Status</Label>
              <Select onValueChange={value => addArrayFilter('statuses', value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.statuses && filters.statuses.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                  {filters.statuses.map(status => (
                    <Badge key={status} variant='secondary' className='flex items-center gap-1'>
                      {status.replace('_', ' ')}
                      <X className='h-3 w-3 cursor-pointer' onClick={() => removeArrayFilter('statuses', status)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Conditions */}
            <div className='space-y-2'>
              <Label>Condition</Label>
              <Select onValueChange={value => addArrayFilter('conditions', value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select condition' />
                </SelectTrigger>
                <SelectContent>
                  {availableConditions.map(condition => (
                    <SelectItem key={condition} value={condition}>
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.conditions && filters.conditions.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                  {filters.conditions.map(condition => (
                    <Badge key={condition} variant='secondary' className='flex items-center gap-1'>
                      {condition}
                      <X
                        className='h-3 w-3 cursor-pointer'
                        onClick={() => removeArrayFilter('conditions', condition)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Locations */}
            <div className='space-y-2'>
              <Label>Location</Label>
              <Select onValueChange={value => addArrayFilter('locations', value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select location' />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.locations && filters.locations.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                  {filters.locations.map(location => (
                    <Badge key={location} variant='secondary' className='flex items-center gap-1'>
                      {location}
                      <X className='h-3 w-3 cursor-pointer' onClick={() => removeArrayFilter('locations', location)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='advanced'
              checked={showAdvanced}
              onCheckedChange={checked => setShowAdvanced(checked === true)}
            />
            <Label htmlFor='advanced'>Show advanced filters</Label>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className='space-y-4 p-4 border rounded-lg bg-gray-50'>
              {/* Date Range */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Date From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant='outline' className='w-full justify-start text-left font-normal'>
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {filters.dateFrom ? format(new Date(filters.dateFrom), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                      <Calendar
                        mode='single'
                        selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                        onSelect={date => updateFilter('dateFrom', date?.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className='space-y-2'>
                  <Label>Date To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant='outline' className='w-full justify-start text-left font-normal'>
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {filters.dateTo ? format(new Date(filters.dateTo), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                      <Calendar
                        mode='single'
                        selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                        onSelect={date => updateFilter('dateTo', date?.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Value Range */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Min Value ($)</Label>
                  <Input
                    type='number'
                    placeholder='0'
                    value={filters.valueRange?.min || ''}
                    onChange={e =>
                      updateFilter('valueRange', {
                        ...filters.valueRange,
                        min: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Max Value ($)</Label>
                  <Input
                    type='number'
                    placeholder='1000000'
                    value={filters.valueRange?.max || ''}
                    onChange={e =>
                      updateFilter('valueRange', {
                        ...filters.valueRange,
                        max: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>

              {/* Boolean Filters */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='maintenanceDue'
                    checked={filters.maintenanceDue || false}
                    onCheckedChange={checked => updateFilter('maintenanceDue', checked === true)}
                  />
                  <Label htmlFor='maintenanceDue'>Maintenance Due Only</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='warrantyExpiring'
                    checked={filters.warrantyExpiring || false}
                    onCheckedChange={checked => updateFilter('warrantyExpiring', checked === true)}
                  />
                  <Label htmlFor='warrantyExpiring'>Warranty Expiring Only</Label>
                </div>
              </div>
            </div>
          )}

          {/* Export Options */}
          {exportFormat === 'excel' && (
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='includeCharts'
                checked={includeCharts}
                onCheckedChange={checked => setIncludeCharts(checked === true)}
              />
              <Label htmlFor='includeCharts'>Include charts in Excel export</Label>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex items-center justify-between pt-4 border-t'>
            <div className='flex items-center gap-2'>
              {hasActiveFilters() && (
                <Button variant='outline' size='sm' onClick={clearAllFilters}>
                  <X className='h-4 w-4 mr-1' />
                  Clear Filters
                </Button>
              )}
              <span className='text-sm text-gray-500'>
                {hasActiveFilters() ? 'Filters applied' : 'No filters applied'}
              </span>
            </div>
            <Button onClick={handleExport} disabled={loading} className='flex items-center gap-2'>
              <Download className='h-4 w-4' />
              {loading ? 'Exporting...' : 'Export Assets'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Export Preview
          </CardTitle>
          <CardDescription>
            Preview of {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} that will be exported
            {hasActiveFilters() && ' (filtered)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssets.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              <Filter className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p className='text-lg font-medium'>No assets match the current filters</p>
              <p className='text-sm'>Try adjusting your filter criteria to see assets</p>
            </div>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Tag</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className='text-right'>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.slice(0, 10).map((asset, index) => (
                    <TableRow key={index}>
                      <TableCell className='font-medium'>{String(asset.assetTag || 'N/A')}</TableCell>
                      <TableCell>
                        <div className='max-w-[200px] truncate'>{String(asset.name || 'Unnamed Asset')}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline' className='capitalize'>
                          {String(asset.category || 'Unknown')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            asset.status === 'available'
                              ? 'default'
                              : asset.status === 'checked_out'
                                ? 'secondary'
                                : asset.status === 'maintenance'
                                  ? 'destructive'
                                  : 'outline'
                          }
                          className='capitalize'
                        >
                          {String(asset.status || 'unknown').replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            asset.condition === 'excellent'
                              ? 'default'
                              : asset.condition === 'good'
                                ? 'secondary'
                                : asset.condition === 'fair'
                                  ? 'outline'
                                  : asset.condition === 'poor'
                                    ? 'destructive'
                                    : 'secondary'
                          }
                          className='capitalize'
                        >
                          {String(asset.condition || 'unknown')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='max-w-[150px] truncate'>{String(asset.location || 'Unknown')}</div>
                      </TableCell>
                      <TableCell className='text-right'>
                        {asset.currentValue
                          ? new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(Number(asset.currentValue))
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredAssets.length > 10 && (
                <div className='p-4 text-center text-sm text-muted-foreground border-t'>
                  Showing first 10 of {filteredAssets.length} assets. All {filteredAssets.length} assets will be
                  exported.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
