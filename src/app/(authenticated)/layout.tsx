import { AppSidebar } from '@/components/layouts/sidebar';
import { SiteHeader } from '@/components/layouts/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { requireAuth } from '@/lib/auth/require-auth';
import { AuthStoreCleanup } from '@/components/auth-store-cleanup';
import { ReactNode } from 'react';

interface ServicesLayoutProps {
  children: ReactNode;
}

export default async function AuthenticatedLayout({ children }: ServicesLayoutProps) {
  await requireAuth();

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AuthStoreCleanup />
      <AppSidebar variant='inset' />
      <SidebarInset>
        <SiteHeader />
        <div className='flex flex-1 flex-col'>
          <div className='@container/main flex flex-1 flex-col gap-2'>
            <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
              <div className='px-4 lg:px-6'>{children}</div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
