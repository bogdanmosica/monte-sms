'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EnrollmentStatsProps {
  currentStudents: number;
  pendingApplications: number;
  approvedApplications: number;
  totalCapacity?: number;
}

export function EnrollmentStats({
  currentStudents,
  pendingApplications,
  approvedApplications,
  totalCapacity = 50,
}: EnrollmentStatsProps) {
  const availableSpots = totalCapacity - currentStudents;

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {currentStudents}
          </div>
          <p className="text-xs text-muted-foreground">
            Active enrollments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {pendingApplications}
          </div>
          <p className="text-xs text-muted-foreground">Awaiting review</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Approved This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {approvedApplications}
          </div>
          <p className="text-xs text-muted-foreground">Ready to enroll</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Available Spots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {availableSpots}
          </div>
          <p className="text-xs text-muted-foreground">
            Out of {totalCapacity} capacity
          </p>
        </CardContent>
      </Card>
    </div>
  );
}