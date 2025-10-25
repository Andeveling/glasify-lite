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
- PostgreSQL (existing multi-tenant schema with Model, ProfileSupplier, User, Quote) (001-model-design-gallery)

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

**Canvas & Design Rendering** (001-model-design-gallery):
- Konva 9.x (2D canvas rendering library)
- react-konva 18.x (React bindings for Konva)
- Parametric design system with constraint-based adaptation
- Material-based color mapping (PVC=white, ALUMINUM=gray, WOOD=brown, MIXED=light gray)
- Design storage: JSON configuration with versioning (StoredDesignConfig v1.0)

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


## Design Rendering Patterns (001-model-design-gallery)

### Client Component Boundary

⚠️ **CRITICAL**: Konva rendering runs ONLY in Client Components (`'use client'`)

**✅ ALLOWED**:
- `DesignRenderer.tsx` - renders StoredDesignConfig via Konva Stage/Layer
- `DesignFallback.tsx` - placeholder when no design assigned
- `ModelDesignPreview.tsx` - preview in modal/gallery
- Canvas event handlers (click, drag, etc.)
- Lazy loading with `React.memo` + `Intersection Observer`

**❌ PROHIBITED**:
- Design rendering logic in Server Components
- Konva in Server Actions
- Design adaptation calculations in tRPC procedures (move to service layer)

### Design Data Flow

```
ModelDesign (DB) 
  → StoredDesignConfig (JSON, versioned v1.0)
  → validateDesignConfig() (Zod validation)
  → designAdapterService.adaptDesign(config, dimensions)
  → AdaptedDesign (resolved px values, material colors)
  → DesignRenderer (Konva Stage + shapes)
```

### Key Abstractions

**1. StoredDesignConfig** (`src/lib/design/types.ts`):
- Version-locked JSON structure (version: '1.0')
- Hierarchical: metadata → dimensions → constraints → shapes array
- Shape types: rect, circle, line, path
- Shape styles: fill (hex or 'material'), stroke, strokeWidth, opacity, cornerRadius
- Position/Size: supports absolute (px) or relative (%)

**2. Material Color Mapping** (`src/lib/design/material-colors.ts`):
- Singleton: Map of MaterialType to hex color (PVC=white, ALUMINUM=gray, WOOD=brown, MIXED=light-gray)
- Resolution: During adaptation, 'material' placeholders → actual hex colors
- Rule: All shapes must resolve 'material' fill before rendering

**3. Design Validation** (`src/lib/design/validation.ts`):
- `storedDesignConfigSchema`: Zod schema enforcing v1.0 structure, 1-100 shapes, constraint ranges
- `validateDesignConfig(config)`: Throws on invalid config (use for trusted data)
- `isValidDesignConfig(config)`: Safe check returning boolean (use for untrusted input)
- Constants: `MAX_SHAPES_PER_DESIGN=100`, `MIN_SHAPES_PER_DESIGN=1`, `MAX_OPACITY_VALUE=1`, `MIN_PERCENT_VALUE=0`, `MAX_PERCENT_VALUE=1`

**4. Design Adapter Service** (`src/server/services/design-adapter-service.ts` - to be created):
- `adaptDesign(config: StoredDesignConfig, baseWidth: number, baseHeight: number): AdaptedDesign`
- Converts relative positioning (%) → absolute (px) based on model dimensions
- Resolves material colors via `getMaterialColor()`
- Validates all shapes are complete before returning
- Throws if config invalid or color resolution fails

**5. DesignRenderer Component** (`src/app/_components/design/design-renderer.tsx` - to be created):
- Client Component with `'use client'` directive
- Props: `design: AdaptedDesign`, `width: number`, `height: number`, optional `onShapeClick?`
- Uses Konva Stage/Layer/Shape (rect, circle, line, path)
- `React.memo` wrapper for optimization
- Lazy load with `Intersection Observer` for off-screen designs
- Error boundary integration for render failures

### Parametric Design System

**Constraint-Based Adaptation**:
- Frame thickness: Logical constraints (frameThicknessMin/Max, e.g., 40-80mm)
- Glass fill: Automatically fills remaining space with `glassMargin` offset
- Dimension adaptation: All percentages calculated relative to model dimensions
- Proportional scaling: Designs adapt to different model sizes

**Example**:
```typescript
// Fixed window design for 1000x1200mm
// Logical constraints in mm:
- frameThickness: 40-80mm (adapts to model)
- glassMargin: 5mm (offset from frame edge)

// Rendered at 800x960px:
- Frame rect: x:0, y:0, w:800, h:960 (fills container)
- Glass rect: x:40px (scaled from 40mm), y:40px, fills remaining with 5px margin
```

### Design Database & Seeding

**ModelDesign Table**:
- `id`: cuid, primary key
- `name` (unique): slug for identification, e.g., 'fixed-window-simple'
- `nameEs`: Spanish label for UI, e.g., 'Ventana Fija Simple'
- `type`: ModelType enum (fixed_window, sliding_window_horizontal, etc.)
- `config`: StoredDesignConfig JSON (versioned)
- `thumbnailUrl`: Optional preview image
- `isActive`: Boolean flag for soft deletion
- `displayOrder`: Integer for gallery ordering
- Indexes: `(type, isActive)`, `displayOrder` for query performance

**Model Relationship**:
- `Model.designId?` (optional): Foreign key to ModelDesign
- `Model.type?` (optional): ModelType enum for categorization
- Cascade: onDelete SetNull (preserve model if design deleted)

**Seeding** (`prisma/seeders/seed-designs.ts`):
- Idempotent creation: Check if design exists by name before creating
- Error tracking: SeedResult interface captures skipped/errors per seed
- Integration: Step 8/8 in seed orchestrator after Step 7 (Assign Solutions)

### File Organization

```
src/lib/design/
├── types.ts                 # StoredDesignConfig, ShapeDefinition, AdaptedDesign
├── material-colors.ts       # MATERIAL_COLORS constant, helper functions
└── validation.ts            # Zod schemas, validation functions

src/server/services/
└── design-adapter-service.ts  # adaptDesign(config, dimensions): AdaptedDesign (SERVER-SIDE)

src/app/_components/design/
├── design-renderer.tsx      # Client Component, Konva rendering (MUST be 'use client')
├── design-fallback.tsx      # Placeholder when no design
└── model-card.tsx           # Integration with catalog card

prisma/seeders/
└── seed-designs.ts          # Design factories + seedModelDesigns()

prisma/migrations/
└── 20251025184911_add_model_designs/  # ModelDesign table + ModelType enum
```

### When Implementing Design Components

1. **Validate Early**: Always call `validateDesignConfig()` in service layer (server-side)
2. **Adapt Before Render**: Use `designAdapterService.adaptDesign()` to resolve all values to px
3. **Render Safely**: DesignRenderer receives AdaptedDesign (all values guaranteed)
4. **Handle Errors**: Catch adaptation errors, show fallback in DesignFallback component
5. **Optimize**: Wrap DesignRenderer with `React.memo`, use `Intersection Observer` for lazy loading
6. **Test Both Layers**: Unit tests for validation/adaptation (server), snapshot tests for renderer (client)

---

## Recent Changes
- 001-model-design-gallery: Added TypeScript 5.8.2 (strict mode), Node.js ES2022 target, Konva 9.x + react-konva 18.x, design rendering patterns (Phase 2: Foundation complete)
- 016-admin-dashboard-charts: Added TypeScript 5.8.2 (strict mode), Node.js (ES2022 target)
- 015-static-glass-taxonomy: Added TypeScript 5.9.3, Node.js (ES2022 target via Next.js 15.5.4) + Next.js 15.5.4 (App Router), Prisma 6.17.0 (ORM), tRPC 11.6.0 (API), Zod 4.1.12 (validation), React Hook Form 7.64.0
