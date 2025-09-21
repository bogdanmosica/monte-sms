'use client';

import {
  BookOpen,
  Calendar,
  ClipboardList,
  MessageCircle,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const teacherNavItems = [
  {
    title: 'Dashboard',
    href: '/teacher',
    icon: TrendingUp,
  },
  {
    title: 'Students',
    href: '/teacher/students',
    icon: Users,
  },
  {
    title: 'Activities',
    href: '/teacher/activities',
    icon: BookOpen,
  },
  {
    title: 'Kanban',
    href: '/teacher/kanban',
    icon: ClipboardList,
  },
  {
    title: 'Observations',
    href: '/teacher/observations',
    icon: MessageCircle,
  },
  {
    title: 'Calendar',
    href: '/teacher/calendar',
    icon: Calendar,
  },
];

export function TeacherTopBarLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {teacherNavItems.map((item) => {
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
