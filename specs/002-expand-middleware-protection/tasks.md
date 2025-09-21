# Tasks: Expand Middleware Protection to All Authenticated Routes for Available Roles

**Input**: Design documents from `/specs/002-expand-middleware-protection/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
2. Load optional design documents: data-model.md, contracts/, research.md, quickstart.md
3. Generate tasks by category: Setup, Tests, Core, Integration, Polish
4. Apply task rules: [P] for parallel, sequential for same file
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
9. Return: SUCCESS (tasks ready for execution)
```

## Phase 3.1: Setup
- [x] T001 Ensure all dependencies are installed (Next.js, Auth.js, Drizzle ORM, Vitest, shadcn/ui) in `package.json` ✅
- [x] T002 [P] Configure linting and formatting tools (Biome, ESLint, Prettier) in `app/biome.json`, `app/package.json` ✅

## Phase 3.2: Tests First (TDD)
- [x] T003 [P] Write failing contract test for middleware role-based access in `__tests__/middleware-role-access.test.ts` ✅
- [x] T004 [P] Write integration test for session invalidation on role change in `__tests__/middleware-role-access.test.ts` ✅
- [x] T005 [P] Write integration test for redirect on denied access in `__tests__/middleware-role-access.test.ts` ✅
- [x] T006 [P] Write integration test for logging access events in `__tests__/middleware-role-access.test.ts` ✅

## Phase 3.3: Core Implementation
- [x] T007 [P] Implement User entity (already existed in schema) ✅
- [x] T008 [P] Implement Route entity in `lib/db/route.ts` based on data-model.md ✅
- [x] T009 [P] Implement AccessLog entity in `lib/db/access-log.ts` based on data-model.md ✅
- [x] T010 Update middleware in `app/middleware.ts` to enforce role-based access for all authenticated routes ✅
- [x] T011 Update middleware to invalidate session on role change in `app/middleware.ts` ✅
- [x] T012 Update middleware to redirect users to unauthorized page on denied access in `app/middleware.ts` ✅
- [x] T013 Update middleware to log all authentication and access events in `app/middleware.ts` ✅

## Phase 3.4: Integration
- [x] T014 Integrate AccessLog entity with database in `lib/db/access-log.ts` ✅
- [x] T015 Integrate middleware with Auth.js session management in `app/middleware.ts` ✅
- [x] T016 Integrate middleware with Drizzle ORM for role and session checks in `app/middleware.ts` ✅

## Phase 3.5: Polish
- [x] T017 [P] Write unit tests for User, Route, and AccessLog entities in `__tests__/middleware-role-access.test.ts` ✅
- [x] T018 [P] Write performance tests for middleware (existing performance tests updated) ✅
- [x] T019 [P] Update documentation in `README.md` and `specs/002-expand-middleware-protection/quickstart.md` ✅
- [x] T020 [P] Review and refactor code for maintainability and accessibility ✅

## Parallel Execution Example
```
# Launch T003-T006 together:
Task: "Write failing contract test for middleware role-based access in specs/002-expand-middleware-protection/contracts/middleware-role-access.test.ts"
Task: "Write integration test for session invalidation on role change in specs/002-expand-middleware-protection/contracts/middleware-role-access.test.ts"
Task: "Write integration test for redirect on denied access in specs/002-expand-middleware-protection/contracts/middleware-role-access.test.ts"
Task: "Write integration test for logging access events in specs/002-expand-middleware-protection/contracts/middleware-role-access.test.ts"

# Launch T007-T009 together:
Task: "Implement User entity in lib/db/user.ts"
Task: "Implement Route entity in lib/db/route.ts"
Task: "Implement AccessLog entity in lib/db/access-log.ts"
```

## Dependencies
- Setup (T001-T002) before everything
- Tests (T003-T006) before implementation (T007-T013)
- Entities (T007-T009) before integration (T014-T016)
- Implementation before polish (T017-T020)
- No [P] tasks modify the same file concurrently

## Validation Checklist
- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
