'use client';

import { MessageCircle } from 'lucide-react';

export function NoThreadSelected() {
  return (
    <div className='h-full flex items-center justify-center'>
      <div className='text-center'>
        <MessageCircle className='h-16 w-16 text-gray-400 mx-auto mb-4' />
        <h3 className='text-lg font-medium text-gray-900 mb-2'>Select a conversation</h3>
        <p className='text-gray-500'>Choose a conversation from the sidebar to start messaging.</p>
      </div>
    </div>
  );
}
