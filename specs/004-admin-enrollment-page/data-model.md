# Data Model – Admin Enrollment Page Refactor

## Entities

### Enrollment
- id: string (UUID)
- studentId: string
- enrollmentDate: date
- status: enum (pending, approved, interview_scheduled, rejected)
- classLevel: string
- adminId: string

### Application
- id: string (UUID)
- childName: string
- parentName: string
- email: string
- phone: string
- address: string
- birthdate: date
- age: number
- appliedDate: date
- status: enum (pending, approved, interview_scheduled, rejected)
- preferredStartDate: date
- notes: string

### Student
- id: string (UUID)
- name: string
- age: number
- classroom: string

### AdminUser
- id: string (UUID)
- name: string
- role: enum (admin)
- permissions: string[]

## Relationships
- Enrollment.studentId → Student.id
- Enrollment.adminId → AdminUser.id
- Application.childName/parentName → Student/Parent (future join)

## Validation Rules
- Enrollment: No duplicate (same studentId + classLevel + active term)
- Application: Valid email, phone, birthdate, age
- Student: Unique name per classroom
