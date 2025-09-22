# Admin Dashboard API Documentation

## Overview

The Admin Dashboard API provides comprehensive endpoints for managing a Montessori school management system. All endpoints require admin authentication and are protected by role-based access control.

## Authentication

All API endpoints require authentication with admin role. Requests must include proper JWT tokens via the authentication middleware.

```typescript
// All requests are protected by withRole middleware
export async function GET(request: NextRequest) {
  return await withRole([UserRole.ADMIN], async (req, user) => {
    // Endpoint logic here
  })(request);
}
```

## Base URL

```
/api/admin/
```

## Endpoints

### 1. Dashboard Metrics

**GET** `/api/admin/metrics`

Retrieves comprehensive school metrics for the admin dashboard.

#### Response Schema

```typescript
interface AdminMetrics {
  enrollment: {
    totalStudents: number;
    activeStudents: number;
    newThisMonth: number;
    pendingApplications: number;
  };
  staff: {
    totalStaff: number;
    activeStaff: number;
    teachers: number;
    administrators: number;
  };
  financial: {
    totalRevenue: number;
    pendingPayments: number;
    overdueAmount: number;
    recentPayments: number;
  };
  parent: {
    totalParents: number;
    activeParents: number;
    newParentsThisMonth: number;
  };
  capacity: {
    currentCapacity: number;
    maxCapacity: number;
    utilizationRate: number;
  };
}
```

#### Example Response

```json
{
  "enrollment": {
    "totalStudents": 42,
    "activeStudents": 40,
    "newThisMonth": 5,
    "pendingApplications": 8
  },
  "staff": {
    "totalStaff": 8,
    "activeStaff": 8,
    "teachers": 6,
    "administrators": 2
  },
  "financial": {
    "totalRevenue": 45600,
    "pendingPayments": 12,
    "overdueAmount": 2400,
    "recentPayments": 28
  },
  "parent": {
    "totalParents": 35,
    "activeParents": 33,
    "newParentsThisMonth": 4
  },
  "capacity": {
    "currentCapacity": 40,
    "maxCapacity": 50,
    "utilizationRate": 80
  }
}
```

### 2. Recent Activities

**GET** `/api/admin/activities`

Retrieves recent school activities including access logs and enrollments.

#### Query Parameters

- `limit` (optional): Number of activities to return (default: 20, max: 50)

#### Response Schema

```typescript
interface Activity {
  id: string;
  type: 'login' | 'access_granted' | 'enrollment' | 'payment';
  description: string;
  timestamp: string;
  userName?: string;
  userRole?: string;
  details?: any;
}
```

#### Example Response

```json
{
  "activities": [
    {
      "id": "activity_1",
      "type": "login",
      "description": "Sarah Johnson logged in",
      "timestamp": "2025-01-15T10:30:00Z",
      "userName": "Sarah Johnson",
      "userRole": "teacher"
    },
    {
      "id": "activity_2",
      "type": "enrollment",
      "description": "New enrollment: Emma Smith",
      "timestamp": "2025-01-15T09:15:00Z",
      "details": {
        "childName": "Emma Smith",
        "parentName": "John Smith"
      }
    }
  ],
  "total": 15
}
```

### 3. System Alerts

**GET** `/api/admin/alerts`

Generates system alerts based on current school conditions.

#### Response Schema

```typescript
interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  actionRequired?: boolean;
  actionUrl?: string;
}
```

#### Example Response

```json
{
  "alerts": [
    {
      "id": "alert_1",
      "type": "warning",
      "title": "Overdue Payments",
      "message": "3 payments are overdue and require attention",
      "priority": "high",
      "timestamp": "2025-01-15T10:00:00Z",
      "actionRequired": true,
      "actionUrl": "/admin/payments?status=overdue"
    }
  ],
  "counts": {
    "high": 1,
    "medium": 2,
    "low": 0
  }
}
```

### 4. Staff Management

**GET** `/api/admin/staff`

Retrieves staff members with filtering and pagination.

#### Query Parameters

- `role` (optional): Filter by role ('teacher' | 'admin')
- `limit` (optional): Number of records (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**POST** `/api/admin/staff`

Creates a new staff member.

#### Request Schema

```typescript
interface CreateStaffRequest {
  name: string; // min: 1, max: 100
  email: string; // valid email
  role: 'teacher' | 'admin';
  password: string; // min: 6 characters
}
```

**PUT** `/api/admin/staff?id={staffId}`

Updates staff member information.

#### Request Schema

```typescript
interface UpdateStaffRequest {
  name?: string;
  email?: string;
  role?: 'teacher' | 'admin';
  isActive?: boolean;
}
```

### 5. Enrollment Management

**GET** `/api/admin/enrollment`

Retrieves enrollment applications with filtering.

#### Query Parameters

- `status` (optional): Filter by status ('pending' | 'approved' | 'rejected')
- `limit` (optional): Number of records (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**POST** `/api/admin/enrollment`

Processes an enrollment application.

#### Request Schema

```typescript
interface ProcessEnrollmentRequest {
  childId: number; // min: 1
  action: 'approve' | 'reject';
  notes?: string;
}
```

### 6. Payment Management

**GET** `/api/admin/payment`

Retrieves payment records with filtering and statistics.

#### Query Parameters

- `status` (optional): Filter by status ('pending' | 'paid' | 'overdue' | 'cancelled')
- `parentId` (optional): Filter by parent ID
- `limit` (optional): Number of records (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**POST** `/api/admin/payment`

Creates a new payment record.

#### Request Schema

```typescript
interface CreatePaymentRequest {
  parentId: number; // min: 1
  amount: number; // min: 0.01
  type: 'tuition' | 'fees' | 'materials' | 'other';
  description: string; // min: 1, max: 255
  dueDate?: string; // ISO date string
  notes?: string;
}
```

**PUT** `/api/admin/payment?id={paymentId}`

Updates payment status.

#### Request Schema

```typescript
interface UpdatePaymentRequest {
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
}
```

### 7. Report Generation

**POST** `/api/admin/report`

Generates comprehensive reports for various school aspects.

#### Request Schema

```typescript
interface GenerateReportRequest {
  type: 'enrollment' | 'financial' | 'attendance' | 'staff' | 'activity';
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  format?: 'json' | 'csv' | 'pdf'; // default: 'json'
  includeDetails?: boolean; // default: true
}
```

#### Validation Rules

- Date range cannot exceed 365 days
- Start date must be before end date
- Format 'csv' and 'pdf' return download URLs (implementation pending)

#### Response Schema

```typescript
interface ReportResponse {
  report: {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    format: string;
    generatedAt: string;
    generatedBy: number;
    data: {
      summary: Record<string, number>;
      details?: any[];
    };
  };
}
```

### 8. Settings Management

**GET** `/api/admin/settings`

Retrieves school and system settings.

#### Query Parameters

- `section` (optional): Filter settings ('school' | 'system' | 'all')

**PUT** `/api/admin/settings?section={section}`

Updates school or system settings.

#### School Settings Schema

```typescript
interface SchoolSettings {
  name?: string; // max: 255
  address?: string; // max: 500
  city?: string; // max: 100
  state?: string; // max: 50
  zipCode?: string; // max: 20
  country?: string; // max: 100
  phone?: string; // max: 20
  email?: string; // valid email
  website?: string; // valid URL
  ageRangeMin?: number; // 0-18
  ageRangeMax?: number; // 1-18
  capacity?: number; // 1-500
}
```

#### System Settings Schema

```typescript
interface SystemSettings {
  allowRegistration?: boolean;
  requireEmailVerification?: boolean;
  enableNotifications?: boolean;
  sessionTimeout?: number; // 5-1440 minutes
  maxLoginAttempts?: number; // 3-10
  enablePayments?: boolean;
  enableObservations?: boolean;
  enablePortfolio?: boolean;
  emailFrom?: string; // valid email
  smsEnabled?: boolean;
  autoBackup?: boolean;
  backupFrequency?: 'daily' | 'weekly' | 'monthly';
}
```

**POST** `/api/admin/settings?action={action}`

Performs settings actions.

#### Supported Actions

- `reset-system`: Resets system settings to defaults
- `backup`: Creates a settings backup

## Error Handling

All endpoints follow consistent error response format:

```typescript
interface ErrorResponse {
  error: string;
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created (for POST requests)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Example Error Responses

```json
// Validation Error
{
  "error": "Email is required"
}

// Authentication Error
{
  "error": "Authentication required"
}

// Authorization Error
{
  "error": "Admin access required"
}
```

## Security Features

### Authentication
- All endpoints protected by JWT authentication
- Role-based access control (admin-only)
- Session management with configurable timeouts

### Input Validation
- Zod schema validation for all request bodies
- SQL injection prevention through parameterized queries
- Email format validation
- URL validation for website fields

### Audit Logging
- All admin actions logged via `logAuthEvent()`
- Access tracking for security monitoring
- User activity correlation

## Rate Limiting

- Concurrent request handling tested up to 20 simultaneous requests
- Performance thresholds maintained:
  - Fast operations: < 100ms
  - Acceptable operations: < 500ms
  - Slow operations: < 1000ms

## Database Performance

### Query Optimization
- Parallel database queries for metrics aggregation
- Pagination support for large datasets
- Indexed queries for common filters (role, status, dates)

### Connection Handling
- Graceful handling of database connection delays
- Timeout management for slow queries
- Connection pooling through Drizzle ORM

## Testing Coverage

The API includes comprehensive testing:

- **Contract Tests**: API structure and authentication validation
- **Integration Tests**: Component and API interaction testing
- **Unit Tests**: Model validation and business logic
- **Performance Tests**: Response time and memory usage monitoring

## Migration Notes

### From Mock Data
- All endpoints previously using mock data now query the database
- Maintained backward compatibility for existing frontend components
- Added proper TypeScript interfaces for all responses

### Future Enhancements
- Stripe integration for payment processing
- PDF/CSV report generation
- Real-time notifications via WebSocket
- Advanced analytics and reporting features