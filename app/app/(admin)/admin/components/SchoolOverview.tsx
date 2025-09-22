import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  DollarSign,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import type { AdminMetrics } from '../types/dashboard';

interface SchoolOverviewProps {
  metrics: AdminMetrics | undefined;
}

export function SchoolOverview({ metrics }: SchoolOverviewProps) {
  const enrollmentPercentage = metrics?.enrollment?.enrollmentPercentage || 0;
  const totalStudents = metrics?.enrollment?.totalStudents || 0;
  const capacity = metrics?.enrollment?.capacity || 0;
  const availableSpots = metrics?.enrollment?.availableSpots || 0;
  const newEnrollments = metrics?.enrollment?.newEnrollments || 0;

  const totalRevenue = metrics?.financial?.totalRevenue || 0;
  const paidThisMonth = metrics?.financial?.paidThisMonth || 0;
  const pendingPayments = metrics?.financial?.pendingPayments || 0;
  const overduePayments = metrics?.financial?.overduePayments || 0;

  const totalStaff = metrics?.staff?.totalStaff || 0;
  const teachers = metrics?.staff?.teachers || 0;
  const administrators = metrics?.staff?.administrators || 0;
  const activeStaff = metrics?.staff?.activeStaff || 0;

  // Helper functions for status badges and indicators
  const getEnrollmentStatus = () => {
    if (enrollmentPercentage >= 95) return { status: 'critical', color: 'destructive', icon: AlertCircle };
    if (enrollmentPercentage >= 85) return { status: 'high', color: 'default', icon: TrendingUp };
    if (enrollmentPercentage >= 65) return { status: 'optimal', color: 'default', icon: CheckCircle };
    return { status: 'low', color: 'secondary', icon: TrendingDown };
  };

  const getFinancialHealth = () => {
    const overdueRatio = totalRevenue > 0 ? (overduePayments / totalRevenue) * 100 : 0;
    if (overdueRatio > 10) return { status: 'concerning', color: 'destructive' };
    if (overdueRatio > 5) return { status: 'attention', color: 'default' };
    return { status: 'healthy', color: 'default' };
  };

  const enrollmentStatus = getEnrollmentStatus();
  const financialHealth = getFinancialHealth();

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Enrollment Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Enrollment Status
            </div>
            <Badge variant={enrollmentStatus.color} className="text-xs">
              {enrollmentStatus.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Students</span>
              <span className="font-semibold text-lg">{totalStudents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Capacity</span>
              <span className="font-medium">{capacity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Available Spots</span>
              <span className={`font-medium ${availableSpots <= 5 ? 'text-orange-600' : 'text-green-600'}`}>
                {availableSpots}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Capacity Used</span>
                <span className="text-xs font-medium">{enrollmentPercentage}%</span>
              </div>
              <Progress
                value={enrollmentPercentage}
                className="h-2"
                style={{
                  background: enrollmentPercentage >= 90 ? '#fee2e2' : enrollmentPercentage >= 75 ? '#fef3c7' : '#dcfce7'
                }}
              />
            </div>
            {newEnrollments > 0 && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">New This Month</span>
                <Badge variant="secondary" className="text-xs">
                  +{newEnrollments}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Financial Summary
            </div>
            <Badge variant={financialHealth.color} className="text-xs">
              {financialHealth.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <span className="font-semibold text-lg">
                ${totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Collected This Month</span>
              <span className="font-medium text-green-600">
                ${paidThisMonth.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="font-medium text-blue-600">
                ${pendingPayments.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Overdue</span>
              <span className={`font-medium ${overduePayments > 0 ? 'text-destructive' : 'text-green-600'}`}>
                ${overduePayments.toLocaleString()}
              </span>
            </div>
            {overduePayments > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <AlertCircle className="w-3 h-3 text-destructive" />
                <span className="text-xs text-destructive">Requires attention</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Staff Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-600" />
            Staff Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Staff</span>
              <span className="font-semibold text-lg">{totalStaff}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Teachers</span>
              <span className="font-medium">{teachers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Administrators</span>
              <span className="font-medium">{administrators}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Today</span>
              <span className="font-medium text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {activeStaff}
              </span>
            </div>
            {totalStudents > 0 && teachers > 0 && (
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-xs text-muted-foreground">Student:Teacher Ratio</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(totalStudents / teachers)}:1
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}