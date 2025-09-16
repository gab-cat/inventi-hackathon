'use client';

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
import { SignOutButton } from '@clerk/nextjs';

export function NavUser({
  user,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
}) {
  const { isMobile } = useSidebar();

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
                <span className='text-muted-foreground truncate text-xs'>{user.email}</span>
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
                  <span className='text-muted-foreground truncate text-xs'>{user.email}</span>
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
