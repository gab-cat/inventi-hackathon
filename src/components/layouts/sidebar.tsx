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
} from '@/components/ui/sidebar';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { PropertySelector, usePropertyStore } from '@/features/property';
import Image from 'next/image';
import { FolderKanban, LayoutDashboard, Wrench, Package, Mailbox, MessageSquare, BarChart3, Users } from 'lucide-react';
import { Label } from '../ui/label';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: <LayoutDashboard className='h-5 w-5' />,
    },
    {
      title: 'Maintenance',
      url: '/maintenance',
      icon: <Wrench className='h-5 w-5' />,
    },
    {
      title: 'Transactions',
      url: '/transaction',
      icon: <FolderKanban className='h-5 w-5' />,
    },
    {
      title: 'Noticeboard',
      url: '/noticeboard',
      icon: <Mailbox className='h-5 w-5' />,
    },
    {
      title: 'Assets',
      url: '/assets',
      icon: <Package className='h-5 w-5' />,
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
          <Label className='text-gray-500 text-xs px-2 mb-2 block'>Property</Label>
          <PropertySelector selectedPropertyId={selectedPropertyId} onPropertySelect={setSelectedPropertyId} />
        </div>
        <div className='px-2 py-2'>
          <Label className='text-gray-500 text-xs px-2 mb-2 block'>Main</Label>
          <NavMain items={data.navMain} />
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
