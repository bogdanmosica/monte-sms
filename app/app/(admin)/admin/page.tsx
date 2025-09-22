'use client';

import useSWR from 'swr';

import {
  DashboardHeader,
  MetricsCards,
  AlertsNotifications,
  QuickActions,
  RecentActivity,
  SchoolOverview,
} from './components';

import type { AdminMetrics, Activity, Alert } from './types/dashboard';

// Data fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminDashboard() {
  // Fetch data using SWR
  const { data: metrics, error: metricsError, isLoading: metricsLoading } = useSWR<AdminMetrics>(
    '/api/admin/metrics',
    fetcher
  );

  const { data: activitiesData, error: activitiesError } = useSWR<{activities: Activity[]}>(
    '/api/admin/activities',
    fetcher
  );

  const { data: alertsData, error: alertsError } = useSWR<{alerts: Alert[]}>(
    '/api/admin/alerts',
    fetcher
  );

  // Loading state
  if (metricsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (metricsError || activitiesError || alertsError) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Error loading dashboard data</div>
        </div>
      </div>
    );
  }

  const activities = activitiesData?.activities || [];
  const alerts = alertsData?.alerts || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <DashboardHeader />

      {/* Key Metrics */}
      <MetricsCards metrics={metrics} />

      {/* Quick Actions & Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AlertsNotifications alerts={alerts} />
        <QuickActions />
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={activities} />

      {/* School Overview */}
      <SchoolOverview metrics={metrics} />
    </div>
  );
}