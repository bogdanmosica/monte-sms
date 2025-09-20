'use client';

import {
  Calendar,
  DollarSign,
  FileText,
  Filter,
  Mail,
  MapPin,
  Phone,
  Search,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockChildren } from '@/lib/mock-data';


// Mock enrollment applications
const mockApplications = [
  {
    id: '1',
    childName: 'Oliver Thompson',
    parentName: 'Jennifer Thompson',
    email: 'jennifer.thompson@email.com',
    phone: '(555) 123-4567',
    address: '456 Oak Street, Education City, EC 12345',
    birthdate: '2019-05-12',
    age: 4,
    appliedDate: '2024-01-10',
    status: 'pending',
    preferredStartDate: '2024-02-01',
    notes:
      'Child has previous Montessori experience. Parent interested in full-day program.',
  },
  {
    id: '2',
    childName: 'Ava Martinez',
    parentName: 'Carlos Martinez',
    email: 'carlos.martinez@email.com',
    phone: '(555) 234-5678',
    address: '789 Pine Avenue, Education City, EC 12345',
    birthdate: '2018-09-22',
    age: 5,
    appliedDate: '2024-01-08',
    status: 'approved',
    preferredStartDate: '2024-01-22',
    notes:
      'Family relocating from another state. Excellent references from previous school.',
  },
  {
    id: '3',
    childName: 'Noah Wilson',
    parentName: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    phone: '(555) 345-6789',
    address: '321 Elm Drive, Education City, EC 12345',
    birthdate: '2019-12-03',
    age: 4,
    appliedDate: '2024-01-05',
    status: 'interview_scheduled',
    preferredStartDate: '2024-02-15',
    notes: 'Parent tour completed. Interview scheduled for next week.',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-primary/20 text-primary border-primary/30';
    case 'approved':
      return 'bg-accent/20 text-accent border-accent/30';
    case 'interview_scheduled':
      return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
    case 'rejected':
      return 'bg-destructive/20 text-destructive border-destructive/30';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
};

export default function AdminEnrollment() {
  const currentStudents = mockChildren;
  const pendingApplications = mockApplications.filter(
    (app) => app.status === 'pending'
  );
  const approvedApplications = mockApplications.filter(
    (app) => app.status === 'approved'
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Enrollment Management
              </h1>
              <p className="text-muted-foreground">
                Manage student applications and current enrollments
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </div>

          {/* Enrollment Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {currentStudents.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active enrollments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {pendingApplications.length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Approved This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {approvedApplications.length}
                </div>
                <p className="text-xs text-muted-foreground">Ready to enroll</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Available Spots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {50 - currentStudents.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Out of 50 capacity
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by child name, parent name, or email..."
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

          {/* Enrollment Tabs */}
          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="current">Current Students</TabsTrigger>
              <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="space-y-4">
              <div className="space-y-4">
                {mockApplications.map((application) => (
                  <Card
                    key={application.id}
                    className="border-l-4 border-l-primary"
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 bg-primary/20">
                            <AvatarFallback className="text-primary font-medium">
                              {application.childName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-lg">
                              {application.childName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Age {application.age} • Parent:{' '}
                              {application.parentName}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={getStatusColor(application.status)}
                          variant="outline"
                        >
                          {application.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{application.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{application.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{application.address}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>
                              Applied:{' '}
                              {new Date(
                                application.appliedDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>
                              Preferred Start:{' '}
                              {new Date(
                                application.preferredStartDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>
                              Birth Date:{' '}
                              {new Date(
                                application.birthdate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {application.notes && (
                        <div className="mb-4">
                          <h5 className="font-medium text-sm mb-1">Notes:</h5>
                          <p className="text-sm text-muted-foreground">
                            {application.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Full Application
                        </Button>
                        <Button variant="outline" size="sm">
                          Schedule Interview
                        </Button>
                        <Button
                          size="sm"
                          className="bg-accent hover:bg-accent/90"
                        >
                          Approve
                        </Button>
                        <Button variant="outline" size="sm">
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="current" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-4">
                {currentStudents.map((student) => (
                  <Card key={student.id} className="border-l-4 border-l-accent">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-4 mb-3">
                        <Avatar className="h-12 w-12 bg-accent/20">
                          <AvatarFallback className="text-accent font-medium">
                            {student.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Age {student.age} • {student.classroom}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
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
                          Contact Parent
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                        >
                          Edit Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="waitlist" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No students on waitlist
                    </h3>
                    <p className="text-muted-foreground">
                      Students waiting for available spots will appear here when
                      capacity is reached.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
