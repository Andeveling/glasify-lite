# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: TypeScript 5.8.2 (strict mode), Node.js (ES2022 target)  
**Framework**: Next.js 15.2.3 (App Router, React Server Components 19.0.0)  
**Primary Dependencies**: 
- tRPC 11.0.0 (type-safe API layer)
- Prisma 6.16.2 (PostgreSQL ORM)
- NextAuth.js 5.0.0-beta.25 (authentication)
- TanStack Query 5.69.0 (React Query)
- Zod 4.1.1 (schema validation)
- Shadcn/ui + Radix UI (UI components)
- TailwindCSS 4.0.15 (styling)
- React Hook Form 7.63.0 (forms)

**Storage**: PostgreSQL via Prisma ORM  
**Testing**: 
- Unit/Integration: Vitest 3.2.4 (jsdom, @testing-library/react)
- E2E: Playwright 1.55.1
- Linting: Ultracite 5.4.4 + Biome 2.2.4

**Target Platform**: Web (Next.js server + browser client)  
**Project Type**: Full-stack web application (Next.js App Router)  
**Performance Goals**: 
- Server-side: <200ms p95 API response time, <10ms middleware overhead
- Client-side: <1.5s FCP, <2.5s LCP (Core Web Vitals)
- Database: <50ms p95 query time

**Constraints**: 
- Server Components by default (constitution: "Server-First Architecture")
- Winston logger server-side ONLY (no client components)
- UI text in Spanish (es-LA), code/comments/commits in English
- tRPC procedures use kebab-case naming
- No barrel files (index.ts) anywhere

**Scale/Scope**: Small-to-medium business application (expected <500 concurrent users, <100k quotes/year)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Single Responsibility (SRP)**:
- [ ] Each module/component has ONE well-defined responsibility
- [ ] No mixing of concerns (UI + business logic + data access)
- [ ] Tests and docs exist for each public abstraction

**Open/Closed (OCP)**:
- [ ] New features prefer extension patterns (hooks, tRPC procedures, adapters) over modifying stable modules
- [ ] Breaking API changes follow semantic versioning (MAJOR bump + migration guide)

**Pragmatic Testing Discipline**:
- [ ] All features include tests for happy paths and critical edge cases before merge
- [ ] Tests MAY be written before, during, or after implementation (flexible workflow)
- [ ] Unit tests MUST run in CI; integration/contract tests for cross-service changes

**Server-First Architecture (Next.js 15)**:
- [ ] Pages (`page.tsx`) are Server Components by default
- [ ] Client Components (`'use client'`) ONLY for: hooks, browser APIs, event handlers, interactive libraries
- [ ] Public pages export `metadata` for SEO
- [ ] Pattern: Server Page + Client Content separation followed
- [ ] Pages using browser APIs set `export const dynamic = 'force-dynamic'`

**Integration & Contract Testing**:
- [ ] Changes to shared schemas/API contracts include contract tests and migration notes
- [ ] Integration tests run in CI for changes touching integration points (DB, external APIs, client↔server)

**Observability & Versioning**:
- [ ] Structured logging with Winston (server-side ONLY)
- [ ] Winston NEVER used in Client Components, hooks, or browser-executed code
- [ ] Client-side uses: console (dev only), toast (user feedback), error boundaries
- [ ] Semantic versioning followed (MAJOR.MINOR.PATCH)

**Technology & Compliance**:
- [ ] Next.js 15 App Router + React Server Components architecture
- [ ] TypeScript strict mode + Zod validation + tRPC typed APIs + Prisma ORM
- [ ] Shadcn/ui + Radix UI + TailwindCSS for UI
- [ ] Ultracite/Biome for linting/formatting
- [ ] UI text in Spanish (es-LA), code/comments/commits in English
- [ ] All inputs validated server-side (Zod schemas in tRPC `.input()`)
- [ ] No secrets committed; use environment variables + @t3-oss/env-nextjs

**Development Workflow**:
- [ ] CI gates pass: type check, lint, unit tests, integration/contract tests, E2E (Playwright)
- [ ] Conventional commits format (English)
- [ ] PR references affected constitutional principles when applicable

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
  This is the standard Glasify Lite Next.js 15 App Router structure.
  Mark files as NEW, MODIFY, or DELETE based on the feature requirements.
-->

```
glasify-lite/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                   # Route group: authentication pages
│   │   │   └── signin/
│   │   │       └── page.tsx          # Server Component
│   │   ├── (dashboard)/              # Route group: protected admin area
│   │   │   ├── layout.tsx            # Layout with role protection
│   │   │   └── dashboard/
│   │   │       └── page.tsx          # Admin dashboard
│   │   ├── (public)/                 # Route group: public area
│   │   │   ├── catalog/
│   │   │   │   ├── _components/      # Private components (organisms/molecules)
│   │   │   │   ├── _hooks/           # Feature-specific custom hooks
│   │   │   │   ├── _types/           # Feature-specific TypeScript types
│   │   │   │   ├── _utils/           # Feature-specific utilities (pure functions)
│   │   │   │   ├── [modelId]/        # Dynamic route
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx          # Server Component (catalog list)
│   │   │   ├── quote/
│   │   │   └── my-quotes/
│   │   ├── _components/              # Shared app components
│   │   ├── _utils/                   # Global app utilities
│   │   ├── api/                      # API Route handlers
│   │   │   └── trpc/[trpc]/
│   │   │       └── route.ts
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── not-found.tsx             # 404 page
│   │   └── global-error.tsx          # Error boundary
│   │
│   ├── components/                   # Shared UI components (atoms/molecules)
│   │   ├── ui/                       # Shadcn/ui components (atoms)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── form.tsx
│   │   └── back-button.tsx           # Shared molecules
│   │
│   ├── hooks/                        # Global custom hooks
│   │   └── use-toast.tsx
│   │
│   ├── lib/                          # Utilities and configurations
│   │   ├── logger.ts                 # Winston singleton (SERVER-SIDE ONLY)
│   │   └── utils.ts                  # Helper functions (cn, etc.)
│   │
│   ├── providers/                    # React Context providers
│   │   └── theme-provider.tsx
│   │
│   ├── server/                       # Backend logic (tRPC, Prisma)
│   │   ├── api/
│   │   │   ├── routers/              # tRPC routers (kebab-case procedures)
│   │   │   │   ├── catalog.ts
│   │   │   │   ├── quote.ts
│   │   │   │   └── admin.ts
│   │   │   ├── root.ts               # tRPC root router
│   │   │   └── trpc.ts               # tRPC config (procedures, context)
│   │   ├── auth/                     # NextAuth config
│   │   │   ├── config.ts
│   │   │   └── index.ts
│   │   ├── services/                 # Business logic services
│   │   │   └── catalog.service.ts
│   │   └── db.ts                     # Prisma singleton client
│   │
│   ├── trpc/                         # tRPC client configuration
│   │   ├── react.tsx                 # React client
│   │   ├── server.ts                 # Server client
│   │   └── query-client.ts
│   │
│   ├── styles/                       # Global CSS
│   │   └── globals.css
│   │
│   ├── middleware.ts                 # Next.js middleware (auth, i18n, etc.)
│   └── env.js                        # Environment validation (@t3-oss/env-nextjs)
│
├── prisma/                           # Database schema and migrations
│   ├── schema.prisma
│   ├── seed-cli.ts
│   ├── seed-tenant.ts
│   ├── data/                         # Seed data files
│   ├── factories/                    # Data factories for seeding
│   ├── seeders/                      # Seeder modules
│   └── migrations/                   # Prisma migrations
│
├── tests/                            # Unit, integration, contract tests
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   └── setup.ts
│
├── e2e/                              # Playwright E2E tests
│   ├── auth/
│   ├── catalog/
│   ├── quote/
│   └── example.spec.ts
│
├── public/                           # Static assets
│   └── assets/
│
├── docs/                             # Project documentation
├── .github/                          # GitHub configs and copilot instructions
├── next.config.js                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # TailwindCSS configuration
├── vitest.config.ts                  # Vitest configuration
├── playwright.config.ts              # Playwright configuration
└── package.json
```

**Naming Conventions**:
- **Files**: kebab-case (`quote-calculator.ts`, `catalog-search.tsx`)
- **Components**: PascalCase (`QuoteForm`, `CatalogSearch`)
- **Variables/Functions**: camelCase (`calculatePrice`, `handleSearchChange`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_GLASS_THICKNESS`, `DEFAULT_PAGE_LIMIT`)
- **Database entities**: PascalCase (`Manufacturer`, `QuoteItem`)
- **tRPC procedures**: kebab-case (`'quote.calculate-item'`, `'catalog.list-models'`)
- **Route Groups**: (lowercase) `(auth)`, `(dashboard)`, `(public)`
- **Private Folders**: _underscore-prefix `_components/`, `_hooks/`, `_utils/`, `_types/`

**Architecture Patterns**:
- **Server Components**: Default for all `page.tsx`, `layout.tsx`
- **Client Components**: Only in `_components/*-content.tsx` or when using `'use client'` directive
- **Atomic Design**: 
  - Atoms: `src/components/ui/*` (Shadcn/ui)
  - Molecules: `src/components/*` (shared combinations)
  - Organisms: `src/app/(route)/_components/*` (feature-specific)
  - Templates: `layout.tsx` files
  - Pages: `page.tsx` files
- **SOLID**: Single Responsibility, hooks for logic separation, utilities as pure functions
- **Defense in Depth**: Middleware → tRPC procedures → UI guards

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
