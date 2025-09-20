'use client';

import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect } from 'react';
import { UnauthorizedError } from '@/components/ui/error-states';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  currentUserRole?: string;
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  currentUserRole,
  redirectTo = '/unauthorized',
}: RoleGuardProps) {
  const router = useRouter();

  useEffect(() => {
    if (currentUserRole && !allowedRoles.includes(currentUserRole)) {
      router.push(redirectTo);
    }
  }, [currentUserRole, allowedRoles, redirectTo, router]);

  // If no current user role is provided, assume we're in demo mode and allow access
  if (!currentUserRole) {
    return <>{children}</>;
  }

  // If user role is not allowed, show unauthorized error
  if (!allowedRoles.includes(currentUserRole)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <UnauthorizedError onLogin={() => router.push('/')} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for role-based access control
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: string[],
  options?: {
    redirectTo?: string;
    getCurrentUserRole?: () => string | undefined;
  }
) {
  return function GuardedComponent(props: P) {
    const currentUserRole = options?.getCurrentUserRole?.();

    return (
      <RoleGuard
        allowedRoles={allowedRoles}
        currentUserRole={currentUserRole}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </RoleGuard>
    );
  };
}
