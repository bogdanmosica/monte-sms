import { eq, or, and, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, UserRole } from '@/lib/db/schema';
import { withRole, logAuthEvent } from '@/lib/auth/middleware';

// GET /api/users - List users (owner/admin only)
export async function GET(request: Request) {
  try {
    return await withRole([UserRole.OWNER, UserRole.ADMIN], async (req, user) => {
      const url = new URL(request.url);
      const role = url.searchParams.get('role');

      let query = db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(isNull(users.deletedAt)); // Only show non-deleted users

      // Filter by role if specified
      if (role && Object.values(UserRole).includes(role as UserRole)) {
        query = query.where(and(
          isNull(users.deletedAt),
          eq(users.role, role as UserRole)
        ));
      }

      const allUsers = await query.orderBy(users.createdAt);

      // Log access for audit trail
      logAuthEvent(
        'LOGIN_SUCCESS', // Reusing for data access
        user.id,
        `Accessed users list${role ? ` filtered by role: ${role}` : ''}`
      );

      return Response.json({
        users: allUsers,
        total: allUsers.length,
      });
    });
  } catch (error) {
    console.error('Users listing error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}