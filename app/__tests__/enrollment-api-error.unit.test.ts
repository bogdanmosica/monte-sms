import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as GET_APPLICATIONS, POST as POST_APPLICATIONS } from '@/app/api/applications/route';
import { GET as GET_ENROLLMENTS, POST as POST_ENROLLMENTS } from '@/app/api/enrollments/route';
import { GET as GET_STUDENTS } from '@/app/api/students/route';
import { z } from 'zod';

// Mock dependencies
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
  children: { id: 'id', firstName: 'firstName', lastName: 'lastName', deletedAt: 'deletedAt' },
  schools: { id: 'id', name: 'name' },
  UserRole: { ADMIN: 'admin', TEACHER: 'teacher', PARENT: 'parent' },
}));

vi.mock('@/lib/db/enrollment', () => ({
  applications: {
    id: 'id',
    childName: 'childName',
    status: 'status',
    schoolId: 'schoolId',
    parentId: 'parentId'
  },
  enrollments: {
    id: 'id',
    status: 'status',
    childId: 'childId',
    applicationId: 'applicationId'
  },
}));

describe('API Error Handling Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Applications API Error Handling', () => {
    describe('GET /api/applications', () => {
      it('should handle database connection errors', async () => {
        const { db } = await import('@/lib/db/drizzle');

        // Mock database error
        (db.select as any).mockImplementation(() => {
          throw new Error('Database connection failed');
        });

        const request = new NextRequest('http://localhost:3000/api/applications');
        const response = await GET_APPLICATIONS(request);

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toHaveProperty('error', 'Internal server error');
      });

      it('should handle malformed query parameters', async () => {
        const { db } = await import('@/lib/db/drizzle');

        // Mock successful database response
        (db.select as any).mockImplementation(() => ({
          from: () => ({
            leftJoin: () => ({
              leftJoin: () => ({
                where: () => ({
                  orderBy: () => ({
                    limit: () => ({
                      offset: () => Promise.resolve([]),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }));

        // Test with invalid limit parameter
        const request = new NextRequest('http://localhost:3000/api/applications?limit=invalid&offset=negative');
        const response = await GET_APPLICATIONS(request);

        // Should still succeed but with corrected parameters
        expect(response.status).toBe(200);
      });

      it('should handle SQL injection attempts', async () => {
        const { db } = await import('@/lib/db/drizzle');

        (db.select as any).mockImplementation(() => ({
          from: () => ({
            leftJoin: () => ({
              leftJoin: () => ({
                where: () => ({
                  orderBy: () => ({
                    limit: () => ({
                      offset: () => Promise.resolve([]),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }));

        // Attempt SQL injection via search parameter
        const maliciousSearch = "'; DROP TABLE applications; --";
        const request = new NextRequest(`http://localhost:3000/api/applications?search=${encodeURIComponent(maliciousSearch)}`);
        const response = await GET_APPLICATIONS(request);

        // Should succeed - parameterized queries prevent injection
        expect(response.status).toBe(200);
      });
    });

    describe('POST /api/applications', () => {
      it('should handle validation errors for missing required fields', async () => {
        const invalidData = {
          childName: '', // Invalid: empty
          email: 'invalid-email', // Invalid: not an email
          // Missing required fields
        };

        const request = new NextRequest('http://localhost:3000/api/applications', {
          method: 'POST',
          body: JSON.stringify(invalidData),
        });

        const response = await POST_APPLICATIONS(request);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty('error');
        expect(typeof data.error).toBe('string');
      });

      it('should handle invalid JSON body', async () => {
        const request = new NextRequest('http://localhost:3000/api/applications', {
          method: 'POST',
          body: 'invalid json{',
        });

        const response = await POST_APPLICATIONS(request);

        expect(response.status).toBe(500);
      });

      it('should handle duplicate application submission', async () => {
        const { db } = await import('@/lib/db/drizzle');

        // Mock school exists
        (db.select as any).mockImplementationOnce(() => ({
          from: () => ({
            limit: () => Promise.resolve([{ id: 1, name: 'Test School' }]),
          }),
        }));

        // Mock user already exists
        (db.select as any).mockImplementationOnce(() => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([{ id: 1, email: 'test@example.com' }]),
            }),
          }),
        }));

        // Mock application creation that throws constraint error
        (db.insert as any).mockImplementation(() => ({
          values: () => ({
            returning: () => Promise.reject(new Error('UNIQUE constraint failed')),
          }),
        }));

        const validData = {
          childName: 'John Doe',
          childBirthDate: '2020-01-01',
          parentName: 'Jane Doe',
          email: 'test@example.com',
          phone: '555-123-4567',
          address: '123 Main St',
          preferredStartDate: '2024-01-01',
        };

        const request = new NextRequest('http://localhost:3000/api/applications', {
          method: 'POST',
          body: JSON.stringify(validData),
        });

        const response = await POST_APPLICATIONS(request);

        expect(response.status).toBe(500);
      });

      it('should handle database insert failures', async () => {
        const { db } = await import('@/lib/db/drizzle');

        // Mock school exists
        (db.select as any).mockImplementationOnce(() => ({
          from: () => ({
            limit: () => Promise.resolve([{ id: 1, name: 'Test School' }]),
          }),
        }));

        // Mock user doesn't exist
        (db.select as any).mockImplementationOnce(() => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }));

        // Mock user creation succeeds
        (db.insert as any).mockImplementationOnce(() => ({
          values: () => ({
            returning: () => Promise.resolve([{ id: 1 }]),
          }),
        }));

        // Mock application creation fails
        (db.insert as any).mockImplementationOnce(() => ({
          values: () => ({
            returning: () => Promise.reject(new Error('Database write failed')),
          }),
        }));

        const validData = {
          childName: 'John Doe',
          childBirthDate: '2020-01-01',
          parentName: 'Jane Doe',
          email: 'test@example.com',
          phone: '555-123-4567',
          address: '123 Main St',
          preferredStartDate: '2024-01-01',
        };

        const request = new NextRequest('http://localhost:3000/api/applications', {
          method: 'POST',
          body: JSON.stringify(validData),
        });

        const response = await POST_APPLICATIONS(request);

        expect(response.status).toBe(500);
      });
    });
  });

  describe('Enrollments API Error Handling', () => {
    describe('GET /api/enrollments', () => {
      it('should handle database timeout errors', async () => {
        const { db } = await import('@/lib/db/drizzle');

        // Mock database timeout
        (db.select as any).mockImplementation(() => {
          throw new Error('Query timeout');
        });

        const request = new NextRequest('http://localhost:3000/api/enrollments');
        const response = await GET_ENROLLMENTS(request);

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toHaveProperty('error', 'Internal server error');
      });

      it('should handle invalid status filter values', async () => {
        const { db } = await import('@/lib/db/drizzle');

        // Mock successful database response
        (db.select as any).mockImplementation(() => ({
          from: () => ({
            leftJoin: () => ({
              leftJoin: () => ({
                leftJoin: () => ({
                  leftJoin: () => ({
                    where: () => ({
                      orderBy: () => ({
                        limit: () => ({
                          offset: () => Promise.resolve([]),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }));

        // Test with invalid status
        const request = new NextRequest('http://localhost:3000/api/enrollments?status=invalid_status');
        const response = await GET_ENROLLMENTS(request);

        // Should succeed but ignore invalid filter
        expect(response.status).toBe(200);
      });
    });

    describe('POST /api/enrollments', () => {
      it('should handle non-existent application ID', async () => {
        const { db } = await import('@/lib/db/drizzle');

        // Mock application not found
        (db.select as any).mockImplementationOnce(() => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]), // Empty result
            }),
          }),
        }));

        const validData = {
          applicationId: 999, // Non-existent
          childId: 1,
          enrollmentDate: '2024-01-01',
        };

        const request = new NextRequest('http://localhost:3000/api/enrollments', {
          method: 'POST',
          body: JSON.stringify(validData),
        });

        const response = await POST_ENROLLMENTS(request);

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data).toHaveProperty('error', 'Application not found');
      });

      it('should handle non-approved applications', async () => {
        const { db } = await import('@/lib/db/drizzle');

        // Mock application exists but not approved
        (db.select as any).mockImplementationOnce(() => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([{
                id: 1,
                status: 'pending', // Not approved
                schoolId: 1,
                parentId: 1,
              }]),
            }),
          }),
        }));

        const validData = {
          applicationId: 1,
          childId: 1,
          enrollmentDate: '2024-01-01',
        };

        const request = new NextRequest('http://localhost:3000/api/enrollments', {
          method: 'POST',
          body: JSON.stringify(validData),
        });

        const response = await POST_ENROLLMENTS(request);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty('error', 'Application must be approved before enrollment');
      });

      it('should handle non-existent child ID', async () => {
        const { db } = await import('@/lib/db/drizzle');

        // Mock application exists and approved
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

        // Mock child not found
        (db.select as any).mockImplementationOnce(() => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]), // Empty result
            }),
          }),
        }));

        const validData = {
          applicationId: 1,
          childId: 999, // Non-existent
          enrollmentDate: '2024-01-01',
        };

        const request = new NextRequest('http://localhost:3000/api/enrollments', {
          method: 'POST',
          body: JSON.stringify(validData),
        });

        const response = await POST_ENROLLMENTS(request);

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data).toHaveProperty('error', 'Child not found');
      });

      it('should handle duplicate enrollment attempts', async () => {
        const { db } = await import('@/lib/db/drizzle');

        // Mock application exists and approved
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

        // Mock child exists
        (db.select as any).mockImplementationOnce(() => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([{ id: 1 }]),
            }),
          }),
        }));

        // Mock existing enrollment found
        (db.select as any).mockImplementationOnce(() => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([{ id: 1 }]), // Existing enrollment
            }),
          }),
        }));

        const validData = {
          applicationId: 1,
          childId: 1,
          enrollmentDate: '2024-01-01',
        };

        const request = new NextRequest('http://localhost:3000/api/enrollments', {
          method: 'POST',
          body: JSON.stringify(validData),
        });

        const response = await POST_ENROLLMENTS(request);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty('error', 'Enrollment already exists for this application');
      });

      it('should handle invalid enrollment data', async () => {
        const invalidData = {
          applicationId: 'not-a-number', // Invalid type
          childId: -1, // Invalid value
          enrollmentDate: 'invalid-date',
        };

        const request = new NextRequest('http://localhost:3000/api/enrollments', {
          method: 'POST',
          body: JSON.stringify(invalidData),
        });

        const response = await POST_ENROLLMENTS(request);

        expect(response.status).toBe(400);
      });
    });
  });

  describe('Students API Error Handling', () => {
    describe('GET /api/students', () => {
      it('should handle database query failures', async () => {
        const { db } = await import('@/lib/db/drizzle');

        // Mock database error
        (db.select as any).mockImplementation(() => {
          throw new Error('Connection lost');
        });

        const request = new NextRequest('http://localhost:3000/api/students');
        const response = await GET_STUDENTS(request);

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toHaveProperty('error', 'Internal server error');
      });

      it('should handle malformed boolean parameters', async () => {
        const { db } = await import('@/lib/db/drizzle');

        // Mock successful database response
        (db.select as any).mockImplementation(() => ({
          from: () => ({
            leftJoin: () => ({
              leftJoin: () => ({
                leftJoin: () => ({
                  where: () => ({
                    orderBy: () => ({
                      limit: () => ({
                        offset: () => Promise.resolve([]),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }));

        // Test with invalid boolean value
        const request = new NextRequest('http://localhost:3000/api/students?active=maybe');
        const response = await GET_STUDENTS(request);

        // Should succeed but ignore invalid parameter
        expect(response.status).toBe(200);
      });

      it('should handle empty result sets gracefully', async () => {
        const { db } = await import('@/lib/db/drizzle');

        // Mock empty database response
        (db.select as any).mockImplementation(() => ({
          from: () => ({
            leftJoin: () => ({
              leftJoin: () => ({
                leftJoin: () => ({
                  where: () => ({
                    orderBy: () => ({
                      limit: () => ({
                        offset: () => Promise.resolve([]), // Empty result
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

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('students');
        expect(Array.isArray(data.students)).toBe(true);
        expect(data.students).toHaveLength(0);
      });
    });
  });

  describe('General Error Handling Patterns', () => {
    it('should handle authentication failures', async () => {
      const { withRole } = await import('@/lib/auth/middleware');

      // Mock authentication failure
      (withRole as any).mockImplementation(() => () => {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      });

      const request = new NextRequest('http://localhost:3000/api/applications');
      const response = await GET_APPLICATIONS(request);

      expect(response.status).toBe(401);
    });

    it('should handle role-based access control failures', async () => {
      const { withRole } = await import('@/lib/auth/middleware');

      // Mock insufficient permissions
      (withRole as any).mockImplementation(() => () => {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      });

      const request = new NextRequest('http://localhost:3000/api/enrollments');
      const response = await GET_ENROLLMENTS(request);

      expect(response.status).toBe(403);
    });

    it('should log errors appropriately without exposing sensitive data', async () => {
      const { db } = await import('@/lib/db/drizzle');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock database error with sensitive information
      (db.select as any).mockImplementation(() => {
        throw new Error('Database password is incorrect for user admin');
      });

      const request = new NextRequest('http://localhost:3000/api/applications');
      const response = await GET_APPLICATIONS(request);

      expect(response.status).toBe(500);
      const data = await response.json();

      // Should return generic error message
      expect(data.error).toBe('Internal server error');
      // Should not expose database credentials
      expect(data.error).not.toContain('password');
      expect(data.error).not.toContain('admin');

      // Should log the actual error for debugging
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle rate limiting scenarios', async () => {
      // This would typically be handled by middleware, but we can test the concept
      const requests = Array.from({ length: 10 }, (_, i) =>
        new NextRequest(`http://localhost:3000/api/applications?test=${i}`)
      );

      // In a real scenario, rapid requests might be rate limited
      const responses = await Promise.all(
        requests.map(req => GET_APPLICATIONS(req))
      );

      // All should succeed in our mock environment
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status); // 200 success or 429 rate limited
      });
    });
  });
});