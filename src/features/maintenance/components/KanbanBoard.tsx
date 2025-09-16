'use client';

import { MaintenanceRequest } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  requests: MaintenanceRequest[];
  onAssign: (requestId: string) => void;
  onViewDetails: (requestId: string) => void;
  onStatusChange?: (requestId: string, newStatus: string) => void;
}

// Map statuses to Kanban columns based on the image
const STATUS_MAPPING = {
  pending: { title: 'NEW', status: 'pending' },
  assigned: { title: 'IN PROGRESS', status: 'assigned' },
  in_progress: { title: 'IN PROGRESS', status: 'in_progress' },
  completed: { title: 'RESOLVED', status: 'completed' },
  cancelled: { title: 'RESOLVED', status: 'cancelled' },
  rejected: { title: 'RESOLVED', status: 'rejected' },
} as const;

// Group requests by status for Kanban columns
const groupRequestsByStatus = (requests: MaintenanceRequest[]) => {
  const grouped = requests.reduce(
    (acc, request) => {
      const status = request.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(request);
      return acc;
    },
    {} as Record<string, MaintenanceRequest[]>
  );

  return grouped;
};

export function KanbanBoard({ requests, onAssign, onViewDetails, onStatusChange }: KanbanBoardProps) {
  const groupedRequests = groupRequestsByStatus(requests);

  // Define the columns we want to show in order
  const columns = [
    { key: 'pending', ...STATUS_MAPPING.pending },
    { key: 'assigned', ...STATUS_MAPPING.assigned },
    { key: 'in_progress', ...STATUS_MAPPING.in_progress },
    { key: 'completed', ...STATUS_MAPPING.completed },
  ];

  return (
    <div className='flex gap-6 overflow-x-auto pb-4'>
      {columns.map(column => {
        let finalRequests: MaintenanceRequest[] = [];

        switch (column.key) {
          case 'pending':
            finalRequests = groupedRequests['pending'] || [];
            break;
          case 'assigned':
            // Combine assigned and in_progress into IN PROGRESS column
            finalRequests = [...(groupedRequests['assigned'] || []), ...(groupedRequests['in_progress'] || [])];
            break;
          case 'in_progress':
            // This column is now handled by the 'assigned' case above
            return null;
          case 'completed':
            // Combine completed, cancelled, and rejected into RESOLVED column
            finalRequests = [
              ...(groupedRequests['completed'] || []),
              ...(groupedRequests['cancelled'] || []),
              ...(groupedRequests['rejected'] || []),
            ];
            break;
          default:
            finalRequests = groupedRequests[column.key] || [];
        }

        if (column.key === 'in_progress') {
          return null; // Skip rendering this column as it's combined with 'assigned'
        }

        return (
          <KanbanColumn
            key={column.key}
            title={column.title}
            status={column.status}
            requests={finalRequests}
            count={finalRequests.length}
            onAssign={onAssign}
            onViewDetails={onViewDetails}
            onStatusChange={onStatusChange}
          />
        );
      })}
    </div>
  );
}
