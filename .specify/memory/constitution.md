# Montessori Kindergarten School Management System Constitution

## Core Principles

### I. Modern Web Stack
All development uses Next.js 15, Tailwind CSS, shadcn/ui, and Drizzle ORM with PostgreSQL. Code must follow best practices for scalability, maintainability, and accessibility. Use latest stable versions and official documentation for reference.

### II. Library-First Architecture
Every feature is developed as a standalone, reusable module or library. Modules must be self-contained, independently testable, and well-documented. Avoid monolithic code; prefer composability and clear separation of concerns.

### III. CLI & API Interface
All core modules expose functionality via CLI and RESTful/GraphQL APIs. Use text I/O protocols: stdin/args → stdout, errors → stderr. Support both JSON and human-readable formats for interoperability.

### IV. Test-First Development (NON-NEGOTIABLE)
Test-Driven Development (TDD) is mandatory. Write tests before implementation. All tests must be user-approved and fail before code is written. Strictly follow Red-Green-Refactor cycle. Use integration, unit, and contract tests for all modules.

### V. Integration & Contract Testing
Integration tests are required for:
- New module contracts
- Contract changes
- Inter-service communication
- Shared schemas
- Database migrations (Drizzle/Postgres)

### VI. Observability & Logging
Implement structured logging and error handling. Use text I/O for debuggability. All API endpoints and CLI commands must log actions, errors, and performance metrics. Ensure traceability for all user and system actions.

### VII. Versioning & Breaking Changes
Use semantic versioning (MAJOR.MINOR.PATCH). Document all breaking changes and migrations. Backward compatibility is required unless justified and approved.

### VIII. Simplicity & Accessibility
Prioritize simple, intuitive interfaces. Follow YAGNI (You Aren't Gonna Need It) principles. Ensure accessibility (WCAG) for all user-facing components. Use Tailwind and shadcn/ui best practices for UI/UX.

## Additional Constraints

- Technology stack: Next.js 15, Tailwind CSS, shadcn/ui, Drizzle ORM, PostgreSQL
- Security: Follow OWASP guidelines, secure authentication, and authorization for all users (staff, parents, admins)
- Performance: Optimize for fast load times, efficient database queries, and responsive UI
- Compliance: Adhere to local data protection and privacy laws (e.g., GDPR)
- Deployment: Use CI/CD pipelines, automated testing, and staging environments before production

## Development Workflow

- All code changes require peer review and must pass all tests
- Use feature branches and pull requests for all changes
- Enforce code style and linting (Biome, ESLint, Prettier)
- Automated testing gates for unit, integration, and end-to-end tests
- Deployment approval required for production releases
- Documentation must be updated with every feature or change

## Governance

This constitution supersedes all other practices. Amendments require documentation, approval, and a migration plan. All PRs/reviews must verify compliance. Complexity must be justified. Use the project guidance file for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2025-09-18 | **Last Amended**: 2025-09-18