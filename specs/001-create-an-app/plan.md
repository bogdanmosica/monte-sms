# Implementation Plan: Montessori School Management Platform

**Branch**: `001-create-an-app` | **Date**: September 18, 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-create-an-app/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `.github/copilot-instructions.md` for GitHub Copilot)
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

## Summary
A modern SaaS platform for Montessori kindergartens, supporting child-centered learning, parent communication, and school operations. Phase 1 focuses on secure authentication and role-based access for Parent, Teacher, and Admin roles using Auth.js, Next.js API routes, and PostgreSQL with Drizzle ORM.

## Technical Context
**Language/Version**: TypeScript (Next.js 15)
**Primary Dependencies**: Next.js, Tailwind CSS, shadcn/ui, Rombo animations, Auth.js, Drizzle ORM
**Storage**: PostgreSQL
**Testing**: Vitest, Playwright, MSW, Biome
**Target Platform**: Web (Vercel deployment)
**Project Type**: Web (frontend + backend)
**Performance Goals**: Fast login (<200ms), secure session management, scalable to 10k+ users
**Constraints**: RBAC enforced in API routes, secure session handling, GDPR compliance, accessibility (WCAG)
**Scale/Scope**: Multi-tenant SaaS, 3 user roles, school-level data isolation

## Constitution Check
- Stack matches constitution: Next.js 15, Tailwind CSS, shadcn/ui, Drizzle ORM, PostgreSQL
- Library-first architecture: Auth.js and RBAC middleware as reusable modules
- Test-first development: All authentication and RBAC features require failing tests before implementation
- Observability/logging: Structured logging for all auth events
- Security: OWASP guidelines, GDPR compliance, role-based access enforced
- Accessibility: UI components follow WCAG via shadcn/ui
- No violations detected

## Project Structure

### Documentation (this feature)
```
specs/001-create-an-app/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

**Structure Decision**: Web application (frontend + backend)

## Phase 0: Outline & Research
- Research RBAC best practices for Next.js API routes
- Research secure session management with Auth.js
- Research GDPR compliance for school/child data
- Research accessibility for role-based UI components
- Research multi-tenant SaaS patterns for school-level data isolation

## Phase 1: Design & Contracts
- Extract entities: User (role: Parent, Teacher, Admin), Session, School, Child
- Data model: users table with role field, relationships to children/schools
- API contracts: login/logout endpoints, RBAC middleware, protected routes
- Contract tests: failing tests for login, logout, access control, unauthorized access
- Integration scenarios: Parent cannot access teacher/admin routes, Teacher cannot access admin billing, unauthorized users redirected to login
- Quickstart: Steps to run authentication and RBAC tests
- Update `.github/copilot-instructions.md` with new tech context

## Phase 2: Task Planning Approach
- Tasks generated from contracts, data model, quickstart
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass
- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

## Complexity Tracking
No constitution violations detected.

## Progress Tracking
**Phase Status**:
- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
