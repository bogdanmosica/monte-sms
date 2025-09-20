# GitHub Copilot Agent Context

## Recent Tech Additions
- Auth.js for authentication and RBAC
- Next.js API routes for backend logic
- PostgreSQL with Drizzle ORM for data storage
- Vitest for contract and integration tests
- shadcn/ui for accessible UI components

## Feature Context
This project implements a Montessori school management SaaS with secure authentication and role-based access for Parent, Teacher, and Admin roles. All authentication and RBAC logic is modular, test-driven, and follows constitutional principles (see `/memory/constitution.md`).

## Implementation Guidance
- Use Auth.js for login/logout and session management
- Enforce RBAC in API routes via middleware
- Store user roles in the users table (Parent, Teacher, Admin)
- Write failing contract tests before implementation
- Use shadcn/ui for all UI components, ensuring accessibility
- Log all authentication and access events
- Follow GDPR and OWASP guidelines for data and security

---
(Keep this file under 150 lines. Update only with new tech or major changes.)
