'use client';

import {
  Award,
  BookOpen,
  Calendar,
  ClipboardList,
  MessageCircle,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UserRole } from '@/lib/db/schema';
import {
  mockActivities,
  mockChildren,
  mockObservations,
  mockUsers,
} from '@/lib/mock-data';

export default function TeacherDashboard() {
  const currentTeacher = mockUsers.find(
    (user) => user.role === UserRole.TEACHER
  );
  const classroomChildren = mockChildren.filter(
    (child) => child.classroom === 'Primary A'
  );
  const totalActivities = mockActivities.length;
  const completedActivities = mockActivities.filter(
    (activity) => activity.completed
  ).length;
  const recentObservations = mockObservations.slice(0, 3);

  const activityStats = {
    practical_life: mockActivities.filter(
      (a) => a.category === 'practical_life'
    ).length,
    sensorial: mockActivities.filter((a) => a.category === 'sensorial').length,
    mathematics: mockActivities.filter((a) => a.category === 'mathematics')
      .length,
    language: mockActivities.filter((a) => a.category === 'language').length,
    cultural: mockActivities.filter((a) => a.category === 'cultural').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {currentTeacher?.name}
              </h1>
              <p className="text-muted-foreground">
                Primary A Classroom • Sunshine Montessori Academy
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Observation
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Activity
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {classroomChildren.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active in Primary A
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Activities This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {totalActivities}
                </div>
                <p className="text-xs text-muted-foreground">
                  {completedActivities} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Observations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {mockObservations.length}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {Math.round((completedActivities / totalActivities) * 100)}%
                </div>
                <Progress
                  value={(completedActivities / totalActivities) * 100}
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Classroom Overview */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Students Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  My Students
                </CardTitle>
                <CardDescription>Primary A Classroom Students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {classroomChildren.map((child) => {
                    const childActivities = mockActivities.filter(
                      (a) => a.child_id === child.id
                    );
                    const completedCount = childActivities.filter(
                      (a) => a.completed
                    ).length;
                    const progressPercent =
                      childActivities.length > 0
                        ? (completedCount / childActivities.length) * 100
                        : 0;

                    return (
                      <div
                        key={child.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border"
                      >
                        <Avatar className="h-10 w-10 bg-primary/20">
                          <AvatarFallback className="text-primary font-medium">
                            {child.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{child.name}</h4>
                            <span className="text-xs text-muted-foreground">
                              Age {child.age}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress
                              value={progressPercent}
                              className="h-1 flex-1"
                            />
                            <span className="text-xs text-muted-foreground">
                              {completedCount}/{childActivities.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 bg-transparent"
                >
                  View All Students
                </Button>
              </CardContent>
            </Card>

            {/* Activity Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  Activity Overview
                </CardTitle>
                <CardDescription>Activities by Montessori area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(activityStats).map(([category, count]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              category === 'practical_life'
                                ? 'var(--primary)'
                                : category === 'sensorial'
                                  ? 'var(--accent)'
                                  : category === 'mathematics'
                                    ? 'var(--secondary)'
                                    : 'var(--muted)',
                          }}
                        />
                        <span className="text-sm capitalize">
                          {category.replace('_', ' ')}
                        </span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 bg-transparent"
                >
                  Manage Activities
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Observations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-secondary-foreground" />
                Recent Observations
              </CardTitle>
              <CardDescription>
                Latest student observations and notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentObservations.map((observation) => {
                  const child = mockChildren.find(
                    (c) => c.id === observation.child_id
                  );
                  return (
                    <div
                      key={observation.id}
                      className="p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 bg-accent/20">
                            <AvatarFallback className="text-accent text-sm">
                              {child?.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-sm">
                              {child?.name}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(observation.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="capitalize"
                          style={{
                            backgroundColor:
                              observation.category === 'academic'
                                ? 'var(--primary)'
                                : observation.category === 'social'
                                  ? 'var(--accent)'
                                  : 'var(--secondary)',
                            color: 'var(--foreground)',
                            opacity: 0.8,
                          }}
                        >
                          {observation.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {observation.content}
                      </p>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Observations
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common classroom management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                >
                  <Plus className="w-6 h-6 text-primary" />
                  <span>Add Activity</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                >
                  <MessageCircle className="w-6 h-6 text-accent" />
                  <span>New Observation</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                >
                  <Users className="w-6 h-6 text-secondary-foreground" />
                  <span>Message Parents</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                >
                  <Award className="w-6 h-6 text-primary" />
                  <span>Update Progress</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
