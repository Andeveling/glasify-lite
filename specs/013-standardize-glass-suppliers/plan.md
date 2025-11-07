# Implementation Plan: Standardize Glass Suppliers with SOLID Pattern

**Branch**: `013-standardize-glass-suppliers` | **Date**: 2025-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-standardize-glass-suppliers/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Refactor the glass suppliers admin module to use dialog-based CRUD operations with SOLID principles, following the exact pattern established in Services and Profile Suppliers modules. The 354-line monolithic form component will be decomposed into focused, testable hooks (useGlassSupplierForm, useGlassSupplierMutations) and a composable dialog UI. This eliminates page navigation overhead, provides consistent UX across all admin modules, and improves code maintainability for the most complex form in the admin area (8 fields vs 4 in profile suppliers).

**Key Outcomes**: 
- Replace separate create/edit pages with dialog modals (reduces user time from 50s to 25s for create)
- Extract form logic into testable hooks (<120 lines each)
- Reduce main component from 354 to <250 lines
- Achieve 100% pattern consistency with Services and Profile Suppliers modules

## Technical Context

**Language/Version**: TypeScript 5.8.2 (strict mode), Node.js ES2022 target  
**Primary Dependencies**: Next.js 15.2.3 (App Router), React 19.0.0 (Server Components), tRPC 11.0.0, TanStack Query 5.69.0, React Hook Form 7.63.0, Zod 4.1.1  
**Storage**: PostgreSQL via Prisma 6.16.2 (existing GlassSupplier schema with GlassTypes relationship)  
**Testing**: Vitest 3.2.4 (unit/integration), Playwright 1.55.1 (E2E)  
**Target Platform**: Web application (Next.js SSR with force-dynamic for admin routes)  
**Project Type**: Web (full-stack Next.js monorepo)  
**Performance Goals**: 
- Dialog open: <200ms
- Form submission: <1s (network dependent)
- List refresh after mutation: <500ms (SSR cache invalidation)
- Component bundle size: <50KB gzipped
**Constraints**: 
- Must maintain tenant isolation (all queries filtered by session.user.tenantId)
- Must handle referential integrity (GlassSupplier → GlassTypes relationship)
- Must use SSR cache invalidation pattern (invalidate + router.refresh)
- Must not use Winston logger in client components/hooks
- Component file must be <250 lines (form has 8 fields, needs vertical scroll in dialog)
**Scale/Scope**: 
- 3 admin modules to standardize (Services ✅, Profile Suppliers ✅, Glass Suppliers ⏳)
- ~10-50 glass suppliers per tenant (pagination at 20 items)
- 8-field form (most complex in admin area)
- 25 functional requirements
- 2 custom hooks to extract
- 2 directories to remove (new/, [id]/)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This feature must align with Glasify Lite Constitution v2.1.1 principles:

### Single Responsibility (SRP)
- [x] Each component/module has ONE clear responsibility
  - `useGlassSupplierForm`: Form state management only
  - `useGlassSupplierMutations`: API mutations only
  - `GlassSupplierDialog`: UI composition only
- [x] Business logic is separated from UI and data access
  - Validation: Zod schemas in `@/lib/validations/admin/glass-supplier.schema`
  - Data access: tRPC procedures in `@/server/api/routers/admin/glass-supplier`
  - UI: Dialog component uses hooks, no business logic
- [x] Tests and docs exist for each public abstraction
  - Unit tests for hooks (planned in Phase 2)
  - E2E tests for user flows (planned in Phase 2)
  - JSDoc comments on exported functions

### Open/Closed (OCP)
- [x] New features use extension patterns (hooks, procedures, adapters)
  - Follows exact same pattern as Services and Profile Suppliers (extension by replication)
  - Hooks are composable and reusable
  - No modification of existing stable modules
- [x] No modification of stable modules unless documented with migration plan
  - Only modifies glass-suppliers module (unstable, being standardized)
  - Removes old implementation completely (clean cutover)
- [x] Breaking API changes include MAJOR version bump + migration guide
  - N/A - internal refactor only, no public API changes

### Pragmatic Testing Discipline
- [x] Tests MAY be written before/during/after implementation
  - Tests will be written during/after (exploring pattern from Services/Profile Suppliers)
- [x] Tests MUST cover happy paths and critical edge cases before merge
  - Happy path: create, edit, delete supplier via dialog
  - Edge cases: referential integrity, validation errors, network failures
- [x] Unit tests run in CI
  - Vitest configured, will add tests for hooks
- [x] Integration/contract tests for cross-service changes
  - N/A - uses existing tRPC contracts, no changes to API

### Server-First Architecture (Next.js 15)
- [x] Pages are Server Components by default (`page.tsx`)
  - `glass-suppliers/page.tsx` is async Server Component
- [x] Client Components (`'use client'`) ONLY for: React hooks, browser APIs, event handlers, client-required libraries
  - Dialog component needs `'use client'` (React Hook Form, TanStack Query mutations)
  - List component needs `'use client'` (search state, TanStack Query)
- [x] Public pages export `metadata` for SEO
  - N/A - admin pages, not public
- [x] Dynamic rendering uses `export const dynamic = 'force-dynamic'`
  - Already configured in page.tsx (admin route, SSR with no caching)
- [x] Pattern: Server Page + Client Content (interactivity in `_components/*-content.tsx`)
  - page.tsx (Server) → GlassSupplierList (Client) → GlassSupplierDialog (Client)

### Integration & Contract Testing
- [x] Contract tests for shared schemas/API contracts
  - Uses existing Zod schemas (no changes needed)
  - tRPC procedures tested via E2E (type safety at compile time)
- [x] Integration tests for service boundaries (DB, external APIs, client-server)
  - E2E tests will cover full CRUD flow including DB operations
- [x] Contracts are explicit and versioned
  - Zod schemas in `@/lib/validations/admin/glass-supplier.schema`
  - tRPC procedures are type-safe by design

### Observability & Versioning
- [x] Structured logging with correlation IDs
  - Winston logging in tRPC procedures (server-side only)
  - No Winston in client components (constitution compliance)
- [x] **Winston logger ONLY in server-side code** (Server Components, Server Actions, API routes, tRPC, middleware)
  - ✅ Confirmed: No Winston imports in client hooks or dialog component
- [x] **NO Winston in Client Components** (use console, toast, error boundaries)
  - ✅ Will use toast notifications for user feedback
  - ✅ Will use console.error for development debugging only
- [x] Semantic versioning: MAJOR.MINOR.PATCH
  - N/A - internal refactor, no version bump needed
- [x] Authorization checks + audit logging for sensitive operations
  - Already handled by `adminProcedure` in tRPC router
  - Middleware protects /admin/* routes

### Technology Stack Compliance
- [x] Next.js 15 App Router with React Server Components
  - ✅ Using App Router, page.tsx is Server Component
- [x] TypeScript (strict), Zod 4, tRPC, Prisma
  - ✅ All dependencies match: TS 5.8.2, Zod 4.1.1, tRPC 11.0.0, Prisma 6.16.2
- [x] React Hook Form + @hookform/resolvers
  - ✅ Will use RHF 7.63.0 with zodResolver in useGlassSupplierForm hook
- [x] shadcn/ui + Radix + TailwindCSS
  - ✅ Dialog uses shadcn/ui Dialog component (Radix under the hood)
- [x] Biome/Ultracite for formatting/linting
  - ✅ CI configured, will pass linting
- [x] UI text in Spanish (es-LA); code/comments/commits in English
  - ✅ All UI strings in Spanish (button labels, toasts, validation messages)
  - ✅ Code/comments/commits in English

### Security & Compliance
- [x] All inputs validated server-side (Zod schemas in tRPC `.input()`)
  - ✅ All tRPC procedures use `.input(schema)` with Zod validation
- [x] No secrets committed (use env variables + @t3-oss/env-nextjs)
  - ✅ No secrets involved in this feature
- [x] Sensitive operations include authorization + audit logging
  - ✅ RBAC via adminProcedure (only admins can access)
  - ✅ Audit logging in tRPC procedures (create/update/delete)

### Development Workflow
- [x] Conventional commits format
  - ✅ Will use: `refactor(glass-suppliers): standardize with SOLID pattern`
- [x] PR descriptions reference affected principles
  - ✅ Will reference SRP and OCP in PR description
- [x] CI gates: typecheck, lint, unit tests, E2E tests (if user flows affected)
  - ✅ All gates configured, tests will be added before merge
- [x] Code review: 1 approver (2 for large/risky changes)
  - ✅ Standard workflow, 1 approver sufficient (following established pattern)

---

**Notes**:
- ✅ All constitution checks pass
- No exceptions needed
- Pattern is proven (Services and Profile Suppliers already use it)
- No modifications to stable modules (only refactoring glass-suppliers)

## Project Structure

### Documentation (this feature)

```
specs/013-standardize-glass-suppliers/
├── spec.md              # Feature specification (DONE)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   └── glass-supplier-dialog.contract.md  # Component API contract
└── checklists/
    └── requirements.md  # Spec quality checklist (DONE)
```

### Source Code (repository root)

```
src/app/(dashboard)/admin/glass-suppliers/
├── page.tsx                                    # Server Component (existing, minimal changes)
├── _components/
│   ├── glass-supplier-dialog.tsx              # NEW: Main dialog component (UI composition only, <250 lines)
│   ├── glass-supplier-list.tsx                # MODIFIED: Remove navigation logic, add dialog state
│   └── glass-supplier-form.tsx                # DEPRECATED: To be removed
├── _hooks/
│   ├── use-glass-supplier-form.ts             # NEW: Form state management (<120 lines)
│   └── use-glass-supplier-mutations.ts        # NEW: Mutation logic (<120 lines)
├── new/
│   └── page.tsx                                # DEPRECATED: To be removed
└── [id]/
    └── page.tsx                                # DEPRECATED: To be removed

src/server/api/routers/admin/glass-supplier.ts  # UNCHANGED: Existing tRPC procedures
src/lib/validations/admin/glass-supplier.schema.ts  # UNCHANGED: Existing Zod schemas

tests/unit/
└── glass-suppliers/
    ├── use-glass-supplier-form.test.ts        # NEW: Hook unit tests
    └── use-glass-supplier-mutations.test.ts   # NEW: Hook unit tests

e2e/admin/
└── glass-suppliers.spec.ts                     # MODIFIED: Update for dialog pattern
```

**Structure Decision**: 

This is a **Single Next.js Web Application** using the App Router pattern. The feature follows the established pattern from Services and Profile Suppliers modules:

1. **Server Component (page.tsx)**: Fetches initial data, delegates interactivity to client components
2. **Client Components (_components/)**: 
   - List component manages table state and opens dialog
   - Dialog component composes UI using extracted hooks
3. **Custom Hooks (_hooks/)**: 
   - Form hook: React Hook Form setup, validation, default values
   - Mutations hook: tRPC mutations, cache invalidation, toasts
4. **Cleanup**: Remove `/new` and `/[id]` directories (obsolete separate pages)

**Key Architectural Decisions**:
- **Hooks over classes**: Functional programming with React Hooks
- **Composition over inheritance**: Dialog composes smaller, focused components
- **Server-first**: Data fetching in Server Components, mutations via tRPC
- **Co-location**: Feature-specific hooks in `_hooks/` (private folder)

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations detected.** All constitution checks pass without exceptions.

This refactoring actually **reduces** complexity:
- Monolithic 354-line component → 3 focused files (<250, <120, <120 lines)
- Page navigation → In-place dialog (fewer routes, simpler mental model)
- Duplicate code patterns → Unified pattern across 3 admin modules

