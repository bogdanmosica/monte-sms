import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminDashboard from '@/app/(admin)/admin/page';

// Mock SWR to control API responses
vi.mock('swr', () => ({
  default: vi.fn(),
}));

// Mock components to focus on data integration
vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress" data-value={value}>
      Progress: {value}%
    </div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-description">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-title">{children}</div>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="button">{children}</button>
  ),
}));

import useSWR from 'swr';

const mockUseSWR = useSWR as unknown as vi.MockedFunction<typeof useSWR>;

describe('Admin Dashboard Metrics Integration', () => {
  const mockMetrics = {
    enrollment: {
      totalStudents: 42,
      capacity: 50,
      enrollmentPercentage: 84,
      availableSpots: 8,
      newEnrollments: 3,
      pendingApplications: 2,
    },
    staff: {
      totalStaff: 8,
      teachers: 6,
      activeStaff: 8,
      administrators: 2,
    },
    financial: {
      totalRevenue: 125000,
      pendingPayments: 5000,
      overduePayments: 1200,
      paidThisMonth: 118800,
    },
    parents: {
      totalParents: 35,
    },
  };

  const mockActivities = {
    activities: [
      {
        id: 'act-1',
        type: 'enrollment' as const,
        message: 'New student Emma Johnson enrolled',
        time: '2 hours ago',
        status: 'completed' as const,
      },
      {
        id: 'act-2',
        type: 'payment' as const,
        message: 'Monthly tuition payment received',
        time: '4 hours ago',
        status: 'completed' as const,
      },
    ],
  };

  const mockAlerts = {
    alerts: [
      {
        id: 'alert-1',
        type: 'warning' as const,
        icon: 'AlertCircle' as const,
        title: 'Overdue Payments',
        message: '$1,200 in overdue tuition payments',
        action: 'Review',
        priority: 'high' as const,
      },
      {
        id: 'alert-2',
        type: 'info' as const,
        icon: 'Clock' as const,
        title: 'Pending Applications',
        message: '2 enrollment applications awaiting review',
        action: 'Review',
        priority: 'medium' as const,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should display enrollment metrics correctly', async () => {
    // Mock successful API responses
    mockUseSWR
      .mockReturnValueOnce({
        data: mockMetrics,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: mockActivities,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: mockAlerts,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      });

    render(<AdminDashboard />);

    // Check enrollment metrics
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument(); // Total students
      expect(screen.getByText('84% capacity')).toBeInTheDocument(); // Enrollment percentage
    });

    // Check progress bar reflects correct enrollment percentage
    const progressBar = screen.getByTestId('progress');
    expect(progressBar).toHaveAttribute('data-value', '84');
  });

  it('should display staff metrics correctly', async () => {
    mockUseSWR
      .mockReturnValueOnce({
        data: mockMetrics,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: mockActivities,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: mockAlerts,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument(); // Active staff
      expect(screen.getByText('6 teachers')).toBeInTheDocument(); // Teachers count
    });
  });

  it('should display financial metrics correctly', async () => {
    mockUseSWR
      .mockReturnValueOnce({
        data: mockMetrics,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: mockActivities,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: mockAlerts,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('$125,000')).toBeInTheDocument(); // Total revenue
      expect(screen.getByText('$5,000 pending')).toBeInTheDocument(); // Pending payments
    });
  });

  it('should display activities correctly', async () => {
    mockUseSWR
      .mockReturnValueOnce({
        data: mockMetrics,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: mockActivities,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: mockAlerts,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('New student Emma Johnson enrolled')).toBeInTheDocument();
      expect(screen.getByText('Monthly tuition payment received')).toBeInTheDocument();
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('4 hours ago')).toBeInTheDocument();
    });
  });

  it('should display alerts correctly', async () => {
    mockUseSWR
      .mockReturnValueOnce({
        data: mockMetrics,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: mockActivities,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: mockAlerts,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Overdue Payments')).toBeInTheDocument();
      expect(screen.getByText('$1,200 in overdue tuition payments')).toBeInTheDocument();
      expect(screen.getByText('Pending Applications')).toBeInTheDocument();
      expect(screen.getByText('2 enrollment applications awaiting review')).toBeInTheDocument();
    });
  });

  it('should show loading state', async () => {
    mockUseSWR
      .mockReturnValueOnce({
        data: undefined,
        error: null,
        isLoading: true,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      });

    render(<AdminDashboard />);

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('should show error state', async () => {
    mockUseSWR
      .mockReturnValueOnce({
        data: undefined,
        error: new Error('Network error'),
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      });

    render(<AdminDashboard />);

    expect(screen.getByText('Error loading dashboard data')).toBeInTheDocument();
  });

  it('should handle missing data gracefully', async () => {
    // Test with undefined/null data
    const emptyMetrics = {
      enrollment: {
        totalStudents: 0,
        capacity: 0,
        enrollmentPercentage: 0,
        availableSpots: 0,
        newEnrollments: 0,
        pendingApplications: 0,
      },
      staff: {
        totalStaff: 0,
        teachers: 0,
        activeStaff: 0,
        administrators: 0,
      },
      financial: {
        totalRevenue: 0,
        pendingPayments: 0,
        overduePayments: 0,
        paidThisMonth: 0,
      },
      parents: {
        totalParents: 0,
      },
    };

    mockUseSWR
      .mockReturnValueOnce({
        data: emptyMetrics,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: { activities: [] },
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: { alerts: [] },
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No recent activities')).toBeInTheDocument();
      expect(screen.getByText('No alerts at this time')).toBeInTheDocument();
    });
  });

  it('should call correct API endpoints', () => {
    mockUseSWR
      .mockReturnValueOnce({
        data: mockMetrics,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: mockActivities,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      })
      .mockReturnValueOnce({
        data: mockAlerts,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      });

    render(<AdminDashboard />);

    // Verify SWR was called with correct endpoints
    expect(mockUseSWR).toHaveBeenCalledWith('/api/admin/metrics', expect.any(Function));
    expect(mockUseSWR).toHaveBeenCalledWith('/api/admin/activities', expect.any(Function));
    expect(mockUseSWR).toHaveBeenCalledWith('/api/admin/alerts', expect.any(Function));
  });
});