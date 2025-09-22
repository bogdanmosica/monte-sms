import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';
import { AccessEventType, logAccessEvent } from '@/lib/db/access-log';
import { hasRouteAccess, isProtectedRoute } from '@/lib/db/route';
import { UserRole } from '@/lib/db/schema';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isRouteProtected = isProtectedRoute(pathname);
  const isApiRoute = pathname.startsWith('/api');

  // Get client IP and user agent for logging
  const clientIP =
    request.ip ||
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Handle API routes differently - don't redirect, return 401
  if (isApiRoute && pathname.startsWith('/api/admin')) {
    if (!sessionCookie) {
      await logAccessEvent({
        userId: 'anonymous',
        routeId: pathname,
        eventType: AccessEventType.ACCESS_DENIED,
        ipAddress: clientIP,
        userAgent,
        metadata: { reason: 'no_session' },
      });

      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify session for admin API routes
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const userRole = parsed.role as UserRole;

      if (userRole !== UserRole.ADMIN && userRole !== UserRole.OWNER) {
        await logAccessEvent({
          userId: parsed.userId?.toString() || 'unknown',
          routeId: pathname,
          eventType: AccessEventType.ACCESS_DENIED,
          ipAddress: clientIP,
          userAgent,
          metadata: { reason: 'insufficient_role', userRole },
        });

        return new NextResponse('Forbidden', { status: 403 });
      }

      // Admin access granted, continue
      await logAccessEvent({
        userId: parsed.userId?.toString() || 'unknown',
        routeId: pathname,
        eventType: AccessEventType.ACCESS_GRANTED,
        ipAddress: clientIP,
        userAgent,
        metadata: { userRole },
      });

      return NextResponse.next();
    } catch (error) {
      console.error('Error verifying admin API session:', error);
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  // Skip middleware for non-admin API routes
  if (isApiRoute) {
    return NextResponse.next();
  }

  // If route is protected and no session exists, redirect to sign-in
  if (isRouteProtected && !sessionCookie) {
    // Log anonymous access attempt
    await logAccessEvent({
      userId: 'anonymous',
      routeId: pathname,
      eventType: AccessEventType.ACCESS_DENIED,
      ipAddress: clientIP,
      userAgent,
      metadata: { reason: 'no_session' },
    });

    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const res = NextResponse.next();

  // Process session if it exists
  if (sessionCookie) {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const userRole = parsed.role as UserRole;
      const userId = parsed.userId?.toString() || 'unknown';

      // Check for role change (session invalidation)
      if (parsed.previousRole && parsed.previousRole !== userRole) {
        // Log session invalidation
        await logAccessEvent({
          userId,
          routeId: pathname,
          eventType: AccessEventType.SESSION_INVALIDATED,
          ipAddress: clientIP,
          userAgent,
          metadata: {
            reason: 'role_change',
            previousRole: parsed.previousRole,
            currentRole: userRole,
          },
        });

        // Clear session and redirect to sign-in
        res.cookies.delete('session');
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }

      // Check role-based access for protected routes
      if (isRouteProtected) {
        const hasAccess = hasRouteAccess(pathname, userRole);

        if (!hasAccess) {
          // Log access denied
          await logAccessEvent({
            userId,
            routeId: pathname,
            eventType: AccessEventType.ACCESS_DENIED,
            ipAddress: clientIP,
            userAgent,
            metadata: {
              reason: 'insufficient_role',
              userRole,
            },
          });

          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        // Log successful access
        await logAccessEvent({
          userId,
          routeId: pathname,
          eventType: AccessEventType.ACCESS_GRANTED,
          ipAddress: clientIP,
          userAgent,
          metadata: { userRole },
        });
      }

      // Refresh session token for GET requests
      if (request.method === 'GET') {
        const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

        res.cookies.set({
          name: 'session',
          value: await signToken({
            ...parsed,
            expires: expiresInOneDay.toISOString(),
          }),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: expiresInOneDay,
        });
      }
    } catch (error) {
      console.error('Error processing session:', error);

      // Log logout due to invalid session
      await logAccessEvent({
        userId: 'unknown',
        routeId: pathname,
        eventType: AccessEventType.LOGOUT,
        ipAddress: clientIP,
        userAgent,
        metadata: {
          reason: 'invalid_session',
          error: error instanceof Error ? error.message : 'unknown_error',
        },
      });

      // Clear invalid session
      res.cookies.delete('session');

      if (isRouteProtected) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs',
};
