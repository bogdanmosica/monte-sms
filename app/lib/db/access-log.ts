import { desc, eq } from 'drizzle-orm';
import { db } from './drizzle';
import { accessLogs, users } from './schema';

// Type exports
export type AccessLog = typeof accessLogs.$inferSelect;
export type NewAccessLog = typeof accessLogs.$inferInsert;

// Event types enum
export enum AccessEventType {
  LOGIN = 'login',
  ACCESS_GRANTED = 'access_granted',
  ACCESS_DENIED = 'access_denied',
  LOGOUT = 'logout',
  SESSION_INVALIDATED = 'session_invalidated',
}

// Service function to log access events
export async function logAccessEvent({
  userId,
  routeId,
  eventType,
  ipAddress,
  userAgent,
  metadata,
}: {
  userId: string;
  routeId: string;
  eventType: AccessEventType | string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}) {
  try {
    // Skip logging for anonymous users or invalid user IDs
    if (userId === 'anonymous' || userId === 'unknown' || !userId) {
      console.log(`Access event: ${eventType} for ${routeId} - anonymous user`);
      return;
    }

    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      console.log(
        `Access event: ${eventType} for ${routeId} - invalid user ID: ${userId}`
      );
      return;
    }

    await db.insert(accessLogs).values({
      userId: parsedUserId,
      routeId,
      eventType,
      ipAddress,
      userAgent,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (error) {
    console.error('Failed to log access event:', error);
    // Don't throw error to avoid breaking the main flow
  }
}

// Service function to get access logs for a user
export async function getUserAccessLogs(userId: string, limit: number = 50) {
  return await db
    .select()
    .from(accessLogs)
    .where(eq(accessLogs.userId, parseInt(userId)))
    .orderBy(desc(accessLogs.timestamp))
    .limit(limit);
}

// Service function to get recent access logs for security monitoring
export async function getRecentAccessLogs(limit: number = 100) {
  return await db
    .select({
      id: accessLogs.id,
      userId: accessLogs.userId,
      routeId: accessLogs.routeId,
      eventType: accessLogs.eventType,
      timestamp: accessLogs.timestamp,
      ipAddress: accessLogs.ipAddress,
      userName: users.name,
      userEmail: users.email,
    })
    .from(accessLogs)
    .leftJoin(users, eq(accessLogs.userId, users.id))
    .orderBy(desc(accessLogs.timestamp))
    .limit(limit);
}
