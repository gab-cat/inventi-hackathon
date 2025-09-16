'use client';

import { Suspense } from 'react';
import { IconCreditCard, IconDotsVertical, IconLogout, IconNotification, IconUserCircle } from '@tabler/icons-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { Skeleton } from '../ui/skeleton';

function NavUserContent() {
  const { user } = useUser();
  const { isMobile } = useSidebar();

  if (!user) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-md'>
                <AvatarImage src={user.imageUrl} alt={`${user.firstName ?? ''} ${user.lastName ?? ''}`} />
                <AvatarFallback className='rounded-lg'>
                  {(user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '') || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{user.firstName}</span>
                <span className='text-muted-foreground truncate text-xs'>{user.emailAddresses[0]?.emailAddress}</span>
              </div>
              <IconDotsVertical className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-md'>
                  <AvatarImage src={user.imageUrl} alt={`${user.firstName ?? ''} ${user.lastName ?? ''}`} />
                  <AvatarFallback className='rounded-lg'>
                    {(user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '') || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{user.firstName}</span>
                  <span className='text-muted-foreground truncate text-xs'>{user.emailAddresses[0]?.emailAddress}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className='w-full'>
              <DropdownMenuItem className='w-full cursor-pointer'>
                <span className='w-full'>
                  <SignOutButton>
                    <button className='w-full flex items-center gap-2'>
                      <IconLogout />
                      Sign out
                    </button>
                  </SignOutButton>
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// Navigation User Skeleton
function NavUserSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg'>
          <Skeleton className='h-8 w-8 rounded-md bg-muted-foreground/20' />
          <div className='grid flex-1 gap-y-1 text-left text-sm leading-tight'>
            <Skeleton className='h-3 w-24 bg-muted-foreground/20' />
            <Skeleton className='h-3 w-32 bg-muted-foreground/20' />
          </div>
          <Skeleton className='h-4 w-4 ml-auto bg-muted-foreground/20' />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function NavUser() {
  return (
    <Suspense fallback={<NavUserSkeleton />}>
      <NavUserContent />
    </Suspense>
  );
}
