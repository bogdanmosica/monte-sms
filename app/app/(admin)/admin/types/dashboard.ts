export interface AdminMetrics {
  enrollment: {
    totalStudents: number;
    capacity: number;
    enrollmentPercentage: number;
    availableSpots: number;
    newEnrollments: number;
    pendingApplications: number;
  };
  staff: {
    totalStaff: number;
    teachers: number;
    activeStaff: number;
    administrators: number;
  };
  financial: {
    totalRevenue: number;
    pendingPayments: number;
    overduePayments: number;
    paidThisMonth: number;
  };
  parents: {
    totalParents: number;
  };
}

export interface Activity {
  id: string;
  type: 'enrollment' | 'payment' | 'staff' | 'observation' | 'access';
  message: string;
  time: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  icon: 'AlertCircle' | 'Clock' | 'CheckCircle' | 'DollarSign';
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
}