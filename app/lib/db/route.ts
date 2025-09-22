import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { UserRole } from './schema';

// Route entity for managing route-based permissions
export const routes = pgTable('routes', {
  id: serial('id').primaryKey(),
  routePattern: varchar('route_pattern', { length: 255 }).notNull().unique(), // e.g., '/admin/*', '/teacher/*'
  requiredRoles: text('required_roles').notNull(), // JSON array of roles
  description: text('description'),
});

// Type exports
export type Route = typeof routes.$inferSelect;
export type NewRoute = typeof routes.$inferInsert;

// Route configuration for role-based access control
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/admin': [UserRole.ADMIN],
  '/admin/*': [UserRole.ADMIN],
  '/teacher': [UserRole.TEACHER, UserRole.ADMIN],
  '/teacher/*': [UserRole.TEACHER, UserRole.ADMIN],
  '/parent': [UserRole.PARENT, UserRole.ADMIN],
  '/parent/*': [UserRole.PARENT, UserRole.ADMIN],
  '/dashboard': [UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT],
  '/dashboard/*': [UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT],
} as const;

// Function to check if a user role has access to a specific route
export function hasRouteAccess(route: string, userRole: UserRole): boolean {
  // Check exact route first
  if (ROUTE_PERMISSIONS[route]?.includes(userRole)) {
    return true;
  }

  // Check wildcard patterns
  for (const [pattern, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pattern.endsWith('/*')) {
      const basePattern = pattern.slice(0, -2); // Remove /*
      if (route.startsWith(basePattern) && allowedRoles.includes(userRole)) {
        return true;
      }
    }
  }

  return false;
}

// Function to get the appropriate redirect path based on user role
export function getRoleBasedHomePath(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin';
    case UserRole.TEACHER:
      return '/teacher';
    case UserRole.PARENT:
      return '/parent';
    default:
      return '/dashboard';
  }
}

// Function to determine if a route is protected (requires authentication)
export function isProtectedRoute(pathname: string): boolean {
  const protectedPatterns = ['/admin', '/teacher', '/parent', '/dashboard'];

  return protectedPatterns.some((pattern) => pathname.startsWith(pattern));
}
