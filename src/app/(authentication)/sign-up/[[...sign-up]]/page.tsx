import { SignInSkeleton } from '@/features/auth/components/skeletons';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
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
