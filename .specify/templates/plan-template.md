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

This feature must align with Glasify Lite Constitution v2.0.0 principles:

### Single Responsibility (SRP)
- [ ] Each component/module has ONE clear responsibility
- [ ] Business logic is separated from UI and data access
- [ ] Tests and docs exist for each public abstraction

### Open/Closed (OCP)
- [ ] New features use extension patterns (hooks, procedures, adapters)
- [ ] No modification of stable modules unless documented with migration plan
- [ ] Breaking API changes include MAJOR version bump + migration guide

### Pragmatic Testing Discipline
- [ ] Tests MAY be written before/during/after implementation
- [ ] Tests MUST cover happy paths and critical edge cases before merge
- [ ] Unit tests run in CI
- [ ] Integration/contract tests for cross-service changes

### Server-First Architecture (Next.js 15)
- [ ] Pages are Server Components by default (`page.tsx`)
- [ ] Client Components (`'use client'`) ONLY for: React hooks, browser APIs, event handlers, client-required libraries
- [ ] Public pages export `metadata` for SEO
- [ ] Dynamic rendering uses `export const dynamic = 'force-dynamic'`
- [ ] Pattern: Server Page + Client Content (interactivity in `_components/*-content.tsx`)

### Integration & Contract Testing
- [ ] Contract tests for shared schemas/API contracts
- [ ] Integration tests for service boundaries (DB, external APIs, client-server)
- [ ] Contracts are explicit and versioned

### Observability & Versioning
- [ ] Structured logging with correlation IDs
- [ ] **Winston logger ONLY in server-side code** (Server Components, Server Actions, API routes, tRPC, middleware)
- [ ] **NO Winston in Client Components** (use console, toast, error boundaries)
- [ ] Semantic versioning: MAJOR.MINOR.PATCH
- [ ] Authorization checks + audit logging for sensitive operations

### Technology Stack Compliance
- [ ] Next.js 15 App Router with React Server Components
- [ ] TypeScript (strict), Zod 4, tRPC, Prisma
- [ ] React Hook Form + @hookform/resolvers
- [ ] shadcn/ui + Radix + TailwindCSS
- [ ] Biome/Ultracite for formatting/linting
- [ ] UI text in Spanish (es-LA); code/comments/commits in English

### Security & Compliance
- [ ] All inputs validated server-side (Zod schemas in tRPC `.input()`)
- [ ] No secrets committed (use env variables + @t3-oss/env-nextjs)
- [ ] Sensitive operations include authorization + audit logging

### Development Workflow
- [ ] Conventional commits format
- [ ] PR descriptions reference affected principles
- [ ] CI gates: typecheck, lint, unit tests, E2E tests (if user flows affected)
- [ ] Code review: 1 approver (2 for large/risky changes)

---

**Notes**:
- Mark N/A for checks not applicable to this feature
- Document any exceptions in Complexity Tracking section
- Re-validate after Phase 1 design decisions

## Project Structure

### Documentation (this feature)

```
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

```
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

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

