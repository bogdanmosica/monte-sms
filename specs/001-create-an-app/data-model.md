# Data Model: Authentication & RBAC

## Entities

### User
- id: UUID
- email: string
- password_hash: string
- role: enum (Parent, Teacher, Admin)
- school_id: UUID (FK)
- created_at: datetime
- updated_at: datetime

### School
- id: UUID
- name: string
- address: string
- created_at: datetime
- updated_at: datetime

### Child
- id: UUID
- name: string
- birthdate: date
- school_id: UUID (FK)
- parent_id: UUID (FK)
- created_at: datetime
- updated_at: datetime

### Session
- id: UUID
- user_id: UUID (FK)
- expires_at: datetime
- created_at: datetime

## Relationships
- User (Parent) → Child (one-to-many)
- User (Teacher) → School (many-to-one)
- User (Admin) → School (one-to-one)
- Child → School (many-to-one)
- Session → User (many-to-one)

## Validation Rules
- Email must be unique per user
- Password must meet security requirements (min length, complexity)
- Role must be one of Parent, Teacher, Admin
- School_id must exist for all users and children
- Parent can only access their own children
- Teacher can only access children in their school
- Admin can access all data for their school

---
Ready for contract and test generation.
