import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { observations, children, users } from '@/lib/db/schema';
import { withRole, logAuthEvent, UserRole } from '@/lib/auth/middleware';
import { eq, and } from 'drizzle-orm';

// Schema for updating an observation
const updateObservationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  montessoriArea: z.string().min(1).max(100).optional(),
  activityType: z.string().max(100).optional(),
  workCycle: z.enum(['Morning', 'Afternoon']).optional(),
  skillsDemonstrated: z.array(z.object({
    skill: z.string().min(1),
    level: z.enum(['Introduced', 'Practicing', 'Mastered']),
    notes: z.string().optional(),
  })).optional(),
  developmentalMilestones: z.array(z.object({
    milestone: z.string().min(1),
    age: z.number().min(0),
    achieved: z.boolean(),
    notes: z.string().optional(),
  })).optional(),
  socialInteraction: z.enum(['Individual', 'Small Group', 'Large Group', 'Peer to Peer']).optional(),
  childInterest: z.enum(['High', 'Medium', 'Low']).optional(),
  concentrationLevel: z.enum(['Deep', 'Moderate', 'Brief']).optional(),
  independenceLevel: z.enum(['Independent', 'Guided', 'Assisted']).optional(),
  nextSteps: z.string().optional(),
  materialsUsed: z.array(z.string()).optional(),
  hasPhoto: z.boolean().optional(),
  hasVideo: z.boolean().optional(),
  mediaUrls: z.array(z.string()).optional(),
  isVisibleToParents: z.boolean().optional(),
  isConfidential: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

async function getObservationWithAccess(observationId: number, userId: number, userRole: string) {
  let whereClause = and(
    eq(observations.id, observationId),
    eq(observations.deletedAt, null)
  );

  // Role-based access control
  if (userRole === UserRole.PARENT) {
    // Parents can only see non-confidential observations visible to parents of their children
    whereClause = and(
      whereClause,
      eq(observations.isVisibleToParents, true),
      eq(observations.isConfidential, false)
    );
  } else if (userRole === UserRole.TEACHER) {
    // Teachers can see observations they created
    whereClause = and(whereClause, eq(observations.teacherId, userId));
  }
  // Admins can see all observations

  const [observation] = await db
    .select({
      id: observations.id,
      title: observations.title,
      description: observations.description,
      montessoriArea: observations.montessoriArea,
      activityType: observations.activityType,
      workCycle: observations.workCycle,
      skillsDemonstrated: observations.skillsDemonstrated,
      developmentalMilestones: observations.developmentalMilestones,
      socialInteraction: observations.socialInteraction,
      childInterest: observations.childInterest,
      concentrationLevel: observations.concentrationLevel,
      independenceLevel: observations.independenceLevel,
      nextSteps: observations.nextSteps,
      materialsUsed: observations.materialsUsed,
      hasPhoto: observations.hasPhoto,
      hasVideo: observations.hasVideo,
      mediaUrls: observations.mediaUrls,
      isVisibleToParents: observations.isVisibleToParents,
      isConfidential: observations.isConfidential,
      observationDate: observations.observationDate,
      tags: observations.tags,
      createdAt: observations.createdAt,
      updatedAt: observations.updatedAt,
      child: {
        id: children.id,
        firstName: children.firstName,
        lastName: children.lastName,
      },
      teacher: {
        id: users.id,
        name: users.name,
      },
    })
    .from(observations)
    .leftJoin(children, eq(observations.childId, children.id))
    .leftJoin(users, eq(observations.teacherId, users.id))
    .where(whereClause);

  // Additional check for parents - verify they own the child
  if (userRole === UserRole.PARENT && observation) {
    const [childOwnership] = await db
      .select({ id: children.id })
      .from(children)
      .where(and(
        eq(children.id, observation.child.id),
        eq(children.parentId, userId)
      ));

    if (!childOwnership) {
      return null; // Parent doesn't own this child
    }
  }

  return observation;
}

// GET /api/observations/[id] - Get specific observation
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    return await withRole([UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN], async (req, user) => {
      const observationId = parseInt(params.id);

      if (isNaN(observationId)) {
        return Response.json({ error: 'Invalid observation ID' }, { status: 400 });
      }

      const observation = await getObservationWithAccess(observationId, user.id, user.role);

      if (!observation) {
        logAuthEvent('ACCESS_DENIED', user.id, `Attempted to access observation ${observationId}`);
        return Response.json({ error: 'Observation not found or access denied' }, { status: 404 });
      }

      logAuthEvent('LOGIN_SUCCESS', user.id, `Retrieved observation: ${observation.title}`);

      return Response.json({ observation });
    })(request);
  } catch (error) {
    logAuthEvent('ACCESS_DENIED', undefined, error.message);
    if (error instanceof Response) {
      return error;
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/observations/[id] - Update observation (Teacher/Admin only, must be owner or admin)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    return await withRole([UserRole.TEACHER, UserRole.ADMIN], async (req, user) => {
      const observationId = parseInt(params.id);

      if (isNaN(observationId)) {
        return Response.json({ error: 'Invalid observation ID' }, { status: 400 });
      }

      const body = await req.json();
      const validatedData = updateObservationSchema.parse(body);

      // Check if observation exists and user has access to edit
      let whereClause = and(
        eq(observations.id, observationId),
        eq(observations.deletedAt, null)
      );

      // Teachers can only edit their own observations
      if (user.role === UserRole.TEACHER) {
        whereClause = and(whereClause, eq(observations.teacherId, user.id));
      }
      // Admins can edit any observation

      const [existingObservation] = await db
        .select()
        .from(observations)
        .where(whereClause);

      if (!existingObservation) {
        logAuthEvent('ACCESS_DENIED', user.id, `Attempted to update observation ${observationId}`);
        return Response.json({ error: 'Observation not found or access denied' }, { status: 404 });
      }

      // Prepare update data
      const updateData = {
        ...validatedData,
        updatedAt: new Date(),
      };

      // Handle JSON fields
      if (validatedData.skillsDemonstrated) {
        updateData.skillsDemonstrated = JSON.stringify(validatedData.skillsDemonstrated);
      }
      if (validatedData.developmentalMilestones) {
        updateData.developmentalMilestones = JSON.stringify(validatedData.developmentalMilestones);
      }
      if (validatedData.materialsUsed) {
        updateData.materialsUsed = JSON.stringify(validatedData.materialsUsed);
      }
      if (validatedData.mediaUrls) {
        updateData.mediaUrls = JSON.stringify(validatedData.mediaUrls);
      }
      if (validatedData.tags) {
        updateData.tags = JSON.stringify(validatedData.tags);
      }

      const [updatedObservation] = await db
        .update(observations)
        .set(updateData)
        .where(eq(observations.id, observationId))
        .returning();

      logAuthEvent('LOGIN_SUCCESS', user.id, `Updated observation: ${updatedObservation.title}`);

      return Response.json({ observation: updatedObservation });
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

// DELETE /api/observations/[id] - Soft delete observation (Admin only, or teacher who created it)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    return await withRole([UserRole.TEACHER, UserRole.ADMIN], async (req, user) => {
      const observationId = parseInt(params.id);

      if (isNaN(observationId)) {
        return Response.json({ error: 'Invalid observation ID' }, { status: 400 });
      }

      // Check if observation exists and user has access to delete
      let whereClause = and(
        eq(observations.id, observationId),
        eq(observations.deletedAt, null)
      );

      // Teachers can only delete their own observations
      if (user.role === UserRole.TEACHER) {
        whereClause = and(whereClause, eq(observations.teacherId, user.id));
      }
      // Admins can delete any observation

      const [deletedObservation] = await db
        .update(observations)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(whereClause)
        .returning();

      if (!deletedObservation) {
        logAuthEvent('ACCESS_DENIED', user.id, `Attempted to delete observation ${observationId}`);
        return Response.json({ error: 'Observation not found or access denied' }, { status: 404 });
      }

      logAuthEvent('LOGIN_SUCCESS', user.id, `Deleted observation: ${deletedObservation.title}`);

      return Response.json({ message: 'Observation deleted successfully' });
    })(request);
  } catch (error) {
    logAuthEvent('PERMISSION_ERROR', undefined, error.message);
    if (error instanceof Response) {
      return error;
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}