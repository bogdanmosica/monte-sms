'use client';

import { BookOpen, Calendar, MessageCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const parentNavItems = [
  {
    title: 'Dashboard',
    href: '/parent',
    icon: TrendingUp,
  },
  {
    title: 'Portfolio',
    href: '/parent/portfolio',
    icon: BookOpen,
  },
  {
    title: 'Messages',
    href: '/parent/messages',
    icon: MessageCircle,
  },
  {
    title: 'Calendar',
    href: '/parent/calendar',
    icon: Calendar,
  },
];

export function ParentTopBarLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {parentNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-emerald-600',
              isActive ? 'text-emerald-600' : 'text-gray-600'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
