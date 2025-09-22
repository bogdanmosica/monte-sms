# Security Documentation

## Overview

Monte SMS implements comprehensive security measures with role-based access control, comprehensive logging, and GDPR/OWASP compliance.

## Authentication & Authorization

### User Roles
- **Admin**: Full system access to all routes and features
- **Teacher**: Access to classroom management and dashboard features
- **Parent**: Access to child information and dashboard features

### Route Protection

#### Protected Routes
All routes starting with these patterns require authentication:
- `/admin/*` - Admin-only access
- `/teacher/*` - Teacher and Admin access
- `/parent/*` - Parent and Admin access
- `/dashboard/*` - All authenticated users

#### Access Matrix
| Route Pattern | Admin | Teacher | Parent |
|---------------|-------|---------|--------|
| `/admin/*`    | ✅    | ❌      | ❌     |
| `/teacher/*`  | ✅    | ✅      | ❌     |
| `/parent/*`   | ✅    | ❌      | ✅     |
| `/dashboard/*`| ✅    | ✅      | ✅     |

## Middleware Security Features

### Implementation (`middleware.ts`)

1. **Route Protection Check**
   - Validates if route requires authentication
   - Redirects unauthenticated users to `/sign-in`

2. **Session Validation**
   - Verifies JWT token validity
   - Checks token expiration
   - Handles malformed tokens gracefully

3. **Role-Based Access Control**
   - Validates user role against route requirements
   - Redirects unauthorized users to `/unauthorized`

4. **Session Management**
   - Refreshes valid sessions on GET requests
   - Invalidates sessions on role changes
   - Clears invalid sessions

5. **Access Logging**
   - Logs all access attempts (successful and failed)
   - Tracks IP addresses and user agents
   - Records metadata for audit purposes

## Access Logging System

### Database Schema (`access_logs` table)
```sql
CREATE TABLE access_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  route_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata TEXT -- JSON string
);
```

### Event Types
- `login` - User successfully authenticated
- `access_granted` - User accessed protected route
- `access_denied` - User denied access to route
- `logout` - User session terminated
- `session_invalidated` - Session invalidated due to role change

### Logged Information
- User ID and role
- Requested route
- Event type and timestamp
- Client IP address
- User agent string
- Additional metadata (error details, role changes, etc.)

## Security Compliance

### GDPR Compliance
- ✅ Only authenticated users are logged
- ✅ Anonymous access attempts are not stored in database
- ✅ Personal data is minimal (user ID reference only)
- ✅ Access logs can be purged per data retention policies

### OWASP Best Practices
- ✅ Secure session management
- ✅ Role-based access control
- ✅ Input validation and sanitization
- ✅ Comprehensive audit logging
- ✅ Secure cookie settings (production)
- ✅ Error handling without information disclosure

## Session Security

### JWT Token Management
- Tokens include user ID, role, and expiration
- 24-hour token lifetime with automatic refresh
- Secure cookie settings in production
- HTTPOnly flags to prevent XSS

### Role Change Detection
- Previous role stored in session for comparison
- Immediate session invalidation on role change
- Forced re-authentication required
- Access logged as `session_invalidated`

## Monitoring & Alerting

### Access Log Queries
```bash
# View recent access logs
pnpm db:logs

# Run security tests
pnpm test:security

# Check access logs in database
pnpm db:studio
```

### Log Analysis
- Monitor failed access attempts
- Track unusual access patterns
- Identify potential security threats
- Audit user activity

## Emergency Procedures

### Security Incident Response
1. **Immediate Actions**
   - Check access logs for suspicious activity
   - Verify user sessions and roles
   - Monitor for unauthorized access attempts

2. **Investigation**
   - Query access logs by IP address or user
   - Check for pattern of failed attempts
   - Verify legitimate user activity

3. **Mitigation**
   - Invalidate compromised sessions
   - Update user roles if necessary
   - Block suspicious IP addresses if needed

### Recovery Procedures
1. Reset affected user passwords
2. Audit and verify current user roles
3. Review access logs for timeline of events
4. Update security measures if needed

## Testing Security

### Manual Testing
1. **Role-Based Access**
   - Sign in with different role accounts
   - Attempt to access restricted routes
   - Verify proper redirects occur

2. **Session Management**
   - Test session expiration handling
   - Verify role change invalidation
   - Check automatic session refresh

3. **Access Logging**
   - Monitor database for logged events
   - Verify all access attempts are recorded
   - Check metadata completeness

### Automated Testing
- Security middleware tests in `__tests__/middleware-role-access.test.ts`
- Performance tests for authentication flow
- Integration tests for role-based access

## Configuration

### Environment Variables
- `AUTH_SECRET` - JWT signing secret (required)
- `POSTGRES_URL` - Database connection (required)
- `NODE_ENV` - Environment setting (affects cookie security)

### Security Headers
- Secure cookies in production
- HTTPOnly session cookies
- SameSite cookie protection

## Updates & Maintenance

### Version 2.0.0 (Current)
- ✅ Expanded middleware protection
- ✅ Role-based access control
- ✅ Comprehensive access logging
- ✅ Session invalidation on role changes
- ✅ GDPR/OWASP compliance

### Future Enhancements
- Rate limiting for authentication endpoints
- IP-based access restrictions
- Two-factor authentication
- Advanced threat detection