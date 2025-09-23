import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users, children, schools, UserRole } from '@/lib/db/schema';
import { enrollments, applications } from '@/lib/db/enrollment';
import { withRole, logAuthEvent } from '@/lib/auth/middleware';

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

interface RouteParams {
  params: { id: string };
}

// GET /api/enrollments/[id] - Get single enrollment
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    return await withRole(
      [UserRole.ADMIN, UserRole.TEACHER],
      async (req, user) => {
        const enrollmentId = parseInt(params.id);

        if (!enrollmentId || isNaN(enrollmentId)) {
          return Response.json(
            { error: 'Invalid enrollment ID' },
            { status: 400 }
          );
        }

        // Get enrollment with full relations
        const enrollment = await db
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
              gender: children.gender,
              allergies: children.allergies,
              medicalNotes: children.medicalNotes,
              emergencyContact: children.emergencyContact,
              montessoriLevel: children.montessoriLevel,
            },
            parent: {
              id: users.id,
              name: users.name,
              email: users.email,
              role: users.role,
            },
            school: {
              id: schools.id,
              name: schools.name,
              address: schools.address,
              phone: schools.phone,
            },
            application: {
              id: applications.id,
              childName: applications.childName,
              submittedAt: applications.submittedAt,
              status: applications.status,
              notes: applications.notes,
              priority: applications.priority,
            },
          })
          .from(enrollments)
          .leftJoin(children, eq(enrollments.childId, children.id))
          .leftJoin(users, eq(enrollments.parentId, users.id))
          .leftJoin(schools, eq(enrollments.schoolId, schools.id))
          .leftJoin(applications, eq(enrollments.applicationId, applications.id))
          .where(eq(enrollments.id, enrollmentId))
          .limit(1);

        if (!enrollment.length) {
          return Response.json(
            { error: 'Enrollment not found' },
            { status: 404 }
          );
        }

        logAuthEvent(
          'ACCESS_GRANTED',
          user.id,
          `Viewed enrollment ${enrollmentId} for ${enrollment[0].child?.firstName} ${enrollment[0].child?.lastName}`
        );

        return Response.json({
          enrollment: enrollment[0],
        });
      }
    )(request);
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    if (error instanceof Response) {
      return error;
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/enrollments/[id] - Update enrollment
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const enrollmentId = parseInt(params.id);

        if (!enrollmentId || isNaN(enrollmentId)) {
          return Response.json(
            { error: 'Invalid enrollment ID' },
            { status: 400 }
          );
        }

        const body = await req.json();
        const validatedData = updateEnrollmentSchema.parse(body);

        // Check if enrollment exists
        const existingEnrollment = await db
          .select()
          .from(enrollments)
          .where(eq(enrollments.id, enrollmentId))
          .limit(1);

        if (!existingEnrollment.length) {
          return Response.json(
            { error: 'Enrollment not found' },
            { status: 404 }
          );
        }

        // Prepare update data
        const updateData: any = {
          ...validatedData,
          updatedAt: new Date(),
        };

        // Parse withdrawal date if provided
        if (validatedData.withdrawalDate) {
          updateData.withdrawalDate = validatedData.withdrawalDate;
        }

        // Update the enrollment
        const [updatedEnrollment] = await db
          .update(enrollments)
          .set(updateData)
          .where(eq(enrollments.id, enrollmentId))
          .returning();

        // Get child info for logging
        const child = await db
          .select({ firstName: children.firstName, lastName: children.lastName })
          .from(children)
          .where(eq(children.id, updatedEnrollment.childId))
          .limit(1);

        const childName = child.length ? `${child[0].firstName} ${child[0].lastName}` : 'Unknown';

        logAuthEvent(
          'ENROLLMENT_UPDATED',
          user.id,
          `Updated enrollment ${enrollmentId} for ${childName} - Status: ${updatedEnrollment.status}`
        );

        return Response.json({
          message: 'Enrollment updated successfully',
          enrollment: updatedEnrollment,
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

// DELETE /api/enrollments/[id] - Delete enrollment (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const enrollmentId = parseInt(params.id);

        if (!enrollmentId || isNaN(enrollmentId)) {
          return Response.json(
            { error: 'Invalid enrollment ID' },
            { status: 400 }
          );
        }

        // Check if enrollment exists and get child info
        const existingEnrollment = await db
          .select({
            id: enrollments.id,
            childId: enrollments.childId,
            child: {
              firstName: children.firstName,
              lastName: children.lastName,
            }
          })
          .from(enrollments)
          .leftJoin(children, eq(enrollments.childId, children.id))
          .where(eq(enrollments.id, enrollmentId))
          .limit(1);

        if (!existingEnrollment.length) {
          return Response.json(
            { error: 'Enrollment not found' },
            { status: 404 }
          );
        }

        // Delete the enrollment
        await db
          .delete(enrollments)
          .where(eq(enrollments.id, enrollmentId));

        const childName = existingEnrollment[0].child ?
          `${existingEnrollment[0].child.firstName} ${existingEnrollment[0].child.lastName}` :
          'Unknown';

        logAuthEvent(
          'ENROLLMENT_DELETED',
          user.id,
          `Deleted enrollment ${enrollmentId} for ${childName}`
        );

        return Response.json({
          message: 'Enrollment deleted successfully',
        });
      }
    )(request);
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    if (error instanceof Response) {
      return error;
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}