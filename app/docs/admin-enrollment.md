# Admin Enrollment Page Documentation

## Overview

The Admin Enrollment Page is a comprehensive system for managing student applications and enrollments in the Montessori School Management System. This documentation covers the complete implementation including API endpoints, UI components, database models, and testing strategies.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [UI Components](#ui-components)
- [Testing](#testing)
- [Security](#security)
- [Performance](#performance)
- [Usage Guide](#usage-guide)

## Architecture Overview

The enrollment system follows a modular architecture with clear separation of concerns:

```
├── Database Layer (Drizzle ORM)
│   ├── applications - Student application data
│   ├── enrollments - Active student enrollments
│   ├── waitlist - Waitlisted applications
│   └── applicationDocuments - Supporting documents
├── API Layer (Next.js Route Handlers)
│   ├── /api/applications - Application CRUD operations
│   ├── /api/enrollments - Enrollment management
│   └── /api/students - Student data aggregation
├── UI Layer (React Components)
│   ├── EnrollmentStats - Statistics dashboard
│   ├── SearchAndFilter - Data filtering interface
│   └── EnrollmentTabs - Tabbed content organization
└── Security Layer
    ├── Role-based access control (RBAC)
    ├── Audit logging
    └── Input validation
```

## Database Models

### Applications Table

Stores student application information submitted by parents.

```typescript
export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  childName: varchar('child_name', { length: 100 }).notNull(),
  parentId: integer('parent_id').notNull().references(() => users.id),
  schoolId: integer('school_id').notNull().references(() => schools.id),
  childBirthDate: date('child_birth_date').notNull(),
  parentName: varchar('parent_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  address: text('address').notNull(),
  preferredStartDate: date('preferred_start_date').notNull(),
  status: applicationStatusEnum('status').notNull().default('pending'),
  notes: text('notes'),
  priority: priorityEnum('priority').notNull().default('medium'),
  // ... additional fields
});
```

**Status Values:**
- `pending` - Initial submission
- `under_review` - Being evaluated by staff
- `interview_scheduled` - Parent/child interview arranged
- `approved` - Application accepted
- `rejected` - Application declined
- `waitlisted` - Added to waiting list

**Priority Levels:**
- `low` - Standard processing
- `medium` - Normal priority (default)
- `high` - Expedited review
- `urgent` - Immediate attention required

### Enrollments Table

Tracks active student enrollments with financial and classroom details.

```typescript
export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').notNull().references(() => applications.id),
  childId: integer('child_id').notNull().references(() => children.id),
  schoolId: integer('school_id').notNull().references(() => schools.id),
  parentId: integer('parent_id').notNull().references(() => users.id),
  enrollmentDate: date('enrollment_date').notNull(),
  status: enrollmentStatusEnum('status').notNull().default('active'),
  classroom: varchar('classroom', { length: 100 }),
  tuitionAmount: integer('tuition_amount'), // in cents
  discountAmount: integer('discount_amount'), // in cents
  // ... additional fields
});
```

**Status Values:**
- `active` - Currently enrolled
- `inactive` - Temporarily not attending
- `graduated` - Completed program
- `transferred` - Moved to another school
- `withdrawn` - Left the program

## API Endpoints

### Applications API

#### GET /api/applications
Retrieve applications with filtering and pagination.

**Query Parameters:**
- `status` - Filter by application status
- `search` - Search by child or parent name
- `priority` - Filter by priority level
- `limit` - Results per page (max 100, default 50)
- `offset` - Pagination offset

**Response:**
```json
{
  "applications": [
    {
      "id": 1,
      "childName": "Emma Johnson",
      "parentName": "Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "status": "pending",
      "priority": "medium",
      "submittedAt": "2024-01-15T10:30:00Z",
      "parent": { "id": 1, "name": "Sarah Johnson" },
      "school": { "id": 1, "name": "Montessori Academy" }
    }
  ],
  "total": 25,
  "stats": {
    "pending": 10,
    "under_review": 5,
    "approved": 8,
    "rejected": 2
  }
}
```

#### POST /api/applications
Create a new application.

**Request Body:**
```json
{
  "childName": "Emma Johnson",
  "childBirthDate": "2020-03-15",
  "parentName": "Sarah Johnson",
  "email": "sarah.johnson@example.com",
  "phone": "555-123-4567",
  "address": "123 Oak Street, Springfield, ST 12345",
  "preferredStartDate": "2024-09-01",
  "notes": "Child has prior Montessori experience",
  "priority": "medium"
}
```

### Enrollments API

#### GET /api/enrollments
Retrieve enrollments with comprehensive filtering.

**Query Parameters:**
- `status` - Filter by enrollment status
- `classroom` - Filter by classroom assignment
- `search` - Search by child or parent name
- `limit` - Results per page
- `offset` - Pagination offset

**Response:**
```json
{
  "enrollments": [
    {
      "id": 1,
      "enrollmentDate": "2024-01-08",
      "status": "active",
      "classroom": "Toddler Room A",
      "tuitionAmount": 150000,
      "child": {
        "id": 1,
        "firstName": "Emma",
        "lastName": "Johnson",
        "age": 4
      },
      "parent": {
        "id": 1,
        "name": "Sarah Johnson",
        "email": "sarah.johnson@example.com"
      }
    }
  ],
  "stats": {
    "active": 85,
    "inactive": 5,
    "newThisMonth": 12,
    "totalTuition": 12750000
  },
  "classrooms": [
    { "classroom": "Toddler Room A", "count": 15 },
    { "classroom": "Primary Room B", "count": 20 }
  ]
}
```

#### POST /api/enrollments
Create a new enrollment from an approved application.

**Request Body:**
```json
{
  "applicationId": 1,
  "childId": 1,
  "enrollmentDate": "2024-09-01",
  "classroom": "Toddler Room A",
  "tuitionAmount": 150000,
  "discountAmount": 15000,
  "notes": "Sibling discount applied"
}
```

### Students API

#### GET /api/students
Retrieve student data with enrollment information.

**Query Parameters:**
- `classroom` - Filter by classroom
- `active` - Filter by active status (true/false)
- `search` - Search by student name
- `limit` - Results per page
- `offset` - Pagination offset

## UI Components

### EnrollmentStats Component

Displays key enrollment metrics and statistics.

**Features:**
- Real-time enrollment counts by status
- Monthly enrollment trends
- Revenue calculations
- Classroom capacity overview

**Props:**
```typescript
interface EnrollmentStatsProps {
  stats: {
    active: number;
    inactive: number;
    graduated: number;
    withdrawn: number;
    newThisMonth: number;
    totalTuition: number;
  };
  classrooms: Array<{
    classroom: string;
    count: number;
  }>;
}
```

### SearchAndFilter Component

Provides advanced filtering and search capabilities.

**Features:**
- Text search across multiple fields
- Status filtering with multi-select
- Classroom filtering
- Priority level filtering
- Date range filtering
- Export functionality

**Props:**
```typescript
interface SearchAndFilterProps {
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  availableClassrooms: string[];
  isLoading?: boolean;
}
```

### EnrollmentTabs Component

Organizes different enrollment-related views in tabs.

**Features:**
- Applications tab - Pending and reviewed applications
- Active Enrollments tab - Currently enrolled students
- Waitlist tab - Students awaiting enrollment
- Documents tab - Application supporting documents

**Props:**
```typescript
interface EnrollmentTabsProps {
  activeTab: 'applications' | 'enrollments' | 'waitlist' | 'documents';
  onTabChange: (tab: string) => void;
  applications: Application[];
  enrollments: Enrollment[];
  waitlist: WaitlistEntry[];
  documents: ApplicationDocument[];
}
```

## Testing

### Test Coverage

The enrollment system has comprehensive test coverage including:

1. **Contract Tests** (`enrollment-api.contract.test.ts`)
   - API endpoint compliance
   - Response schema validation
   - Parameter handling

2. **Integration Tests** (`enrollment-components.integration.test.tsx`)
   - Component rendering with real data
   - User interaction flows
   - Error state handling

3. **Unit Tests** (`enrollment-model.unit.test.ts`)
   - Data model validation
   - Enum value testing
   - Type safety verification

4. **Error Handling Tests** (`enrollment-api-error.unit.test.ts`)
   - Database failure scenarios
   - Validation error handling
   - Security error responses

5. **Performance Tests** (`enrollment-api.performance.test.ts`)
   - Response time validation (<200ms p95)
   - Concurrent request handling
   - Database query optimization

### Running Tests

```bash
# Run all enrollment tests
pnpm test run __tests__/enrollment*

# Run specific test suites
pnpm test run __tests__/enrollment-api.contract.test.ts
pnpm test run __tests__/enrollment-components.integration.test.tsx
pnpm test run __tests__/enrollment-model.unit.test.ts

# Run with coverage
pnpm test run --coverage __tests__/enrollment*

# Run performance tests
pnpm test run __tests__/enrollment-api.performance.test.ts
```

## Security

### Role-Based Access Control (RBAC)

Access to enrollment functionality is restricted by user role:

- **Admin**: Full access to all enrollment operations
- **Teacher**: Read access to enrollments and applications
- **Parent**: No access to admin enrollment features

### Data Protection

1. **Input Validation**: All inputs validated using Zod schemas
2. **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
3. **Audit Logging**: All enrollment actions logged with user details
4. **Data Encryption**: Sensitive data encrypted at rest and in transit

### Audit Trail

All enrollment operations are logged including:
- User ID and role
- Action performed (create, update, delete)
- Timestamp and IP address
- Before/after data states for updates

## Performance

### Optimization Strategies

1. **Database Indexing**
   - Primary keys and foreign keys
   - Search fields (name, email)
   - Status and date columns for filtering

2. **Query Optimization**
   - Eager loading of related data
   - Pagination for large result sets
   - Efficient counting queries

3. **Caching Strategy**
   - Static data caching (classrooms, schools)
   - API response caching for read operations
   - Client-side data caching

### Performance Targets

- API response time: <200ms (95th percentile)
- Database query time: <50ms average
- Page load time: <2 seconds
- Search results: <500ms

## Usage Guide

### Creating a New Application

1. Navigate to Admin > Enrollment
2. Click "New Application" button
3. Fill out application form:
   - Child information (name, birth date)
   - Parent contact details
   - Preferred start date
   - Additional notes
4. Set priority level if needed
5. Submit application

### Processing Applications

1. Go to Applications tab
2. Filter by status: "Pending" or "Under Review"
3. Click on application to view details
4. Review application information
5. Update status:
   - Schedule interview if needed
   - Approve for enrollment
   - Reject with reason
   - Add to waitlist

### Creating Enrollments

1. From approved applications, click "Enroll"
2. Select or create child profile
3. Set enrollment details:
   - Start date
   - Classroom assignment
   - Tuition amount
   - Any discounts
4. Add enrollment notes
5. Confirm enrollment

### Managing Waitlist

1. Go to Waitlist tab
2. View waiting families by position
3. Notify families when spots available
4. Move from waitlist to enrollment
5. Set expiration dates for responses

### Generating Reports

1. Use filters to select data range
2. Export filtered results
3. Generate enrollment statistics
4. Create financial reports
5. Print enrollment contracts

## API Integration Examples

### Fetching Applications

```typescript
// Fetch pending applications
const response = await fetch('/api/applications?status=pending&limit=25');
const { applications, total, stats } = await response.json();

// Search applications
const searchResponse = await fetch('/api/applications?search=Johnson');
const searchResults = await searchResponse.json();
```

### Creating Enrollment

```typescript
const enrollmentData = {
  applicationId: 1,
  childId: 1,
  enrollmentDate: '2024-09-01',
  classroom: 'Toddler Room A',
  tuitionAmount: 150000,
  notes: 'New student orientation scheduled'
};

const response = await fetch('/api/enrollments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(enrollmentData)
});

const result = await response.json();
```

### Error Handling

```typescript
try {
  const response = await fetch('/api/applications', {
    method: 'POST',
    body: JSON.stringify(applicationData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create application');
  }

  const result = await response.json();
  // Handle success
} catch (error) {
  console.error('Application creation failed:', error);
  // Show user-friendly error message
}
```

## Troubleshooting

### Common Issues

1. **Applications not appearing**
   - Check user role permissions
   - Verify database connection
   - Review filter settings

2. **Enrollment creation fails**
   - Ensure application is approved
   - Verify child profile exists
   - Check for duplicate enrollments

3. **Performance issues**
   - Review database query plans
   - Check for missing indexes
   - Monitor memory usage

4. **Authentication errors**
   - Verify JWT token validity
   - Check role assignments
   - Review middleware configuration

### Debug Information

Enable debug logging by setting environment variable:
```bash
DEBUG=enrollment:*
```

View recent enrollment activity:
```bash
pnpm db:logs
```

## Future Enhancements

### Planned Features

1. **Bulk Operations**
   - Mass enrollment processing
   - Batch status updates
   - Bulk email notifications

2. **Advanced Reporting**
   - Custom report builder
   - Scheduled report generation
   - Data visualization dashboard

3. **Integration Capabilities**
   - Parent portal API
   - Payment processing integration
   - Document management system

4. **Workflow Automation**
   - Automated status transitions
   - Email notifications
   - Deadline reminders

### API Extensions

1. **Webhook Support**
   - Application status changes
   - Enrollment confirmations
   - Payment notifications

2. **Bulk API Endpoints**
   - Batch application processing
   - Mass enrollment updates
   - Bulk data exports

3. **Real-time Updates**
   - WebSocket connections
   - Live data synchronization
   - Push notifications

## Conclusion

The Admin Enrollment Page provides a comprehensive solution for managing student applications and enrollments in the Montessori School Management System. With its robust API layer, intuitive UI components, and comprehensive testing coverage, it offers a production-ready foundation for educational institution management.

For additional support or feature requests, please refer to the project's issue tracking system or contact the development team.