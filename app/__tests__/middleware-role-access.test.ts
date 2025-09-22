import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { verifyToken } from '@/lib/auth/session';
import { UserRole } from '@/lib/db/schema';
import { middleware } from '@/middleware';

// Mock the auth session module
vi.mock('@/lib/auth/session', () => ({
  verifyToken: vi.fn(),
  signToken: vi.fn(),
}));

// Mock the database access log
vi.mock('@/lib/db/access-log', () => ({
  logAccessEvent: vi.fn(),
}));

// Mock route functions
vi.mock('@/lib/db/route', () => ({
  hasRouteAccess: vi.fn(),
  isProtectedRoute: vi.fn(),
}));

// Helper function to create a mock NextRequest
function createMockNextRequest(
  url: string,
  options: { headers?: Record<string, string> } = {}
) {
  const urlObj = new URL(url);

  return {
    nextUrl: {
      pathname: urlObj.pathname,
    },
    url,
    method: 'GET',
    headers: {
      get: vi.fn((name: string) => options.headers?.[name] || null),
    },
    cookies: {
      get: vi.fn((name: string) => {
        if (
          name === 'session' &&
          options.headers?.cookie?.includes('session=')
        ) {
          const match = options.headers.cookie.match(/session=([^;]+)/);
          return match ? { value: match[1] } : null;
        }
        return null;
      }),
    },
    ip: '127.0.0.1',
  } as unknown as NextRequest;
}

describe('Middleware Role-Based Access Control', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    const { isProtectedRoute, hasRouteAccess } = vi.mocked(
      require('@/lib/db/route')
    );
    isProtectedRoute.mockReturnValue(true);
    hasRouteAccess.mockReturnValue(true);
  });

  describe('T003: Middleware role-based access enforcement', () => {
    it('should allow admin access to admin routes', async () => {
      const { isProtectedRoute, hasRouteAccess } = await import(
        '@/lib/db/route'
      );

      const mockToken = {
        userId: '1',
        role: UserRole.ADMIN,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(verifyToken).mockResolvedValue(mockToken);
      vi.mocked(isProtectedRoute).mockReturnValue(true);
      vi.mocked(hasRouteAccess).mockReturnValue(true);

      const request = createMockNextRequest(
        'http://localhost:3000/admin/dashboard',
        {
          headers: {
            cookie: 'session=valid-token',
          },
        }
      );

      const response = await middleware(request);

      // Should allow access (no redirect)
      expect(response.status).not.toBe(302);
      expect(response.headers.get('location')).toBeFalsy();
    });

    it('should deny parent access to admin routes', async () => {
      const mockToken = {
        userId: '2',
        role: UserRole.PARENT,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(verifyToken).mockResolvedValue(mockToken);

      const request = new NextRequest('http://localhost:3000/admin/dashboard', {
        headers: {
          cookie: 'session=valid-token',
        },
      });

      const response = await middleware(request);

      // Should redirect to unauthorized page
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/unauthorized'
      );
    });

    it('should deny teacher access to admin routes', async () => {
      const mockToken = {
        userId: '3',
        role: UserRole.TEACHER,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(verifyToken).mockResolvedValue(mockToken);

      const request = new NextRequest('http://localhost:3000/admin/users', {
        headers: {
          cookie: 'session=valid-token',
        },
      });

      const response = await middleware(request);

      // Should redirect to unauthorized page
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/unauthorized'
      );
    });

    it('should allow teacher access to teacher routes', async () => {
      const mockToken = {
        userId: '3',
        role: UserRole.TEACHER,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(verifyToken).mockResolvedValue(mockToken);

      const request = new NextRequest(
        'http://localhost:3000/teacher/observations',
        {
          headers: {
            cookie: 'session=valid-token',
          },
        }
      );

      const response = await middleware(request);

      // Should allow access (no redirect)
      expect(response.status).not.toBe(302);
      expect(response.headers.get('location')).toBeFalsy();
    });

    it('should allow parent access to parent routes', async () => {
      const mockToken = {
        userId: '2',
        role: UserRole.PARENT,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(verifyToken).mockResolvedValue(mockToken);

      const request = new NextRequest('http://localhost:3000/parent/children', {
        headers: {
          cookie: 'session=valid-token',
        },
      });

      const response = await middleware(request);

      // Should allow access (no redirect)
      expect(response.status).not.toBe(302);
      expect(response.headers.get('location')).toBeFalsy();
    });
  });

  describe('T004: Session invalidation on role change', () => {
    it('should invalidate session when role has changed', async () => {
      // This test assumes we have a way to detect role changes
      // Implementation will need to track previous role in session
      const mockToken = {
        userId: '1',
        role: UserRole.PARENT,
        previousRole: UserRole.ADMIN, // Role has changed
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(verifyToken).mockResolvedValue(mockToken);

      const request = new NextRequest('http://localhost:3000/dashboard', {
        headers: {
          cookie: 'session=valid-token',
        },
      });

      const response = await middleware(request);

      // Should redirect to sign-in and clear session
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/sign-in'
      );

      // Check that session cookie is being deleted
      const setCookieHeader = response.headers.get('set-cookie');
      expect(setCookieHeader).toContain('session=;');
    });
  });

  describe('T005: Redirect on denied access', () => {
    it('should redirect to unauthorized page when access is denied', async () => {
      const mockToken = {
        userId: '2',
        role: UserRole.PARENT,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(verifyToken).mockResolvedValue(mockToken);

      const request = new NextRequest('http://localhost:3000/admin/billing', {
        headers: {
          cookie: 'session=valid-token',
        },
      });

      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/unauthorized'
      );
    });

    it('should redirect to sign-in when no session exists', async () => {
      const request = new NextRequest('http://localhost:3000/admin/dashboard');

      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/sign-in'
      );
    });

    it('should redirect to sign-in when session is invalid', async () => {
      vi.mocked(verifyToken).mockRejectedValue(new Error('Invalid token'));

      const request = new NextRequest('http://localhost:3000/dashboard', {
        headers: {
          cookie: 'session=invalid-token',
        },
      });

      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/sign-in'
      );
    });
  });

  describe('T006: Access event logging', () => {
    it('should log successful access events', async () => {
      const { logAccessEvent } = await import('@/lib/db/access-log');

      const mockToken = {
        userId: '1',
        role: UserRole.ADMIN,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(verifyToken).mockResolvedValue(mockToken);

      const request = new NextRequest('http://localhost:3000/admin/dashboard', {
        headers: {
          cookie: 'session=valid-token',
        },
      });

      await middleware(request);

      expect(logAccessEvent).toHaveBeenCalledWith({
        userId: '1',
        routeId: '/admin/dashboard',
        eventType: 'access_granted',
        timestamp: expect.any(Date),
      });
    });

    it('should log denied access events', async () => {
      const { logAccessEvent } = await import('@/lib/db/access-log');

      const mockToken = {
        userId: '2',
        role: UserRole.PARENT,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(verifyToken).mockResolvedValue(mockToken);

      const request = new NextRequest('http://localhost:3000/admin/dashboard', {
        headers: {
          cookie: 'session=valid-token',
        },
      });

      await middleware(request);

      expect(logAccessEvent).toHaveBeenCalledWith({
        userId: '2',
        routeId: '/admin/dashboard',
        eventType: 'access_denied',
        timestamp: expect.any(Date),
      });
    });

    it('should log logout events when session is invalidated', async () => {
      const { logAccessEvent } = await import('@/lib/db/access-log');

      vi.mocked(verifyToken).mockRejectedValue(new Error('Token expired'));

      const request = new NextRequest('http://localhost:3000/dashboard', {
        headers: {
          cookie: 'session=expired-token',
        },
      });

      await middleware(request);

      expect(logAccessEvent).toHaveBeenCalledWith({
        userId: expect.any(String),
        routeId: '/dashboard',
        eventType: 'logout',
        timestamp: expect.any(Date),
      });
    });
  });
});
