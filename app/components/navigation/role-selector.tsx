'use client';
import { GraduationCap, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface RoleSelectorProps {
  onRoleSelect: (role: 'parent' | 'teacher' | 'admin') => void;
}

export function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Montessori School Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose your role to access your personalized dashboard
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50"
            onClick={() => onRoleSelect('parent')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Parent Portal</CardTitle>
              <CardDescription>
                View your child's progress, communicate with teachers, and stay
                updated on school activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline">
                Access Parent Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-accent/50"
            onClick={() => onRoleSelect('teacher')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-xl">Teacher Portal</CardTitle>
              <CardDescription>
                Manage your classroom, track student activities, and communicate
                with parents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline">
                Access Teacher Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-secondary/50"
            onClick={() => onRoleSelect('admin')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl">Admin Portal</CardTitle>
              <CardDescription>
                Manage school operations, staff, enrollment, and billing systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline">
                Access Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
