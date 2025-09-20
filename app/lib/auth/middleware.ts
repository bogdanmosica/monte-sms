import { redirect } from 'next/navigation';
import type { z } from 'zod';
import { getTeamForUser, getUser } from '@/lib/db/queries';
import type { TeamDataWithMembers, User } from '@/lib/db/schema';
import { UserRole } from '@/lib/db/schema';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const user = await getUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData, user);
  };
}

type ActionWithTeamFunction<T> = (
  formData: FormData,
  team: TeamDataWithMembers
) => Promise<T>;

export function withTeam<T>(action: ActionWithTeamFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) {
      redirect('/sign-in');
    }

    const team = await getTeamForUser();
    if (!team) {
      throw new Error('Team not found');
    }

    return action(formData, team);
  };
}

// RBAC helper functions for Montessori roles
export function requireRole(allowedRoles: UserRole[]) {
  return async (request: Request): Promise<User> => {
    const user = await getUser();
    if (!user) {
      throw new Response('Unauthorized', { status: 401 });
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      throw new Response('Forbidden: Insufficient permissions', { status: 403 });
    }

    return user;
  };
}

export function requireParent() {
  return requireRole([UserRole.PARENT]);
}

export function requireTeacher() {
  return requireRole([UserRole.TEACHER, UserRole.ADMIN, UserRole.OWNER]);
}

export function requireAdmin() {
  return requireRole([UserRole.ADMIN, UserRole.OWNER]);
}

export function requireOwner() {
  return requireRole([UserRole.OWNER]);
}

export function requireTeacherOrAdmin() {
  return requireRole([UserRole.TEACHER, UserRole.ADMIN, UserRole.OWNER]);
}

export function requireAdminOrOwner() {
  return requireRole([UserRole.ADMIN, UserRole.OWNER]);
}

// API route wrapper with role checking
export function withRole<T>(
  allowedRoles: UserRole[],
  handler: (request: Request, user: User) => Promise<T>
) {
  return async (request: Request): Promise<T> => {
    const user = await requireRole(allowedRoles)(request);
    return handler(request, user);
  };
}

// Error logging for authentication events
export function logAuthEvent(
  event: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'ACCESS_DENIED' | 'PERMISSION_ERROR',
  userId?: number,
  details?: string
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    userId,
    details,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
  };

  // In production, this would go to a proper logging service
  console.log('[AUTH]', JSON.stringify(logEntry));

  // TODO: Store in activity_logs table for audit trail
}
