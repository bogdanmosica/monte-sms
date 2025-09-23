'use client';

import {
  Calendar,
  Mail,
  MapPin,
  Phone,
  UserPlus,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Application {
  id: string;
  childName: string;
  parentName: string;
  email: string;
  phone: string;
  address: string;
  birthdate: string;
  age: number;
  appliedDate: string;
  status: string;
  preferredStartDate: string;
  notes?: string;
}

interface Student {
  id: string;
  name: string;
  age: number;
  classroom: string;
}

interface EnrollmentTabsProps {
  applications: Application[];
  currentStudents: Student[];
  onViewApplication?: (id: string) => void;
  onScheduleInterview?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewProfile?: (id: string) => void;
  onContactParent?: (id: string) => void;
  onEditDetails?: (id: string) => void;
}

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

export function EnrollmentTabs({
  applications = [],
  currentStudents = [],
  onViewApplication = () => {},
  onScheduleInterview = () => {},
  onApprove = () => {},
  onReject = () => {},
  onViewProfile = () => {},
  onContactParent = () => {},
  onEditDetails = () => {},
}: EnrollmentTabsProps) {
  return (
    <Tabs defaultValue="applications" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="applications">Applications</TabsTrigger>
        <TabsTrigger value="current">Current Students</TabsTrigger>
        <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
      </TabsList>

      <TabsContent value="applications" className="space-y-4">
        <div className="space-y-4">
          {applications.map((application) => (
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewApplication(application.id)}
                  >
                    View Full Application
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onScheduleInterview(application.id)}
                  >
                    Schedule Interview
                  </Button>
                  <Button
                    size="sm"
                    className="bg-accent hover:bg-accent/90"
                    onClick={() => onApprove(application.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(application.id)}
                  >
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
                    onClick={() => onViewProfile(student.id)}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => onContactParent(student.id)}
                  >
                    Contact Parent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => onEditDetails(student.id)}
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
  );
}