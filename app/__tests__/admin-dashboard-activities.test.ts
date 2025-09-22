import { describe, expect, it, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/admin/activities/route';
import { NextRequest } from 'next/server';

// Mock the database and auth modules
vi.mock('@/lib/db/drizzle', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/lib/auth/middleware', () => ({
  withRole: vi.fn(),
}));

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id', name: 'name', role: 'role' },
  children: {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
    createdAt: 'createdAt',
    parentId: 'parentId',
    isActive: 'isActive'
  },
  accessLogs: {
    id: 'id',
    eventType: 'eventType',
    timestamp: 'timestamp',
    routeId: 'routeId',
    metadata: 'metadata',
    userId: 'userId'
  },
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

describe('Admin Dashboard Activities Integration', () => {
  const mockUser = {
    id: 1,
    role: 'admin',
    email: 'admin@test.com'
  };

  const mockAccessLogs = [
    {
      id: 1,
      eventType: 'login',
      timestamp: new Date('2025-01-15T10:00:00Z'),
      routeId: '/admin',
      metadata: null,
      userId: 1,
      userName: 'Admin User',
      userRole: 'admin'
    },
    {
      id: 2,
      eventType: 'access_granted',
      timestamp: new Date('2025-01-15T11:00:00Z'),
      routeId: '/teacher/dashboard',
      metadata: null,
      userId: 2,
      userName: 'Teacher User',
      userRole: 'teacher'
    }
  ];

  const mockEnrollments = [
    {
      id: 1,
      firstName: 'Emma',
      lastName: 'Johnson',
      createdAt: new Date('2025-01-15T09:00:00Z'),
      parentName: 'Sarah Johnson'
    },
    {
      id: 2,
      firstName: 'Liam',
      lastName: 'Chen',
      createdAt: new Date('2025-01-15T08:00:00Z'),
      parentName: 'Wei Chen'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock withRole to call the handler function directly
    mockWithRole.mockImplementation((roles, handler) => {
      return async (request: NextRequest) => {
        return handler(request, mockUser);
      };
    });
  });

  it('should return activities with correct structure', async () => {
    // Mock database queries
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(mockAccessLogs)
    });

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(mockEnrollments)
    });

    const request = new NextRequest('http://localhost:3001/api/admin/activities');
    const response = await GET(request);
    const data = await response.json();

    // Verify response structure
    expect(data).toHaveProperty('activities');
    expect(Array.isArray(data.activities)).toBe(true);
    expect(data.activities.length).toBeGreaterThan(0);

    // Verify activity structure
    const activity = data.activities[0];
    expect(activity).toHaveProperty('id');
    expect(activity).toHaveProperty('type');
    expect(activity).toHaveProperty('message');
    expect(activity).toHaveProperty('time');
    expect(activity).toHaveProperty('status');

    // Verify activity types
    const activityTypes = data.activities.map((a: any) => a.type);
    activityTypes.forEach((type: string) => {
      expect(['enrollment', 'payment', 'staff', 'observation', 'access']).toContain(type);
    });
  });

  it('should respect limit parameter', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([])
    });

    const request = new NextRequest('http://localhost:3001/api/admin/activities?limit=5');
    const response = await GET(request);
    const data = await response.json();

    expect(data.activities.length).toBeLessThanOrEqual(5);
  });

  it('should include enrollment activities', async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([])
    });

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(mockEnrollments)
    });

    const request = new NextRequest('http://localhost:3001/api/admin/activities');
    const response = await GET(request);
    const data = await response.json();

    // Should have enrollment activities
    const enrollmentActivities = data.activities.filter((a: any) => a.type === 'enrollment');
    expect(enrollmentActivities.length).toBeGreaterThan(0);

    // Check enrollment activity structure
    const enrollmentActivity = enrollmentActivities[0];
    expect(enrollmentActivity.message).toContain('Emma Johnson');
    expect(enrollmentActivity.message).toContain('Sarah Johnson');
    expect(enrollmentActivity.status).toBe('completed');
  });

  it('should include access log activities', async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(mockAccessLogs)
    });

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([])
    });

    const request = new NextRequest('http://localhost:3001/api/admin/activities');
    const response = await GET(request);
    const data = await response.json();

    // Should have access activities
    const accessActivities = data.activities.filter((a: any) => a.type === 'access');
    expect(accessActivities.length).toBeGreaterThan(0);

    // Check access activity structure
    const accessActivity = accessActivities[0];
    expect(accessActivity.message).toContain('signed in');
    expect(accessActivity.status).toBe('completed');
  });

  it('should include mock activities when database is empty', async () => {
    // Mock empty database responses
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([])
    });

    const request = new NextRequest('http://localhost:3001/api/admin/activities');
    const response = await GET(request);
    const data = await response.json();

    // Should still have mock activities
    expect(data.activities.length).toBeGreaterThan(0);

    // Should include payment and staff mock activities
    const mockActivityTypes = data.activities.map((a: any) => a.type);
    expect(mockActivityTypes).toContain('payment');
    expect(mockActivityTypes).toContain('staff');
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    mockDb.select.mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const request = new NextRequest('http://localhost:3001/api/admin/activities');
    const response = await GET(request);

    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Internal server error');
  });

  it('should format time correctly', async () => {
    const recentEnrollment = [{
      id: 1,
      firstName: 'Emma',
      lastName: 'Johnson',
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      parentName: 'Sarah Johnson'
    }];

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([])
    });

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(recentEnrollment)
    });

    const request = new NextRequest('http://localhost:3001/api/admin/activities');
    const response = await GET(request);
    const data = await response.json();

    const enrollmentActivity = data.activities.find((a: any) => a.type === 'enrollment');
    expect(enrollmentActivity.time).toContain('minutes ago');
  });

  it('should require admin role', async () => {
    // This test verifies that withRole is called with correct roles
    const request = new NextRequest('http://localhost:3001/api/admin/activities');
    await GET(request);

    expect(mockWithRole).toHaveBeenCalledWith(
      ['admin'],
      expect.any(Function)
    );
  });
});