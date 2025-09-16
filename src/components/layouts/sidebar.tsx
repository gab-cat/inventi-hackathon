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
import Image from 'next/image';
import { FolderKanban, LayoutDashboard, Wrench } from 'lucide-react';
import { Label } from '../ui/label';
import { useUser } from '@clerk/nextjs';

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
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <Label className='text-gray-500 text-xs px-2'>Main</Label>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} />
                <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
