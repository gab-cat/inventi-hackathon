'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  title: string;
  url: string;
  icon: React.ReactNode;
}

interface NavMainProps {
  items: NavItem[];
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname();

  return (
    <nav className='flex flex-col space-y-1'>
      {items.map(item => {
        const isActive = pathname === item.url;
        return (
          <Link
            key={item.title}
            href={item.url}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'}
            `}
          >
            {item.icon}
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
