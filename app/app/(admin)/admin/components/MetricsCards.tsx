import { DollarSign, UserPlus, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { AdminMetrics } from '../types/dashboard';

interface MetricsCardsProps {
  metrics: AdminMetrics | undefined;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const enrollmentPercentage = metrics?.enrollment?.enrollmentPercentage || 0;

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            Total Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {metrics?.enrollment?.totalStudents || 0}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={enrollmentPercentage} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground">
              {Math.round(enrollmentPercentage)}% capacity
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Monthly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${metrics?.financial?.totalRevenue?.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-muted-foreground">
            ${metrics?.financial?.pendingPayments?.toLocaleString() || '0'} pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            New Enrollments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {metrics?.enrollment?.newEnrollments || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics?.enrollment?.pendingApplications || 0} applications pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            Active Staff
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {metrics?.staff?.activeStaff || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics?.staff?.teachers || 0} teachers
          </p>
        </CardContent>
      </Card>
    </div>
  );
}