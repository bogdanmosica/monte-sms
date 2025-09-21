import { UserRole } from '@/lib/db/schema';

/**
 * Gets the appropriate redirect path based on user role
 */
export function getRoleBasedRedirectPath(role: string): string {
  switch (role) {
    case UserRole.PARENT:
      return '/parent';
    case UserRole.TEACHER:
      return '/teacher';
    case UserRole.ADMIN:
    case UserRole.OWNER:
      return '/admin';
    case UserRole.MEMBER:
      // Fallback for generic members
      return '/dashboard';
    default:
      // Fallback for unknown roles
      return '/dashboard';
  }
}
