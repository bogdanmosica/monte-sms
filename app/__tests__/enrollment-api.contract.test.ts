import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/applications/route';
import { GET as GET_ENROLLMENTS, POST as POST_ENROLLMENTS } from '@/app/api/enrollments/route';
import { GET as GET_STUDENTS } from '@/app/api/students/route';
import { NextRequest } from 'next/server';

// Mock the database and auth
vi.mock('@/lib/db/drizzle', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
  },
}));

vi.mock('@/lib/auth/middleware', () => ({
  withRole: vi.fn((roles, handler) => (req: NextRequest) => {
    const mockUser = { id: 1, role: 'admin', name: 'Test Admin' };
    return handler(req, mockUser);
  }),
  logAuthEvent: vi.fn(),
}));

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id', name: 'name', email: 'email', role: 'role' },
  children: { id: 'id', firstName: 'firstName', lastName: 'lastName' },
  schools: { id: 'id', name: 'name' },
  UserRole: { ADMIN: 'admin', TEACHER: 'teacher', PARENT: 'parent' },
}));

vi.mock('@/lib/db/enrollment', () => ({
  applications: { id: 'id', childName: 'childName', status: 'status' },
  enrollments: { id: 'id', status: 'status', childId: 'childId' },
}));

describe('Applications API Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/applications', () => {
    it('should return applications list with required fields', async () => {
      const { db } = await import('@/lib/db/drizzle');

      // Mock the database response
      const mockApplications = [
        {
          id: 1,
          childName: 'John Doe',
          parentName: 'Jane Doe',
          email: 'jane@example.com',
          phone: '555-1234',
          address: '123 Main St',
          childBirthDate: '2019-01-01',
          preferredStartDate: '2024-01-01',
          status: 'pending',
          notes: 'Test notes',
          priority: 'medium',
          submittedAt: new Date(),
          createdAt: new Date(),
          parent: { id: 1, name: 'Jane Doe', email: 'jane@example.com' },
          school: { id: 1, name: 'Test School' },
        },
      ];

      // Mock the select chain
      (db.select as any).mockImplementation(() => ({
        from: () => ({
          leftJoin: () => ({
            leftJoin: () => ({
              leftJoin: () => ({
                where: () => ({
                  orderBy: () => ({
                    limit: () => ({
                      offset: () => Promise.resolve(mockApplications),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }));

      // Mock the count query
      (db.select as any).mockImplementationOnce(() => ({
        from: () => ({
          where: () => Promise.resolve([{ count: 1 }]),
        }),
      }));

      const request = new NextRequest('http://localhost:3000/api/applications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('applications');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('stats');

      if (data.applications.length > 0) {
        const application = data.applications[0];
        expect(application).toHaveProperty('id');
        expect(application).toHaveProperty('childName');
        expect(application).toHaveProperty('status');
        expect(application).toHaveProperty('email');
        expect(application).toHaveProperty('phone');
      }
    });

    it('should support filtering by status', async () => {
      const request = new NextRequest('http://localhost:3000/api/applications?status=pending');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should support search functionality', async () => {
      const request = new NextRequest('http://localhost:3000/api/applications?search=John');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should support pagination', async () => {
      const request = new NextRequest('http://localhost:3000/api/applications?limit=10&offset=0');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/applications', () => {
    it('should create new application with valid data', async () => {
      const { db } = await import('@/lib/db/drizzle');

      // Mock school query
      (db.select as any).mockImplementationOnce(() => ({
        from: () => ({
          limit: () => Promise.resolve([{ id: 1, name: 'Test School' }]),
        }),
      }));

      // Mock user query (parent doesn't exist)
      (db.select as any).mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
      }));

      // Mock user creation
      (db.insert as any).mockImplementationOnce(() => ({
        values: () => ({
          returning: () => Promise.resolve([{ id: 1 }]),
        }),
      }));

      // Mock application creation
      (db.insert as any).mockImplementationOnce(() => ({
        values: () => ({
          returning: () => Promise.resolve([{
            id: 1,
            childName: 'John Doe',
            status: 'pending',
          }]),
        }),
      }));

      const validApplication = {
        childName: 'John Doe',
        childBirthDate: '2019-01-01',
        parentName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '555-1234',
        address: '123 Main St',
        preferredStartDate: '2024-01-01',
        notes: 'Test application',
        priority: 'medium',
      };

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(validApplication),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('application');
    });

    it('should validate required fields', async () => {
      const invalidApplication = {
        childName: '', // Invalid: empty name
        email: 'invalid-email', // Invalid: not an email
      };

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(invalidApplication),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});

describe('Enrollments API Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/enrollments', () => {
    it('should return enrollments list with required fields', async () => {
      const { db } = await import('@/lib/db/drizzle');

      const mockEnrollments = [
        {
          id: 1,
          enrollmentDate: '2024-01-01',
          status: 'active',
          classroom: 'Toddler Room',
          child: { id: 1, firstName: 'John', lastName: 'Doe', age: 3 },
          parent: { id: 1, name: 'Jane Doe', email: 'jane@example.com' },
          school: { id: 1, name: 'Test School' },
        },
      ];

      // Mock the select chain
      (db.select as any).mockImplementation(() => ({
        from: () => ({
          leftJoin: () => ({
            leftJoin: () => ({
              leftJoin: () => ({
                leftJoin: () => ({
                  where: () => ({
                    orderBy: () => ({
                      limit: () => ({
                        offset: () => Promise.resolve(mockEnrollments),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }));

      const request = new NextRequest('http://localhost:3000/api/enrollments');
      const response = await GET_ENROLLMENTS(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('enrollments');
      expect(data).toHaveProperty('stats');

      if (data.enrollments.length > 0) {
        const enrollment = data.enrollments[0];
        expect(enrollment).toHaveProperty('id');
        expect(enrollment).toHaveProperty('status');
        expect(enrollment).toHaveProperty('child');
      }
    });
  });

  describe('POST /api/enrollments', () => {
    it('should create new enrollment with valid data', async () => {
      const { db } = await import('@/lib/db/drizzle');

      // Mock application query (approved)
      (db.select as any).mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([{
              id: 1,
              status: 'approved',
              schoolId: 1,
              parentId: 1,
            }]),
          }),
        }),
      }));

      // Mock child query
      (db.select as any).mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([{ id: 1 }]),
          }),
        }),
      }));

      // Mock existing enrollment check
      (db.select as any).mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
      }));

      // Mock enrollment creation
      (db.insert as any).mockImplementation(() => ({
        values: () => ({
          returning: () => Promise.resolve([{
            id: 1,
            status: 'active',
            childId: 1,
          }]),
        }),
      }));

      const validEnrollment = {
        applicationId: 1,
        childId: 1,
        enrollmentDate: '2024-01-01',
        classroom: 'Toddler Room',
        tuitionAmount: 100000, // $1000 in cents
      };

      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify(validEnrollment),
      });

      const response = await POST_ENROLLMENTS(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('enrollment');
    });
  });
});

describe('Students API Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/students', () => {
    it('should return students list with required fields', async () => {
      const { db } = await import('@/lib/db/drizzle');

      const mockStudents = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          nickname: 'Johnny',
          age: 3,
          currentClassroom: 'Toddler Room',
          isActive: true,
          parent: { id: 1, name: 'Jane Doe', email: 'jane@example.com' },
          school: { id: 1, name: 'Test School' },
        },
      ];

      // Mock the select chain
      (db.select as any).mockImplementation(() => ({
        from: () => ({
          leftJoin: () => ({
            leftJoin: () => ({
              leftJoin: () => ({
                where: () => ({
                  orderBy: () => ({
                    limit: () => ({
                      offset: () => Promise.resolve(mockStudents),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }));

      const request = new NextRequest('http://localhost:3000/api/students');
      const response = await GET_STUDENTS(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('students');
      expect(data).toHaveProperty('stats');

      if (data.students.length > 0) {
        const student = data.students[0];
        expect(student).toHaveProperty('id');
        expect(student).toHaveProperty('firstName');
        expect(student).toHaveProperty('lastName');
        expect(student).toHaveProperty('age');
        expect(student).toHaveProperty('currentClassroom');
      }
    });

    it('should filter by classroom', async () => {
      const request = new NextRequest('http://localhost:3000/api/students?classroom=Toddler%20Room');
      const response = await GET_STUDENTS(request);

      expect(response.status).toBe(200);
    });

    it('should filter by active status', async () => {
      const request = new NextRequest('http://localhost:3000/api/students?active=true');
      const response = await GET_STUDENTS(request);

      expect(response.status).toBe(200);
    });
  });
});