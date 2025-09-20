'use client';

import {
  BookOpen,
  Calendar,
  Filter,
  MessageCircle,
  Search,
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
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getActivitiesByChild,
  mockChildren,
  mockObservations,
} from '@/lib/mock-data';

export default function TeacherStudents() {
  const classroomChildren = mockChildren.filter(
    (child) => child.classroom === 'Primary A'
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                My Students
              </h1>
              <p className="text-muted-foreground">
                Primary A Classroom • {classroomChildren.length} students
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message All Parents
            </Button>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search students by name..."
                    className="w-full"
                  />
                </div>
                <Button variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Students Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {classroomChildren.map((child) => {
              const childActivities = getActivitiesByChild(child.id);
              const completedActivities = childActivities.filter(
                (a) => a.completed
              ).length;
              const progressPercent =
                childActivities.length > 0
                  ? (completedActivities / childActivities.length) * 100
                  : 0;
              const recentObservations = mockObservations
                .filter((obs) => obs.child_id === child.id)
                .slice(0, 2);

              return (
                <Card key={child.id} className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 bg-primary/20">
                        <AvatarFallback className="text-primary font-semibold text-lg">
                          {child.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{child.name}</CardTitle>
                        <CardDescription>
                          Age {child.age} • Born{' '}
                          {new Date(child.birthdate).toLocaleDateString()}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress
                            value={progressPercent}
                            className="h-2 flex-1"
                          />
                          <span className="text-xs text-muted-foreground">
                            {completedActivities}/{childActivities.length}{' '}
                            activities
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="activities" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="activities">
                          Recent Activities
                        </TabsTrigger>
                        <TabsTrigger value="observations">
                          Observations
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="activities" className="space-y-3">
                        {childActivities.slice(0, 3).map((activity) => (
                          <div
                            key={activity.id}
                            className="p-3 rounded-lg border border-border"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h4 className="font-medium text-sm">
                                  {activity.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {activity.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                    style={{
                                      backgroundColor:
                                        activity.category === 'practical_life'
                                          ? 'var(--primary)'
                                          : activity.category === 'sensorial'
                                            ? 'var(--accent)'
                                            : 'var(--secondary)',
                                      color: 'var(--foreground)',
                                      opacity: 0.8,
                                    }}
                                  >
                                    {activity.category.replace('_', ' ')}
                                  </Badge>
                                  <Badge
                                    variant={
                                      activity.completed
                                        ? 'default'
                                        : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {activity.completed
                                      ? 'Completed'
                                      : 'In Progress'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {childActivities.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">
                              No activities recorded yet
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="observations" className="space-y-3">
                        {recentObservations.map((observation) => (
                          <div
                            key={observation.id}
                            className="p-3 rounded-lg border border-border"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
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
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  observation.date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {observation.content}
                            </p>
                          </div>
                        ))}
                        {recentObservations.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">
                              No observations recorded yet
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                      >
                        View Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                      >
                        Add Activity
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                      >
                        Message Parent
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {classroomChildren.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No students found
                  </h3>
                  <p className="text-muted-foreground">
                    Students assigned to your classroom will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
