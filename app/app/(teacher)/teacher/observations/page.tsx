'use client';

import {
  BookOpen,
  Calendar,
  Filter,
  MessageCircle,
  Plus,
  Search,
  TrendingUp,
  User,
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
import { Textarea } from '@/components/ui/textarea';
import { mockChildren, mockObservations } from '@/lib/mock-data';


const getCategoryColor = (category: string) => {
  switch (category) {
    case 'academic':
      return 'bg-primary/20 text-primary border-primary/30';
    case 'social':
      return 'bg-accent/20 text-accent border-accent/30';
    case 'physical':
      return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
    case 'emotional':
      return 'bg-muted text-muted-foreground border-muted';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
};

export default function TeacherObservations() {
  const allObservations = mockObservations.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Student Observations
              </h1>
              <p className="text-muted-foreground">
                Document and track student development and behavior
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Observation
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Observations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {allObservations.length}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Academic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {
                    allObservations.filter((obs) => obs.category === 'academic')
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Learning focused
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Social
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {
                    allObservations.filter((obs) => obs.category === 'social')
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Interaction based
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {
                    allObservations.filter((obs) => {
                      const obsDate = new Date(obs.date);
                      const weekAgo = new Date(
                        Date.now() - 7 * 24 * 60 * 60 * 1000
                      );
                      return obsDate >= weekAgo;
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Recent entries</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search observations by student name or content..."
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

          {/* New Observation Form */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Quick Observation Entry
              </CardTitle>
              <CardDescription>
                Add a new observation for a student
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Student</label>
                  <select className="w-full mt-1 p-2 border border-border rounded-md bg-background">
                    <option value="">Select a student...</option>
                    {mockChildren.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select className="w-full mt-1 p-2 border border-border rounded-md bg-background">
                    <option value="">Select category...</option>
                    <option value="academic">Academic</option>
                    <option value="social">Social</option>
                    <option value="physical">Physical</option>
                    <option value="emotional">Emotional</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Observation</label>
                <Textarea
                  placeholder="Enter your observation here..."
                  className="mt-1 min-h-[100px]"
                />
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Save Observation
              </Button>
            </CardContent>
          </Card>

          {/* Observations List */}
          <div className="space-y-4">
            {allObservations.map((observation) => {
              const child = mockChildren.find(
                (c) => c.id === observation.child_id
              );
              return (
                <Card
                  key={observation.id}
                  className="border-l-4 border-l-primary"
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-accent/20">
                          <AvatarFallback className="text-accent font-medium">
                            {child?.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{child?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Age {child?.age}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getCategoryColor(observation.category)}
                          variant="outline"
                        >
                          {observation.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(observation.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {observation.content}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Share with Parent
                      </Button>
                      <Button variant="ghost" size="sm">
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {allObservations.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No observations yet
                  </h3>
                  <p className="text-muted-foreground">
                    Start documenting student development by adding your first
                    observation.
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
