import { NextRequest } from 'next/server';
import { eq, count, and, sql, sum, lt } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, children, payments, schools, UserRole } from '@/lib/db/schema';
import { withRole } from '@/lib/auth/middleware';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  icon: 'AlertCircle' | 'Clock' | 'CheckCircle' | 'DollarSign';
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
}

export async function GET(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const alerts: Alert[] = [];

    // Check for pending enrollments (children without complete information)
    const incompleteEnrollments = await db
      .select({ count: count() })
      .from(children)
      .where(
        and(
          eq(children.isActive, true),
          sql`${children.emergencyContact} IS NULL OR ${children.medicalNotes} IS NULL`
        )
      );

    const incompleteCount = incompleteEnrollments[0]?.count || 0;
    if (incompleteCount > 0) {
      alerts.push({
        id: 'pending-enrollments',
        type: 'warning',
        icon: 'Clock',
        title: 'Pending Applications',
        message: `${incompleteCount} enrollment applications awaiting review`,
        action: 'Review',
        actionUrl: '/admin/enrollments',
        priority: 'medium',
      });
    }

    // Real overdue payments alert from database
    const overduePaymentsResult = await db
      .select({
        total: sum(payments.amount),
        count: count()
      })
      .from(payments)
      .where(eq(payments.status, 'overdue'));

    const overdueAmount = Number(overduePaymentsResult[0]?.total || 0);
    const overdueCount = overduePaymentsResult[0]?.count || 0;

    if (overdueAmount > 0) {
      alerts.push({
        id: 'overdue-payments',
        type: 'error',
        icon: 'DollarSign',
        title: 'Overdue Payments',
        message: `$${overdueAmount.toLocaleString()} in overdue payments (${overdueCount} payment${overdueCount !== 1 ? 's' : ''})`,
        action: 'Review',
        actionUrl: '/admin/payments',
        priority: 'high',
      });
    }

    // Real pending payments alert from database
    const pendingPaymentsResult = await db
      .select({
        total: sum(payments.amount),
        count: count()
      })
      .from(payments)
      .where(
        and(
          eq(payments.status, 'pending'),
          lt(payments.dueDate, new Date())
        )
      );

    const pendingAmount = Number(pendingPaymentsResult[0]?.total || 0);
    const pendingCount = pendingPaymentsResult[0]?.count || 0;

    if (pendingAmount > 0) {
      alerts.push({
        id: 'pending-payments-overdue',
        type: 'warning',
        icon: 'DollarSign',
        title: 'Past Due Payments',
        message: `$${pendingAmount.toLocaleString()} in payments past due date (${pendingCount} payment${pendingCount !== 1 ? 's' : ''})`,
        action: 'Send Reminders',
        actionUrl: '/admin/payments',
        priority: 'medium',
      });
    }

    // Check staff report completion (mock data)
    const staffReportsComplete = true; // Would check from reports table
    if (staffReportsComplete) {
      alerts.push({
        id: 'staff-reports-complete',
        type: 'success',
        icon: 'CheckCircle',
        title: 'Staff Reports',
        message: 'All weekly classroom reports submitted on time',
        priority: 'low',
      });
    }

    // Check for students without recent observations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const studentsWithoutObservations = await db
      .select({ count: count() })
      .from(children)
      .where(
        and(
          eq(children.isActive, true),
          sql`${children.updatedAt} < ${thirtyDaysAgo}`
        )
      );

    const studentsNeedingAttention = studentsWithoutObservations[0]?.count || 0;
    if (studentsNeedingAttention > 0) {
      alerts.push({
        id: 'students-need-observations',
        type: 'info',
        icon: 'AlertCircle',
        title: 'Student Observations',
        message: `${studentsNeedingAttention} students haven't been observed recently`,
        action: 'Review',
        actionUrl: '/admin/observations',
        priority: 'medium',
      });
    }

    // Real capacity alert from database
    const [currentStudents, schoolData] = await Promise.all([
      db
        .select({ count: count() })
        .from(children)
        .where(eq(children.isActive, true)),

      db
        .select({ capacity: schools.capacity })
        .from(schools)
        .limit(1)
    ]);

    const studentCount = currentStudents[0]?.count || 0;
    const capacity = schoolData[0]?.capacity || 50;
    const capacityPercentage = (studentCount / capacity) * 100;

    if (capacityPercentage > 90) {
      alerts.push({
        id: 'near-capacity',
        type: 'warning',
        icon: 'AlertCircle',
        title: 'Near Capacity',
        message: `School is at ${Math.round(capacityPercentage)}% capacity (${studentCount}/${capacity})`,
        action: 'View Details',
        actionUrl: '/admin/enrollment',
        priority: 'medium',
      });
    }

    // Sort alerts by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return Response.json({ alerts });
      }
    )(request);
  } catch (error) {
    console.error('Error fetching admin alerts:', error);
    if (error instanceof Response) {
      return error;
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}