# Tasks: Admin Dashboard Refactor & Data Integration

**Input**: Design documents from `/specs/003-in-the-current/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
2. Load optional design documents: data-model.md, contracts/, research.md, quickstart.md
3. Generate tasks by category: Setup, Tests, Core, Integration, Polish
4. Apply task rules: [P] for parallel, sequential for dependencies
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
9. Return: SUCCESS (tasks ready for execution)
```

## Phase 3.1: Setup
- [ ] T001 Create admin dashboard feature branch and structure per plan.md
- [ ] T002 Initialize Next.js 15 project dependencies (Auth.js, Drizzle ORM, shadcn/ui, Vitest)
- [ ] T003 [P] Configure linting and formatting tools (Biome, Prettier, ESLint)

## Phase 3.2: Tests First (TDD)
- [x] T004 [P] Write contract test for GET /api/admin/cards in `specs/003-in-the-current/contracts/admin-dashboard-api.contract.test.ts`
- [x] T005 [P] Write contract test for GET /api/admin/card/:id in `specs/003-in-the-current/contracts/admin-dashboard-api.contract.test.ts`
- [x] T006 [P] Write contract test for POST /api/admin/card/:id/action in `specs/003-in-the-current/contracts/admin-dashboard-api.contract.test.ts`
- [x] T007 [P] Write integration test for dashboard metrics in `__tests__/admin-dashboard-metrics.test.ts`
- [x] T008 [P] Write integration test for dashboard activities in `__tests__/admin-dashboard-activities.test.ts`
- [x] T009 [P] Write integration test for dashboard alerts in `__tests__/admin-dashboard-alerts.test.ts`

## Phase 3.3: Core Implementation
- [x] T010 [P] Create Drizzle ORM models for AdminUser, AdminCard, User, Class, Payment in `app/lib/db/models.ts`
- [x] T011 [P] Implement GET /api/admin/cards endpoint in `app/api/admin/cards/route.ts`
- [x] T012 [P] Implement GET /api/admin/card/:id endpoint in `app/api/admin/card/[id]/route.ts`
- [x] T013 [P] Implement POST /api/admin/card/:id/action endpoint in `app/api/admin/card/[id]/action/route.ts`
- [x] T014 [P] Implement GET /api/admin/metrics endpoint in `app/api/admin/metrics/route.ts`
- [x] T015 [P] Implement GET /api/admin/activities endpoint in `app/api/admin/activities/route.ts`
- [x] T016 [P] Implement GET /api/admin/alerts endpoint in `app/api/admin/alerts/route.ts`
- [x] T017 [P] Implement POST /api/admin/staff endpoint in `app/api/admin/staff/route.ts`
- [x] T018 [P] Implement POST /api/admin/enrollment endpoint in `app/api/admin/enrollment/route.ts`
- [x] T019 [P] Implement POST /api/admin/payment endpoint in `app/api/admin/payment/route.ts`
- [x] T020 [P] Implement POST /api/admin/report endpoint in `app/api/admin/report/route.ts`
- [x] T021 [P] Implement GET /api/admin/settings endpoint in `app/api/admin/settings/route.ts`
- [x] T022 [P] Implement POST /api/admin/settings endpoint in `app/api/admin/settings/route.ts`

## Phase 3.4: Integration
- [x] T023 Connect Drizzle ORM models to endpoints and services in `app/lib/db/`
- [x] T024 Implement Auth.js RBAC middleware for all admin endpoints in `app/middleware.ts`
- [x] T025 Implement structured logging for all admin API actions in `app/lib/logging.ts`
- [x] T026 Ensure accessibility and shadcn/ui best practices in all dashboard components in `components/ui/`

## Phase 3.5: Polish
- [x] T027 [P] Write unit tests for all model validation in `__tests__/admin-models.unit.test.ts`
- [x] T028 [P] Write performance tests for dashboard endpoints in `__tests__/admin-dashboard.performance.test.ts`
- [x] T029 [P] Update documentation for admin dashboard API in `docs/admin-dashboard-api.md`
- [x] T030 [P] Manual test and review for UI consistency and accessibility in `app/(admin)/dashboard`

## Parallel Example
```
# Launch T004-T006 together:
Task: "Contract test for GET /api/admin/cards"
Task: "Contract test for GET /api/admin/card/:id"
Task: "Contract test for POST /api/admin/card/:id/action"

# Launch T010-T022 together (different files):
Task: "Create Drizzle ORM models"
Task: "Implement GET /api/admin/cards endpoint"
Task: "Implement GET /api/admin/card/:id endpoint"
...etc.
```

## Dependencies
- Tests (T004-T009) before implementation (T010-T022)
- Models (T010) before endpoints (T011-T022)
- Auth middleware (T024) before endpoint access
- Logging (T025) after endpoints
- Polish (T027-T030) after all implementation

## Validation Checklist
- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
