# Implementation Plan: Role-Based Access Control System

**Branch**: `009-role-based-access` | **Date**: 14 de octubre de 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/009-role-based-access/spec.md`

**Note**: This plan follows the `/speckit.plan` command workflow. See constitution and spec for context.

---

## Summary

This feature implements a comprehensive role-based access control system for Glasify Lite with three roles: **admin**, **seller**, and **user** (client). The system will:

1. **Database Migration**: Add `role` field to User model with enum values ('admin' | 'seller' | 'user')
2. **Middleware Enhancement**: Extend existing Next.js middleware to verify roles and enforce route-level authorization
3. **tRPC Authorization**: Update procedures to filter data based on user role (data isolation)
4. **Conditional UI**: Create helper components and update navigation to show role-appropriate options
5. **Admin Dashboard**: Build initial admin dashboard with model management, all-quotes view, and tenant configuration

**Technical Approach**: Leverage existing NextAuth.js v5 session structure by adding `role` to session object, implement server-side authorization in middleware and tRPC procedures, and create Server Components for conditional rendering. Maintain backward compatibility with `ADMIN_EMAIL` environment variable.

---

## Technical Context

**Language/Version**: TypeScript 5.8.2 (strict mode)  
**Primary Dependencies**: 
- Next.js 15.2.3 (App Router, React Server Components)
- React 19.0.0
- NextAuth.js 5.0.0-beta.25 (authentication)
- tRPC 11.0.0 (API layer)
- Prisma 6.16.2 (ORM with PostgreSQL)
- Zod 4.1.1 (validation schemas)
- Shadcn/ui + Radix UI (UI components)

**Storage**: PostgreSQL (via Prisma ORM)  
**Testing**: 
- Vitest 3.2.4 (unit/integration tests with jsdom)
- Playwright 1.55.1 (E2E tests)
- @testing-library/react (component testing)

**Target Platform**: Web application (SSR/ISR with Next.js 15)  
**Project Type**: Web (Next.js App Router monolith with tRPC backend)

**Performance Goals**: 
- Middleware role verification: <10ms overhead
- Dashboard initial load: <1.5 seconds
- Role-based data filtering: No N+1 queries (use Prisma joins)

**Constraints**: 
- Must NOT break existing client (user role) MVP flow
- Database migration must be reversible (rollback script required)
- No new external dependencies (use existing stack)
- Winston logger ONLY in server-side code (constitution compliance)
- All pages must be Server Components by default (constitution: Server-First Architecture)

**Scale/Scope**: 
- 3 user roles to implement
- ~6 new routes for admin dashboard
- ~15 tRPC procedures to update for role-based filtering
- ~10 UI components to create/modify for conditional rendering
- Database migration affecting User table (potentially thousands of existing users)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Status: ✅ PASS

#### ✅ Single Responsibility Principle (SRP)
- Middleware handles ONLY route authorization
- tRPC procedures handle ONLY data access authorization
- UI components render based on role but don't enforce security
- Database migration handles ONLY schema changes

#### ✅ Open/Closed Principle (OCP)
- Role system designed for extension: new roles can be added to enum without modifying existing logic
- Helper components (`<AdminOnly>`, `<SellerOnly>`) use composition pattern
- Middleware role checks use strategy pattern (easily extensible)

#### ✅ Pragmatic Testing Discipline
- Tests will cover:
  - Unit: Role verification helpers, data filtering logic
  - Integration: Middleware authorization flows, tRPC procedure filtering
  - Contract: API schema validation for admin procedures
  - E2E: Complete user flows for each role (login → dashboard → actions)
- Tests MAY be written during implementation but MUST exist before merge

#### ✅ Server-First Architecture (Next.js 15)
- All new pages will be Server Components (`/dashboard/*`)
- Metadata exports for SEO on admin dashboard pages
- Client Components ONLY for:
  - Interactive forms (using React Hook Form)
  - Navigation menus with state (mobile menu toggle)
  - Toast notifications (user feedback)
- Pattern: Server Page + Client Content will be followed

#### ✅ Observability & Versioning
- Winston logger will be used ONLY in:
  - Server Actions (role assignment)
  - tRPC procedures (authorization attempts)
  - Middleware (access denials for audit trail)
- NO Winston in Client Components (constitution compliance)
- Client-side: Use console (dev only) and toast notifications (user feedback)

#### ✅ Technology & Compliance Requirements
- Using mandated stack: Next.js 15, tRPC, Prisma, Zod, shadcn/ui
- All inputs validated server-side with Zod schemas
- Authorization checks in server code (middleware + tRPC)
- UI text in Spanish (es-LA), code/comments in English
- Secrets (ADMIN_EMAIL) via environment variables

#### ✅ Development Workflow & Quality Gates
- Feature will pass all CI gates:
  - Type check: TypeScript strict mode
  - Lint/format: Biome via Ultracite
  - Unit tests: Vitest with coverage
  - E2E tests: Playwright for each role flow
- Commits follow conventional commits
- Migration includes rollback script

### No Violations - No Complexity Tracking Needed

---

## Project Structure

### Documentation (this feature)

```
specs/009-role-based-access/
├── spec.md              # Feature specification (DONE)
├── checklists/
│   └── requirements.md  # Specification quality checklist (DONE)
├── plan.md              # This file (IN PROGRESS)
├── research.md          # Phase 0 output (TO BE CREATED)
├── data-model.md        # Phase 1 output (TO BE CREATED)
├── quickstart.md        # Phase 1 output (TO BE CREATED)
├── contracts/           # Phase 1 output (TO BE CREATED)
│   ├── middleware-role-checks.contract.md
│   ├── trpc-admin-procedures.contract.md
│   └── user-role-enum.contract.md
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created yet)
```

### Source Code (repository root)

```
glasify-lite/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (dashboard)/              # Route group: admin area (NEW/MODIFIED)
│   │   │   ├── layout.tsx            # Admin layout with role verification (MODIFY)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx          # Main admin dashboard (MODIFY)
│   │   │   │   ├── _components/      # Dashboard-specific components (NEW)
│   │   │   │   │   ├── admin-metrics.tsx
│   │   │   │   │   └── quick-actions.tsx
│   │   │   ├── models/               # Model management (EXISTING - enhance)
│   │   │   ├── quotes/               # All quotes view (NEW)
│   │   │   │   ├── page.tsx
│   │   │   │   └── _components/
│   │   │   │       ├── quotes-table.tsx
│   │   │   │       └── quote-filters.tsx
│   │   │   └── settings/             # Tenant config (EXISTING - enhance)
│   │   │
│   │   ├── (seller)/                 # Route group: seller area (NEW)
│   │   │   └── quotes/               # Seller quotes dashboard
│   │   │       └── page.tsx          # Server Component
│   │   │
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── page.tsx          # Role-based redirect (MODIFY for seller)
│   │   │
│   │   └── _components/              # Shared app components (MODIFY)
│   │       ├── admin-only.tsx        # NEW: Server Component guard
│   │       ├── seller-only.tsx       # NEW: Server Component guard
│   │       └── role-based-nav.tsx    # NEW: Conditional navigation
│   │
│   ├── components/                   # UI components
│   │   └── ui/                       # Shadcn components (use existing)
│   │
│   ├── lib/
│   │   ├── auth-helpers.ts           # MODIFY: Add role verification helpers
│   │   └── logger.ts                 # EXISTING: Winston (server-side only)
│   │
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/
│   │   │   │   ├── admin.ts          # MODIFY: Add role checks to all procedures
│   │   │   │   ├── quote.ts          # MODIFY: Add role-based filtering
│   │   │   │   └── user.ts           # NEW: User management for admins
│   │   │   ├── root.ts               # MODIFY: Register user router
│   │   │   └── trpc.ts               # MODIFY: Add sellerProcedure helper
│   │   │
│   │   ├── auth/
│   │   │   └── config.ts             # MODIFY: Update session callback for seller role
│   │   │
│   │   └── db.ts                     # EXISTING: Prisma client
│   │
│   └── middleware.ts                 # MODIFY: Add role-based route authorization
│
├── prisma/
│   ├── schema.prisma                 # MODIFY: Add role enum to User model
│   └── migrations/                   # NEW: Migration + rollback script
│       └── [timestamp]_add_user_role/
│
├── tests/
│   ├── unit/
│   │   ├── auth-helpers.test.ts      # NEW: Role verification tests
│   │   └── middleware-role.test.ts   # NEW: Middleware logic tests
│   │
│   ├── integration/
│   │   ├── trpc-admin-auth.test.ts   # NEW: Admin procedure authorization
│   │   └── trpc-seller-filter.test.ts # NEW: Seller data isolation
│   │
│   └── contract/
│       └── user-role-schema.test.ts  # NEW: Zod schema validation
│
└── e2e/
    ├── admin-dashboard.spec.ts       # NEW: Admin flow E2E
    ├── seller-quotes.spec.ts         # NEW: Seller flow E2E
    └── client-access.spec.ts         # MODIFY: Ensure client flow unbroken
```

**Structure Decision**: Web application structure with Next.js 15 App Router. Using route groups `(dashboard)` for admin and `(seller)` for seller to organize without affecting URLs. Server Components by default for all pages, with Client Components only for interactivity (forms, menus). All role authorization happens server-side (middleware + tRPC).
