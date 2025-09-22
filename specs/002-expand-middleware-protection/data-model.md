# Data Model: Middleware Protection Expansion

## Entities

### User
- userId: string
- role: enum (Parent, Teacher, Admin)
- sessionStatus: enum (active, expired, invalid)

### Route
- routeId: string
- requiredRoles: array of enum (Parent, Teacher, Admin)

### AccessLog
- logId: string
- userId: string
- routeId: string
- eventType: enum (login, access_granted, access_denied, logout)
- timestamp: datetime

## Relationships
- User has many AccessLogs
- Route has many AccessLogs

## Validation Rules
- Only authenticated users with correct role can access protected routes
- All access events must be logged
- Session must be invalidated on role change
