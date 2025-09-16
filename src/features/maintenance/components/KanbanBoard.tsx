'use client';

import { MaintenanceRequest } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  requests: MaintenanceRequest[];
  onAssign: (requestId: string) => void;
  onViewDetails: (requestId: string) => void;
  onStatusChange?: (requestId: string, newStatus: string) => void;
}

// Map statuses to Kanban columns - now showing all 6 statuses
const STATUS_MAPPING = {
  pending: { title: 'New', status: 'pending' },
  assigned: { title: 'Assigned', status: 'assigned' },
  in_progress: { title: 'In Progress', status: 'in_progress' },
  completed: { title: 'Completed', status: 'completed' },
  cancelled: { title: 'Cancelled', status: 'cancelled' },
  rejected: { title: 'Rejected', status: 'rejected' },
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

  // Define all 6 status columns in order
  const columns = [
    { key: 'pending', ...STATUS_MAPPING.pending },
    { key: 'assigned', ...STATUS_MAPPING.assigned },
    { key: 'in_progress', ...STATUS_MAPPING.in_progress },
    { key: 'completed', ...STATUS_MAPPING.completed },
    { key: 'cancelled', ...STATUS_MAPPING.cancelled },
    { key: 'rejected', ...STATUS_MAPPING.rejected },
  ];

  return (
    <div className='w-full overflow-x-auto'>
      <div className='flex gap-4 min-w-max pb-4'>
        {columns.map(column => {
          const finalRequests = groupedRequests[column.key] || [];

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
    </div>
  );
}
