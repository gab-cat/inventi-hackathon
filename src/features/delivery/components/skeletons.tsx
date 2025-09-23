import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Delivery list skeleton
export function DeliveryListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-32' />
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* Desktop table skeleton */}
          <div className='hidden md:block'>
            <div className='space-y-3'>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className='flex items-center space-x-4 p-4 border rounded-lg'>
                  <Skeleton className='h-4 w-4' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-3 w-48' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-8 w-8' />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile card skeleton */}
          <div className='md:hidden space-y-4'>
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className='p-4'>
                <div className='space-y-3'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <Skeleton className='h-4 w-20' />
                      <Skeleton className='h-3 w-32' />
                    </div>
                    <Skeleton className='h-5 w-16' />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1'>
                      <Skeleton className='h-3 w-16' />
                      <Skeleton className='h-3 w-24' />
                    </div>
                    <div className='space-y-1'>
                      <Skeleton className='h-3 w-16' />
                      <Skeleton className='h-3 w-20' />
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Skeleton className='h-8 flex-1' />
                    <Skeleton className='h-8 flex-1' />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Delivery filters skeleton
export function DeliveryFiltersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-6 w-20' />
          <div className='flex gap-2'>
            <Skeleton className='h-8 w-16' />
            <Skeleton className='h-8 w-20' />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </div>
      </CardContent>
    </Card>
  );
}

// Delivery detail skeleton
export function DeliveryDetailSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-4 border-b'>
        <Skeleton className='h-4 w-32' />
      </div>

      <div className='px-6 pb-6 space-y-6'>
        {/* Title */}
        <div>
          <Skeleton className='h-8 w-64 mb-2' />
        </div>

        {/* Status */}
        <div className='flex items-center gap-3'>
          <Skeleton className='h-4 w-12' />
          <Skeleton className='h-5 w-20' />
        </div>

        {/* Delivery Information */}
        <div className='space-y-3'>
          <Skeleton className='h-4 w-24' />
          <div className='grid grid-cols-2 gap-4'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-20' />
          </div>
          <Skeleton className='h-16 w-full' />
        </div>

        {/* Sender Information */}
        <div className='space-y-3'>
          <Skeleton className='h-4 w-32' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-32' />
          </div>
        </div>

        {/* Recipient Information */}
        <div className='space-y-3'>
          <Skeleton className='h-4 w-36' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-4 w-40' />
            <Skeleton className='h-4 w-36' />
          </div>
        </div>

        {/* Property & Unit */}
        <div className='space-y-3'>
          <Skeleton className='h-4 w-32' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-40' />
            <Skeleton className='h-4 w-24' />
          </div>
        </div>

        {/* Timeline */}
        <div className='space-y-3'>
          <Skeleton className='h-4 w-32' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-36' />
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-4 w-32' />
          </div>
        </div>
      </div>
    </div>
  );
}

// Delivery logs skeleton
export function DeliveryLogsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-40' />
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* Desktop table skeleton */}
          <div className='hidden md:block'>
            <div className='space-y-3'>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className='flex items-center space-x-4 p-4 border rounded-lg'>
                  <Skeleton className='h-5 w-16' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-3 w-48' />
                  </div>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-8 w-8 rounded-full' />
                    <div className='space-y-1'>
                      <Skeleton className='h-3 w-24' />
                      <Skeleton className='h-3 w-32' />
                    </div>
                  </div>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-32' />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile card skeleton */}
          <div className='md:hidden space-y-4'>
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className='p-4'>
                <div className='space-y-3'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <Skeleton className='h-4 w-20' />
                      <Skeleton className='h-3 w-32' />
                    </div>
                    <Skeleton className='h-5 w-16' />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1'>
                      <Skeleton className='h-3 w-20' />
                      <Skeleton className='h-3 w-24' />
                    </div>
                    <div className='space-y-1'>
                      <Skeleton className='h-3 w-16' />
                      <Skeleton className='h-3 w-20' />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Delivery form skeleton
export function DeliveryFormSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-12' />
          <Skeleton className='h-10 w-full' />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <Skeleton className='h-5 w-32' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className='h-5 w-36' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-32' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-36' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-24 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-20 w-full' />
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end gap-2'>
        <Skeleton className='h-10 w-20' />
        <Skeleton className='h-10 w-32' />
      </div>
    </div>
  );
}

// Stats cards skeleton
export function DeliveryStatsSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-4'>
              <Skeleton className='h-12 w-12 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-6 w-16' />
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-3 w-20' />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
