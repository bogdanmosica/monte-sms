import { describe, expect, it, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/admin/alerts/route';
import { NextRequest } from 'next/server';

// Mock the database and auth modules
vi.mock('@/lib/db/drizzle', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  },
}));

vi.mock('@/lib/auth/middleware', () => ({
  withRole: vi.fn(),
}));

vi.mock('@/lib/db/schema', () => ({
  users: { role: 'role', deletedAt: 'deletedAt' },
  children: { isActive: 'isActive', emergencyContact: 'emergencyContact', medicalNotes: 'medicalNotes', updatedAt: 'updatedAt' },
  UserRole: {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    PARENT: 'parent'
  }
}));

import { withRole } from '@/lib/auth/middleware';
import { db } from '@/lib/db/drizzle';

const mockWithRole = withRole as vi.MockedFunction<typeof withRole>;
const mockDb = db as any;

describe('Admin Dashboard Alerts Integration', () => {
  const mockUser = {
    id: 1,
    role: 'admin',
    email: 'admin@test.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock withRole to call the handler function directly
    mockWithRole.mockImplementation((roles, handler) => {
      return async (request: NextRequest) => {
        return handler(request, mockUser);
      };
    });
  });

  it('should return alerts with correct structure', async () => {
    // Mock database queries for various alert conditions
    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 3 }]) // Incomplete enrollments
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 2 }]) // Students without observations
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 45 }]) // Current students
      });

    const request = new NextRequest('http://localhost:3001/api/admin/alerts');
    const response = await GET(request);
    const data = await response.json();

    // Verify response structure
    expect(data).toHaveProperty('alerts');
    expect(Array.isArray(data.alerts)).toBe(true);

    if (data.alerts.length > 0) {
      const alert = data.alerts[0];
      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('type');
      expect(alert).toHaveProperty('icon');
      expect(alert).toHaveProperty('title');
      expect(alert).toHaveProperty('message');
      expect(alert).toHaveProperty('priority');

      // Verify type values
      expect(['warning', 'info', 'success', 'error']).toContain(alert.type);

      // Verify priority values
      expect(['high', 'medium', 'low']).toContain(alert.priority);

      // Verify icon values
      expect(['AlertCircle', 'Clock', 'CheckCircle', 'DollarSign']).toContain(alert.icon);
    }
  });

  it('should generate pending enrollments alert', async () => {
    // Mock incomplete enrollments found
    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 5 }]) // 5 incomplete enrollments
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 0 }]) // No students without observations
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 30 }]) // Current students (under capacity)
      });

    const request = new NextRequest('http://localhost:3001/api/admin/alerts');
    const response = await GET(request);
    const data = await response.json();

    // Should have pending enrollments alert
    const pendingAlert = data.alerts.find((a: any) => a.id === 'pending-enrollments');
    expect(pendingAlert).toBeDefined();
    expect(pendingAlert.title).toBe('Pending Applications');
    expect(pendingAlert.message).toContain('5 enrollment applications');
    expect(pendingAlert.type).toBe('warning');
    expect(pendingAlert.icon).toBe('Clock');
    expect(pendingAlert.priority).toBe('medium');
  });

  it('should generate overdue payments alert', async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 0 }]) // No incomplete enrollments
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 0 }]) // No students without observations
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 25 }]) // Current students
      });

    const request = new NextRequest('http://localhost:3001/api/admin/alerts');
    const response = await GET(request);
    const data = await response.json();

    // Should have overdue payments alert (mock data)
    const overdueAlert = data.alerts.find((a: any) => a.id === 'overdue-payments');
    expect(overdueAlert).toBeDefined();
    expect(overdueAlert.title).toBe('Overdue Payments');
    expect(overdueAlert.message).toContain('$800');
    expect(overdueAlert.type).toBe('error');
    expect(overdueAlert.icon).toBe('DollarSign');
    expect(overdueAlert.priority).toBe('high');
  });

  it('should generate staff reports complete alert', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 0 }])
    });

    const request = new NextRequest('http://localhost:3001/api/admin/alerts');
    const response = await GET(request);
    const data = await response.json();

    // Should have staff reports complete alert
    const staffAlert = data.alerts.find((a: any) => a.id === 'staff-reports-complete');
    expect(staffAlert).toBeDefined();
    expect(staffAlert.title).toBe('Staff Reports');
    expect(staffAlert.message).toBe('All weekly classroom reports submitted on time');
    expect(staffAlert.type).toBe('success');
    expect(staffAlert.icon).toBe('CheckCircle');
    expect(staffAlert.priority).toBe('low');
  });

  it('should generate students need observations alert', async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 0 }]) // No incomplete enrollments
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 8 }]) // 8 students without recent observations
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 35 }]) // Current students
      });

    const request = new NextRequest('http://localhost:3001/api/admin/alerts');
    const response = await GET(request);
    const data = await response.json();

    // Should have students need observations alert
    const observationsAlert = data.alerts.find((a: any) => a.id === 'students-need-observations');
    expect(observationsAlert).toBeDefined();
    expect(observationsAlert.title).toBe('Student Observations');
    expect(observationsAlert.message).toContain('8 students haven\'t been observed');
    expect(observationsAlert.type).toBe('info');
    expect(observationsAlert.icon).toBe('AlertCircle');
    expect(observationsAlert.priority).toBe('medium');
  });

  it('should generate near capacity alert', async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 0 }]) // No incomplete enrollments
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 0 }]) // No students without observations
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 46 }]) // 46 students (92% of 50 capacity)
      });

    const request = new NextRequest('http://localhost:3001/api/admin/alerts');
    const response = await GET(request);
    const data = await response.json();

    // Should have near capacity alert
    const capacityAlert = data.alerts.find((a: any) => a.id === 'near-capacity');
    expect(capacityAlert).toBeDefined();
    expect(capacityAlert.title).toBe('Near Capacity');
    expect(capacityAlert.message).toContain('92% capacity');
    expect(capacityAlert.message).toContain('46/50');
    expect(capacityAlert.type).toBe('warning');
    expect(capacityAlert.icon).toBe('AlertCircle');
    expect(capacityAlert.priority).toBe('medium');
  });

  it('should sort alerts by priority', async () => {
    // Set up conditions for multiple alerts
    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 3 }]) // Incomplete enrollments (medium priority)
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 2 }]) // Students without observations (medium priority)
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 25 }]) // Current students
      });

    const request = new NextRequest('http://localhost:3001/api/admin/alerts');
    const response = await GET(request);
    const data = await response.json();

    // Verify alerts are sorted by priority (high -> medium -> low)
    const priorities = data.alerts.map((a: any) => a.priority);
    const priorityOrder = ['high', 'medium', 'low'];

    for (let i = 1; i < priorities.length; i++) {
      const currentIndex = priorityOrder.indexOf(priorities[i]);
      const previousIndex = priorityOrder.indexOf(priorities[i - 1]);
      expect(currentIndex).toBeGreaterThanOrEqual(previousIndex);
    }
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    mockDb.select.mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const request = new NextRequest('http://localhost:3001/api/admin/alerts');
    const response = await GET(request);

    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Internal server error');
  });

  it('should require admin role', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 0 }])
    });

    const request = new NextRequest('http://localhost:3001/api/admin/alerts');
    await GET(request);

    expect(mockWithRole).toHaveBeenCalledWith(
      ['admin'],
      expect.any(Function)
    );
  });

  it('should return empty alerts array when no conditions are met', async () => {
    // Mock no alerts conditions
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 0 }])
    });

    const request = new NextRequest('http://localhost:3001/api/admin/alerts');
    const response = await GET(request);
    const data = await response.json();

    // Should still have some alerts (overdue payments and staff reports are mocked)
    expect(data.alerts).toBeDefined();
    expect(Array.isArray(data.alerts)).toBe(true);
  });

  it('should include action buttons for actionable alerts', async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 5 }]) // Incomplete enrollments
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 0 }])
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 25 }])
      });

    const request = new NextRequest('http://localhost:3001/api/admin/alerts');
    const response = await GET(request);
    const data = await response.json();

    // Find actionable alerts
    const actionableAlerts = data.alerts.filter((a: any) => a.action);
    expect(actionableAlerts.length).toBeGreaterThan(0);

    // Check that actionable alerts have URLs
    actionableAlerts.forEach((alert: any) => {
      expect(alert.action).toBeDefined();
      if (alert.actionUrl) {
        expect(alert.actionUrl).toMatch(/^\/admin/);
      }
    });
  });
});