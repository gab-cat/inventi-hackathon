import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen flex flex-col'>
      {/* Main Content */}
      <div className='flex-1 flex items-center justify-center px-4 min-h-screen'>
        <div className='w-full max-w-md'>
          {/* Logo */}
          <div className='text-center mb-2'>
            <Image src='/inventi-logo.svg' alt='Logo' width={500} height={500} className='mx-auto h-12 w-auto mb-5' />
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
