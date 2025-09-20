'use client';

import { DollarSign, FileText, Settings, TrendingUp, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: TrendingUp,
  },
  {
    title: 'Enrollment',
    href: '/admin/enrollment',
    icon: UserPlus,
  },
  {
    title: 'Staff',
    href: '/admin/staff',
    icon: Users,
  },
  {
    title: 'Billing',
    href: '/admin/billing',
    icon: DollarSign,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
];

export function AdminTopBarLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-emerald-600',
              isActive
                ? 'text-emerald-600'
                : 'text-gray-600'
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