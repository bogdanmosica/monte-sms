import { NextRequest } from 'next/server';
import { eq, and, sql, gte, lte, count } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users, children, schools, accessLogs, UserRole } from '@/lib/db/schema';
import { withRole, logAuthEvent } from '@/lib/auth/middleware';

// Schema for report generation
const generateReportSchema = z.object({
  type: z.enum(['enrollment', 'financial', 'attendance', 'staff', 'activity'], {
    required_error: 'Report type is required',
  }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  includeDetails: z.boolean().default(true),
});

// Helper function to generate enrollment report
async function generateEnrollmentReport(startDate: string, endDate: string, includeDetails: boolean) {
  const dateStart = new Date(startDate);
  const dateEnd = new Date(endDate);

  // Get enrollment statistics
  const [
    totalEnrollments,
    activeStudents,
    newEnrollments,
    withdrawals,
    pendingApplications,
  ] = await Promise.all([
    // Total enrollments in period
    db.select({ count: count() })
      .from(children)
      .where(and(
        gte(children.createdAt, dateStart),
        lte(children.createdAt, dateEnd),
        sql`${children.deletedAt} IS NULL`
      )),

    // Currently active students
    db.select({ count: count() })
      .from(children)
      .where(and(
        eq(children.isActive, true),
        sql`${children.deletedAt} IS NULL`
      )),

    // New enrollments in period
    db.select({ count: count() })
      .from(children)
      .where(and(
        gte(children.createdAt, dateStart),
        lte(children.createdAt, dateEnd),
        eq(children.isActive, true),
        sql`${children.deletedAt} IS NULL`
      )),

    // Withdrawals (students marked inactive in period)
    db.select({ count: count() })
      .from(children)
      .where(and(
        gte(children.updatedAt, dateStart),
        lte(children.updatedAt, dateEnd),
        eq(children.isActive, false),
        sql`${children.deletedAt} IS NULL`
      )),

    // Pending applications
    db.select({ count: count() })
      .from(children)
      .where(and(
        sql`${children.deletedAt} IS NULL`,
        sql`(${children.emergencyContact} IS NULL OR ${children.medicalNotes} IS NULL)`
      )),
  ]);

  let details = null;
  if (includeDetails) {
    // Get detailed enrollment data
    details = await db
      .select({
        id: children.id,
        firstName: children.firstName,
        lastName: children.lastName,
        createdAt: children.createdAt,
        isActive: children.isActive,
        montessoriLevel: children.montessoriLevel,
        currentClassroom: children.currentClassroom,
        parentName: users.name,
        parentEmail: users.email,
      })
      .from(children)
      .leftJoin(users, eq(children.parentId, users.id))
      .where(and(
        gte(children.createdAt, dateStart),
        lte(children.createdAt, dateEnd),
        sql`${children.deletedAt} IS NULL`
      ));
  }

  return {
    summary: {
      totalEnrollments: totalEnrollments[0]?.count || 0,
      activeStudents: activeStudents[0]?.count || 0,
      newEnrollments: newEnrollments[0]?.count || 0,
      withdrawals: withdrawals[0]?.count || 0,
      pendingApplications: pendingApplications[0]?.count || 0,
    },
    details,
  };
}

// Helper function to generate staff report
async function generateStaffReport(startDate: string, endDate: string, includeDetails: boolean) {
  const dateStart = new Date(startDate);
  const dateEnd = new Date(endDate);

  // Get staff statistics
  const [
    totalStaff,
    teachers,
    administrators,
    newHires,
  ] = await Promise.all([
    // Total active staff
    db.select({ count: count() })
      .from(users)
      .where(and(
        sql`${users.role} IN ('teacher', 'admin')`,
        sql`${users.deletedAt} IS NULL`
      )),

    // Teachers
    db.select({ count: count() })
      .from(users)
      .where(and(
        eq(users.role, UserRole.TEACHER),
        sql`${users.deletedAt} IS NULL`
      )),

    // Administrators
    db.select({ count: count() })
      .from(users)
      .where(and(
        eq(users.role, UserRole.ADMIN),
        sql`${users.deletedAt} IS NULL`
      )),

    // New hires in period
    db.select({ count: count() })
      .from(users)
      .where(and(
        sql`${users.role} IN ('teacher', 'admin')`,
        gte(users.createdAt, dateStart),
        lte(users.createdAt, dateEnd),
        sql`${users.deletedAt} IS NULL`
      )),
  ]);

  let details = null;
  if (includeDetails) {
    details = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(
        sql`${users.role} IN ('teacher', 'admin')`,
        sql`${users.deletedAt} IS NULL`
      ));
  }

  return {
    summary: {
      totalStaff: totalStaff[0]?.count || 0,
      teachers: teachers[0]?.count || 0,
      administrators: administrators[0]?.count || 0,
      newHires: newHires[0]?.count || 0,
    },
    details,
  };
}

// Helper function to generate activity report
async function generateActivityReport(startDate: string, endDate: string, includeDetails: boolean) {
  const dateStart = new Date(startDate);
  const dateEnd = new Date(endDate);

  // Get activity statistics from access logs
  const [
    totalLogins,
    uniqueUsers,
    adminAccess,
    teacherAccess,
  ] = await Promise.all([
    // Total login events
    db.select({ count: count() })
      .from(accessLogs)
      .where(and(
        eq(accessLogs.eventType, 'login'),
        gte(accessLogs.timestamp, dateStart),
        lte(accessLogs.timestamp, dateEnd)
      )),

    // Unique users who logged in
    db.select({ count: sql<number>`COUNT(DISTINCT ${accessLogs.userId})` })
      .from(accessLogs)
      .where(and(
        eq(accessLogs.eventType, 'login'),
        gte(accessLogs.timestamp, dateStart),
        lte(accessLogs.timestamp, dateEnd)
      )),

    // Admin access events
    db.select({ count: count() })
      .from(accessLogs)
      .leftJoin(users, eq(accessLogs.userId, users.id))
      .where(and(
        eq(accessLogs.eventType, 'access_granted'),
        eq(users.role, UserRole.ADMIN),
        gte(accessLogs.timestamp, dateStart),
        lte(accessLogs.timestamp, dateEnd)
      )),

    // Teacher access events
    db.select({ count: count() })
      .from(accessLogs)
      .leftJoin(users, eq(accessLogs.userId, users.id))
      .where(and(
        eq(accessLogs.eventType, 'access_granted'),
        eq(users.role, UserRole.TEACHER),
        gte(accessLogs.timestamp, dateStart),
        lte(accessLogs.timestamp, dateEnd)
      )),
  ]);

  let details = null;
  if (includeDetails) {
    details = await db
      .select({
        id: accessLogs.id,
        eventType: accessLogs.eventType,
        timestamp: accessLogs.timestamp,
        routeId: accessLogs.routeId,
        userName: users.name,
        userRole: users.role,
      })
      .from(accessLogs)
      .leftJoin(users, eq(accessLogs.userId, users.id))
      .where(and(
        gte(accessLogs.timestamp, dateStart),
        lte(accessLogs.timestamp, dateEnd)
      ))
      .limit(100); // Limit for performance
  }

  return {
    summary: {
      totalLogins: totalLogins[0]?.count || 0,
      uniqueUsers: uniqueUsers[0]?.count || 0,
      adminAccess: adminAccess[0]?.count || 0,
      teacherAccess: teacherAccess[0]?.count || 0,
    },
    details,
  };
}

// POST /api/admin/report - Generate report
export async function POST(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const body = await req.json();
        const validatedData = generateReportSchema.parse(body);

        // Validate date range
        const startDate = new Date(validatedData.startDate);
        const endDate = new Date(validatedData.endDate);

        if (startDate > endDate) {
          return Response.json(
            { error: 'Start date must be before end date' },
            { status: 400 }
          );
        }

        // Check if date range is not too large (max 1 year)
        const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 365) {
          return Response.json(
            { error: 'Date range cannot exceed 365 days' },
            { status: 400 }
          );
        }

        let reportData: any = {};

        // Generate report based on type
        switch (validatedData.type) {
          case 'enrollment':
            reportData = await generateEnrollmentReport(
              validatedData.startDate,
              validatedData.endDate,
              validatedData.includeDetails
            );
            break;

          case 'staff':
            reportData = await generateStaffReport(
              validatedData.startDate,
              validatedData.endDate,
              validatedData.includeDetails
            );
            break;

          case 'activity':
            reportData = await generateActivityReport(
              validatedData.startDate,
              validatedData.endDate,
              validatedData.includeDetails
            );
            break;

          case 'financial':
            // Mock financial report (would integrate with payment system)
            reportData = {
              summary: {
                totalRevenue: 45600,
                totalPayments: 54,
                pendingAmount: 3200,
                overdueAmount: 800,
                averagePayment: 844.44,
              },
              details: validatedData.includeDetails ? [
                { month: '2025-01', revenue: 23400, payments: 28 },
                { month: '2024-12', revenue: 22200, payments: 26 },
              ] : null,
            };
            break;

          case 'attendance':
            // Mock attendance report (would integrate with attendance system)
            reportData = {
              summary: {
                totalDays: 20,
                averageAttendance: 94.2,
                totalAbsences: 15,
                totalStudents: 42,
              },
              details: validatedData.includeDetails ? [
                { date: '2025-01-15', present: 40, absent: 2 },
                { date: '2025-01-14', present: 39, absent: 3 },
              ] : null,
            };
            break;

          default:
            return Response.json(
              { error: 'Invalid report type' },
              { status: 400 }
            );
        }

        const report = {
          id: `report_${Date.now()}`,
          type: validatedData.type,
          startDate: validatedData.startDate,
          endDate: validatedData.endDate,
          format: validatedData.format,
          generatedAt: new Date().toISOString(),
          generatedBy: user.id,
          data: reportData,
        };

        logAuthEvent(
          'REPORT_GENERATED',
          user.id,
          `Generated ${validatedData.type} report for ${validatedData.startDate} to ${validatedData.endDate}`
        );

        // For CSV and PDF formats, you would implement file generation here
        if (validatedData.format === 'csv') {
          // TODO: Implement CSV generation
          return Response.json({
            message: 'CSV generation not yet implemented',
            report: { ...report, downloadUrl: `/api/admin/report/download/${report.id}` },
          });
        }

        if (validatedData.format === 'pdf') {
          // TODO: Implement PDF generation
          return Response.json({
            message: 'PDF generation not yet implemented',
            report: { ...report, downloadUrl: `/api/admin/report/download/${report.id}` },
          });
        }

        return Response.json({ report });
      }
    )(request);
  } catch (error) {
    console.error('Error generating report:', error);
    if (error instanceof Response) {
      return error;
    }
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}