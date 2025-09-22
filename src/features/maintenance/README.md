# Maintenance Update Logging System

This system provides comprehensive logging of all maintenance request status changes and updates, following the existing architecture patterns.

## Features

- **Status Update Logging**: Every maintenance request status change is automatically logged
- **Timeline View**: Status updates are displayed in a timeline format in the maintenance detail sheet
- **Dedicated Logs Page**: A separate page with pagination to view all maintenance status logs
- **Filtering & Search**: Filter logs by status, date range, property, and user
- **Real-time Updates**: Uses Convex for real-time data synchronization

## Components

### MaintenanceUpdatesTimeline

Displays status updates in a timeline format within the maintenance detail sheet.

```tsx
import { MaintenanceUpdatesTimeline } from '@/features/maintenance/components';

<MaintenanceUpdatesTimeline updates={updates} isLoading={updatesLoading} />;
```

### MaintenanceStatusLogs

A comprehensive page component for viewing all maintenance status logs with filtering and pagination.

```tsx
import { MaintenanceStatusLogs } from '@/features/maintenance/components';

<MaintenanceStatusLogs propertyId='property123' initialFilters={{ status: 'completed' }} />;
```

### MaintenanceUpdatesTable

A table component for displaying maintenance updates in a structured format.

```tsx
import { MaintenanceUpdatesTable } from '@/features/maintenance/components';

<MaintenanceUpdatesTable updates={updates} isLoading={isLoading} onUpdateClick={update => console.log(update)} />;
```

## Hooks

### useMaintenanceUpdates

A custom hook for fetching and managing maintenance updates with pagination.

```tsx
import { useMaintenanceUpdates } from '@/features/maintenance/hooks';

const { updates, isLoading, currentPage, totalPages, onPageChange, filters, setFilters } = useMaintenanceUpdates({
  requestId: 'request123',
  propertyId: 'property123',
  status: 'completed',
});
```

## Backend Integration

The system automatically logs status updates in the following mutations:

- `createRequest` - Logs initial request creation
- `updateRequest` - Logs any request updates
- `updateMaintenanceStatus` - Logs status changes
- `bulkUpdateStatus` - Logs bulk status updates
- `assignTechnician` - Logs technician assignments
- `updateMaintenanceCost` - Logs cost updates
- `cancelRequest` - Logs request cancellations
- `tenantConfirmCompletion` - Logs tenant confirmations

## Database Schema

The `maintenanceUpdates` table stores:

```typescript
{
  _id: Id<'maintenanceUpdates'>;
  requestId: Id<'maintenanceRequests'>;
  propertyId: Id<'properties'>;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  description: string;
  updatedBy: Id<'users'>;
  photos?: string[];
  timestamp: number;
}
```

## Usage Examples

### 1. View Status Updates in Maintenance Detail Sheet

The maintenance detail sheet automatically shows status updates when opened:

```tsx
import { MaintenanceDetailSheet } from '@/features/maintenance/components';

<MaintenanceDetailSheet request={request} isOpen={isOpen} onClose={onClose} onStatusChange={handleStatusChange} />;
```

### 2. Create a Dedicated Logs Page

```tsx
// app/maintenance/logs/page.tsx
import { MaintenanceStatusLogsPage } from '@/features/maintenance/pages';

export default function MaintenanceLogsPage() {
  return <MaintenanceStatusLogsPage />;
}
```

### 3. Filter Updates by Property

```tsx
import { MaintenanceStatusLogs } from '@/features/maintenance/components';

<MaintenanceStatusLogs
  propertyId='property123'
  initialFilters={{
    status: 'completed',
    dateFrom: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
  }}
/>;
```

## API Endpoints

### Queries

- `api.maintenance.webGetMaintenanceUpdates` - Get paginated maintenance updates
- `api.maintenance.webGetMaintenanceUpdatesCount` - Get total count of updates

### Mutations

All existing maintenance mutations automatically create update logs.

## Styling

The components use the existing design system with:

- Tailwind CSS for styling
- Shadcn/ui components for UI elements
- Consistent color scheme for status badges
- Responsive design for mobile and desktop

## Performance

- Pagination is implemented for large datasets
- Real-time updates using Convex subscriptions
- Efficient filtering and indexing in the database
- Memoized components to prevent unnecessary re-renders
