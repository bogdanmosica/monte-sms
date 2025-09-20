'use client';

import {
  Calendar,
  DollarSign,
  FileText,
  Filter,
  Mail,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';


// Mock staff data with additional details
const mockStaffMembers = [
  {
    id: '1',
    name: 'Maria Montessori',
    email: 'maria.montessori@school.edu',
    phone: '(555) 123-4567',
    role: 'Lead Teacher',
    department: 'Primary',
    hireDate: '2020-08-15',
    status: 'active',
    classroom: 'Primary A',
    certifications: [
      'Montessori Primary Certificate',
      'Early Childhood Education',
    ],
    experience: '15 years',
  },
  {
    id: '2',
    name: 'Dr. Elizabeth Carter',
    email: 'admin@school.edu',
    phone: '(555) 234-5678',
    role: 'School Administrator',
    department: 'Administration',
    hireDate: '2018-06-01',
    status: 'active',
    classroom: 'N/A',
    certifications: ['Educational Leadership', 'School Administration'],
    experience: '20 years',
  },
  {
    id: '3',
    name: 'James Wilson',
    email: 'james.wilson@school.edu',
    phone: '(555) 345-6789',
    role: 'Assistant Teacher',
    department: 'Primary',
    hireDate: '2022-01-10',
    status: 'active',
    classroom: 'Primary B',
    certifications: ['Montessori Assistant Certificate'],
    experience: '3 years',
  },
  {
    id: '4',
    name: 'Sarah Thompson',
    email: 'sarah.thompson@school.edu',
    phone: '(555) 456-7890',
    role: 'Substitute Teacher',
    department: 'Primary',
    hireDate: '2023-09-01',
    status: 'part_time',
    classroom: 'Various',
    certifications: ['Early Childhood Education'],
    experience: '5 years',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-accent/20 text-accent border-accent/30';
    case 'part_time':
      return 'bg-primary/20 text-primary border-primary/30';
    case 'inactive':
      return 'bg-muted text-muted-foreground border-muted';
    default:
      return 'bg-muted text-muted-foreground border-muted';
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Lead Teacher':
      return 'bg-primary/20 text-primary';
    case 'School Administrator':
      return 'bg-secondary/20 text-secondary-foreground';
    case 'Assistant Teacher':
      return 'bg-accent/20 text-accent';
    case 'Substitute Teacher':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function AdminStaff() {
  const activeStaff = mockStaffMembers.filter(
    (staff) => staff.status === 'active'
  );
  const partTimeStaff = mockStaffMembers.filter(
    (staff) => staff.status === 'part_time'
  );
  const teachers = mockStaffMembers.filter((staff) =>
    staff.role.includes('Teacher')
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Staff Management
              </h1>
              <p className="text-muted-foreground">
                Manage school staff, roles, and assignments
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </div>

          {/* Staff Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {mockStaffMembers.length}
                </div>
                <p className="text-xs text-muted-foreground">All employees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {activeStaff.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Full-time employees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {teachers.length}
                </div>
                <p className="text-xs text-muted-foreground">Teaching staff</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Part-Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {partTimeStaff.length}
                </div>
                <p className="text-xs text-muted-foreground">Part-time staff</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, role, or department..."
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

          {/* Staff Directory */}
          <div className="grid lg:grid-cols-2 gap-6">
            {mockStaffMembers.map((staff) => (
              <Card key={staff.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 bg-primary/20">
                        <AvatarFallback className="text-primary font-semibold text-lg">
                          {staff.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-lg">{staff.name}</h4>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={getRoleColor(staff.role)}
                            variant="outline"
                          >
                            {staff.role}
                          </Badge>
                          <Badge
                            className={getStatusColor(staff.status)}
                            variant="outline"
                          >
                            {staff.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {staff.department} Department
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{staff.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{staff.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          Hired: {new Date(staff.hireDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Classroom: </span>
                        <span>{staff.classroom}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Experience: </span>
                        <span>{staff.experience}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium text-sm mb-2">
                      Certifications:
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {staff.certifications.map((cert, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {cert}
                        </Badge>
                      ))}
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
                      Edit Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                    >
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Department Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
              <CardDescription>
                Staff distribution by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Primary Department
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {
                        mockStaffMembers.filter(
                          (staff) => staff.department === 'Primary'
                        ).length
                      }
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Teaching staff
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Administration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-accent">
                      {
                        mockStaffMembers.filter(
                          (staff) => staff.department === 'Administration'
                        ).length
                      }
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Administrative staff
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Support Staff</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-secondary-foreground">
                      0
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Support roles
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
