'use client';

import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { MessagingDashboard } from '../../../features/messaging';
import { usePropertyStore } from '../../../features/property/stores/property-store';
import { MessageCircle } from 'lucide-react';

export default function MessagingPage() {
  const currentUser = useQuery(api.user.webGetCurrentUser);
  const { selectedPropertyId } = usePropertyStore();

  if (!currentUser) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading messaging...</p>
        </div>
      </div>
    );
  }

  if (!selectedPropertyId) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <p className='text-gray-600'>Please select a property to access messaging.</p>
        </div>
      </div>
    );
  }

  return (
    <div className=''>
      <MessagingDashboard propertyId={selectedPropertyId} currentUserId={currentUser._id} />
    </div>
  );
}
