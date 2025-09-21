'use client';

import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UserRole } from '@/lib/db/schema';
import { mockChildren, mockSchools, mockUsers } from '@/lib/mock-data';

// Mock admin data
const mockBillingData = {
  totalRevenue: 45600,
  pendingPayments: 3200,
  overduePayments: 800,
  paidThisMonth: 42400,
};

const mockEnrollmentData = {
  totalStudents: mockChildren.length,
  newEnrollments: 2,
  pendingApplications: 5,
  capacity: 50,
};

const mockStaffData = {
  totalStaff:
    mockUsers.filter((user) => user.role === UserRole.TEACHER).length + 1, // +1 for admin
  teachers: mockUsers.filter((user) => user.role === UserRole.TEACHER).length,
  activeStaff:
    mockUsers.filter((user) => user.role === UserRole.TEACHER).length + 1,
};

const recentActivities = [
  {
    id: '1',
    type: 'enrollment',
    message: 'New student application received from Johnson family',
    time: '2 hours ago',
    status: 'pending',
  },
  {
    id: '2',
    type: 'payment',
    message: 'Monthly tuition payment received from Chen family',
    time: '4 hours ago',
    status: 'completed',
  },
  {
    id: '3',
    type: 'staff',
    message: 'Maria Montessori submitted weekly classroom report',
    time: '1 day ago',
    status: 'completed',
  },
  {
    id: '4',
    type: 'enrollment',
    message: 'Rodriguez family completed enrollment process',
    time: '2 days ago',
    status: 'completed',
  },
];

export default function AdminDashboard() {
  const currentAdmin = mockUsers.find((user) => user.role === UserRole.ADMIN);
  const school = mockSchools[0];

  const enrollmentPercentage =
    (mockEnrollmentData.totalStudents / mockEnrollmentData.capacity) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {currentAdmin?.name}
          </h1>
          <p className="text-muted-foreground">
            {school.name} • Administrative Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Settings className="w-4 h-4 mr-2" />
            School Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
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
              {mockEnrollmentData.totalStudents}
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
              ${mockBillingData.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${mockBillingData.pendingPayments.toLocaleString()} pending
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
              {mockEnrollmentData.newEnrollments}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockEnrollmentData.pendingApplications} applications pending
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
              {mockStaffData.activeStaff}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockStaffData.teachers} teachers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Alerts & Notifications */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Alerts & Notifications
            </CardTitle>
            <CardDescription>
              Important items requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Overdue Payments</h4>
                  <p className="text-xs text-muted-foreground">
                    ${mockBillingData.overduePayments.toLocaleString()} in
                    overdue tuition payments
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Review
                </Button>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Pending Applications</h4>
                  <p className="text-xs text-muted-foreground">
                    {mockEnrollmentData.pendingApplications} enrollment
                    applications awaiting review
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Review
                </Button>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <CheckCircle className="w-5 h-5 text-accent mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Staff Reports</h4>
                  <p className="text-xs text-muted-foreground">
                    All weekly classroom reports submitted on time
                  </p>
                </div>
                <Badge variant="secondary" className="bg-accent/20 text-accent">
                  Complete
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
              >
                <UserPlus className="w-6 h-6 text-primary" />
                <span>New Enrollment</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
              >
                <DollarSign className="w-6 h-6 text-accent" />
                <span>Process Payment</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
              >
                <Users className="w-6 h-6 text-secondary-foreground" />
                <span>Add Staff Member</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
              >
                <FileText className="w-6 h-6 text-primary" />
                <span>Generate Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary-foreground" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest school activities and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border"
              >
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'enrollment'
                        ? 'bg-primary/20'
                        : activity.type === 'payment'
                          ? 'bg-accent/20'
                          : 'bg-secondary/20'
                    }`}
                  >
                    {activity.type === 'enrollment' && (
                      <UserPlus className="w-5 h-5 text-primary" />
                    )}
                    {activity.type === 'payment' && (
                      <DollarSign className="w-5 h-5 text-accent" />
                    )}
                    {activity.type === 'staff' && (
                      <Users className="w-5 h-5 text-secondary-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
                <Badge
                  variant={
                    activity.status === 'completed' ? 'default' : 'secondary'
                  }
                  className={
                    activity.status === 'completed'
                      ? 'bg-accent/20 text-accent'
                      : activity.status === 'pending'
                        ? 'bg-primary/20 text-primary'
                        : ''
                  }
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* School Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enrollment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Students</span>
                <span className="font-medium">
                  {mockEnrollmentData.totalStudents}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Capacity</span>
                <span className="font-medium">
                  {mockEnrollmentData.capacity}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Available Spots</span>
                <span className="font-medium">
                  {mockEnrollmentData.capacity -
                    mockEnrollmentData.totalStudents}
                </span>
              </div>
              <Progress value={enrollmentPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Revenue</span>
                <span className="font-medium">
                  ${mockBillingData.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Collected</span>
                <span className="font-medium text-accent">
                  ${mockBillingData.paidThisMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending</span>
                <span className="font-medium text-primary">
                  ${mockBillingData.pendingPayments.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Overdue</span>
                <span className="font-medium text-destructive">
                  ${mockBillingData.overduePayments.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Staff Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Staff</span>
                <span className="font-medium">{mockStaffData.totalStaff}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Teachers</span>
                <span className="font-medium">{mockStaffData.teachers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Administrators</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Today</span>
                <span className="font-medium text-accent">
                  {mockStaffData.activeStaff}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
