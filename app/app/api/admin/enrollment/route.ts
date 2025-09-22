import { NextRequest } from 'next/server';
import { eq, and, sql, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users, children, schools, UserRole } from '@/lib/db/schema';
import { withRole, logAuthEvent } from '@/lib/auth/middleware';

// Schema for processing enrollment
const processEnrollmentSchema = z.object({
  childId: z.number().min(1, 'Child ID is required'),
  action: z.enum(['approve', 'reject'], {
    required_error: 'Action must be approve or reject',
  }),
  notes: z.string().optional(),
});

// Schema for updating enrollment status
const updateEnrollmentSchema = z.object({
  isActive: z.boolean().optional(),
  currentClassroom: z.string().max(100).optional(),
  notes: z.string().optional(),
});

// GET /api/admin/enrollment - List enrollment applications and students
export async function GET(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status'); // 'pending', 'active', 'inactive'
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

        // Build where clause based on status
        let whereClause = sql`${children.deletedAt} IS NULL`;

        if (status === 'pending') {
          // Pending applications: missing emergency contact or medical notes
          whereClause = and(
            whereClause,
            sql`(${children.emergencyContact} IS NULL OR ${children.medicalNotes} IS NULL)`
          );
        } else if (status === 'active') {
          whereClause = and(whereClause, eq(children.isActive, true));
        } else if (status === 'inactive') {
          whereClause = and(whereClause, eq(children.isActive, false));
        }

        // Get enrollment data
        const enrollments = await db
          .select({
            id: children.id,
            firstName: children.firstName,
            lastName: children.lastName,
            nickname: children.nickname,
            birthdate: children.birthdate,
            gender: children.gender,
            allergies: children.allergies,
            medicalNotes: children.medicalNotes,
            emergencyContact: children.emergencyContact,
            montessoriLevel: children.montessoriLevel,
            currentClassroom: children.currentClassroom,
            startDate: children.startDate,
            isActive: children.isActive,
            canReceivePhotos: children.canReceivePhotos,
            canParticipateInActivities: children.canParticipateInActivities,
            notes: children.notes,
            createdAt: children.createdAt,
            updatedAt: children.updatedAt,
            school: {
              id: schools.id,
              name: schools.name,
            },
            parent: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
          })
          .from(children)
          .leftJoin(schools, eq(children.schoolId, schools.id))
          .leftJoin(users, eq(children.parentId, users.id))
          .where(whereClause)
          .orderBy(desc(children.createdAt))
          .limit(limit)
          .offset(offset);

        // Get total count
        const totalResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(children)
          .where(whereClause);

        const total = totalResult[0]?.count || 0;

        // Calculate enrollment statistics
        const stats = await Promise.all([
          // Total active students
          db.select({ count: sql<number>`count(*)` })
            .from(children)
            .where(and(eq(children.isActive, true), sql`${children.deletedAt} IS NULL`)),

          // Pending applications
          db.select({ count: sql<number>`count(*)` })
            .from(children)
            .where(and(
              sql`${children.deletedAt} IS NULL`,
              sql`(${children.emergencyContact} IS NULL OR ${children.medicalNotes} IS NULL)`
            )),

          // Recent enrollments (last 30 days)
          db.select({ count: sql<number>`count(*)` })
            .from(children)
            .where(and(
              sql`${children.deletedAt} IS NULL`,
              sql`${children.createdAt} >= NOW() - INTERVAL '30 days'`
            )),

          // School capacity
          db.select({ capacity: schools.capacity })
            .from(schools)
            .limit(1),
        ]);

        const enrollmentStats = {
          totalActive: stats[0][0]?.count || 0,
          pending: stats[1][0]?.count || 0,
          recentEnrollments: stats[2][0]?.count || 0,
          capacity: stats[3][0]?.capacity || 50,
        };

        logAuthEvent(
          'ACCESS_GRANTED',
          user.id,
          `Retrieved ${enrollments.length} enrollments (status: ${status || 'all'})`
        );

        return Response.json({
          enrollments,
          total,
          limit,
          offset,
          stats: enrollmentStats,
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

// POST /api/admin/enrollment - Process enrollment action
export async function POST(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const body = await req.json();
        const validatedData = processEnrollmentSchema.parse(body);

        // Get the child record
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

        const childRecord = child[0];

        // Process the action
        let updateData: any = {};
        let actionMessage = '';

        if (validatedData.action === 'approve') {
          updateData = {
            isActive: true,
            notes: validatedData.notes ?
              `${childRecord.notes || ''}\n[Admin] Enrollment approved: ${validatedData.notes}`.trim() :
              `${childRecord.notes || ''}\n[Admin] Enrollment approved`.trim(),
            updatedAt: new Date(),
          };
          actionMessage = 'Enrollment approved';
        } else if (validatedData.action === 'reject') {
          updateData = {
            isActive: false,
            notes: validatedData.notes ?
              `${childRecord.notes || ''}\n[Admin] Enrollment rejected: ${validatedData.notes}`.trim() :
              `${childRecord.notes || ''}\n[Admin] Enrollment rejected`.trim(),
            updatedAt: new Date(),
          };
          actionMessage = 'Enrollment rejected';
        }

        // Update the child record
        const [updatedChild] = await db
          .update(children)
          .set(updateData)
          .where(eq(children.id, validatedData.childId))
          .returning({
            id: children.id,
            firstName: children.firstName,
            lastName: children.lastName,
            isActive: children.isActive,
            updatedAt: children.updatedAt,
          });

        logAuthEvent(
          'ENROLLMENT_PROCESSED',
          user.id,
          `${actionMessage} for ${updatedChild.firstName} ${updatedChild.lastName}`
        );

        return Response.json({
          message: actionMessage,
          child: updatedChild,
        });
      }
    )(request);
  } catch (error) {
    console.error('Error processing enrollment:', error);
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

// PUT /api/admin/enrollment - Update enrollment details
export async function PUT(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const { searchParams } = new URL(req.url);
        const childId = parseInt(searchParams.get('id') || '0');

        if (!childId) {
          return Response.json(
            { error: 'Child ID is required' },
            { status: 400 }
          );
        }

        const body = await req.json();
        const validatedData = updateEnrollmentSchema.parse(body);

        // Check if child exists
        const existingChild = await db
          .select()
          .from(children)
          .where(eq(children.id, childId))
          .limit(1);

        if (!existingChild.length) {
          return Response.json(
            { error: 'Child not found' },
            { status: 404 }
          );
        }

        // Update the child record
        const [updatedChild] = await db
          .update(children)
          .set({
            ...validatedData,
            updatedAt: new Date(),
          })
          .where(eq(children.id, childId))
          .returning({
            id: children.id,
            firstName: children.firstName,
            lastName: children.lastName,
            isActive: children.isActive,
            currentClassroom: children.currentClassroom,
            notes: children.notes,
            updatedAt: children.updatedAt,
          });

        logAuthEvent(
          'ENROLLMENT_UPDATED',
          user.id,
          `Updated enrollment for ${updatedChild.firstName} ${updatedChild.lastName}`
        );

        return Response.json({
          message: 'Enrollment updated successfully',
          child: updatedChild,
        });
      }
    )(request);
  } catch (error) {
    console.error('Error updating enrollment:', error);
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