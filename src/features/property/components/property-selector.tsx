'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Building2, Plus, MapPin } from 'lucide-react';
import { CreatePropertyModal } from './create-property-modal';
import { useManagerProperties } from '../hooks';
import { Property } from '../types';

interface PropertySelectorProps {
  selectedPropertyId?: Id<'properties'>;
  onPropertySelect: (propertyId: Id<'properties'>) => void;
}

export function PropertySelector({ selectedPropertyId, onPropertySelect }: PropertySelectorProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get properties for the current manager
  const { properties } = useManagerProperties();

  const selectedProperty = properties?.find(p => p._id === selectedPropertyId);

  const handlePropertySelect = (propertyId: Id<'properties'>) => {
    onPropertySelect(propertyId);
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case 'apartment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'condo':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'house':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'commercial':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!properties) {
    return (
      <div className='flex items-center gap-2 px-3 py-2'>
        <Building2 className='h-4 w-4 text-muted-foreground' />
        <span className='text-sm text-muted-foreground'>Loading properties...</span>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='w-full justify-between px-3 py-2 h-auto text-left'>
            <div className='flex items-center gap-2 min-w-0 flex-1'>
              <Building2 className='h-4 w-4 text-muted-foreground flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <div className='text-sm font-medium truncate'>{selectedProperty?.name || 'Select Property'}</div>
                {selectedProperty && (
                  <div className='text-xs text-muted-foreground truncate'>
                    {selectedProperty.city}, {selectedProperty.state}
                  </div>
                )}
              </div>
              <Badge
                variant='secondary'
                className={`text-xs ${getPropertyTypeColor(selectedProperty?.propertyType || '')}`}
              >
                {selectedProperty?.propertyType || ''}
              </Badge>
            </div>
            <ChevronDown className='h-4 w-4 text-muted-foreground flex-shrink-0' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-80' align='start'>
          {properties.map(property => (
            <DropdownMenuItem
              key={property._id}
              onClick={() => handlePropertySelect(property._id)}
              className='flex items-center gap-3 p-3 cursor-pointer'
            >
              <div className='flex items-center gap-2 min-w-0 flex-1'>
                <Building2 className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                <div className='min-w-0 flex-1'>
                  <div className='text-sm font-medium truncate'>{property.name}</div>
                  <div className='text-xs text-muted-foreground truncate flex items-center gap-1'>
                    <MapPin className='h-3 w-3' />
                    {property.city}, {property.state}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {property.occupiedUnits}/{property.totalUnits} units occupied
                  </div>
                </div>
                <Badge variant='secondary' className={`text-xs ${getPropertyTypeColor(property.propertyType)}`}>
                  {property.propertyType}
                </Badge>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowCreateModal(true)}
            className='flex items-center gap-2 p-3 cursor-pointer text-blue-600 hover:text-blue-700'
          >
            <Plus className='h-4 w-4' />
            <span className='text-sm font-medium'>Create New Property</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreatePropertyModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onPropertyCreated={propertyId => {
          handlePropertySelect(propertyId);
          setShowCreateModal(false);
        }}
      />
    </>
  );
}
