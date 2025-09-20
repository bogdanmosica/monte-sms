import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { children, users, schools } from '@/lib/db/schema';
import { withRole, logAuthEvent, UserRole } from '@/lib/auth/middleware';
import { eq, and } from 'drizzle-orm';

// Schema for updating a child
const updateChildSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  nickname: z.string().max(50).optional(),
  allergies: z.string().optional(),
  medicalNotes: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(1),
    relationship: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional(),
    canPickup: z.boolean(),
    notes: z.string().optional(),
  }).optional(),
  currentClassroom: z.string().max(100).optional(),
  canReceivePhotos: z.boolean().optional(),
  canParticipateInActivities: z.boolean().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

async function getChildWithAccess(childId: number, userId: number, userRole: string) {
  let whereClause = and(
    eq(children.id, childId),
    eq(children.deletedAt, null)
  );

  // Role-based access control
  if (userRole === UserRole.PARENT) {
    whereClause = and(whereClause, eq(children.parentId, userId));
  }

  const [child] = await db
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
    .where(whereClause);

  return child;
}

// GET /api/children/[id] - Get specific child
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    return await withRole([UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN], async (req, user) => {
      const childId = parseInt(params.id);

      if (isNaN(childId)) {
        return Response.json({ error: 'Invalid child ID' }, { status: 400 });
      }

      const child = await getChildWithAccess(childId, user.id, user.role);

      if (!child) {
        logAuthEvent('ACCESS_DENIED', user.id, `Attempted to access child ${childId}`);
        return Response.json({ error: 'Child not found or access denied' }, { status: 404 });
      }

      logAuthEvent('LOGIN_SUCCESS', user.id, `Retrieved child: ${child.firstName} ${child.lastName}`);

      return Response.json({ child });
    })(request);
  } catch (error) {
    logAuthEvent('ACCESS_DENIED', undefined, error.message);
    if (error instanceof Response) {
      return error;
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/children/[id] - Update child (Admin/Teacher only, or parent for limited fields)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    return await withRole([UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN], async (req, user) => {
      const childId = parseInt(params.id);

      if (isNaN(childId)) {
        return Response.json({ error: 'Invalid child ID' }, { status: 400 });
      }

      const body = await req.json();
      const validatedData = updateChildSchema.parse(body);

      // Check if child exists and user has access
      const existingChild = await getChildWithAccess(childId, user.id, user.role);
      if (!existingChild) {
        logAuthEvent('ACCESS_DENIED', user.id, `Attempted to update child ${childId}`);
        return Response.json({ error: 'Child not found or access denied' }, { status: 404 });
      }

      // Parents can only update limited fields
      if (user.role === UserRole.PARENT) {
        const allowedFields = ['emergencyContact', 'canReceivePhotos', 'canParticipateInActivities'];
        const updateData = Object.fromEntries(
          Object.entries(validatedData).filter(([key]) => allowedFields.includes(key))
        );

        if (Object.keys(updateData).length === 0) {
          return Response.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        validatedData = updateData;
      }

      // Prepare update data
      const updateData = {
        ...validatedData,
        updatedAt: new Date(),
      };

      if (validatedData.emergencyContact) {
        updateData.emergencyContact = JSON.stringify(validatedData.emergencyContact);
      }

      const [updatedChild] = await db
        .update(children)
        .set(updateData)
        .where(eq(children.id, childId))
        .returning();

      logAuthEvent('LOGIN_SUCCESS', user.id, `Updated child: ${updatedChild.firstName} ${updatedChild.lastName}`);

      return Response.json({ child: updatedChild });
    })(request);
  } catch (error) {
    logAuthEvent('PERMISSION_ERROR', undefined, error.message);
    if (error instanceof Response) {
      return error;
    }
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors[0].message }, { status: 400 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/children/[id] - Soft delete child (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    return await withRole([UserRole.ADMIN], async (req, user) => {
      const childId = parseInt(params.id);

      if (isNaN(childId)) {
        return Response.json({ error: 'Invalid child ID' }, { status: 400 });
      }

      const [deletedChild] = await db
        .update(children)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(children.id, childId),
          eq(children.deletedAt, null)
        ))
        .returning();

      if (!deletedChild) {
        return Response.json({ error: 'Child not found' }, { status: 404 });
      }

      logAuthEvent('LOGIN_SUCCESS', user.id, `Deleted child: ${deletedChild.firstName} ${deletedChild.lastName}`);

      return Response.json({ message: 'Child deleted successfully' });
    })(request);
  } catch (error) {
    logAuthEvent('PERMISSION_ERROR', undefined, error.message);
    if (error instanceof Response) {
      return error;
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}