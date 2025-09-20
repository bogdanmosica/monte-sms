# Quickstart: Montessori School Management Platform

## Prerequisites
- Node.js 18+
- PostgreSQL database
- pnpm package manager

## Quick Setup
```bash
# Install dependencies
cd app && pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection details

# Run database setup
pnpm db:generate
pnpm db:push

# Start development server
pnpm dev
```

## Running Tests
```bash
# Run all tests
pnpm test:run

# Run specific test suites
pnpm test:run __tests__/auth-rbac.test.ts      # Authentication & RBAC tests (27 tests)
pnpm test:run __tests__/performance.test.ts    # Performance tests (14 tests)

# Run tests in watch mode
pnpm test
```

## Core Features Implemented

### 🔐 Authentication & RBAC
- JWT-based authentication with role-based access control
- Three user roles: Parent, Teacher, Admin
- Protected API routes with proper authorization
- Session management and logout functionality

### 📊 Database Schema
- **Users**: Authentication and role management
- **Schools**: Montessori school information
- **Children**: Student profiles with emergency contacts and medical info
- **Observations**: Teacher activity logging with Montessori curriculum areas
- **Portfolio**: Learning artifacts and collections for student progress
- **Learning Paths**: Kanban-style developmental tracking

### 🌐 API Routes
- `GET/POST /api/children` - Role-based child management
- `GET/POST/PUT/DELETE /api/children/[id]` - Individual child operations
- `GET/POST /api/observations` - Observation management
- `GET/PUT/DELETE /api/observations/[id]` - Individual observation operations
- Comprehensive error handling and validation

### 📱 Dashboard Systems
- **Teacher Dashboard**: Observation logging, student management, Kanban boards
- **Parent Dashboard**: Child portfolio viewing, progress tracking
- **Admin Dashboard**: School management, billing, staff oversight

### 🛡️ Compliance & Accessibility
- **GDPR Compliance**: Data export, deletion, retention policies
- **WCAG 2.1 Accessibility**: Color contrast, keyboard navigation, ARIA support
- **Security**: Input validation, XSS prevention, audit logging

## API Testing Examples

### Authentication
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@school.com","password":"password"}'

# Access protected route
curl http://localhost:3000/api/children \
  -H "Authorization: Bearer <token>"
```

### Children Management
```bash
# Get children (role-based results)
curl http://localhost:3000/api/children \
  -H "Authorization: Bearer <teacher-token>"

# Create child (teacher/admin only)
curl -X POST http://localhost:3000/api/children \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <teacher-token>" \
  -d '{
    "firstName": "Emma",
    "lastName": "Johnson",
    "birthdate": "2018-05-15",
    "schoolId": 1,
    "parentId": 2,
    "emergencyContact": {
      "name": "Sarah Johnson",
      "relationship": "Mother",
      "phone": "+1-555-0123",
      "canPickup": true
    }
  }'
```

### Observations
```bash
# Create observation
curl -X POST http://localhost:3000/api/observations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <teacher-token>" \
  -d '{
    "childId": 1,
    "title": "Practical Life Activity",
    "description": "Emma demonstrated excellent concentration while pouring water",
    "montessoriArea": "Practical Life",
    "childInterest": "High",
    "concentrationLevel": "Deep",
    "observationDate": "2025-09-19T10:30:00Z"
  }'
```

## Development URLs
- **Application**: http://localhost:3000
- **Teacher Dashboard**: http://localhost:3000/teacher
- **Parent Dashboard**: http://localhost:3000/parent
- **Admin Dashboard**: http://localhost:3000/admin

## File Structure
```
app/
├── lib/
│   ├── db/                    # Database schema and utilities
│   │   ├── schema.ts          # Main schema exports
│   │   ├── school.ts          # School model
│   │   ├── child.ts           # Child model
│   │   ├── observation.ts     # Observation model
│   │   ├── portfolio.ts       # Portfolio model
│   │   ├── learning-path.ts   # Learning path model
│   │   └── gdpr.ts           # GDPR compliance utilities
│   ├── auth/                  # Authentication
│   │   └── middleware.ts      # RBAC and auth utilities
│   ├── hooks/                 # React hooks for data fetching
│   │   ├── use-children.ts    # Children data management
│   │   └── use-observations.ts # Observations data management
│   └── accessibility/         # Accessibility utilities
│       └── a11y-checker.ts    # WCAG compliance checking
├── app/
│   ├── api/                   # API routes
│   │   ├── children/         # Children CRUD endpoints
│   │   └── observations/     # Observations CRUD endpoints
│   ├── (teacher)/            # Teacher dashboard pages
│   ├── (parent)/             # Parent dashboard pages
│   └── (admin)/              # Admin dashboard pages
└── __tests__/                # Test suites
    ├── auth-rbac.test.ts     # Authentication & RBAC tests
    └── performance.test.ts   # Performance tests
```

## Implementation Status ✅
All core features are implemented and tested:
- ✅ 41+ unit tests passing (authentication, validation, GDPR, accessibility)
- ✅ Performance targets met (<200ms for login, <150ms for API calls)
- ✅ RBAC working with proper role restrictions
- ✅ Database schema complete with relationships
- ✅ GDPR compliance framework implemented
- ✅ WCAG 2.1 accessibility validation available

---

For detailed API documentation, see `auth-rbac-openapi.yaml`
For database schema details, see `data-model.md`
For architecture overview, see `spec.md`
