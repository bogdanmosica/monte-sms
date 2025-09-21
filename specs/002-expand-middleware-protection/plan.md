# Implementation Plan: Expand Middleware Protection to All Authenticated Routes for Available Roles

**Branch**: `002-expand-middleware-protection` | **Date**: September 21, 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-expand-middleware-protection/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
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
Expand middleware protection to all authenticated routes for Parent, Teacher, and Admin roles. The technical approach is to update route-level middleware to enforce role-based access, ensure logging of access events, and handle session expiration and role changes according to the spec and constitution.

## Technical Context
**Language/Version**: TypeScript, Next.js 15
**Primary Dependencies**: Next.js, Auth.js, Drizzle ORM, PostgreSQL, shadcn/ui
**Storage**: PostgreSQL
**Testing**: Vitest (unit, contract, integration)
**Target Platform**: Web (frontend + backend)
**Project Type**: Web application
**Performance Goals**: Fast route protection (<200ms p95), no unauthorized access
**Constraints**: GDPR, OWASP, session invalidation on role change, redirect on denied access
**Scale/Scope**: All authenticated routes for Parent, Teacher, Admin roles

## Constitution Check
- Modern web stack: Next.js, Tailwind, shadcn/ui, Drizzle ORM, PostgreSQL (compliant)
- Library-first architecture: Middleware and RBAC logic modular (compliant)
- CLI & API interface: Not directly relevant for middleware, but logging and error handling must be CLI/API compatible (compliant)
- Test-first development: Contract and integration tests required before implementation (compliant)
- Observability & logging: All access events must be logged (compliant)
- Versioning: No breaking changes to public API, feature branch used (compliant)
- Simplicity & accessibility: Middleware must be simple, maintainable, and accessible (compliant)
- Security: OWASP and GDPR compliance required (compliant)

## Project Structure

### Documentation (this feature)
```
specs/002-expand-middleware-protection/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Web application structure
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
- Research session invalidation on role change for Next.js/Auth.js
- Research best practices for redirecting on denied access
- Research logging strategies for access events in Next.js
- Research GDPR/OWASP compliance for middleware

## Phase 1: Design & Contracts
- Extract entities: User, Route, Access Log
- Design data model for access logs
- Define contract tests for middleware (role-based access, session expiration, denied access)
- Write quickstart.md for middleware update and test execution
- Update `.github/copilot-instructions.md` with any new tech or major changes

## Phase 2: Task Planning Approach
- Tasks will be generated from contracts, data model, and quickstart
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
- [x] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
