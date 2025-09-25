'use client';

import { MaintenanceStatusLogs } from '../components/maintenance-status-logs';
import { usePropertyStore, useManagerProperties } from '@/features/property';
import { Id } from '@convex/_generated/dataModel';
import { useEffect } from 'react';

interface MaintenanceStatusLogsPageProps {
  propertyId?: Id<'properties'>;
}

export function MaintenanceStatusLogsPage({ propertyId }: MaintenanceStatusLogsPageProps) {
  const { selectedPropertyId, clearSelectedProperty } = usePropertyStore();
  const { properties, isLoading: propertiesLoading } = useManagerProperties();

  // Use the propertyId prop if provided, otherwise use the selected property from store
  const currentPropertyId = propertyId || selectedPropertyId;

  // Validate that the current user has access to the selected property
  const hasAccessToProperty = currentPropertyId ? properties?.some(p => p._id === currentPropertyId) : false;

  // Debug logging
  console.log('MaintenanceStatusLogsPage Debug:', {
    currentPropertyId,
    hasAccessToProperty,
    propertiesLoading,
    userProperties: properties?.map(p => p._id),
    validPropertyId: !propertiesLoading && hasAccessToProperty ? currentPropertyId : undefined,
  });

  // Clear the selected property if the user doesn't have access to it
  useEffect(() => {
    if (currentPropertyId && !hasAccessToProperty && !propertyId && !propertiesLoading) {
      console.log('Clearing invalid property selection:', currentPropertyId);
      clearSelectedProperty();
    }
  }, [currentPropertyId, hasAccessToProperty, propertyId, clearSelectedProperty, propertiesLoading]);

  // Only pass propertyId if user has confirmed access to it
  // If no property is selected or user doesn't have access, pass undefined to show all user's logs
  const validPropertyId = !propertiesLoading && hasAccessToProperty ? currentPropertyId : undefined;

  return (
    <div className='container mx-auto py-6'>
      <MaintenanceStatusLogs propertyId={validPropertyId} />
    </div>
  );
}
