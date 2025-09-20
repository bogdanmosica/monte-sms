'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { UserRole } from '@/lib/db/schema';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, UserCheck, AlertTriangle } from 'lucide-react';

interface User {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

interface UserManagementProps {
  currentUserRole: UserRole;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function UserManagement({ currentUserRole }: UserManagementProps) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState<number | null>(null);

  const { data, error, mutate } = useSWR<{ users: User[]; total: number }>(
    '/api/users',
    fetcher
  );

  const canManageRoles = currentUserRole === UserRole.OWNER || currentUserRole === UserRole.ADMIN;

  const updateUserRole = async (userId: number, newRole: UserRole) => {
    if (!canManageRoles) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to modify user roles.',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(userId);
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Role Updated',
          description: `User role successfully changed to ${newRole}.`,
        });
        mutate(); // Refresh the data
      } else {
        toast({
          title: 'Update Failed',
          description: result.error || 'Failed to update user role.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error occurred while updating role.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.OWNER:
        return 'default';
      case UserRole.ADMIN:
        return 'secondary';
      case UserRole.TEACHER:
        return 'outline';
      case UserRole.PARENT:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Error Loading Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Failed to load user data. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Users...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage user roles and permissions. Only owners and admins can promote parents to teachers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Total Users: {data.total}
            </p>
            {!canManageRoles && (
              <Badge variant="outline" className="text-amber-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                View Only
              </Badge>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Role</TableHead>
                  {canManageRoles && <TableHead>Change Role</TableHead>}
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name || 'Unnamed User'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    {canManageRoles && (
                      <TableCell>
                        {user.role === UserRole.OWNER ? (
                          <span className="text-sm text-muted-foreground">Cannot modify</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Select
                              value={user.role}
                              onValueChange={(newRole: UserRole) => updateUserRole(user.id, newRole)}
                              disabled={updating === user.id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={UserRole.PARENT}>Parent</SelectItem>
                                <SelectItem value={UserRole.TEACHER}>Teacher</SelectItem>
                              </SelectContent>
                            </Select>
                            {updating === user.id && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                          </div>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}