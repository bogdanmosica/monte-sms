'use client';

import useSWR from 'swr';
import { UserManagement } from '@/components/admin/user-management';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getUser } from '@/lib/db/queries';
import { UserRole } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminUsersPage() {
  const { data: user, error } = useSWR('/api/user', fetcher);

  if (error) {
    return (
      <div className="flex min-h-screen">
        <div className="flex flex-col gap-4 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Unable to verify your permissions. Please try logging in again.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen">
        <div className="flex flex-col gap-4 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user has permission to access this page
  const canAccessUserManagement =
    user.role === UserRole.OWNER || user.role === UserRole.ADMIN;

  if (!canAccessUserManagement) {
    return (
      <div className="flex min-h-screen">
        <div className="flex flex-col gap-4 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You do not have permission to access user management.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                User Role Management
              </h2>
              <p className="text-muted-foreground">
                Manage user roles and permissions across the platform
              </p>
            </div>
          </div>
          <Separator />

          <div className="space-y-6">
            {/* Role Hierarchy Information */}
            <Card>
              <CardHeader>
                <CardTitle>Role Hierarchy</CardTitle>
                <CardDescription>
                  Understanding the role system and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <div className="font-semibold text-sm">Owner</div>
                    <div className="text-sm text-muted-foreground">
                      Full system access, can manage all users and settings
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold text-sm">Admin</div>
                    <div className="text-sm text-muted-foreground">
                      Can manage users, promote parents to teachers
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold text-sm">Teacher</div>
                    <div className="text-sm text-muted-foreground">
                      Can manage students, observations, and curriculum
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold text-sm">Parent</div>
                    <div className="text-sm text-muted-foreground">
                      Can view their child's progress and communicate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Management Component */}
            <UserManagement currentUserRole={user.role} />
          </div>
        </div>
      </main>
    </div>
  );
}
