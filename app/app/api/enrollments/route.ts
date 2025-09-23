import { NextRequest } from 'next/server';
import { eq, and, sql, desc, ilike, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users, children, schools, UserRole } from '@/lib/db/schema';
import { enrollments, applications, EnrollmentStatus } from '@/lib/db/enrollment';
import { withRole, logAuthEvent } from '@/lib/auth/middleware';

// Schema for creating new enrollment
const createEnrollmentSchema = z.object({
  applicationId: z.number().min(1, 'Application ID is required'),
  childId: z.number().min(1, 'Child ID is required'),
  enrollmentDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid enrollment date'),
  classroom: z.string().max(100).optional(),
  tuitionAmount: z.number().min(0).optional(), // in cents
  discountAmount: z.number().min(0).optional(), // in cents
  notes: z.string().optional(),
});

// Schema for updating enrollment
const updateEnrollmentSchema = z.object({
  status: z.enum(['active', 'inactive', 'graduated', 'transferred', 'withdrawn']).optional(),
  classroom: z.string().max(100).optional(),
  tuitionAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
  withdrawalDate: z.string().optional(),
  withdrawalReason: z.string().optional(),
});

// GET /api/enrollments - List enrollments with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN, UserRole.TEACHER],
      async (req, user) => {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') as EnrollmentStatus | null;
        const search = searchParams.get('search') || '';
        const classroom = searchParams.get('classroom') || '';
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

        // Build where clause
        let whereConditions = [];

        if (status) {
          whereConditions.push(eq(enrollments.status, status));
        }

        if (classroom) {
          whereConditions.push(eq(enrollments.classroom, classroom));
        }

        if (search) {
          whereConditions.push(
            or(
              ilike(children.firstName, `%${search}%`),
              ilike(children.lastName, `%${search}%`),
              ilike(users.name, `%${search}%`),
              ilike(users.email, `%${search}%`)
            )
          );
        }

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

        // Get enrollments with relations
        const enrollmentsList = await db
          .select({
            id: enrollments.id,
            enrollmentDate: enrollments.enrollmentDate,
            status: enrollments.status,
            classroom: enrollments.classroom,
            tuitionAmount: enrollments.tuitionAmount,
            discountAmount: enrollments.discountAmount,
            notes: enrollments.notes,
            withdrawalDate: enrollments.withdrawalDate,
            withdrawalReason: enrollments.withdrawalReason,
            createdAt: enrollments.createdAt,
            updatedAt: enrollments.updatedAt,
            child: {
              id: children.id,
              firstName: children.firstName,
              lastName: children.lastName,
              nickname: children.nickname,
              birthdate: children.birthdate,
              age: children.age,
            },
            parent: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
            school: {
              id: schools.id,
              name: schools.name,
            },
            application: {
              id: applications.id,
              childName: applications.childName,
              submittedAt: applications.submittedAt,
            },
          })
          .from(enrollments)
          .leftJoin(children, eq(enrollments.childId, children.id))
          .leftJoin(users, eq(enrollments.parentId, users.id))
          .leftJoin(schools, eq(enrollments.schoolId, schools.id))
          .leftJoin(applications, eq(enrollments.applicationId, applications.id))
          .where(whereClause)
          .orderBy(desc(enrollments.enrollmentDate))
          .limit(limit)
          .offset(offset);

        // Get total count
        const totalResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(enrollments)
          .leftJoin(children, eq(enrollments.childId, children.id))
          .leftJoin(users, eq(enrollments.parentId, users.id))
          .where(whereClause);

        const total = totalResult[0]?.count || 0;

        // Calculate enrollment statistics
        const stats = await Promise.all([
          // Active enrollments
          db.select({ count: sql<number>`count(*)` })
            .from(enrollments)
            .where(eq(enrollments.status, 'active')),

          // Inactive enrollments
          db.select({ count: sql<number>`count(*)` })
            .from(enrollments)
            .where(eq(enrollments.status, 'inactive')),

          // Graduated
          db.select({ count: sql<number>`count(*)` })
            .from(enrollments)
            .where(eq(enrollments.status, 'graduated')),

          // Withdrawn
          db.select({ count: sql<number>`count(*)` })
            .from(enrollments)
            .where(eq(enrollments.status, 'withdrawn')),

          // New enrollments this month
          db.select({ count: sql<number>`count(*)` })
            .from(enrollments)
            .where(and(
              eq(enrollments.status, 'active'),
              sql`${enrollments.enrollmentDate} >= DATE_TRUNC('month', CURRENT_DATE)`
            )),

          // Total tuition (active enrollments)
          db.select({
            total: sql<number>`COALESCE(SUM(${enrollments.tuitionAmount} - COALESCE(${enrollments.discountAmount}, 0)), 0)`
          })
            .from(enrollments)
            .where(eq(enrollments.status, 'active')),
        ]);

        const enrollmentStats = {
          active: stats[0][0]?.count || 0,
          inactive: stats[1][0]?.count || 0,
          graduated: stats[2][0]?.count || 0,
          withdrawn: stats[3][0]?.count || 0,
          newThisMonth: stats[4][0]?.count || 0,
          totalTuition: stats[5][0]?.total || 0,
        };

        // Get classroom distribution
        const classrooms = await db
          .select({
            classroom: enrollments.classroom,
            count: sql<number>`count(*)`,
          })
          .from(enrollments)
          .where(and(
            eq(enrollments.status, 'active'),
            sql`${enrollments.classroom} IS NOT NULL`
          ))
          .groupBy(enrollments.classroom)
          .orderBy(enrollments.classroom);

        logAuthEvent(
          'ACCESS_GRANTED',
          user.id,
          `Retrieved ${enrollmentsList.length} enrollments (status: ${status || 'all'})`
        );

        return Response.json({
          enrollments: enrollmentsList,
          total,
          limit,
          offset,
          stats: enrollmentStats,
          classrooms,
        });
      }
    )(request);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    if (error instanceof Response) {
      return error;
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/enrollments - Create new enrollment
export async function POST(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const body = await req.json();
        const validatedData = createEnrollmentSchema.parse(body);

        // Verify application exists and is approved
        const application = await db
          .select()
          .from(applications)
          .where(eq(applications.id, validatedData.applicationId))
          .limit(1);

        if (!application.length) {
          return Response.json(
            { error: 'Application not found' },
            { status: 404 }
          );
        }

        if (application[0].status !== 'approved') {
          return Response.json(
            { error: 'Application must be approved before enrollment' },
            { status: 400 }
          );
        }

        // Verify child exists
        const child = await db
          .select()
          .from(children)
          .where(eq(children.id, validatedData.childId))
          .limit(1);

        if (!child.length) {
          return Response.json(
            { error: 'Child not found' },
            { status: 404 }
          );
        }

        // Check if enrollment already exists for this application
        const existingEnrollment = await db
          .select()
          .from(enrollments)
          .where(eq(enrollments.applicationId, validatedData.applicationId))
          .limit(1);

        if (existingEnrollment.length) {
          return Response.json(
            { error: 'Enrollment already exists for this application' },
            { status: 400 }
          );
        }

        // Create the enrollment
        const [newEnrollment] = await db
          .insert(enrollments)
          .values({
            applicationId: validatedData.applicationId,
            childId: validatedData.childId,
            schoolId: application[0].schoolId,
            parentId: application[0].parentId,
            enrollmentDate: validatedData.enrollmentDate,
            classroom: validatedData.classroom,
            tuitionAmount: validatedData.tuitionAmount,
            discountAmount: validatedData.discountAmount,
            notes: validatedData.notes,
            status: 'active',
          })
          .returning();

        logAuthEvent(
          'ENROLLMENT_CREATED',
          user.id,
          `Created enrollment ${newEnrollment.id} for child ${validatedData.childId}`
        );

        return Response.json({
          message: 'Enrollment created successfully',
          enrollment: newEnrollment,
        }, { status: 201 });
      }
    )(request);
  } catch (error) {
    console.error('Error creating enrollment:', error);
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