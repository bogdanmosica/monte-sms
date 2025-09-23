# Phase 0: Research – Admin Enrollment Page Refactor

## Unknowns & Decisions

### 1. Splitting Next.js Page into Components
- Decision: Split `page.tsx` into `EnrollmentStats.tsx`, `SearchAndFilter.tsx`, and `EnrollmentTabs.tsx`.
- Rationale: Improves readability, maintainability, and testability.
- Alternatives: Keep as single file (rejected for complexity).

### 2. Data Model for Enrollment, Application, Student
- Decision: Use Drizzle ORM with PostgreSQL for all entities.
- Rationale: Consistent with project stack and constitution.
- Alternatives: Prisma, direct SQL (rejected for stack consistency).

### 3. API Contract for CRUD Operations
- Decision: RESTful API routes under `/api/enrollment`, `/api/applications`, `/api/students`.
- Rationale: Follows Next.js conventions and project guidance.
- Alternatives: GraphQL (rejected for simplicity).

### 4. UI State Sync Across Components
- Decision: Use React context or props drilling for state sync.
- Rationale: Standard React pattern, easy to test.
- Alternatives: Redux, Zustand (overkill for this scope).

### 5. Error Handling & Logging
- Decision: Log all API actions, errors, and performance metrics per constitution.
- Rationale: Required for audit and debugging.
- Alternatives: Minimal logging (rejected for compliance).

### 6. Accessibility for shadcn/ui
- Decision: Use shadcn/ui components and Tailwind best practices for WCAG compliance.
- Rationale: Required by constitution.
- Alternatives: Custom components (rejected for consistency).

## Summary
All unknowns resolved. Ready for Phase 1 design.
