# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Reference: `.specify/memory/constitution.md` - verify feature complies with all principles.

### Core Values Compliance

- [ ] **Clarity Over Complexity**: Design uses clear, descriptive names and simple logic
- [ ] **Server-First Performance**: Heavy work done on server, appropriate caching strategy defined
  - [ ] Caching strategy documented (semi-static 30-60s, rarely-changing 5min, user-specific short/none)
  - [ ] SSR mutations use two-step invalidation: `invalidate()` + `router.refresh()`
- [ ] **One Job, One Place (SOLID Architecture)**: Modular architecture with clear separation
  - [ ] Forms follow mandatory file organization (_components, _hooks, _schemas, _utils, _constants)
  - [ ] No SOLID violations: forms <100 lines UI-only, mutations in hooks, schemas extracted
  - [ ] Magic numbers extracted to constants file
  - [ ] Default values in utils, not hardcoded
  - [ ] Business logic separated from UI rendering
- [ ] **Flexible Testing**: Testing strategy defined (before/during/after - all features require tests before merge)
- [ ] **Extend, Don't Modify**: New features add code, don't change existing working code
- [ ] **Security From the Start**: Input validation and authorization checks at every entry point
  - [ ] User permissions checked server-side (middleware, tRPC, Server Components)
  - [ ] All user input validated with Zod schemas
- [ ] **Track Everything Important**: Logging strategy defined for errors and significant events
  - [ ] Winston logger used ONLY in server-side code (never in Client Components)
  - [ ] Error messages to users in Spanish, technical logs in English

### Language & Communication

- [ ] Code/comments/commits in English only
- [ ] UI text in Spanish (es-LA) only
- [ ] Commit messages follow Conventional Commits format

### Technology Constraints

- [ ] Uses required stack: Next.js 15 (App Router), TypeScript (strict), React 19, tRPC, Prisma, PostgreSQL
- [ ] No prohibited technologies (Vue/Angular/Svelte, non-TailwindCSS frameworks, Winston in browser)
- [ ] UI components use Shadcn/ui + Radix UI + TailwindCSS

### Quality Gates

- [ ] TypeScript strict mode enabled, no type errors expected
- [ ] Biome/Ultracite formatting rules followed
- [ ] Tests planned for all user journeys (unit/integration/E2E as appropriate)
- [ ] Changelog entry planned for user-facing changes
- [ ] Migration notes prepared if breaking changes

### Principle Priority Resolution

If principles conflict, documented resolution following priority order:
1. Security From the Start (non-negotiable)
2. One Job, One Place (SOLID Architecture) (maintainability and testability)
3. Clarity Over Complexity
4. Server-First Performance
5. Flexible Testing
6. Extend, Don't Modify
7. Track Everything Important

**Result**: ✅ PASS / ⚠️ VIOLATIONS REQUIRE JUSTIFICATION (see Complexity Tracking section)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
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

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
