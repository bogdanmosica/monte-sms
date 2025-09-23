import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as GET_APPLICATIONS, POST as POST_APPLICATIONS } from '@/app/api/applications/route';
import { GET as GET_ENROLLMENTS, POST as POST_ENROLLMENTS } from '@/app/api/enrollments/route';
import { GET as GET_STUDENTS } from '@/app/api/students/route';

// Mock dependencies for performance testing
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
    applicationId: 'applicationId',
    enrollmentDate: 'enrollmentDate'
  },
}));

// Performance testing utilities
const measurePerformance = async (fn: () => Promise<any>, iterations = 1) => {
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    await fn();
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const averageTime = totalTime / iterations;

  return {
    totalTime,
    averageTime,
    iterations
  };
};

const measurePercentile = async (fn: () => Promise<any>, iterations = 100) => {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    await fn();
    const endTime = performance.now();
    times.push(endTime - startTime);
  }

  times.sort((a, b) => a - b);

  return {
    p50: times[Math.floor(iterations * 0.5)],
    p90: times[Math.floor(iterations * 0.9)],
    p95: times[Math.floor(iterations * 0.95)],
    p99: times[Math.floor(iterations * 0.99)],
    min: times[0],
    max: times[times.length - 1],
    average: times.reduce((sum, time) => sum + time, 0) / times.length
  };
};

describe('Enrollment API Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Applications API Performance', () => {
    beforeEach(() => {
      const { db } = require('@/lib/db/drizzle');

      // Mock database responses with realistic timing
      (db.select as any).mockImplementation(() => {
        // Simulate database query time (1-20ms)
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              from: () => ({
                leftJoin: () => ({
                  leftJoin: () => ({
                    leftJoin: () => ({
                      where: () => ({
                        orderBy: () => ({
                          limit: () => ({
                            offset: () => Promise.resolve([
                              {
                                id: 1,
                                childName: 'John Doe',
                                parentName: 'Jane Doe',
                                email: 'jane@example.com',
                                status: 'pending',
                                priority: 'medium',
                                submittedAt: new Date(),
                                parent: { id: 1, name: 'Jane Doe', email: 'jane@example.com' },
                                school: { id: 1, name: 'Test School' },
                              }
                            ]),
                          }),
                        }),
                      }),
                    }),
                  }),
                }),
              })
            );
          }, Math.random() * 19 + 1); // 1-20ms delay
        });
      });
    });

    it('should return applications list within 200ms (p95)', async () => {
      const request = new NextRequest('http://localhost:3000/api/applications');

      const metrics = await measurePercentile(
        () => GET_APPLICATIONS(request),
        50 // Reduced iterations for faster test execution
      );

      console.log('Applications GET Performance:', {
        p95: `${metrics.p95.toFixed(2)}ms`,
        average: `${metrics.average.toFixed(2)}ms`,
        min: `${metrics.min.toFixed(2)}ms`,
        max: `${metrics.max.toFixed(2)}ms`
      });

      // Target: p95 < 200ms
      expect(metrics.p95).toBeLessThan(200);
      expect(metrics.average).toBeLessThan(100);
    });

    it('should handle filtered queries efficiently', async () => {
      const request = new NextRequest('http://localhost:3000/api/applications?status=pending&search=John&limit=25');

      const metrics = await measurePerformance(
        () => GET_APPLICATIONS(request),
        20
      );

      console.log('Applications Filtered Query Performance:', {
        average: `${metrics.averageTime.toFixed(2)}ms`,
        iterations: metrics.iterations
      });

      // Filtered queries should still be fast
      expect(metrics.averageTime).toBeLessThan(150);
    });

    it('should handle pagination efficiently', async () => {
      const requests = [
        new NextRequest('http://localhost:3000/api/applications?limit=10&offset=0'),
        new NextRequest('http://localhost:3000/api/applications?limit=10&offset=10'),
        new NextRequest('http://localhost:3000/api/applications?limit=10&offset=20'),
      ];

      const results = await Promise.all(
        requests.map(req =>
          measurePerformance(() => GET_APPLICATIONS(req), 10)
        )
      );

      results.forEach((result, index) => {
        console.log(`Pagination Page ${index + 1} Performance:`, {
          average: `${result.averageTime.toFixed(2)}ms`
        });

        // Pagination should not significantly degrade performance
        expect(result.averageTime).toBeLessThan(200);
      });
    });

    it('should create applications within performance targets', async () => {
      const { db } = require('@/lib/db/drizzle');

      // Mock successful creation with realistic timing
      (db.select as any).mockImplementationOnce(() => ({
        from: () => ({
          limit: () => Promise.resolve([{ id: 1, name: 'Test School' }]),
        }),
      }));

      (db.select as any).mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
      }));

      (db.insert as any).mockImplementationOnce(() => ({
        values: () => ({
          returning: () => new Promise(resolve => {
            setTimeout(() => {
              resolve([{ id: 1 }]);
            }, Math.random() * 9 + 1); // 1-10ms delay
          }),
        }),
      }));

      (db.insert as any).mockImplementationOnce(() => ({
        values: () => ({
          returning: () => new Promise(resolve => {
            setTimeout(() => {
              resolve([{
                id: 1,
                childName: 'John Doe',
                status: 'pending',
              }]);
            }, Math.random() * 14 + 1); // 1-15ms delay
          }),
        }),
      }));

      const validApplication = {
        childName: 'John Doe',
        childBirthDate: '2020-01-01',
        parentName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '555-123-4567',
        address: '123 Main St',
        preferredStartDate: '2024-01-01',
      };

      const request = new NextRequest('http://localhost:3000/api/applications', {
        method: 'POST',
        body: JSON.stringify(validApplication),
      });

      const metrics = await measurePerformance(
        () => POST_APPLICATIONS(request),
        10
      );

      console.log('Application Creation Performance:', {
        average: `${metrics.averageTime.toFixed(2)}ms`
      });

      // Creation should be fast
      expect(metrics.averageTime).toBeLessThan(250);
    });
  });

  describe('Enrollments API Performance', () => {
    beforeEach(() => {
      const { db } = require('@/lib/db/drizzle');

      // Mock complex enrollment queries with multiple joins
      (db.select as any).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              from: () => ({
                leftJoin: () => ({
                  leftJoin: () => ({
                    leftJoin: () => ({
                      leftJoin: () => ({
                        where: () => ({
                          orderBy: () => ({
                            limit: () => ({
                              offset: () => Promise.resolve([
                                {
                                  id: 1,
                                  enrollmentDate: '2024-01-01',
                                  status: 'active',
                                  classroom: 'Toddler Room',
                                  child: { id: 1, firstName: 'John', lastName: 'Doe', age: 3 },
                                  parent: { id: 1, name: 'Jane Doe', email: 'jane@example.com' },
                                  school: { id: 1, name: 'Test School' },
                                }
                              ]),
                            }),
                          }),
                        }),
                      }),
                    }),
                  }),
                }),
              })
            );
          }, Math.random() * 24 + 1); // 1-25ms delay (more complex query)
        });
      });
    });

    it('should return enrollments with statistics within 200ms (p95)', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrollments');

      const metrics = await measurePercentile(
        () => GET_ENROLLMENTS(request),
        30
      );

      console.log('Enrollments GET Performance:', {
        p95: `${metrics.p95.toFixed(2)}ms`,
        average: `${metrics.average.toFixed(2)}ms`,
        min: `${metrics.min.toFixed(2)}ms`,
        max: `${metrics.max.toFixed(2)}ms`
      });

      // Complex query with statistics should still meet performance targets
      expect(metrics.p95).toBeLessThan(200);
      expect(metrics.average).toBeLessThan(120);
    });

    it('should handle complex filtering efficiently', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrollments?status=active&classroom=Toddler%20Room&search=John');

      const metrics = await measurePerformance(
        () => GET_ENROLLMENTS(request),
        15
      );

      console.log('Enrollments Complex Filter Performance:', {
        average: `${metrics.averageTime.toFixed(2)}ms`
      });

      // Complex filtering should not significantly impact performance
      expect(metrics.averageTime).toBeLessThan(180);
    });

    it('should create enrollments within performance targets', async () => {
      const { db } = require('@/lib/db/drizzle');

      // Mock enrollment creation with validation queries
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

      (db.select as any).mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([{ id: 1 }]),
          }),
        }),
      }));

      (db.select as any).mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([]),
          }),
        }),
      }));

      (db.insert as any).mockImplementation(() => ({
        values: () => ({
          returning: () => new Promise(resolve => {
            setTimeout(() => {
              resolve([{
                id: 1,
                status: 'active',
                childId: 1,
              }]);
            }, Math.random() * 19 + 1); // 1-20ms delay
          }),
        }),
      }));

      const validEnrollment = {
        applicationId: 1,
        childId: 1,
        enrollmentDate: '2024-01-01',
        classroom: 'Toddler Room',
        tuitionAmount: 100000,
      };

      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify(validEnrollment),
      });

      const metrics = await measurePerformance(
        () => POST_ENROLLMENTS(request),
        10
      );

      console.log('Enrollment Creation Performance:', {
        average: `${metrics.averageTime.toFixed(2)}ms`
      });

      expect(metrics.averageTime).toBeLessThan(300);
    });
  });

  describe('Students API Performance', () => {
    beforeEach(() => {
      const { db } = require('@/lib/db/drizzle');

      (db.select as any).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              from: () => ({
                leftJoin: () => ({
                  leftJoin: () => ({
                    leftJoin: () => ({
                      where: () => ({
                        orderBy: () => ({
                          limit: () => ({
                            offset: () => Promise.resolve([
                              {
                                id: 1,
                                firstName: 'John',
                                lastName: 'Doe',
                                age: 3,
                                currentClassroom: 'Toddler Room',
                                parent: { id: 1, name: 'Jane Doe', email: 'jane@example.com' },
                                school: { id: 1, name: 'Test School' },
                              }
                            ]),
                          }),
                        }),
                      }),
                    }),
                  }),
                }),
              })
            );
          }, Math.random() * 19 + 1); // 1-20ms delay
        });
      });
    });

    it('should return students list within performance targets', async () => {
      const request = new NextRequest('http://localhost:3000/api/students');

      const metrics = await measurePercentile(
        () => GET_STUDENTS(request),
        30
      );

      console.log('Students GET Performance:', {
        p95: `${metrics.p95.toFixed(2)}ms`,
        average: `${metrics.average.toFixed(2)}ms`
      });

      expect(metrics.p95).toBeLessThan(200);
      expect(metrics.average).toBeLessThan(100);
    });

    it('should handle student filtering efficiently', async () => {
      const request = new NextRequest('http://localhost:3000/api/students?classroom=Toddler%20Room&active=true&search=John');

      const metrics = await measurePerformance(
        () => GET_STUDENTS(request),
        15
      );

      console.log('Students Filtered Query Performance:', {
        average: `${metrics.averageTime.toFixed(2)}ms`
      });

      expect(metrics.averageTime).toBeLessThan(150);
    });
  });

  describe('Concurrent Load Testing', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const requests = Array.from({ length: concurrentRequests }, (_, i) =>
        new NextRequest(`http://localhost:3000/api/applications?test=${i}`)
      );

      const startTime = performance.now();

      const responses = await Promise.all(
        requests.map(req => GET_APPLICATIONS(req))
      );

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      console.log('Concurrent Load Test:', {
        requests: concurrentRequests,
        totalTime: `${totalTime.toFixed(2)}ms`,
        averagePerRequest: `${(totalTime / concurrentRequests).toFixed(2)}ms`
      });

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Total time should not be significantly longer than sequential
      // Allow some overhead for concurrency
      expect(totalTime).toBeLessThan(500);
    });

    it('should maintain performance under mixed load', async () => {
      const mixedRequests = [
        () => GET_APPLICATIONS(new NextRequest('http://localhost:3000/api/applications')),
        () => GET_ENROLLMENTS(new NextRequest('http://localhost:3000/api/enrollments')),
        () => GET_STUDENTS(new NextRequest('http://localhost:3000/api/students')),
        () => GET_APPLICATIONS(new NextRequest('http://localhost:3000/api/applications?search=test')),
        () => GET_ENROLLMENTS(new NextRequest('http://localhost:3000/api/enrollments?status=active')),
      ];

      const startTime = performance.now();

      const responses = await Promise.all(
        mixedRequests.map(requestFn => requestFn())
      );

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      console.log('Mixed Load Test:', {
        requests: mixedRequests.length,
        totalTime: `${totalTime.toFixed(2)}ms`,
        averagePerRequest: `${(totalTime / mixedRequests.length).toFixed(2)}ms`
      });

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(totalTime).toBeLessThan(400);
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should not cause memory leaks during repeated requests', async () => {
      const initialMemory = process.memoryUsage();

      // Perform many requests to check for memory leaks
      for (let i = 0; i < 50; i++) {
        const request = new NextRequest(`http://localhost:3000/api/applications?iteration=${i}`);
        await GET_APPLICATIONS(request);
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      console.log('Memory Usage Test:', {
        initialHeap: `${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        finalHeap: `${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        increase: `${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`
      });

      // Memory increase should be reasonable (less than 10MB for 50 requests)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Database Query Optimization', () => {
    it('should minimize database round trips', async () => {
      const { db } = require('@/lib/db/drizzle');
      let queryCount = 0;

      // Count database queries
      const originalSelect = db.select;
      db.select = vi.fn((...args) => {
        queryCount++;
        return originalSelect.call(db, ...args);
      });

      const request = new NextRequest('http://localhost:3000/api/enrollments');
      await GET_ENROLLMENTS(request);

      console.log('Database Query Count:', {
        totalQueries: queryCount
      });

      // Should use efficient queries with minimal round trips
      // Enrollments endpoint should use no more than 10 queries
      // (main query + stats queries + classroom query)
      expect(queryCount).toBeLessThanOrEqual(10);
    });
  });
});