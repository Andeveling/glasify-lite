# Implementation Plan: Static Glass Taxonomy Based on Industry Standards

**Branch**: `015-static-glass-taxonomy` | **Date**: 2025-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-static-glass-taxonomy/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Convert GlassType and GlassSolution entities from tenant-managed dynamic records to static, system-seeded taxonomy based on international glass industry standards (Tecnoglass, Vitro, Guardian product lines). This ensures pricing accuracy, technical specification consistency, and regulatory compliance across all tenants. GlassSupplier remains tenant-specific to support regional distribution relationships. The migration must preserve all historical quote references and prevent data loss during the transition from dynamic to static data architecture.

## Technical Context

**Language/Version**: TypeScript 5.9.3, Node.js (ES2022 target via Next.js 15.5.4)  
**Primary Dependencies**: Next.js 15.5.4 (App Router), Prisma 6.17.0 (ORM), tRPC 11.6.0 (API), Zod 4.1.12 (validation), React Hook Form 7.64.0  
**Storage**: PostgreSQL via Prisma ORM (existing multi-tenant schema with GlassType, GlassSolution, GlassSupplier models)  
**Testing**: Vitest 3.2.4 (unit/integration), Playwright 1.56.0 (E2E), @testing-library/react 16.3.0  
**Target Platform**: Web application (Next.js App Router with Server Components, server-side rendering)  
**Project Type**: Single full-stack web application (not monorepo)  
**Performance Goals**: Database queries <200ms p95, page loads <2s, seed operations <5s, migration scripts <30s for 1000 records  
**Constraints**: Zero downtime migration required, no data loss allowed, referential integrity must be preserved for historical quotes, multi-tenant isolation maintained  
**Scale/Scope**: ~30-50 standardized glass types (Tecnoglass Serie-R, Serie-N, Solarban series), ~6 glass solutions (solar control, energy efficiency, security, acoustic, privacy, hurricane resistance), multi-tenant architecture with tenant-specific suppliers

**Clarifications Needed** (to be resolved in Phase 0 research):
- NEEDS CLARIFICATION: Tenant-specific pricing strategy for static glass types (global base price + tenant markup vs per-tenant pricing table)
- NEEDS CLARIFICATION: Complete product list from Tecnoglass/Vitro/Guardian datasheets (technical specs for 30+ types)
- NEEDS CLARIFICATION: Migration strategy for tenant-created custom glass types (ID preservation vs mapping table vs legacy prefix)
- NEEDS CLARIFICATION: Schema changes required (remove tenantId FK from GlassType? add isSeeded flag? versioning columns?)
- NEEDS CLARIFICATION: Seed data versioning approach (timestamped migrations vs idempotent seed script with version checks)
- NEEDS CLARIFICATION: UI/API blocking strategy (soft errors with migration warnings vs hard 403 Forbidden vs UI removal)
- NEEDS CLARIFICATION: Rollback plan if migration fails mid-process (transaction boundaries, backup restoration SOP)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This feature must align with Glasify Lite Constitution v2.1.1 principles:

### Single Responsibility (SRP)
- [x] Each component/module has ONE clear responsibility
  - Seed scripts: Load static taxonomy data
  - Migration scripts: Transform tenant data to static references
  - tRPC routers: Separate read-only glass catalog from supplier CRUD
- [x] Business logic is separated from UI and data access
  - Seed data factories in `prisma/factories/`
  - Data access via tRPC procedures
  - UI components in `src/app/(dashboard)/admin/glass-types/_components/`
- [x] Tests and docs exist for each public abstraction
  - Unit tests for seed factories
  - Integration tests for migration scripts
  - E2E tests for UI changes (blocked CRUD, read-only catalog)

### Open/Closed (OCP)
- [x] New features use extension patterns (hooks, procedures, adapters)
  - Seed data extends via new factory functions
  - No modification to existing QuoteItem references
- [⚠️] No modification of stable modules unless documented with migration plan
  - **Breaking change**: Removing GlassType/GlassSolution CRUD endpoints
  - **Migration guide required**: Document API deprecation, UI changes, data migration steps
  - **Version bump**: This is a MAJOR change (v1.x → v2.0) due to removed CRUD functionality
- [x] Breaking API changes include MAJOR version bump + migration guide
  - Will document in CHANGELOG.md and migration guide

### Pragmatic Testing Discipline
- [x] Tests MAY be written before/during/after implementation
  - Seed data factories: Test-driven (write tests first to validate data structure)
  - Migration scripts: Test during (validate each transformation step)
  - UI changes: Test after (E2E tests for blocked actions)
- [x] Tests MUST cover happy paths and critical edge cases before merge
  - Happy path: Seed data loads correctly, historical quotes still render
  - Edge cases: Duplicate glass type names, missing supplier references, quote with deleted glass type
- [x] Unit tests run in CI
- [x] Integration/contract tests for cross-service changes
  - Contract tests for seed data schema (matches Prisma schema)
  - Integration tests for migration (DB state before/after)

### Server-First Architecture (Next.js 15)
- [x] Pages are Server Components by default (`page.tsx`)
  - Glass type catalog page: Server Component with SSR
- [x] Client Components (`'use client'`) ONLY for: React hooks, browser APIs, event handlers, client-required libraries
  - No client components needed for read-only catalog
  - Search/filter interactions can be server-side (URL params + server re-render)
- [x] Public pages export `metadata` for SEO
  - N/A: Admin-only pages (glass type catalog is behind authentication)
- [x] Dynamic rendering uses `export const dynamic = 'force-dynamic'`
  - Admin catalog pages use SSR with force-dynamic for real-time data
- [x] Pattern: Server Page + Client Content (interactivity in `_components/*-content.tsx`)
  - Read-only catalog uses server components, no client interactivity needed

### Integration & Contract Testing
- [x] Contract tests for shared schemas/API contracts
  - Seed data schema matches Prisma GlassType/GlassSolution models
  - Zod validation schemas for seed data input
- [x] Integration tests for service boundaries (DB, external APIs, client-server)
  - Migration script integration tests (DB state transformation)
  - Seed script integration tests (idempotency, data consistency)
- [x] Contracts are explicit and versioned
  - Seed data format versioned (v1.0 initial release)

### Observability & Versioning
- [x] Structured logging with correlation IDs
  - Migration scripts log progress with quote IDs, glass type IDs
  - Seed scripts log loaded records count
- [x] **Winston logger ONLY in server-side code** (Server Components, Server Actions, API routes, tRPC, middleware)
  - Migration scripts use Winston (Node.js context)
  - Seed scripts use Winston (Node.js context)
- [x] **NO Winston in Client Components** (use console, toast, error boundaries)
  - N/A: No client components in this feature
- [x] Semantic versioning: MAJOR.MINOR.PATCH
  - This feature requires MAJOR version bump (2.0.0) due to removed CRUD
- [x] Authorization checks + audit logging for sensitive operations
  - Admin-only access to glass type catalog (existing RBAC)
  - Log attempts to create glass types (blocked endpoint)

### Technology Stack Compliance
- [x] Next.js 15 App Router with React Server Components
- [x] TypeScript (strict), Zod 4, tRPC, Prisma
- [x] React Hook Form + @hookform/resolvers
  - N/A: No forms in read-only catalog
- [x] shadcn/ui + Radix + TailwindCSS
- [x] Biome/Ultracite for formatting/linting
- [x] UI text in Spanish (es-LA); code/comments/commits in English

### Security & Compliance
- [x] All inputs validated server-side (Zod schemas in tRPC `.input()`)
  - Seed data validated against Zod schemas before insertion
- [x] No secrets committed (use env variables + @t3-oss/env-nextjs)
  - N/A: No new secrets required
- [x] Sensitive operations include authorization + audit logging
  - Admin-only glass type catalog access (existing middleware)

### Development Workflow
- [x] Conventional commits format
- [x] PR descriptions reference affected principles
- [x] CI gates: typecheck, lint, unit tests, E2E tests (if user flows affected)
  - E2E tests for blocked CRUD actions, read-only catalog
- [x] Code review: 1 approver (2 for large/risky changes)
  - This feature is large/risky (data migration) → 2 approvers required

---

**Notes**:
- ⚠️ **Open/Closed Principle violation justified**: Removing CRUD endpoints is necessary to enforce data governance (glass types must match manufacturer specs). Migration guide will document workaround for tenants needing custom types (contact support).
- **MAJOR version bump required**: v1.x → v2.0.0 due to removed API endpoints.
- Re-validation after Phase 1 design will confirm schema changes and migration strategy.

## Project Structure

### Documentation (this feature)

```
specs/015-static-glass-taxonomy/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output: Research findings on glass industry standards, migration patterns
├── data-model.md        # Phase 1 output: GlassType/GlassSolution schema changes, seed data structure
├── quickstart.md        # Phase 1 output: How to run seeders, migration scripts, verify data
├── contracts/           # Phase 1 output: Seed data JSON schema, tRPC procedure contracts
│   ├── glass-type-seed.schema.json
│   ├── glass-solution-seed.schema.json
│   └── migration-report.schema.json
├── checklists/
│   └── requirements.md  # Feature requirements checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
glasify-lite/  # Single Next.js project
├── prisma/
│   ├── schema.prisma                    # Modified: GlassType/GlassSolution models (remove tenant FK?, add versioning?)
│   ├── migrations/
│   │   └── YYYYMMDDHHMMSS_static_glass_taxonomy/
│   │       └── migration.sql            # Schema changes for static taxonomy
│   ├── factories/
│   │   ├── glass-type.factory.ts        # New: Generate GlassType seed data
│   │   ├── glass-solution.factory.ts    # New: Generate GlassSolution seed data
│   │   └── glass-type-solution.factory.ts # New: Link glass types to solutions
│   ├── seeders/
│   │   ├── glass-types.seeder.ts        # New: Seed standardized glass types
│   │   ├── glass-solutions.seeder.ts    # New: Seed universal glass solutions
│   │   └── index.ts                     # Modified: Register new seeders
│   └── seed-cli.ts                      # Modified: Add --glass-taxonomy flag
│
├── scripts/
│   ├── migrate-glass-taxonomy.ts        # New: Migrate tenant glass types to static
│   ├── validate-seed-data.ts            # New: Validate seed data against schema
│   └── rollback-glass-taxonomy.ts       # New: Emergency rollback script
│
├── src/
│   ├── server/
│   │   ├── api/
│   │   │   └── routers/
│   │   │       ├── admin/
│   │   │       │   ├── glass-type.ts    # Modified: Remove create/update/delete, keep read-only
│   │   │       │   ├── glass-solution.ts # Modified: Remove create/update/delete, keep read-only
│   │   │       │   └── glass-supplier.ts # Unchanged: Keep full CRUD
│   │   │       └── catalog/
│   │   │           └── glass-catalog.ts  # New: Public read-only glass type catalog
│   │   └── services/
│   │       └── glass-taxonomy.service.ts # New: Business logic for seed data loading
│   │
│   ├── app/
│   │   └── (dashboard)/
│   │       └── admin/
│   │           ├── glass-types/
│   │           │   ├── page.tsx          # Modified: Read-only catalog (remove create button)
│   │           │   └── _components/
│   │           │       ├── glass-type-table.tsx # Modified: Remove edit/delete actions
│   │           │       └── glass-type-details.tsx # New: View-only details modal
│   │           ├── glass-solutions/
│   │           │   ├── page.tsx          # Modified: Read-only catalog
│   │           │   └── _components/
│   │           │       └── glass-solution-list.tsx # Modified: Remove CRUD actions
│   │           └── glass-suppliers/
│   │               └── [...]             # Unchanged: Keep existing CRUD
│   │
│   └── lib/
│       └── validators/
│           ├── glass-type-seed.validator.ts # New: Zod schema for seed data
│           └── glass-solution-seed.validator.ts # New: Zod schema for seed data
│
├── tests/
│   ├── unit/
│   │   ├── factories/
│   │   │   ├── glass-type.factory.test.ts # New: Test seed data generation
│   │   │   └── glass-solution.factory.test.ts # New: Test seed data generation
│   │   └── services/
│   │       └── glass-taxonomy.service.test.ts # New: Test seed loading logic
│   └── integration/
│       └── migrations/
│           └── glass-taxonomy.migration.test.ts # New: Test migration script
│
└── e2e/
    └── admin/
        ├── glass-types-readonly.spec.ts # New: Test blocked CRUD actions
        └── glass-solutions-readonly.spec.ts # New: Test blocked CRUD actions
```

**Structure Decision**: Single Next.js project (not monorepo). Feature involves data layer refactoring (Prisma schema, seeders, migrations) and admin UI changes (remove CRUD for glass types/solutions). Glass supplier CRUD remains unchanged. Migration scripts live in `scripts/` for one-time execution. Seed factories follow existing pattern in `prisma/factories/` for reusable data generation.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation                                      | Why Needed                                                                                                                                                  | Simpler Alternative Rejected Because                                                                                                                                           |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Removing GlassType/GlassSolution CRUD (OCP)    | Data governance requirement: Glass types must match manufacturer technical specifications (U-values, SHGC, transmission %) for regulatory compliance (LEED, EDGE, building codes). Allowing tenant customization leads to incorrect specs and failed inspections. | Keeping CRUD with validation rules rejected because tenants could bypass validation or enter near-correct values that pass validation but are still technically wrong (e.g., U-value 1.8 vs 1.82). Manual review of every custom type is not scalable. |
| MAJOR version bump (Breaking API change)       | Removing create/update/delete endpoints for glass types/solutions breaks existing API contracts. Clients calling these endpoints will receive 403 Forbidden or deprecation errors. | Keeping deprecated endpoints as no-ops rejected because it creates confusion (API succeeds but data doesn't persist). Better to fail fast with clear error message directing tenants to support channel for custom type requests. |
| Zero-downtime migration with data transformation | Historical quotes reference glass types by ID. Migration must either preserve IDs (complex matching logic for 50+ types) or create ID mapping table (additional join on every quote query). | Full system downtime rejected because SaaS application cannot have multi-hour outage. Blue-green deployment rejected because Prisma schema changes require database migration. Chosen approach: idempotent seed script + background migration job + gradual rollout. |

**Migration Complexity Justification**:
The migration from dynamic to static taxonomy is fundamentally complex due to three factors:
1. **Data preservation**: 100+ existing quotes must continue rendering identically post-migration
2. **Multi-tenancy**: Each tenant may have created custom glass types with conflicting names (e.g., two tenants both created "N70/38" but with different specs)
3. **Referential integrity**: QuoteItem → GlassType FK must remain valid through entire migration

Simpler alternatives considered and rejected:
- **Start fresh with static data**: Rejected because historical quotes would lose glass type details
- **Keep both dynamic and static**: Rejected because it creates confusion (which catalog do users search?)
- **Manual data cleanup before migration**: Rejected because 10+ tenants × 20+ glass types = 200+ manual reviews (not scalable)

**Chosen approach**: Idempotent seed script + automated migration with conflict resolution (legacy prefix for custom types) + gradual rollout (one tenant at a time with monitoring).

---

## Phase Completion Summary

### Phase 0: Outline & Research ✅ COMPLETE

**Deliverables**:
- [x] `research.md` created with all clarifications resolved
- [x] 7 research tasks completed:
  - RT-001: Tenant-specific pricing strategy (Decision: Per-tenant pricing table)
  - RT-002: Complete product list from datasheets (Decision: Start with Tecnoglass Serie-N/Serie-R)
  - RT-003: Migration strategy for custom types (Decision: Legacy prefix with soft delete)
  - RT-004: Schema changes required (Decision: Add code, series, manufacturer, isSeeded, seedVersion)
  - RT-005: Seed data versioning (Decision: Hybrid - migrations for schema, idempotent seeds for data)
  - RT-006: UI/API blocking strategy (Decision: API hard block + UI removal)
  - RT-007: Rollback plan (Decision: Incremental migration with checkpoints + database backup)

**Key Decisions**:
- Per-tenant pricing table with supplier-specific rates
- Start with 30+ glass types (Tecnoglass core series)
- Legacy prefix for custom types (soft delete pattern)
- Hybrid versioning (schema migrations + idempotent seed scripts)
- API hard block (403 Forbidden) for CRUD attempts
- Incremental migration with resumable checkpoints

### Phase 1: Design & Contracts ✅ COMPLETE

**Deliverables**:
- [x] `data-model.md` created with complete Prisma schema changes
- [x] `contracts/` directory created with 3 JSON schemas:
  - `glass-type-seed.schema.json` (seed data validation)
  - `glass-solution-seed.schema.json` (solution taxonomy validation)
  - `migration-report.schema.json` (migration status tracking)
- [x] `quickstart.md` created with migration runbook (pre-migration checklist, workflow, rollback procedures, troubleshooting)
- [x] Agent context updated (`.github/copilot-instructions.md` updated with new patterns)

**Schema Changes**:
- `GlassType`: Add code, series, manufacturer, isSeeded, seedVersion; make name unique; remove glassSupplierId FK
- `GlassSolution`: Add isSeeded, seedVersion
- `TenantGlassTypePrice` (NEW): Per-tenant pricing table
- `GlassSupplier`: Add tenantId FK, unique constraint on [tenantId, name]
- `GlassTaxonomyMigrationCheckpoint` (NEW): Track migration progress

**Contracts**:
- Seed data format validated against JSON Schema Draft-07
- Migration report format documented for status tracking
- tRPC procedure contracts defined in data-model.md

### Phase 2: Implementation ⏳ PENDING

**Next Command**: `/speckit.tasks` to generate implementation task breakdown

**What Phase 2 Will Deliver**:
- `tasks.md` with granular implementation tasks
- Task breakdown by component (schema migration, seed scripts, data migration, API changes, UI changes, tests)
- Task dependencies and estimated effort
- Acceptance criteria per task

---

## Implementation Readiness Checklist

- [x] All research clarifications resolved (Phase 0 complete)
- [x] Data model fully designed with schema changes documented
- [x] Contracts defined (JSON schemas for seed data and migration reports)
- [x] Migration strategy documented with rollback procedures
- [x] Quickstart guide created for operators
- [x] Agent context updated with new patterns
- [ ] Implementation tasks generated (run `/speckit.tasks`)
- [ ] Code implementation (TBD in Phase 2)
- [ ] Tests written (TBD in Phase 2)
- [ ] E2E validation (TBD in Phase 2)

**Branch**: `015-static-glass-taxonomy`  
**Plan Status**: Phase 0 & 1 complete, ready for Phase 2 task generation  
**Estimated Implementation Effort**: 5-7 days (1 day schema/seeds, 2 days migration script, 1 day API/UI changes, 1-2 days testing)

---

## Notes for Phase 2 Implementation

1. **Start with schema migration**: Apply Prisma schema changes first (low risk, reversible)
2. **Test seed scripts in isolation**: Validate seed data before running migration
3. **Staged rollout**: Migrate one tenant at a time with monitoring
4. **Performance testing**: Benchmark query performance with TenantGlassTypePrice joins
5. **Documentation first**: Update API docs and user guide before deploying

**Critical Path**:
1. Schema migration (blocking)
2. Seed scripts (blocking)
3. Data migration script (blocking for production deployment)
4. API/UI changes (can be parallel)
5. E2E tests (validation gate)

**Risk Mitigation**:
- Daily backups during migration phase
- Rollback runbook tested in staging
- Monitoring alerts for broken quote references
- Performance benchmarks before/after migration

