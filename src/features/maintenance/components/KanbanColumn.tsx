'use client';

import { MaintenanceRequest } from '../types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  title: string;
  status: string;
  requests: MaintenanceRequest[];
  count: number;
  onAssign: (requestId: string) => void;
  onViewDetails: (requestId: string) => void;
  onStatusChange?: (requestId: string, newStatus: string) => void;
}

export function KanbanColumn({
  title,
  status,
  requests,
  count,
  onAssign,
  onViewDetails,
  onStatusChange,
}: KanbanColumnProps) {
  return (
    <div className='flex-1 w-fit'>
      {/* Column Header */}
      <div className='bg-muted/50 rounded-t-lg p-4 border-b'>
        <div className='flex items-center justify-between'>
          <h3 className='font-semibold text-foreground'>{title}</h3>
          <span className='bg-muted text-foreground text-sm font-medium px-2 py-1 rounded-full'>{count}</span>
        </div>
      </div>

      {/* Column Content */}
      <div
        className='bg-muted/30 rounded-b-lg p-4 min-h-[600px]'
        onDragOver={e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={e => {
          e.preventDefault();
          const requestId = e.dataTransfer.getData('text/plain');
          if (onStatusChange && requestId) {
            onStatusChange(requestId, status);
          }
        }}
      >
        <div className='space-y-3'>
          {requests.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground text-sm'>No requests in this status</div>
          ) : (
            requests.map(request => (
              <KanbanCard
                key={request._id}
                request={request}
                onAssign={onAssign}
                onViewDetails={onViewDetails}
                onStatusChange={onStatusChange}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
