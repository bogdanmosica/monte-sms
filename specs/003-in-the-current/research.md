# Research for Admin Dashboard Refactor & Data Integration

## Unknowns & Clarifications
- What specific admin actions must be supported for each card? (e.g., view, edit, delete, create?)
- What data should each card display or manage? (e.g., users, classes, attendance, payments?)
- Are there RBAC requirements for the admin dashboard? (e.g., can all admins access all cards, or are there sub-roles?)
- Should cards be interactive (edit/delete) or read-only?

## Best Practices
- **Next.js 15 Componentization**: Use server components for data fetching, client components for interactivity. Split UI into small, reusable card components. Use shadcn/ui for accessibility and design consistency.
- **Drizzle ORM Schema Design**: Define clear entities for each card (e.g., User, Class, Payment). Use migrations for schema changes. Ensure referential integrity and normalization.
- **API Route Patterns in Next.js**: Use RESTful routes under `/api/admin/*` for dashboard data. Secure endpoints with Auth.js and RBAC middleware.
- **shadcn/ui Accessibility & Modularity**: Follow WCAG guidelines. Use shadcn/ui primitives for all interactive elements. Ensure keyboard and screen reader support.
- **Contract Test Writing with Vitest**: Write failing contract tests for each API endpoint and card component. Use integration tests for user scenarios. Follow Red-Green-Refactor cycle.

## Decisions & Rationale
- **Componentization**: Each card will be a standalone, reusable React component for maintainability and scalability.
- **Data Integration**: Cards will fetch and display data from the database via API routes, using Drizzle ORM for queries.
- **RBAC**: All admin dashboard actions will be protected by role-based access control using Auth.js middleware.
- **Testing**: Contract and integration tests will be written before implementation, using Vitest.

## Alternatives Considered
- **Monolithic dashboard page**: Rejected for maintainability and scalability reasons.
- **Direct DB access from frontend**: Rejected for security and separation of concerns.
- **No RBAC**: Rejected for security and compliance.

---
*All unknowns must be resolved before Phase 1 design.*
