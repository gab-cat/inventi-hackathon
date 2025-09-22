'use client';

import { MaintenanceStatusLogs } from '../components/maintenance-status-logs';

interface MaintenanceStatusLogsPageProps {
  propertyId?: string;
}

export function MaintenanceStatusLogsPage({ propertyId }: MaintenanceStatusLogsPageProps) {
  return (
    <div className='container mx-auto py-6'>
      <MaintenanceStatusLogs propertyId={propertyId} />
    </div>
  );
}
