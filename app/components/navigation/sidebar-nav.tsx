'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  items: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
  }[];
  role: string;
}

export function SidebarNav({ items, role }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-card-foreground capitalize">
          {role} Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Montessori School Management
        </p>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 h-auto p-3',
                  isActive && 'bg-accent/20 text-accent-foreground'
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
