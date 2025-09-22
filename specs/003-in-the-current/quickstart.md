# Quickstart: Admin Dashboard Refactor & Data Integration

## Prerequisites
- Next.js 15 project with Auth.js, Drizzle ORM, PostgreSQL, shadcn/ui
- Feature branch: `003-in-the-current`

## Steps
1. Ensure all contract and integration tests for admin dashboard API endpoints and card components are written and failing.
2. Implement Drizzle ORM models for all required entities (User, Class, Payment, etc.).
3. Create API routes under `/api/admin/*` for dashboard data, protected by Auth.js and RBAC middleware.
4. Refactor admin dashboard page (`app/(admin)/dashboard`) to use reusable card components for each data entity.
5. Integrate card components with API routes to fetch and display real-time data.
6. Ensure all UI components follow shadcn/ui and accessibility best practices.
7. Run all tests and ensure they pass before merging.

## Validation
- All contract and integration tests pass
- Admin dashboard displays accurate, real-time data
- UI is consistent, accessible, and modular
- RBAC and security requirements are enforced

---
*Follow TDD and constitutional principles throughout implementation.*
