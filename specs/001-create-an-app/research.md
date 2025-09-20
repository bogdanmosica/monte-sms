# Phase 0 Research: Authentication & RBAC for Montessori SaaS

## Decision: Auth.js for Authentication & RBAC
- **Rationale**: Auth.js is a modern, secure authentication library for Next.js, supporting custom roles and session management. It integrates with Next.js API routes and supports extensible RBAC logic.
- **Alternatives considered**: NextAuth.js (less flexible for custom RBAC), Passport.js (not Next.js-native), custom JWT (more error-prone, less maintainable).

## Decision: RBAC Middleware in Next.js API Routes
- **Rationale**: Middleware allows centralized enforcement of role-based access, reducing code duplication and improving security. Next.js middleware is performant and easy to maintain.
- **Alternatives considered**: Per-route guards (scattered logic), client-side checks (insecure), custom Express middleware (not idiomatic for Next.js).

## Decision: PostgreSQL with Drizzle ORM
- **Rationale**: PostgreSQL is robust and scalable for multi-tenant SaaS. Drizzle ORM provides type-safe queries and schema migrations, improving reliability and developer experience.
- **Alternatives considered**: Prisma (heavier, less type-safe), TypeORM (less modern), MongoDB (not relational, less suitable for RBAC).

## Decision: GDPR Compliance for School/Child Data
- **Rationale**: Montessori schools handle sensitive child data. GDPR compliance ensures legal operation and builds trust with parents and schools.
- **Alternatives considered**: No compliance (unacceptable risk), CCPA (US-centric, less relevant for EU schools).

## Decision: Accessibility (WCAG) for Role-Based UI
- **Rationale**: shadcn/ui and Tailwind CSS support accessible UI components. Accessibility is required by constitution and improves usability for all users.
- **Alternatives considered**: Custom UI (risk of non-compliance), ignoring accessibility (violates constitution).

## Decision: Multi-Tenant SaaS Patterns
- **Rationale**: Each school must have isolated data. Multi-tenant patterns (school_id in user/child tables) ensure data separation and security.
- **Alternatives considered**: Single-tenant (not scalable), row-level security (PostgreSQL, more complex but possible for future).

## Research Tasks
- RBAC best practices for Next.js API routes
- Auth.js session management and custom roles
- GDPR requirements for child/school data
- Accessibility testing for shadcn/ui components
- Multi-tenant SaaS data isolation patterns

---
All major unknowns resolved. Ready for Phase 1 design.
