# Implementation Plan: Admin Dashboard Refactor & Data Integration

**Branch**: `003-in-the-current` | **Date**: September 22, 2025 | **Spec**: [spec.md](D:\Projects\monte-sms\specs\003-in-the-current\spec.md)
**Input**: Feature specification from `/specs/003-in-the-current/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
5. Execute Phase 0 → research.md
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file
7. Re-evaluate Constitution Check section
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

## Summary
Refactor the existing admin dashboard page (`./app/(admin)/*`) by splitting it into reusable card components, integrating real-time data from the database, and ensuring UI consistency and accessibility. Only the dashboard at `/admin` is in scope. The backend uses Next.js 15, Auth.js, Drizzle ORM (PostgreSQL), and shadcn/ui.

## Technical Context
**Language/Version**: TypeScript, Next.js 15
**Primary Dependencies**: Next.js, Auth.js, Drizzle ORM, PostgreSQL, shadcn/ui
**Storage**: PostgreSQL via Drizzle ORM
**Testing**: Vitest (unit, contract, integration)
**Target Platform**: Web (Next.js 15)
**Project Type**: Web (frontend + backend)
**Performance Goals**: Fast load times, real-time data updates, responsive UI
**Constraints**: Accessibility (WCAG), GDPR, OWASP, modular components, TDD required
**Scale/Scope**: Admin dashboard only, single page, scalable for future cards

## Constitution Check
- Modern web stack enforced (Next.js 15, shadcn/ui, Drizzle ORM, PostgreSQL)
- Library-first architecture: All new components must be reusable and independently testable
- CLI & API interface: All backend logic exposed via API routes
- Test-first development: Contract and integration tests must be written before implementation
- Observability & logging: All API endpoints and actions must be logged
- Versioning: Semantic versioning for breaking changes
- Simplicity & accessibility: UI must follow WCAG and shadcn/ui best practices
- Security: Auth.js for authentication, RBAC enforced, OWASP guidelines
- Performance: Efficient queries, responsive UI
- Compliance: GDPR for data handling
- Deployment: CI/CD, automated testing
- Governance: Peer review, documentation, code style, automated testing gates

**Initial Constitution Check: PASS**

## Project Structure

### Documentation (this feature)
```
specs/003-in-the-current/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
app/(admin)/             # Admin dashboard page and components
app/api/                 # API routes for admin dashboard data
lib/db/                  # Drizzle ORM models and database logic
components/ui/           # Reusable card components
__tests__/               # Vitest contract/integration tests
```

**Structure Decision**: Web application (frontend + backend)

## Phase 0: Outline & Research
- Research required for:
  - Specific admin actions per card: view details, edit details, send message, review alerts, process payments, generate reports, add staff/enrollment, manage school settings
  - Data to display/manage in each card: student counts, staff counts, teacher counts, financial metrics (revenue, payments), enrollment stats, recent activities, department distribution, alerts/notifications
  - RBAC requirements for admin dashboard: Only users with the Admin role (UserRole.ADMIN) can access and perform actions on the dashboard; teachers and other roles have restricted access to their own data only
  - Card interactivity: Cards support view, edit, and action buttons (e.g., review, process, add, generate); most cards are interactive, some are read-only for summary metrics
- Best practices for:
  - Next.js 15 componentization
  - Drizzle ORM schema design for admin dashboard
  - API route patterns in Next.js
  - shadcn/ui accessibility and modularity
  - Contract test writing with Vitest

**Output**: research.md with all unknowns resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*
- Extract entities from feature spec → `data-model.md`
- Generate API contracts for admin dashboard actions → `/contracts/`
- Generate contract tests for each API endpoint
- Extract test scenarios from user stories → quickstart.md
- Update agent file with new tech if needed

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass
- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

## Complexity Tracking
*No constitution violations detected. No complexity justification required.*

## Progress Tracking
**Phase Status**:
- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
