'use client';

import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Loader2,
  MessageCircle,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useSWR from 'swr';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/lib/db/schema';
import { UserRole } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Role-based dashboard content
const roleConfigs = {
  Parent: {
    title: 'Parent Dashboard',
    description: "Track your child's learning journey and development",
    primaryAction: { label: 'View Portfolio', href: '/parent/portfolio' },
    quickActions: [
      { label: 'Child Portfolio', href: '/parent/portfolio', icon: BookOpen },
      { label: 'Messages', href: '/parent/messages', icon: MessageCircle },
      { label: 'Calendar', href: '/parent/calendar', icon: Calendar },
    ],
  },
  Teacher: {
    title: 'Teacher Dashboard',
    description:
      'Manage observations, track student progress, and plan activities',
    primaryAction: { label: 'Log Observation', href: '/teacher/observations' },
    quickActions: [
      { label: 'Students', href: '/teacher/students', icon: Users },
      {
        label: 'Observations',
        href: '/teacher/observations',
        icon: MessageCircle,
      },
      { label: 'Kanban Board', href: '/teacher/kanban', icon: TrendingUp },
    ],
  },
  Admin: {
    title: 'Admin Dashboard',
    description:
      'Oversee school operations, manage staff, and track performance',
    primaryAction: { label: 'School Management', href: '/admin' },
    quickActions: [
      { label: 'Enrollment', href: '/admin/enrollment', icon: Users },
      { label: 'Staff', href: '/admin/staff', icon: Users },
      { label: 'Billing', href: '/admin/billing', icon: Settings },
    ],
  },
  // Map 'owner' role from SaaS starter to Admin functionality
  owner: {
    title: 'School Owner Dashboard',
    description:
      'Oversee school operations, manage staff, and track performance',
    primaryAction: { label: 'School Management', href: '/admin' },
    quickActions: [
      { label: 'Enrollment', href: '/admin/enrollment', icon: Users },
      { label: 'Staff', href: '/admin/staff', icon: Users },
      { label: 'Billing', href: '/admin/billing', icon: Settings },
    ],
  },
};

function DashboardSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleDashboard({ user }: { user: User }) {
  const router = useRouter();
  const config = roleConfigs[user.role as keyof typeof roleConfigs];

  if (!config) {
    return (
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Unknown role: {user.role}. Please contact an administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user.name}
          </h1>
          <p className="text-muted-foreground mt-1">{config.description}</p>
        </div>
        <Button
          onClick={() => router.push(config.primaryAction.href)}
          className="bg-primary hover:bg-primary/90"
        >
          {config.primaryAction.label}
        </Button>
      </div>

      {/* Role indicator */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="capitalize">
          {user.role}
        </Badge>
        <span className="text-sm text-muted-foreground">
          • Montessori School Management Platform
        </span>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        {config.quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.href}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(action.href)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{action.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access {action.label.toLowerCase()} features and tools
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {user.role === UserRole.PARENT && (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>New portfolio entry added for your child</span>
                  <span className="text-muted-foreground ml-auto">
                    2 hours ago
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Teacher observation: Practical Life activity</span>
                  <span className="text-muted-foreground ml-auto">
                    1 day ago
                  </span>
                </div>
              </>
            )}

            {user.role === UserRole.TEACHER && (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>5 new observations logged today</span>
                  <span className="text-muted-foreground ml-auto">
                    Just now
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Portfolio entries created for 3 students</span>
                  <span className="text-muted-foreground ml-auto">
                    2 hours ago
                  </span>
                </div>
              </>
            )}

            {(user.role === UserRole.ADMIN || user.role === UserRole.OWNER) && (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>3 new enrollment applications received</span>
                  <span className="text-muted-foreground ml-auto">
                    1 hour ago
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Monthly tuition payments processed</span>
                  <span className="text-muted-foreground ml-auto">
                    3 hours ago
                  </span>
                </div>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${user.role.toLowerCase()}`)}
              className="w-full justify-start"
            >
              View all activity →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">All systems operational</span>
            <Badge variant="secondary" className="ml-auto">
              v1.0.0
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HomePage() {
  const { data: user, error, isLoading } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  useEffect(() => {
    if (error && error.status === 401) {
      router.push('/sign-in');
    }
  }, [error, router]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Unable to load dashboard. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return <RoleDashboard user={user} />;
}
