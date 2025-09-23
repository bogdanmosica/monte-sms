import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users, schools, UserRole } from '@/lib/db/schema';
import { applications, ApplicationStatus } from '@/lib/db/enrollment';
import { withRole, logAuthEvent } from '@/lib/auth/middleware';

// Schema for updating application
const updateApplicationSchema = z.object({
  status: z.enum(['pending', 'under_review', 'interview_scheduled', 'approved', 'rejected', 'waitlisted']).optional(),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  interviewDate: z.string().optional(),
  interviewNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

interface RouteParams {
  params: { id: string };
}

// GET /api/applications/[id] - Get single application
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    return await withRole(
      [UserRole.ADMIN, UserRole.TEACHER],
      async (req, user) => {
        const applicationId = parseInt(params.id);

        if (!applicationId || isNaN(applicationId)) {
          return Response.json(
            { error: 'Invalid application ID' },
            { status: 400 }
          );
        }

        // Get application with relations
        const application = await db
          .select({
            id: applications.id,
            childName: applications.childName,
            parentName: applications.parentName,
            email: applications.email,
            phone: applications.phone,
            address: applications.address,
            childBirthDate: applications.childBirthDate,
            preferredStartDate: applications.preferredStartDate,
            status: applications.status,
            notes: applications.notes,
            priority: applications.priority,
            submittedAt: applications.submittedAt,
            reviewedAt: applications.reviewedAt,
            interviewDate: applications.interviewDate,
            interviewNotes: applications.interviewNotes,
            rejectionReason: applications.rejectionReason,
            createdAt: applications.createdAt,
            updatedAt: applications.updatedAt,
            parent: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
            school: {
              id: schools.id,
              name: schools.name,
            },
          })
          .from(applications)
          .leftJoin(users, eq(applications.parentId, users.id))
          .leftJoin(schools, eq(applications.schoolId, schools.id))
          .where(eq(applications.id, applicationId))
          .limit(1);

        if (!application.length) {
          return Response.json(
            { error: 'Application not found' },
            { status: 404 }
          );
        }

        logAuthEvent(
          'ACCESS_GRANTED',
          user.id,
          `Viewed application ${applicationId} for ${application[0].childName}`
        );

        return Response.json({
          application: application[0],
        });
      }
    )(request);
  } catch (error) {
    console.error('Error fetching application:', error);
    if (error instanceof Response) {
      return error;
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/applications/[id] - Update application
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const applicationId = parseInt(params.id);

        if (!applicationId || isNaN(applicationId)) {
          return Response.json(
            { error: 'Invalid application ID' },
            { status: 400 }
          );
        }

        const body = await req.json();
        const validatedData = updateApplicationSchema.parse(body);

        // Check if application exists
        const existingApplication = await db
          .select()
          .from(applications)
          .where(eq(applications.id, applicationId))
          .limit(1);

        if (!existingApplication.length) {
          return Response.json(
            { error: 'Application not found' },
            { status: 404 }
          );
        }

        // Prepare update data
        const updateData: any = {
          ...validatedData,
          updatedAt: new Date(),
        };

        // Set reviewed fields if status is being changed
        if (validatedData.status && validatedData.status !== existingApplication[0].status) {
          updateData.reviewedAt = new Date();
          updateData.reviewedBy = user.id;
        }

        // Parse interview date if provided
        if (validatedData.interviewDate) {
          updateData.interviewDate = new Date(validatedData.interviewDate);
        }

        // Update the application
        const [updatedApplication] = await db
          .update(applications)
          .set(updateData)
          .where(eq(applications.id, applicationId))
          .returning();

        logAuthEvent(
          'APPLICATION_UPDATED',
          user.id,
          `Updated application ${applicationId} for ${updatedApplication.childName} - Status: ${updatedApplication.status}`
        );

        return Response.json({
          message: 'Application updated successfully',
          application: updatedApplication,
        });
      }
    )(request);
  } catch (error) {
    console.error('Error updating application:', error);
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

// DELETE /api/applications/[id] - Delete application (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const applicationId = parseInt(params.id);

        if (!applicationId || isNaN(applicationId)) {
          return Response.json(
            { error: 'Invalid application ID' },
            { status: 400 }
          );
        }

        // Check if application exists
        const existingApplication = await db
          .select({ id: applications.id, childName: applications.childName })
          .from(applications)
          .where(eq(applications.id, applicationId))
          .limit(1);

        if (!existingApplication.length) {
          return Response.json(
            { error: 'Application not found' },
            { status: 404 }
          );
        }

        // Delete the application
        await db
          .delete(applications)
          .where(eq(applications.id, applicationId));

        logAuthEvent(
          'APPLICATION_DELETED',
          user.id,
          `Deleted application ${applicationId} for ${existingApplication[0].childName}`
        );

        return Response.json({
          message: 'Application deleted successfully',
        });
      }
    )(request);
  } catch (error) {
    console.error('Error deleting application:', error);
    if (error instanceof Response) {
      return error;
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}