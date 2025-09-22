import { NextRequest } from 'next/server';
import { desc, eq, and, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, children, accessLogs, payments, observations, UserRole } from '@/lib/db/schema';
import { withRole } from '@/lib/auth/middleware';

interface Activity {
  id: string;
  type: 'enrollment' | 'payment' | 'staff' | 'observation' | 'access';
  message: string;
  time: string;
  status: 'pending' | 'completed' | 'failed';
  userId?: number;
  userRole?: string;
}

export async function GET(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    // Get recent access logs for activity tracking
    const recentLogs = await db
      .select({
        id: accessLogs.id,
        eventType: accessLogs.eventType,
        timestamp: accessLogs.timestamp,
        routeId: accessLogs.routeId,
        metadata: accessLogs.metadata,
        userId: accessLogs.userId,
        userName: users.name,
        userRole: users.role,
      })
      .from(accessLogs)
      .leftJoin(users, eq(accessLogs.userId, users.id))
      .where(
        and(
          sql`${accessLogs.eventType} IN ('login', 'access_granted')`,
          sql`${accessLogs.timestamp} >= NOW() - INTERVAL '7 days'`
        )
      )
      .orderBy(desc(accessLogs.timestamp))
      .limit(limit);

    // Get recent enrollments (new children)
    const recentEnrollments = await db
      .select({
        id: children.id,
        firstName: children.firstName,
        lastName: children.lastName,
        createdAt: children.createdAt,
        parentName: users.name,
      })
      .from(children)
      .leftJoin(users, eq(children.parentId, users.id))
      .where(
        and(
          eq(children.isActive, true),
          sql`${children.createdAt} >= NOW() - INTERVAL '7 days'`
        )
      )
      .orderBy(desc(children.createdAt))
      .limit(5);

    // Convert to unified activity format
    const activities: Activity[] = [];

    // Add enrollment activities
    recentEnrollments.forEach((enrollment) => {
      const timeAgo = getTimeAgo(enrollment.createdAt);
      activities.push({
        id: `enrollment-${enrollment.id}`,
        type: 'enrollment',
        message: `New student enrollment: ${enrollment.firstName} ${enrollment.lastName} (Parent: ${enrollment.parentName})`,
        time: timeAgo,
        status: 'completed',
        userId: enrollment.id,
      });
    });

    // Add access log activities (limit to interesting events)
    recentLogs.forEach((log) => {
      if (log.eventType === 'login' && log.userName) {
        const timeAgo = getTimeAgo(log.timestamp);
        activities.push({
          id: `access-${log.id}`,
          type: 'access',
          message: `${log.userName} (${log.userRole}) signed in`,
          time: timeAgo,
          status: 'completed',
          userId: log.userId,
          userRole: log.userRole || undefined,
        });
      }
    });

    // Get recent payments
    const recentPayments = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        type: payments.type,
        status: payments.status,
        paidDate: payments.paidDate,
        createdAt: payments.createdAt,
        parentName: users.name,
        childFirstName: children.firstName,
        childLastName: children.lastName,
      })
      .from(payments)
      .leftJoin(users, eq(payments.parentId, users.id))
      .leftJoin(children, eq(payments.childId, children.id))
      .where(
        and(
          sql`${payments.deletedAt} IS NULL`,
          sql`(${payments.paidDate} IS NOT NULL OR ${payments.createdAt} >= NOW() - INTERVAL '7 days')`
        )
      )
      .orderBy(desc(payments.paidDate), desc(payments.createdAt))
      .limit(5);

    // Get recent observations
    const recentObservations = await db
      .select({
        id: observations.id,
        activity: observations.activity,
        notes: observations.notes,
        createdAt: observations.createdAt,
        teacherName: users.name,
        childFirstName: children.firstName,
        childLastName: children.lastName,
      })
      .from(observations)
      .leftJoin(users, eq(observations.teacherId, users.id))
      .leftJoin(children, eq(observations.childId, children.id))
      .where(
        and(
          sql`${observations.deletedAt} IS NULL`,
          sql`${observations.createdAt} >= NOW() - INTERVAL '7 days'`
        )
      )
      .orderBy(desc(observations.createdAt))
      .limit(3);

    // Add payment activities
    recentPayments.forEach((payment) => {
      const timeAgo = getTimeAgo(payment.paidDate || payment.createdAt);
      const status = payment.status === 'paid' ? 'completed' : payment.status === 'overdue' ? 'failed' : 'pending';
      const childName = payment.childFirstName && payment.childLastName
        ? ` for ${payment.childFirstName} ${payment.childLastName}`
        : '';

      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        message: `${payment.type} payment ${payment.status === 'paid' ? 'received' : 'created'} from ${payment.parentName}${childName} ($${payment.amount})`,
        time: timeAgo,
        status: status as 'pending' | 'completed' | 'failed',
      });
    });

    // Add observation activities
    recentObservations.forEach((observation) => {
      const timeAgo = getTimeAgo(observation.createdAt);
      activities.push({
        id: `observation-${observation.id}`,
        type: 'observation',
        message: `${observation.teacherName} observed ${observation.childFirstName} ${observation.childLastName}: ${observation.activity}`,
        time: timeAgo,
        status: 'completed',
      });
    });

    // Sort activities by time (most recent first)
    activities.sort((a, b) => {
      // Extract numeric values from time strings for proper sorting
      const getTimeValue = (timeStr: string): number => {
        const minutes = timeStr.match(/(\d+)\s*minutes?\s*ago/);
        if (minutes) return parseInt(minutes[1]);

        const hours = timeStr.match(/(\d+)\s*hours?\s*ago/);
        if (hours) return parseInt(hours[1]) * 60;

        const days = timeStr.match(/(\d+)\s*days?\s*ago/);
        if (days) return parseInt(days[1]) * 24 * 60;

        if (timeStr.includes('1 day ago')) return 24 * 60;

        return 999999; // Unknown format, sort to end
      };

      return getTimeValue(a.time) - getTimeValue(b.time);
    });

    const allActivities = activities.slice(0, limit);

        return Response.json({ activities: allActivities });
      }
    )(request);
  } catch (error) {
    console.error('Error fetching admin activities:', error);
    if (error instanceof Response) {
      return error;
    }

    // Handle database connection errors specifically
    if (error instanceof Error && error.message.includes('too many clients')) {
      return Response.json(
        { error: 'Database temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return '1 day ago';
  } else {
    return `${diffDays} days ago`;
  }
}