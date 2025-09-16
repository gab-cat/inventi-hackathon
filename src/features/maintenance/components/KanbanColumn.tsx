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
    <div className='w-80 flex-shrink-0 '>
      {/* Column Header */}
      <div className='bg-muted/50 rounded-t-lg p-3 sm:p-4 border-t border-l border-r'>
        <div className='flex items-center justify-between'>
          <h3 className='font-semibold text-foreground text-sm '>{title}</h3>
          <span className='bg-blue-200 text-blue-500  text-xs sm:text-sm font-medium px-2 py-0.5 rounded'>{count}</span>
        </div>
      </div>

      {/* Column Content */}
      <div
        className='bg-muted/30 rounded-b-lg p-3 sm:p-4 min-h-[500px] sm:min-h-[600px] border'
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
            <div className='text-center py-8 text-muted-foreground text-xs sm:text-sm'>No requests in this status</div>
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
