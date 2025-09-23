import { NextRequest } from 'next/server';
import { eq, count, and, sql, sum, gte } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, children, schools, payments, UserRole } from '@/lib/db/schema';
import { applications, enrollments } from '@/lib/db/enrollment';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Authentication and authorization is handled by middleware
    // Get user from session for logging
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get metrics in parallel
    const [
      totalStudents,
      totalStaff,
      totalParents,
      activeStaff,
      teacherCount,
      adminCount,
      schoolCapacity,
      totalRevenue,
      pendingPayments,
      overduePayments,
      paidThisMonth,
      recentEnrollments,
      pendingApplications,
      approvedApplicationsThisMonth,
    ] = await Promise.all([
      // Total students (children)
      db.select({ count: count() }).from(children).where(eq(children.isActive, true)),

      // Total staff (teachers + admins)
      db.select({ count: count() }).from(users).where(
        and(
          sql`${users.role} IN ('teacher', 'admin')`,
          sql`${users.deletedAt} IS NULL`
        )
      ),

      // Total parents
      db.select({ count: count() }).from(users).where(
        and(
          eq(users.role, UserRole.PARENT),
          sql`${users.deletedAt} IS NULL`
        )
      ),

      // Active staff (same as total for now)
      db.select({ count: count() }).from(users).where(
        and(
          sql`${users.role} IN ('teacher', 'admin')`,
          sql`${users.deletedAt} IS NULL`
        )
      ),

      // Teacher count specifically
      db.select({ count: count() }).from(users).where(
        and(
          eq(users.role, UserRole.TEACHER),
          sql`${users.deletedAt} IS NULL`
        )
      ),

      // Admin count specifically
      db.select({ count: count() }).from(users).where(
        and(
          eq(users.role, UserRole.ADMIN),
          sql`${users.deletedAt} IS NULL`
        )
      ),

      // School capacity
      db.select({ capacity: schools.capacity }).from(schools).limit(1),

      // Total revenue from paid payments
      db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, 'paid')),

      // Pending payments amount
      db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, 'pending')),

      // Overdue payments amount
      db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, 'overdue')),

      // Payments made this month
      db.select({ total: sum(payments.amount) }).from(payments).where(
        and(
          eq(payments.status, 'paid'),
          gte(payments.paidDate, new Date(new Date().getFullYear(), new Date().getMonth(), 1))
        )
      ),

      // Recent enrollments (children enrolled in last 30 days)
      db.select({ count: count() }).from(children).where(
        and(
          eq(children.isActive, true),
          gte(children.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        )
      ),

      // Pending applications (with fallback if table doesn't exist)
      (async () => {
        try {
          return await db.select({ count: count() }).from(applications).where(eq(applications.status, 'pending'));
        } catch (error) {
          console.warn('Applications table not found, using fallback value for pending applications');
          return [{ count: 0 }];
        }
      })(),

      // Applications approved this month (with fallback if table doesn't exist)
      (async () => {
        try {
          return await db.select({ count: count() }).from(applications).where(
            and(
              eq(applications.status, 'approved'),
              gte(applications.reviewedAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1))
            )
          );
        } catch (error) {
          console.warn('Applications table not found, using fallback value for approved applications');
          return [{ count: 0 }];
        }
      })(),
    ]);

    // Calculate enrollment metrics
    const currentStudents = totalStudents[0]?.count || 0;
    const capacity = schoolCapacity[0]?.capacity || 50;
    const enrollmentPercentage = Math.round((currentStudents / capacity) * 100);
    const availableSpots = capacity - currentStudents;

    // Real billing data from payments table
    const billingData = {
      totalRevenue: Number(totalRevenue[0]?.total || 0),
      pendingPayments: Number(pendingPayments[0]?.total || 0),
      overduePayments: Number(overduePayments[0]?.total || 0),
      paidThisMonth: Number(paidThisMonth[0]?.total || 0),
    };

    const metrics = {
      enrollment: {
        totalStudents: currentStudents,
        capacity,
        enrollmentPercentage,
        availableSpots,
        newEnrollments: recentEnrollments[0]?.count || 0,
        pendingApplications: pendingApplications[0]?.count || 0,
        approvedThisMonth: approvedApplicationsThisMonth[0]?.count || 0,
      },
      staff: {
        totalStaff: totalStaff[0]?.count || 0,
        teachers: teacherCount[0]?.count || 0,
        activeStaff: activeStaff[0]?.count || 0,
        administrators: adminCount[0]?.count || 0,
      },
      financial: billingData,
      parents: {
        totalParents: totalParents[0]?.count || 0,
      },
    };

    return Response.json(metrics);
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    if (error instanceof Response) {
      return error;
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}