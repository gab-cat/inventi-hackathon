'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

interface NavItem {
  title: string;
  url: string;
  icon: React.ReactNode;
}

interface NavItemsProps {
  items: NavItem[];
}

export function NavItems({ items }: NavItemsProps) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map(item => {
        const isActive = pathname === item.url;
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link href={item.url}>
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
