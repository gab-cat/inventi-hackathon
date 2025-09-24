'use client';

import { SignInSkeleton } from '@/features/auth/components/skeletons';
import { SignIn } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export default function SignInPage() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
  }, []);

  return (
    <div className='flex justify-center items-center'>
      <SignIn
        fallback={<SignInSkeleton />}
        routing='path'
        path='/sign-in'
        redirectUrl='/dashboard'
        signUpUrl='/sign-up'
      />
    </div>
  );
}
