'use client';

import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Download,
  Filter,
  Search,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getActivitiesByChild,
  getChildrenByParent,
  mockUsers,
} from '@/lib/mock-data';
import { UserRole } from '@/lib/db/schema';


export default function ParentPortfolio() {
  const currentParent = mockUsers.find((user) => user.role === UserRole.PARENT);
  const children = getChildrenByParent(currentParent?.id || '1');
  const currentChild = children[0];
  const activities = currentChild ? getActivitiesByChild(currentChild.id) : [];

  const categorizeActivities = (activities: any[]) => {
    return activities.reduce(
      (acc, activity) => {
        if (!acc[activity.category]) {
          acc[activity.category] = [];
        }
        acc[activity.category].push(activity);
        return acc;
      },
      {} as Record<string, any[]>
    );
  };

  const categorizedActivities = categorizeActivities(activities);

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Learning Portfolio
              </h1>
              <p className="text-muted-foreground">
                {currentChild?.name}'s complete learning journey and
                achievements
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <Download className="w-4 h-4 mr-2" />
                Export Portfolio
              </Button>
            </div>
          </div>

          {/* Child Info Card */}
          {currentChild && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 bg-primary/20">
                    <AvatarFallback className="text-primary font-semibold text-lg">
                      {currentChild.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">
                      {currentChild.name}
                    </CardTitle>
                    <CardDescription>
                      Age {currentChild.age} • {currentChild.classroom} •
                      Sunshine Montessori Academy
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search activities, observations, or achievements..."
                    className="w-full"
                  />
                </div>
                <Button variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Content */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All Work</TabsTrigger>
              <TabsTrigger value="practical_life">Practical Life</TabsTrigger>
              <TabsTrigger value="sensorial">Sensorial</TabsTrigger>
              <TabsTrigger value="mathematics">Mathematics</TabsTrigger>
              <TabsTrigger value="language">Language</TabsTrigger>
              <TabsTrigger value="cultural">Cultural</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-4">
                {activities.map((activity) => (
                  <Card
                    key={activity.id}
                    className="border-l-4 border-l-primary"
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{activity.title}</h4>
                            {activity.completed && (
                              <Award className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(activity.date).toLocaleDateString()}
                            </div>
                            <Badge
                              variant="outline"
                              className="capitalize"
                              style={{
                                backgroundColor:
                                  activity.category === 'practical_life'
                                    ? 'var(--primary)'
                                    : activity.category === 'sensorial'
                                      ? 'var(--accent)'
                                      : activity.category === 'mathematics'
                                        ? 'var(--secondary)'
                                        : 'var(--muted)',
                                color: 'var(--foreground)',
                                opacity: 0.8,
                              }}
                            >
                              {activity.category.replace('_', ' ')}
                            </Badge>
                            <Badge
                              variant={
                                activity.completed ? 'default' : 'secondary'
                              }
                            >
                              {activity.completed ? 'Completed' : 'In Progress'}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {Object.entries(categorizedActivities).map(
              ([category, categoryActivities]) => (
                <TabsContent
                  key={category}
                  value={category}
                  className="space-y-4"
                >
                  <div className="grid gap-4">
                    {categoryActivities.map((activity) => (
                      <Card
                        key={activity.id}
                        className="border-l-4 border-l-primary"
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">
                                  {activity.title}
                                </h4>
                                {activity.completed && (
                                  <Award className="w-4 h-4 text-primary" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {activity.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(activity.date).toLocaleDateString()}
                                </div>
                                <Badge
                                  variant={
                                    activity.completed ? 'default' : 'secondary'
                                  }
                                >
                                  {activity.completed
                                    ? 'Completed'
                                    : 'In Progress'}
                                </Badge>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              )
            )}
          </Tabs>

          {/* Empty State for categories with no activities */}
          {activities.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No activities found
                  </h3>
                  <p className="text-muted-foreground">
                    Your child's learning activities will appear here as they
                    complete them.
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
