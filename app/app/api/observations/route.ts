import { and, desc, eq, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { logAuthEvent, UserRole, withRole } from '@/lib/auth/middleware';
import { db } from '@/lib/db/drizzle';
import { children, observations, users } from '@/lib/db/schema';

// Schema for creating a new observation
const createObservationSchema = z.object({
  childId: z.number().min(1, 'Child ID is required'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  montessoriArea: z.string().min(1, 'Montessori area is required').max(100),
  activityType: z.string().max(100).optional(),
  workCycle: z.enum(['Morning', 'Afternoon']).optional(),
  skillsDemonstrated: z
    .array(
      z.object({
        skill: z.string().min(1),
        level: z.enum(['Introduced', 'Practicing', 'Mastered']),
        notes: z.string().optional(),
      })
    )
    .optional(),
  developmentalMilestones: z
    .array(
      z.object({
        milestone: z.string().min(1),
        age: z.number().min(0),
        achieved: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .optional(),
  socialInteraction: z
    .enum(['Individual', 'Small Group', 'Large Group', 'Peer to Peer'])
    .optional(),
  childInterest: z.enum(['High', 'Medium', 'Low']).optional(),
  concentrationLevel: z.enum(['Deep', 'Moderate', 'Brief']).optional(),
  independenceLevel: z.enum(['Independent', 'Guided', 'Assisted']).optional(),
  nextSteps: z.string().optional(),
  materialsUsed: z.array(z.string()).optional(),
  hasPhoto: z.boolean().default(false),
  hasVideo: z.boolean().default(false),
  mediaUrls: z.array(z.string()).optional(),
  isVisibleToParents: z.boolean().default(true),
  isConfidential: z.boolean().default(false),
  observationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid datetime format'),
  tags: z.array(z.string()).optional(),
});

// Schema for updating an observation
const updateObservationSchema = createObservationSchema
  .partial()
  .omit({ childId: true });

// GET /api/observations - List observations (role-based access)
export async function GET(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN],
      async (req, user) => {
        const { searchParams } = new URL(req.url);
        const childId = searchParams.get('childId');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        let whereClause = eq(observations.deletedAt, null);

        // Role-based filtering
        if (user.role === UserRole.PARENT) {
          // Parents can only see observations of their own children
          const parentChildren = await db
            .select({ id: children.id })
            .from(children)
            .where(
              and(eq(children.parentId, user.id), eq(children.deletedAt, null))
            );

          const childIds = parentChildren.map((child) => child.id);
          if (childIds.length === 0) {
            return Response.json({ observations: [], total: 0 });
          }

          // Only visible observations
          whereClause = and(
            whereClause,
            eq(observations.isVisibleToParents, true),
            eq(observations.isConfidential, false)
          );
        } else if (user.role === UserRole.TEACHER) {
          // Teachers can see all observations they created
          whereClause = and(whereClause, eq(observations.teacherId, user.id));
        }
        // Admins can see all observations

        // Filter by child if specified
        if (childId) {
          const childIdInt = parseInt(childId);
          if (!isNaN(childIdInt)) {
            whereClause = and(
              whereClause,
              eq(observations.childId, childIdInt)
            );
          }
        }

        const observationsList = await db
          .select({
            id: observations.id,
            title: observations.title,
            description: observations.description,
            montessoriArea: observations.montessoriArea,
            activityType: observations.activityType,
            workCycle: observations.workCycle,
            skillsDemonstrated: observations.skillsDemonstrated,
            socialInteraction: observations.socialInteraction,
            childInterest: observations.childInterest,
            concentrationLevel: observations.concentrationLevel,
            independenceLevel: observations.independenceLevel,
            nextSteps: observations.nextSteps,
            hasPhoto: observations.hasPhoto,
            hasVideo: observations.hasVideo,
            observationDate: observations.observationDate,
            tags: observations.tags,
            createdAt: observations.createdAt,
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
          .where(whereClause)
          .orderBy(desc(observations.observationDate))
          .limit(limit)
          .offset(offset);

        // Get total count for pagination
        const [{ count }] = await db
          .select({ count: sql`count(*)` })
          .from(observations)
          .where(whereClause);

        logAuthEvent(
          'LOGIN_SUCCESS',
          user.id,
          `Retrieved ${observationsList.length} observations`
        );

        return Response.json({
          observations: observationsList,
          total: parseInt(count),
          limit,
          offset,
        });
      }
    )(request);
  } catch (error) {
    logAuthEvent('ACCESS_DENIED', undefined, error.message);
    if (error instanceof Response) {
      return error;
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/observations - Create new observation (Teacher/Admin only)
export async function POST(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.TEACHER, UserRole.ADMIN],
      async (req, user) => {
        const body = await req.json();
        const validatedData = createObservationSchema.parse(body);

        // Verify the child exists and user has access
        let childExists;
        if (user.role === UserRole.TEACHER) {
          // Teachers can only create observations for children in their classes
          // This would require additional logic to check classroom assignments
          childExists = await db
            .select()
            .from(children)
            .where(
              and(
                eq(children.id, validatedData.childId),
                eq(children.deletedAt, null)
              )
            )
            .limit(1);
        } else if (user.role === UserRole.ADMIN) {
          // Admins can create observations for any child
          childExists = await db
            .select()
            .from(children)
            .where(
              and(
                eq(children.id, validatedData.childId),
                eq(children.deletedAt, null)
              )
            )
            .limit(1);
        }

        if (!childExists || childExists.length === 0) {
          return Response.json(
            { error: 'Child not found or access denied' },
            { status: 404 }
          );
        }

        const [newObservation] = await db
          .insert(observations)
          .values({
            ...validatedData,
            teacherId: user.id,
            skillsDemonstrated: validatedData.skillsDemonstrated
              ? JSON.stringify(validatedData.skillsDemonstrated)
              : null,
            developmentalMilestones: validatedData.developmentalMilestones
              ? JSON.stringify(validatedData.developmentalMilestones)
              : null,
            materialsUsed: validatedData.materialsUsed
              ? JSON.stringify(validatedData.materialsUsed)
              : null,
            mediaUrls: validatedData.mediaUrls
              ? JSON.stringify(validatedData.mediaUrls)
              : null,
            tags: validatedData.tags
              ? JSON.stringify(validatedData.tags)
              : null,
            observationDate: new Date(validatedData.observationDate),
          })
          .returning();

        logAuthEvent(
          'LOGIN_SUCCESS',
          user.id,
          `Created observation: ${newObservation.title} for child ${validatedData.childId}`
        );

        return Response.json({ observation: newObservation }, { status: 201 });
      }
    )(request);
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
