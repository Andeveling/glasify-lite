# Glasify Lite Development Guidelines

**Project Type**: Full-stack glass quotation management application  
**Last Updated**: 2025-01-21  
**Constitution**: See `.specify/memory/constitution.md`

## Code Generation Priorities

When generating code for this repository:

1. **Version Compatibility**: Always detect and respect exact versions of languages, frameworks and libraries
2. **Context Files**: Prioritize patterns defined in `.github/instructions/` directory
3. **Codebase Patterns**: When context files don't provide guidance, scan codebase for established patterns
4. **Architectural Consistency**: Maintain Next.js 15 App Router + tRPC style and boundaries
5. **Code Quality**: Prioritize maintainability, performance, security, accessibility and testability

---

## Active Technologies
- PostgreSQL via Prisma ORM (existing schema in `prisma/schema.prisma`) (011-admin-catalog-management)
- TypeScript 5.8.2 (strict mode), Node.js (ES2022 target) + Next.js 15.2.3 (App Router), React 19.0.0 (Server Components), tRPC 11.0.0, TanStack Query 5.69.0, React Hook Form 7.63.0, Zod 4.1.1 (012-simplify-profile-suppliers)
- PostgreSQL via Prisma 6.16.2 (existing ProfileSupplier schema) (012-simplify-profile-suppliers)
- TypeScript 5.8.2 (strict mode), Node.js ES2022 target + Next.js 15.2.3 (App Router), React 19.0.0 (Server Components), tRPC 11.0.0, TanStack Query 5.69.0, React Hook Form 7.63.0, Zod 4.1.1 (013-standardize-glass-suppliers)
- PostgreSQL via Prisma 6.16.2 (existing GlassSupplier schema with GlassTypes relationship) (013-standardize-glass-suppliers)
- TypeScript 5.9.3, Node.js (ES2022 target via Next.js 15.5.4) + Next.js 15.5.4 (App Router), Prisma 6.17.0 (ORM), tRPC 11.6.0 (API), Zod 4.1.12 (validation), React Hook Form 7.64.0 (015-static-glass-taxonomy)
- PostgreSQL via Prisma ORM (existing multi-tenant schema with GlassType, GlassSolution, GlassSupplier models) (015-static-glass-taxonomy)
- PostgreSQL via Prisma ORM (existing schema: Quote, QuoteItem, Model, GlassType, ProfileSupplier, User, TenantConfig) (016-admin-dashboard-charts)
- TypeScript 5.8.2 (strict mode), Node.js (ES2022 target) + Next.js 15.2.3 (App Router), React 19.0.0 (Server Components), tRPC 11.0.0, Prisma 6.16.2, shadcn/ui charts (Recharts 2.12.7), date-fns-tz (timezone handling) (016-admin-dashboard-charts)

**Language/Runtime**:
- TypeScript 5.8.2 (strict mode), Node.js (ES2022 target)

**Framework**:
- Next.js 15.2.3 (App Router, React Server Components 19.0.0)

**Core Dependencies**:
- tRPC 11.0.0 (type-safe API)
- Prisma 6.16.2 (PostgreSQL ORM)
- NextAuth.js 5.0.0-beta.25 (authentication)
- TanStack Query 5.69.0 (React Query)
- Zod 4.1.1 (schema validation)
- React Hook Form 7.63.0 (forms)

**UI Stack**:
- Shadcn/ui + Radix UI (components)
- TailwindCSS 4.0.15 (styling)

**Development Tools**:
- Ultracite 5.4.4 + Biome 2.2.4 (linting/formatting)
- Vitest 3.2.4 (unit/integration tests with jsdom)
- Playwright 1.55.1 (E2E tests)
- Winston 3.17.0 (server-side logging)
- Lefthook 1.13.4 (git hooks)

---

## Critical Rules

### Winston Logger - Server-Side ONLY

⚠️ **IMPORTANT**: Winston uses Node.js modules (`fs`, `path`) that are **NOT available in browser**.

**✅ ALLOWED** (Server-Side):
- Server Components
- Server Actions (`'use server'`)
- API Route Handlers (`/api/*`)
- tRPC Procedures (`/server/api/routers`)
- Middleware (`middleware.ts`)
- Server-side utilities (`/server/*`)

**❌ PROHIBITED** (Client-Side):
- Client Components (`'use client'`)
- Custom Hooks (`use*.ts`)
- Client-side utilities used by components
- Any browser-executed code

**Client-Side Alternatives**:
- Use `console` (development only)
- Use toast notifications (user feedback)
- Use error boundaries (error handling)

**Client-Side Alternatives**:
- Use `console` (development only)
- Use toast notifications (user feedback)
- Use error boundaries (error handling)

### Naming Conventions

- **Files**: kebab-case (`quote-calculator.ts`, `catalog-search.tsx`)
- **Components**: PascalCase (`QuoteForm`, `CatalogSearch`)
- **Variables/Functions**: camelCase (`calculatePrice`, `handleSearchChange`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_GLASS_THICKNESS`, `DEFAULT_PAGE_LIMIT`)
- **Database entities**: PascalCase (`Manufacturer`, `QuoteItem`)
- **tRPC procedures**: kebab-case (`'quote.calculate-item'`, `'catalog.list-models'`)
- **Route Groups**: (lowercase) `(auth)`, `(dashboard)`, `(public)`
- **Private Folders**: _underscore-prefix `_components/`, `_hooks/`, `_utils/`, `_types/`

- **Route Groups**: (lowercase) `(auth)`, `(dashboard)`, `(public)`
- **Private Folders**: _underscore-prefix `_components/`, `_hooks/`, `_utils/`, `_types/`

### Language Rules

**Code/Comments/Commits**: English ONLY
- Conventional commits format
- Examples: `feat: add role-based access`, `fix: correct pricing formula`

**UI Text**: Spanish (es-LA) ONLY
- "Cotización" not "Quote"
- "Vidrio" not "Glass"
- "Modelo" not "Model"
- "Fabricante" not "Manufacturer"

---

## Project Structure

Next.js 15 App Router with strict organizational rules:

```
glasify-lite/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                   # Route group: authentication pages
│   │   ├── (dashboard)/              # Route group: protected admin area
│   │   ├── (public)/                 # Route group: public area
│   │   │   └── catalog/
│   │   │       ├── _components/      # Private components (organisms/molecules)
│   │   │       ├── _hooks/           # Feature-specific custom hooks
│   │   │       ├── _types/           # Feature-specific TypeScript types
│   │   │       ├── _utils/           # Feature-specific utilities (pure functions)
│   │   │       └── page.tsx          # Server Component
│   │   ├── _components/              # Shared app components
│   │   ├── _utils/                   # Global app utilities
│   │   ├── api/trpc/[trpc]/         # tRPC API routes
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   │
│   ├── components/ui/                # Shadcn/ui atoms (NO business logic)
│   ├── hooks/                        # Global custom hooks
│   ├── lib/                          # Utilities and configurations
│   │   ├── logger.ts                 # Winston singleton (SERVER-SIDE ONLY)
│   │   └── utils.ts                  # Helper functions
│   ├── providers/                    # React Context providers
│   ├── server/                       # Backend logic (tRPC, Prisma)
│   │   ├── api/routers/              # tRPC routers (kebab-case procedures)
│   │   ├── auth/                     # NextAuth config
│   │   ├── services/                 # Business logic services
│   │   └── db.ts                     # Prisma singleton client
│   ├── trpc/                         # tRPC client configuration
│   ├── middleware.ts                 # Next.js middleware
│   └── env.js                        # Environment validation
│
├── prisma/                           # Database schema and migrations
├── tests/                            # Unit, integration, contract tests
├── e2e/                              # Playwright E2E tests
└── docs/                             # Project documentation
```

**Organization Rules**:
- Route Groups: `(name)` for organizing routes without affecting URLs
- Private Files: `_name` for folders/files that are not routes (colocation)
- Nested Layouts: Share UI between related routes
- Loading/Error: Use `loading.tsx` and `error.tsx` for states

**Organization Rules**:
- Route Groups: `(name)` for organizing routes without affecting URLs
- Private Files: `_name` for folders/files that are not routes (colocation)
- Nested Layouts: Share UI between related routes
- Loading/Error: Use `loading.tsx` and `error.tsx` for states

---

## Arquitectura Next.js 15 + SOLID + Atomic Design

### Server-First Architecture

- **Server Components by default**, Client Components only when necessary
- Use `'use client'` directive ONLY for: interactivity, React hooks, browser APIs
- Leverage Server Actions for data mutations
- ISR (Incremental Static Regeneration) with `revalidate` for semi-static content
- Streaming with `<Suspense>` for better Core Web Vitals

### SOLID Principles

- **Single Responsibility**: Each module/component has ONE clear responsibility
- **Open/Closed**: Components open for extension, closed for modification
- **Liskov Substitution**: Components can be replaced by their variants
- **Interface Segregation**: Specific props, not generic interfaces
- **Dependency Inversion**: Depend on abstractions (hooks, contexts) not implementations

### Atomic Design

- **Atoms**: Basic UI components (`Button`, `Input`) in `src/components/ui/`
- **Molecules**: Simple combinations of atoms
- **Organisms**: Complex components with logic in `_components/`
- **Templates**: Page layouts without data as `layout.tsx`
- **Pages**: Server Components that orchestrate everything in `page.tsx`

- **Templates**: Page layouts without data as `layout.tsx`
- **Pages**: Server Components that orchestrate everything in `page.tsx`

--- 

### RBAC Best Practices

✅ **DO**:
- Check authorization server-side (middleware, tRPC, Server Components)
- Use `adminProcedure` for admin-only tRPC procedures
- Use `getQuoteFilter` for role-based data filtering
- Log authorization failures with Winston (server-side only)
- Throw Spanish error messages for user feedback
- Use Server Component guards for UI (not security)

❌ **DON'T**:
- Trust client-side authorization (UI guards are UX, not security)
- Use Winston in Client Components (server-side only)
- Forget to validate ownership in adminOrOwner procedures
- Hard-code role checks (use helper functions)
- Mix authorization with business logic (separate concerns)
---
## Server-Optimized Data Tables

### Architecture Pattern

Glasify uses a **server-first data table architecture** that leverages URL state management and Next.js Server Components for optimal performance and SEO.

**Core Principles**:
- URL as single source of truth for table state (page, sort, filters, search)
- Server Components for data fetching and rendering
- Client Components only for interactive controls
- Debounced search (300ms) for reduced server load
- Database indexes for query performance
- Type-safe tRPC procedures with Zod validation

### Component Structure

```
src/app/_components/server-table/
├── server-table.tsx          # Main table container (Client Component)
├── table-header.tsx          # Sortable column headers (Client Component)
├── table-search.tsx          # Debounced search input (Client Component)
├── table-pagination.tsx      # Pagination controls (Client Component)
└── table-filters.tsx         # Generic filter component (Client Component)

src/app/(dashboard)/admin/models/
├── _components/
│   └── models-table.tsx      # Feature-specific table (Client Component)
└── page.tsx                  # Server Component with data fetching
```
**When generating code, ALWAYS**:

1. Detect exact project versions
2. Follow established codebase patterns
3. **For dashboard routes: Use SSR with `dynamic = 'force-dynamic'`** (no ISR)
4. **Create pages as Server Components** (delegate interactivity to Client Components)
5. **For SSR mutations: Use `router.refresh()` after `invalidate()`** (two-step pattern)
6. **Never use Winston logger in Client Components** (server-side only)
7. **Apply RBAC patterns** (middleware, tRPC procedures, UI guards)
8. **Use adminProcedure for admin-only APIs** (not manual role checks)
9. **Use getQuoteFilter for data filtering** (role-based WHERE clauses)
10. **Use server-optimized table pattern** (URL state, debounced search, database indexes)
11. **Use centralized formatters from `@lib/format`** (with tenant context)
12. **Implement optimistic UI for mutations** (with rollback on error)
13. Apply SOLID principles and Atomic Design
14. Use Next.js App Router folder structure
15. Prioritize Server Components over Client Components
16. Add metadata for SEO on public pages
17. Write testable and well-documented code
18. Use Spanish only in UI text, everything else in English
19. Never create Barrels (index.ts) or barrel files anywhere
20. Follow project naming and organization conventions


## Recent Changes
- 016-admin-dashboard-charts: Added TypeScript 5.8.2 (strict mode), Node.js (ES2022 target)
- 015-static-glass-taxonomy: Added TypeScript 5.9.3, Node.js (ES2022 target via Next.js 15.5.4) + Next.js 15.5.4 (App Router), Prisma 6.17.0 (ORM), tRPC 11.6.0 (API), Zod 4.1.12 (validation), React Hook Form 7.64.0
