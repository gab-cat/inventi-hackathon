'use client';
        
import { SignInSkeleton } from '@/features/auth/components/skeletons';
import { SignUp } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export default function SignUpPage() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
  }, []);

  return (
    <div className='flex justify-center items-center'>
      <SignUp
        fallback={<SignInSkeleton />}
        routing='path'
        path='/sign-up'
        redirectUrl='/dashboard'
        signInUrl='/sign-in'
      />
    </div>
  );
}
