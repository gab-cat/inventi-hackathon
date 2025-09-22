'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavItems } from './nav-main';
import { NavUser } from './nav-user';
import { PropertySelector, usePropertyStore } from '@/features/property';
import Image from 'next/image';
import { FolderKanban, LayoutDashboard, Wrench, Package, Mailbox, MessageSquare, BarChart3, Users } from 'lucide-react';
import { Label } from '../ui/label';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: <LayoutDashboard className='h-5 w-5' />,
    },
    {
      title: 'Assets',
      url: '/assets',
      icon: <Package className='h-5 w-5' />,
    },
  ],
  maintenanceLinks: [
    {
      title: 'Maintenance Requests',
      url: '/maintenance',
      icon: <Wrench className='h-5 w-5' />,
    },
    {
      title: 'Maintenance Logs',
      url: '/maintenance/logs',
      icon: <BarChart3 className='h-5 w-5' />,
    },
  ],

  visitorLinks: [
    {
      title: 'Visitor Management',
      url: '/visitors',
      icon: <Users className='h-5 w-5' />,
    },
  ],
  engagementLinks: [
    {
      title: 'Noticeboard Management',
      url: '/noticeboard',
      icon: <Mailbox className='h-5 w-5' />,
    },
    {
      title: 'Polls',
      url: '/polls',
      icon: <BarChart3 className='h-5 w-5' />,
    },
    {
      title: 'Messages',
      url: '/messages',
      icon: <MessageSquare className='h-5 w-5' />,
    },
    {
      title: 'Messages',
      url: '/messaging',
      icon: <MessageSquare className='h-5 w-5' />,
    },
    {
      title: 'Polls',
      url: '/polls',
      icon: <BarChart3 className='h-5 w-5' />,
    },
    {
      title: 'Visitors',
      url: '/visitors',
      icon: <Users className='h-5 w-5' />,
    },
  ],
};

// Component to conditionally show labels based on sidebar state
function SidebarLabel({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();

  if (state === 'collapsed') {
    return null;
  }

  return <Label className='text-gray-500 text-xs px-2 block'>{children}</Label>;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { selectedPropertyId, setSelectedPropertyId } = usePropertyStore();

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='data-[slot=sidebar-menu-button]:!p-1.5'>
              <Image src={'/inventi-logo.svg'} alt='Sophons logo' height={500} width={500} className='!h-20 !w-30' />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className='px-2 py-2'>
          <SidebarLabel>Property</SidebarLabel>
          <PropertySelector selectedPropertyId={selectedPropertyId} onPropertySelect={setSelectedPropertyId} />
        </div>
        <div className='px-2 py-2 flex flex-col gap-2'>
          <SidebarLabel>Main</SidebarLabel>
          <NavItems items={data.navMain} />

          <SidebarLabel>Maintenance</SidebarLabel>
          <NavItems items={data.maintenanceLinks} />

          <SidebarLabel>Visitor</SidebarLabel>
          <NavItems items={data.visitorLinks} />

          <SidebarLabel>Engagement</SidebarLabel>
          <NavItems items={data.engagementLinks} />
        </div>
        {/* <NavDocuments items={data.documents} />
                <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
