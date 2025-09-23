import { NextRequest } from 'next/server';
import { eq, and, sql, desc, ilike, or, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users, children, schools, UserRole } from '@/lib/db/schema';
import { withRole, logAuthEvent } from '@/lib/auth/middleware';

// GET /api/students - List current students with enrollment info
export async function GET(request: NextRequest) {
  try {
    return await withRole(
      [UserRole.ADMIN, UserRole.TEACHER],
      async (req, user) => {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const classroom = searchParams.get('classroom') || '';
        const active = searchParams.get('active') !== 'false'; // default to true
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

        // Build where clause
        let whereConditions = [
          isNull(children.deletedAt), // Only non-deleted children
        ];

        if (active) {
          whereConditions.push(eq(children.isActive, true));
        }

        if (classroom) {
          whereConditions.push(eq(children.currentClassroom, classroom));
        }

        if (search) {
          whereConditions.push(
            or(
              ilike(children.firstName, `%${search}%`),
              ilike(children.lastName, `%${search}%`),
              ilike(children.nickname, `%${search}%`),
              ilike(users.name, `%${search}%`),
              ilike(users.email, `%${search}%`)
            )
          );
        }

        const whereClause = and(...whereConditions);

        // Get students (children) with their parent info
        const students = await db
          .select({
            id: children.id,
            firstName: children.firstName,
            lastName: children.lastName,
            nickname: children.nickname,
            name: sql<string>`COALESCE(${children.nickname}, ${children.firstName}) || ' ' || ${children.lastName}`,
            birthdate: children.birthdate,
            age: sql<number>`EXTRACT(YEAR FROM AGE(${children.birthdate}))`,
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
          .from(children)
          .leftJoin(users, eq(children.parentId, users.id))
          .leftJoin(schools, eq(children.schoolId, schools.id))
          .where(whereClause)
          .orderBy(desc(children.createdAt))
          .limit(limit)
          .offset(offset);

        // Get total count
        const totalResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(children)
          .leftJoin(users, eq(children.parentId, users.id))
          .where(whereClause);

        const total = totalResult[0]?.count || 0;

        // Calculate student statistics
        const stats = await Promise.all([
          // Total active students
          db.select({ count: sql<number>`count(*)` })
            .from(children)
            .where(and(
              eq(children.isActive, true),
              isNull(children.deletedAt)
            )),

          // Total inactive students
          db.select({ count: sql<number>`count(*)` })
            .from(children)
            .where(and(
              eq(children.isActive, false),
              isNull(children.deletedAt)
            )),

          // Students by Montessori level
          db.select({
            level: children.montessoriLevel,
            count: sql<number>`count(*)`,
          })
            .from(children)
            .where(and(
              eq(children.isActive, true),
              isNull(children.deletedAt),
              sql`${children.montessoriLevel} IS NOT NULL`
            ))
            .groupBy(children.montessoriLevel),

          // Students by classroom
          db.select({
            classroom: children.currentClassroom,
            count: sql<number>`count(*)`,
          })
            .from(children)
            .where(and(
              eq(children.isActive, true),
              isNull(children.deletedAt),
              sql`${children.currentClassroom} IS NOT NULL`
            ))
            .groupBy(children.currentClassroom),

          // New students this month (using createdAt since we don't have enrollment dates yet)
          db.select({ count: sql<number>`count(*)` })
            .from(children)
            .where(and(
              eq(children.isActive, true),
              isNull(children.deletedAt),
              sql`${children.createdAt} >= DATE_TRUNC('month', CURRENT_DATE)`
            )),
        ]);

        const studentStats = {
          totalActive: stats[0][0]?.count || 0,
          totalInactive: stats[1][0]?.count || 0,
          byLevel: stats[2] || [],
          byClassroom: stats[3] || [],
          newThisMonth: stats[4][0]?.count || 0,
        };

        logAuthEvent(
          'ACCESS_GRANTED',
          user.id,
          `Retrieved ${students.length} students (active: ${active})`
        );

        return Response.json({
          students,
          total,
          limit,
          offset,
          stats: studentStats,
        });
      }
    )(request);
  } catch (error) {
    console.error('Error fetching students:', error);
    if (error instanceof Response) {
      return error;
    }
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}