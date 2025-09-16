import { Skeleton } from '@/components/ui/skeleton';

// Base skeleton component
export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-lg border bg-card p-4 ${className}`} {...props}>
      <div className='space-y-3'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-3 w-1/2' />
        <Skeleton className='h-3 w-2/3' />
      </div>
    </div>
  );
}

// Kanban Board Skeletons
export function KanbanColumnSkeleton() {
  return (
    <div className='flex flex-col space-y-4 min-w-80'>
      {/* Column Header */}
      <div className='flex items-center justify-between p-4 bg-muted/50 rounded-lg'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-4 rounded-full' />
          <Skeleton className='h-5 w-24' />
        </div>
        <Skeleton className='h-6 w-8 rounded-full' />
      </div>

      {/* Cards */}
      <div className='space-y-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <KanbanCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function KanbanCardSkeleton() {
  return (
    <div className='rounded-lg border bg-card p-3 space-y-3'>
      {/* Request ID and Type */}
      <div className='flex items-center justify-between'>
        <Skeleton className='h-3 w-12' />
        <Skeleton className='h-5 w-16 rounded' />
      </div>

      {/* Title */}
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-3/4' />

      {/* Apartment Type */}
      <Skeleton className='h-3 w-20' />

      {/* Priority */}
      <div className='flex items-center gap-1'>
        <Skeleton className='h-2 w-2 rounded-full' />
        <Skeleton className='h-5 w-16 rounded-full' />
      </div>

      {/* Assigned Person */}
      <div className='flex items-center justify-between border-t pt-2'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-6 w-6 rounded-full' />
          <Skeleton className='h-3 w-20' />
        </div>
        <div className='flex items-center gap-1'>
          <Skeleton className='h-5 w-5 rounded' />
          <Skeleton className='h-5 w-5 rounded' />
        </div>
      </div>
    </div>
  );
}

export function KanbanBoardSkeleton() {
  return (
    <div className='flex gap-6 overflow-x-auto pb-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <KanbanColumnSkeleton key={i} />
      ))}
    </div>
  );
}

// Table View Skeletons
export function TableRowSkeleton() {
  return (
    <div className='border rounded-lg p-4 space-y-3'>
      <div className='flex items-start justify-between'>
        <div className='space-y-2 flex-1'>
          {/* Title */}
          <Skeleton className='h-5 w-48' />

          {/* Description */}
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />

          {/* Details */}
          <div className='flex items-center gap-4'>
            <Skeleton className='h-3 w-24' />
            <Skeleton className='h-3 w-16' />
            <Skeleton className='h-3 w-20' />
            <Skeleton className='h-3 w-28' />
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-24' />
          <Skeleton className='h-8 w-16' />
        </div>
      </div>
    </div>
  );
}

export function TableViewSkeleton() {
  return (
    <div className='rounded-lg border bg-card'>
      <div className='p-6'>
        <Skeleton className='h-6 w-48 mb-4' />
        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// KPI Skeletons
export function KPICardSkeleton() {
  return (
    <div className='rounded-lg border bg-card p-6'>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-8 w-16' />
        <Skeleton className='h-3 w-32' />
      </div>
    </div>
  );
}

export function KPISkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}

// Header and Navigation Skeletons
export function HeaderSkeleton() {
  return (
    <div className='space-y-4'>
      {/* Title and Description */}
      <div className='space-y-2'>
        <Skeleton className='h-7 w-32' />
        <Skeleton className='h-4 w-64' />
      </div>

      {/* View Mode Tabs */}
      <div className='flex gap-4'>
        <Skeleton className='h-10 w-32' />
        <Skeleton className='h-10 w-24' />
      </div>

      {/* Search and Filters */}
      <div className='flex items-center justify-between'>
        <Skeleton className='h-6 w-48' />
        <Skeleton className='h-10 w-64' />
      </div>
    </div>
  );
}

// Maintenance Detail Sheet Skeleton
export function MaintenanceDetailSheetSkeleton() {
  return (
    <div className='px-6 py-6 space-y-6'>
      {/* Title */}
      <Skeleton className='h-8 w-3/4' />

      {/* Status */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-4' />
          <Skeleton className='h-4 w-12' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-4 rounded-full' />
          <Skeleton className='h-4 w-20' />
        </div>
      </div>

      {/* Due Date */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-4' />
          <Skeleton className='h-4 w-16' />
        </div>
        <Skeleton className='h-4 w-32' />
      </div>

      {/* Assignee */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-4' />
          <Skeleton className='h-4 w-16' />
        </div>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-8 w-8 rounded-full' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-8 w-16 ml-auto' />
        </div>
      </div>

      {/* Tags */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-4' />
          <Skeleton className='h-4 w-8' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-6 w-16 rounded-full' />
          <Skeleton className='h-6 w-20 rounded-full' />
        </div>
      </div>

      {/* Description */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-4' />
          <Skeleton className='h-4 w-20' />
        </div>
        <div className='bg-muted rounded-lg p-4 space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
        </div>
      </div>

      {/* Attachments */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-4' />
            <Skeleton className='h-4 w-20' />
          </div>
          <Skeleton className='h-4 w-24' />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div className='border rounded-lg p-3'>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-8 w-8 rounded' />
              <div className='flex-1 space-y-1'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-3 w-12' />
              </div>
              <Skeleton className='h-3 w-3' />
            </div>
          </div>
          <div className='border-2 border-dashed border-muted rounded-lg p-3 flex items-center justify-center'>
            <Skeleton className='h-6 w-6' />
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className='space-y-4 pt-4 border-t'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-4' />
            <Skeleton className='h-4 w-16' />
          </div>
          <Skeleton className='h-4 w-32' />
        </div>

        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-4' />
            <Skeleton className='h-4 w-20' />
          </div>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-6 w-6 rounded-full' />
            <div className='space-y-1'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-3 w-32' />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className='space-y-4 pt-6 border-t'>
        <Skeleton className='h-10 w-full' />
        <div className='space-y-3'>
          <Skeleton className='h-4 w-24' />
          <div className='flex gap-2'>
            <Skeleton className='h-10 flex-1' />
            <Skeleton className='h-10 w-20' />
          </div>
        </div>
      </div>
    </div>
  );
}

// Assignment Dialog Skeleton
export function AssignmentDialogSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Skeleton className='h-6 w-32' />
        <Skeleton className='h-4 w-64' />
      </div>

      <div className='space-y-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-10 w-full' />
      </div>

      <div className='flex justify-end gap-2'>
        <Skeleton className='h-10 w-20' />
        <Skeleton className='h-10 w-16' />
      </div>
    </div>
  );
}

// Main Maintenance Page Skeleton
export function MaintenancePageSkeleton() {
  return (
    <div className='space-y-4 sm:space-y-6'>
      <HeaderSkeleton />
      <KanbanBoardSkeleton />
    </div>
  );
}

// Table View Maintenance Page Skeleton
export function MaintenanceTablePageSkeleton() {
  return (
    <div className='space-y-4 sm:space-y-6'>
      <HeaderSkeleton />
      <TableViewSkeleton />
    </div>
  );
}
