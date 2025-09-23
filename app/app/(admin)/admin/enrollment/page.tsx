'use client';

import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnrollmentStats } from './components/EnrollmentStats';
import { SearchAndFilter } from './components/SearchAndFilter';
import { EnrollmentTabs } from './components/EnrollmentTabs';
import { toast } from 'sonner';

interface ApplicationData {
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

interface StudentData {
  id: string;
  name: string;
  age: number;
  classroom: string;
}

interface EnrollmentStatsData {
  totalActive: number;
  pending: number;
  approvedThisMonth: number;
  capacity: number;
}

export default function AdminEnrollment() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [stats, setStats] = useState<EnrollmentStatsData>({
    totalActive: 0,
    pending: 0,
    approvedThisMonth: 0,
    capacity: 50, // Will be updated with actual capacity from database
  });
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  // Fetch enrollment metrics from admin metrics API
  const fetchEnrollmentMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics');
      if (!response.ok) {
        console.warn('Could not fetch enrollment metrics, using defaults');
        return {
          capacity: 50,
          pendingApplications: 0,
          approvedThisMonth: 0,
          totalStudents: 0,
        };
      }

      const data = await response.json();
      return {
        capacity: data.enrollment?.capacity || 50,
        pendingApplications: data.enrollment?.pendingApplications || 0,
        approvedThisMonth: data.enrollment?.approvedThisMonth || 0,
        totalStudents: data.enrollment?.totalStudents || 0,
      };
    } catch (error) {
      console.warn('Error fetching enrollment metrics:', error);
      return {
        capacity: 50,
        pendingApplications: 0,
        approvedThisMonth: 0,
        totalStudents: 0,
      };
    }
  };

  // Fetch applications data
  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (!response.ok) {
        console.error('Applications API returned error:', response.status, response.statusText);
        throw new Error(`Failed to fetch applications: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid response format');
      }

      // Ensure data.applications exists and is an array
      if (!data.applications || !Array.isArray(data.applications)) {
        console.warn('No applications data found in response:', data);
        setApplications([]);
        return;
      }

      // Transform API data to match component interface
      const transformedApplications = data.applications.map((app: any) => ({
        id: app.id.toString(),
        childName: app.childName,
        parentName: app.parentName,
        email: app.email,
        phone: app.phone,
        address: app.address,
        birthdate: app.childBirthDate,
        age: calculateAge(app.childBirthDate),
        appliedDate: app.submittedAt,
        status: app.status,
        preferredStartDate: app.preferredStartDate,
        notes: app.notes,
      }));

      setApplications(transformedApplications);

      // Get actual enrollment metrics from admin API
      const enrollmentMetrics = await fetchEnrollmentMetrics();

      // Update stats with real database metrics
      setStats({
        totalActive: enrollmentMetrics.totalStudents,
        pending: enrollmentMetrics.pendingApplications,
        approvedThisMonth: enrollmentMetrics.approvedThisMonth,
        capacity: enrollmentMetrics.capacity,
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]); // Set empty array on error
      toast.error('Failed to load applications data');
    }
  };

  // Fetch students data
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students?active=true');
      if (!response.ok) throw new Error('Failed to fetch students');

      const data = await response.json();

      // Ensure data.students exists and is an array
      if (!data.students || !Array.isArray(data.students)) {
        console.warn('No students data found in response:', data);
        setStudents([]);
        return;
      }

      // Transform API data to match component interface
      const transformedStudents = data.students.map((student: any) => ({
        id: student.id.toString(),
        name: student.name || `${student.firstName} ${student.lastName}`,
        age: student.age,
        classroom: student.currentClassroom || 'Unassigned',
      }));

      setStudents(transformedStudents);

      // Get enrollment metrics to ensure consistency
      const enrollmentMetrics = await fetchEnrollmentMetrics();

      // Update stats with consistent database metrics
      setStats(prev => ({
        ...prev,
        totalActive: enrollmentMetrics.totalStudents,
        pending: enrollmentMetrics.pendingApplications,
        approvedThisMonth: enrollmentMetrics.approvedThisMonth,
        capacity: enrollmentMetrics.capacity,
      }));
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]); // Set empty array on error
      toast.error('Failed to load students data');
    }
  };

  // Calculate age from birthdate
  const calculateAge = (birthdate: string): number => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Fetch enrollment metrics first to ensure they're available for calculations
      const enrollmentMetrics = await fetchEnrollmentMetrics();
      setStats(prev => ({
        ...prev,
        totalActive: enrollmentMetrics.totalStudents,
        pending: enrollmentMetrics.pendingApplications,
        approvedThisMonth: enrollmentMetrics.approvedThisMonth,
        capacity: enrollmentMetrics.capacity,
      }));

      // Then fetch applications and students data
      await Promise.all([fetchApplications(), fetchStudents()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Handle application actions
  const handleViewApplication = async (id: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`);
      if (!response.ok) throw new Error('Failed to fetch application');

      const data = await response.json();
      // TODO: Open application detail modal/page
      console.log('Application details:', data.application);

      toast.success('Application details loaded');
    } catch (error) {
      toast.error('Failed to load application details');
    }
  };

  const handleScheduleInterview = async (id: string) => {
    // TODO: Open interview scheduling modal
    console.log('Schedule interview for application:', id);
    toast.info('Interview scheduling will be available soon');
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!response.ok) throw new Error('Failed to approve application');

      // Refresh data
      await fetchApplications();

      toast.success('Application approved successfully');
    } catch (error) {
      toast.error('Failed to approve application');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (!response.ok) throw new Error('Failed to reject application');

      // Refresh data
      await fetchApplications();

      toast.success('Application rejected');
    } catch (error) {
      toast.error('Failed to reject application');
    }
  };

  const handleViewProfile = async (id: string) => {
    // TODO: Navigate to student profile page
    console.log('View student profile:', id);
    toast.info('Student profiles will be available soon');
  };

  const handleContactParent = async (id: string) => {
    // TODO: Open parent contact modal
    console.log('Contact parent for student:', id);
    toast.info('Parent contact features will be available soon');
  };

  const handleEditDetails = async (id: string) => {
    // TODO: Open student edit modal
    console.log('Edit student details:', id);
    toast.info('Student editing will be available soon');
  };

  // Filter applications based on search
  const filteredApplications = applications.filter(app =>
    searchValue === '' ||
    app.childName.toLowerCase().includes(searchValue.toLowerCase()) ||
    app.parentName.toLowerCase().includes(searchValue.toLowerCase()) ||
    app.email.toLowerCase().includes(searchValue.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading enrollment data...</p>
        </div>
      </div>
    );
  }

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
          <EnrollmentStats
            currentStudents={stats.totalActive}
            pendingApplications={stats.pending}
            approvedApplications={stats.approvedThisMonth}
            totalCapacity={stats.capacity}
          />

          {/* Search and Filter */}
          <SearchAndFilter
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            placeholder="Search by child name, parent name, or email..."
          />

          {/* Enrollment Tabs */}
          <EnrollmentTabs
            applications={filteredApplications}
            currentStudents={students}
            onViewApplication={handleViewApplication}
            onScheduleInterview={handleScheduleInterview}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewProfile={handleViewProfile}
            onContactParent={handleContactParent}
            onEditDetails={handleEditDetails}
          />
        </div>
      </main>
    </div>
  );
}
