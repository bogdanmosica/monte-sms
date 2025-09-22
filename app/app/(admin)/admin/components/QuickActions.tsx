'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, FileText, UserPlus, Users } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface QuickActionsProps {
  metrics?: {
    totalChildren: number;
    activeChildren: number;
    pendingEnrollments: number;
    totalPayments: number;
    overduePayments: number;
    totalStaff: number;
  };
}

export function QuickActions({ metrics }: QuickActionsProps) {
  const router = useRouter();

  // Fetch enrollment stats for pending count
  const { data: enrollmentData } = useSWR('/api/admin/enrollment?status=pending&limit=1', fetcher);
  const pendingCount = enrollmentData?.stats?.pending || metrics?.pendingEnrollments || 0;

  // Fetch payment stats for overdue count
  const { data: alertsData } = useSWR('/api/admin/alerts', fetcher);
  const overduePayments = alertsData?.alerts?.find((alert: any) => alert.id === 'overdue-payments') ? 1 : 0;

  const quickActions = [
    {
      label: 'New Enrollment',
      icon: UserPlus,
      color: 'text-primary',
      path: '/admin/enrollment',
      badge: pendingCount > 0 ? pendingCount : null,
      badgeVariant: 'secondary' as const
    },
    {
      label: 'Process Payment',
      icon: DollarSign,
      color: 'text-accent',
      path: '/admin/payments',
      badge: overduePayments > 0 ? overduePayments : null,
      badgeVariant: 'destructive' as const
    },
    {
      label: 'Add Staff Member',
      icon: Users,
      color: 'text-secondary-foreground',
      path: '/admin/staff',
      badge: null,
      badgeVariant: 'secondary' as const
    },
    {
      label: 'Generate Report',
      icon: FileText,
      color: 'text-primary',
      path: '/admin/reports',
      badge: null,
      badgeVariant: 'secondary' as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent relative"
                onClick={() => router.push(action.path)}
              >
                {action.badge && (
                  <Badge
                    variant={action.badgeVariant}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {action.badge}
                  </Badge>
                )}
                <Icon className={`w-6 h-6 ${action.color}`} />
                <span>{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}