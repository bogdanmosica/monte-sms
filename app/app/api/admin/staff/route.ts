import { NextRequest } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users, UserRole } from '@/lib/db/schema';
import { withRole, logAuthEvent } from '@/lib/auth/middleware';
import { hashPassword } from '@/lib/auth/session';

// Schema for creating new staff member
const createStaffSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  role: z.enum(['teacher', 'admin'], {
    required_error: 'Role must be teacher or admin',
  }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Schema for updating staff member
const updateStaffSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['teacher', 'admin']).optional(),
});

// GET /api/admin/staff - List staff members
export async function GET(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

        // Build where clause
        let whereClause = and(
          sql`${users.role} IN ('teacher', 'admin')`,
          sql`${users.deletedAt} IS NULL`
        );

        // Filter by specific role if provided
        if (role && ['teacher', 'admin'].includes(role)) {
          whereClause = and(whereClause, eq(users.role, role as UserRole));
        }

        // Get staff members
        const staffMembers = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          })
          .from(users)
          .where(whereClause)
          .limit(limit)
          .offset(offset);

        // Get total count for pagination
        const totalResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(whereClause);

        const total = totalResult[0]?.count || 0;

        logAuthEvent(
          'ACCESS_GRANTED',
          user.id,
          `Retrieved ${staffMembers.length} staff members`
        );

        return Response.json({
          staff: staffMembers,
          total,
          limit,
          offset,
        });
      }
    )(request);
  } catch (error) {
    console.error('Error fetching staff members:', error);
    if (error instanceof Response) {
      return error;
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/staff - Create new staff member
export async function POST(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN],
      async (req, user) => {
        const body = await req.json();
        const validatedData = createStaffSchema.parse(body);

        // Check if email already exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, validatedData.email))
          .limit(1);

        if (existingUser.length > 0) {
          return Response.json(
            { error: 'Email already exists' },
            { status: 400 }
          );
        }

        // Hash password
        const passwordHash = await hashPassword(validatedData.password);

        // Create new staff member
        const [newStaff] = await db
          .insert(users)
          .values({
            name: validatedData.name,
            email: validatedData.email,
            role: validatedData.role as UserRole,
            passwordHash,
          })
          .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
          });

        logAuthEvent(
          'USER_CREATED',
          user.id,
          `Created staff member: ${newStaff.name} (${newStaff.role})`
        );

        return Response.json({ staff: newStaff }, { status: 201 });
      }
    )(request);
  } catch (error) {
    console.error('Error creating staff member:', error);
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