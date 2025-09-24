'use client';

import { useClerk } from '@clerk/nextjs';
import { IconLogout } from '@tabler/icons-react';

export const SignOutButton = () => {
  const { signOut } = useClerk();

  return (
    // Clicking this button signs out a user
    // and redirects them to the home page "/".
    <button
      className='cursor-pointer px-2.5 py-1 hover:bg-accent w-full rounded-md text-sm flex items-center gap-2'
      onClick={() => signOut({ redirectUrl: '/sign-in' })}
    >
      <IconLogout className='w-4 h-4 text-red-500 ' />
      Sign out
    </button>
  );
};
