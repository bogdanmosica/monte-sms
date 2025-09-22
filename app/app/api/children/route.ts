import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { logAuthEvent, UserRole, withRole } from '@/lib/auth/middleware';
import { db } from '@/lib/db/drizzle';
import { children, schools, users } from '@/lib/db/schema';

// Schema for creating a new child
const createChildSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  nickname: z.string().max(50).optional(),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  gender: z.string().max(20).optional(),
  allergies: z.string().optional(),
  medicalNotes: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().email().optional(),
    canPickup: z.boolean(),
    notes: z.string().optional(),
  }),
  schoolId: z.number().min(1, 'School ID is required'),
  parentId: z.number().min(1, 'Parent ID is required'),
  montessoriLevel: z.string().max(50).default('Primary'),
  currentClassroom: z.string().max(100).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  canReceivePhotos: z.boolean().default(true),
  canParticipateInActivities: z.boolean().default(true),
  notes: z.string().optional(),
});

// GET /api/children - List children (role-based access)
export async function GET(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN],
      async (req, user) => {
        const { searchParams } = new URL(req.url);
        const schoolId = searchParams.get('schoolId');
        const parentId = searchParams.get('parentId');

        let whereClause = eq(children.deletedAt, null);

        // Role-based filtering
        if (user.role === UserRole.PARENT) {
          // Parents can only see their own children
          whereClause = and(whereClause, eq(children.parentId, user.id));
        } else if (user.role === UserRole.TEACHER) {
          // Teachers can see children in their school
          if (schoolId) {
            whereClause = and(
              whereClause,
              eq(children.schoolId, parseInt(schoolId))
            );
          }
        } else if (user.role === UserRole.ADMIN) {
          // Admins can filter by school or parent
          if (schoolId) {
            whereClause = and(
              whereClause,
              eq(children.schoolId, parseInt(schoolId))
            );
          }
          if (parentId) {
            whereClause = and(
              whereClause,
              eq(children.parentId, parseInt(parentId))
            );
          }
        }

        const childrenList = await db
          .select({
            id: children.id,
            firstName: children.firstName,
            lastName: children.lastName,
            nickname: children.nickname,
            birthdate: children.birthdate,
            gender: children.gender,
            montessoriLevel: children.montessoriLevel,
            currentClassroom: children.currentClassroom,
            startDate: children.startDate,
            isActive: children.isActive,
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

        logAuthEvent(
          'LOGIN_SUCCESS',
          user.id,
          `Retrieved ${childrenList.length} children`
        );

        return Response.json({ children: childrenList });
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

// POST /api/children - Create new child (Admin/Teacher only)
export async function POST(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.TEACHER, UserRole.ADMIN],
      async (req, user) => {
        const body = await req.json();
        const validatedData = createChildSchema.parse(body);

        // Verify the school exists and user has access
        const school = await db
          .select()
          .from(schools)
          .where(eq(schools.id, validatedData.schoolId))
          .limit(1);

        if (!school.length) {
          return Response.json({ error: 'School not found' }, { status: 404 });
        }

        // Verify the parent exists and has Parent role
        const parent = await db
          .select()
          .from(users)
          .where(
            and(
              eq(users.id, validatedData.parentId),
              eq(users.role, UserRole.PARENT)
            )
          )
          .limit(1);

        if (!parent.length) {
          return Response.json(
            { error: 'Parent not found or invalid role' },
            { status: 404 }
          );
        }

        const [newChild] = await db
          .insert(children)
          .values({
            ...validatedData,
            emergencyContact: JSON.stringify(validatedData.emergencyContact),
          })
          .returning();

        logAuthEvent(
          'LOGIN_SUCCESS',
          user.id,
          `Created child: ${newChild.firstName} ${newChild.lastName}`
        );

        return Response.json({ child: newChild }, { status: 201 });
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
