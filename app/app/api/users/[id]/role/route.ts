import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { logAuthEvent, withRole } from '@/lib/auth/middleware';
import { db } from '@/lib/db/drizzle';
import { UserRole, users } from '@/lib/db/schema';

const updateRoleSchema = z.object({
  role: z.enum([UserRole.PARENT, UserRole.TEACHER]),
});

// PUT /api/users/[id]/role - Update user role (owner/admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    return await withRole(
      [UserRole.OWNER, UserRole.ADMIN],
      async (req, user) => {
        const userId = parseInt(params.id);

        if (isNaN(userId)) {
          return Response.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const body = await request.json();
        const validatedData = updateRoleSchema.parse(body);

        // Check if target user exists and is currently a parent
        const [targetUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (!targetUser) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        // Only allow promoting parent to teacher, or demoting teacher to parent
        if (
          targetUser.role !== UserRole.PARENT &&
          targetUser.role !== UserRole.TEACHER
        ) {
          return Response.json(
            { error: 'Can only modify parent and teacher roles' },
            { status: 400 }
          );
        }

        // Prevent self-role modification for safety
        if (targetUser.id === user.id) {
          return Response.json(
            { error: 'Cannot modify your own role' },
            { status: 403 }
          );
        }

        // Update the user's role
        const [updatedUser] = await db
          .update(users)
          .set({
            role: validatedData.role,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
          .returning();

        // Log the role change for audit trail
        logAuthEvent(
          'PERMISSION_ERROR', // Reusing for role changes
          user.id,
          `Role updated: ${targetUser.role} → ${validatedData.role} for user ${userId}`
        );

        return Response.json({
          success: true,
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
            updatedAt: updatedUser.updatedAt,
          },
        });
      }
    );
  } catch (error) {
    console.error('Role update error:', error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
