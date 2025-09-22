'use client';

import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  MessageCircle,
  TrendingUp,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole } from '@/lib/db/schema';
import {
  getActivitiesByChild,
  getChildrenByParent,
  getObservationsByChild,
  mockUsers,
} from '@/lib/mock-data';

export default function ParentDashboard() {
  // Mock current parent (in real app, this would come from auth)
  const currentParent = mockUsers.find((user) => user.role === UserRole.PARENT);
  const children = getChildrenByParent(currentParent?.id || '1');
  const currentChild = children[0]; // For demo, show first child

  const activities = currentChild ? getActivitiesByChild(currentChild.id) : [];
  const observations = currentChild
    ? getObservationsByChild(currentChild.id)
    : [];

  const completedActivities = activities.filter(
    (activity) => activity.completed
  ).length;
  const totalActivities = activities.length;
  const progressPercentage =
    totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {currentParent?.name}
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your child's learning journey
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Teacher
            </Button>
          </div>

          {/* Child Overview Cards */}
          <div className="grid gap-6">
            {children.map((child) => (
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
                    <div>
                      <CardTitle className="text-xl">{child.name}</CardTitle>
                      <CardDescription>
                        Age {child.age} • {child.classroom} • Sunshine
                        Montessori Academy
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="progress" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="progress">Progress</TabsTrigger>
                      <TabsTrigger value="recent">Recent Work</TabsTrigger>
                      <TabsTrigger value="observations">
                        Observations
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="progress" className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                              Overall Progress
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Activities Completed</span>
                                <span>
                                  {completedActivities}/{totalActivities}
                                </span>
                              </div>
                              <Progress
                                value={progressPercentage}
                                className="h-2"
                              />
                              <p className="text-xs text-muted-foreground">
                                {Math.round(progressPercentage)}% completion
                                rate this month
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                              Learning Areas
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Practical Life</span>
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/20 text-primary"
                                >
                                  Excellent
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Sensorial</span>
                                <Badge
                                  variant="secondary"
                                  className="bg-accent/20 text-accent"
                                >
                                  Good
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Mathematics</span>
                                <Badge
                                  variant="secondary"
                                  className="bg-secondary/20 text-secondary-foreground"
                                >
                                  Developing
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="recent" className="space-y-4">
                      <div className="space-y-3">
                        {activities.slice(0, 3).map((activity) => (
                          <Card
                            key={activity.id}
                            className="border-l-4 border-l-primary"
                          >
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h4 className="font-medium">
                                    {activity.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {activity.description}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {new Date(
                                      activity.date
                                    ).toLocaleDateString()}
                                    <Badge
                                      variant="outline"
                                      className="capitalize"
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
                                  </div>
                                </div>
                                {activity.completed && (
                                  <Award className="w-5 h-5 text-primary" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="observations" className="space-y-4">
                      <div className="space-y-3">
                        {observations.map((observation) => (
                          <Card key={observation.id}>
                            <CardContent className="pt-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
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
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(
                                      observation.date
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm">{observation.content}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and helpful resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                >
                  <BookOpen className="w-6 h-6 text-primary" />
                  <span>View Full Portfolio</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                >
                  <Calendar className="w-6 h-6 text-accent" />
                  <span>Upcoming Events</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                >
                  <MessageCircle className="w-6 h-6 text-secondary-foreground" />
                  <span>Schedule Conference</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
