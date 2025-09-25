'use client';

import { useClerk } from '@clerk/nextjs';
import { IconLogout } from '@tabler/icons-react';
import { resetAllStores } from '@/lib/store-reset';

export const SignOutButton = () => {
  const { signOut } = useClerk();

  const handleSignOut = () => {
    // Reset all stores before signing out to prevent data leakage
    resetAllStores();

    // Sign out and redirect
    signOut({ redirectUrl: '/sign-in' });
  };

  return (
    // Clicking this button signs out a user
    // and redirects them to the home page "/".
    <button
      className='cursor-pointer px-2.5 py-1 hover:bg-accent w-full rounded-md text-sm flex items-center gap-2'
      onClick={handleSignOut}
    >
      <IconLogout className='w-4 h-4 text-red-500 ' />
      Sign out
    </button>
  );
};
