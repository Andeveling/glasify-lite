# Implementation Plan: Sistema de Catálogo de Colores para Modelos

**Branch**: `001-model-color-catalog` | **Date**: 2025-10-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-model-color-catalog/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements a color catalog system for window models with three core capabilities: (1) a master catalog of 10 industry-standard colors pre-seeded with RAL codes and hexadecimal values, (2) model-specific color assignments with adjustable percentage surcharges, and (3) a visual color selector for customer quotations with automatic price recalculation. The system ensures quote immutability through snapshot storage and supports multi-tenant configuration.

## Technical Context

**Language/Version**: TypeScript 5.8.2 (strict mode), Node.js ES2022 target  
**Primary Dependencies**: Next.js 15.2.3 (App Router), React 19.0.0 (Server Components), tRPC 11.0.0, Prisma 6.16.2, Zod 4.1.1, React Hook Form 7.63.0  
**Storage**: PostgreSQL via Prisma ORM (existing multi-tenant schema)  
**Testing**: Vitest 3.2.4 (unit/integration with jsdom), Playwright 1.55.1 (E2E)  
**Target Platform**: Web application (Next.js SSR + Client Components)  
**Project Type**: Full-stack web application with server-optimized data tables  
**Performance Goals**: <200ms color selection price recalculation, <5min admin color configuration workflow, <2s dashboard table load (100 items)  
**Constraints**: SSR with `force-dynamic` for admin routes (requires two-step cache invalidation), Winston logger server-side only, Spanish UI text, English code/comments  
**Scale/Scope**: 10 colors in master catalog (initial seed), ~5-10 colors per model average, supports unlimited models per tenant

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Reference: `.specify/memory/constitution.md` - verify feature complies with all principles.

### Core Values Compliance

- [x] **Clarity Over Complexity**: Design uses clear entity names (Color, ModelColor), descriptive procedures (colors.list, colors.create), simple Many-to-Many relationship
- [x] **Server-First Performance**: Heavy work done on server, appropriate caching strategy defined
  - [x] Caching strategy documented: Admin color management uses `force-dynamic` SSR (no cache), catalog data uses 5min ISR (rarely changes), client quote form loads colors with model data server-side
  - [x] SSR mutations use two-step invalidation: `utils.colors.invalidate()` + `router.refresh()` in admin panels
- [x] **One Job, One Place**: Separation of concerns: Color (master catalog), ModelColor (assignment + surcharge), QuoteItem (snapshot storage), dedicated seeders, isolated tRPC routers
- [x] **Flexible Testing**: Testing strategy defined - E2E first for user flows (color selection, price recalculation), unit tests for pricing calculations, integration tests for seeder idempotency
- [x] **Extend, Don't Modify**: Extends existing QuoteItem model (adds optional color fields), extends Model with colors relationship, no changes to pricing engine core (adds color surcharge as separate calculation step)
- [x] **Security From the Start**: Input validation and authorization checks at every entry point
  - [x] User permissions checked server-side: `adminProcedure` for color CRUD, public procedures for catalog viewing, ownership validation for quote modifications
  - [x] All user input validated with Zod schemas: hex code format (#RRGGBB regex), surcharge percentage range (0-100), unique name+hexCode constraint
- [x] **Track Everything Important**: Logging strategy defined for errors and significant events
  - [x] Winston logger used ONLY in server-side code: seeder execution logs, color CRUD operations, failed validations (duplicate colors)
  - [x] Error messages to users in Spanish ("El color ya existe", "Formato hexadecimal inválido"), technical logs in English ("Color seed failed: duplicate key")

### Language & Communication

- [x] Code/comments/commits in English only (enforced by Biome linter)
- [x] UI text in Spanish (es-LA) only: "Colores", "Seleccione un color", "Recargo", "Color predeterminado"
- [x] Commit messages follow Conventional Commits format: `feat: add color catalog system`, `refactor: optimize color seeder`

### Technology Constraints

- [x] Uses required stack: Next.js 15.2.3 (App Router), TypeScript 5.8.2 (strict), React 19.0.0, tRPC 11.0.0, Prisma 6.16.2, PostgreSQL
- [x] No prohibited technologies (no Vue/Angular/Svelte, no alternative CSS frameworks, Winston never imported in Client Components)
- [x] UI components use Shadcn/ui + Radix UI + TailwindCSS: ColorPicker (custom chip selector), existing ServerTable pattern for admin list

### Quality Gates

- [x] TypeScript strict mode enabled, no type errors expected (Zod schemas enforce runtime type safety)
- [x] Biome/Ultracite formatting rules followed (existing lefthook git hooks enforce pre-commit)
- [x] Tests planned for all user journeys: Playwright E2E (P1: admin creates color, P2: assign to model, P3: client selects color + PDF generation), Vitest unit (price calculation with surcharge)
- [x] Changelog entry planned: "feat(catalog): Add color selection system with 10 standard colors and model-specific surcharges"
- [x] Migration notes prepared: Prisma migration adds Color + ModelColor tables, extends QuoteItem with color snapshot fields, seeder runs automatically on first deployment

### Principle Priority Resolution

No conflicts detected. All principles align:
- Security (validation + auth) doesn't compromise clarity (simple schemas)
- Server-first (SSR) doesn't conflict with performance (appropriate caching per data type)
- Testing flexibility supports quality (E2E prioritized, then unit/integration as needed)

**Result**: ✅ PASS - No violations, no justifications required

## Project Structure

### Documentation (this feature)

```text
specs/001-model-color-catalog/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (technology decisions + patterns)
├── data-model.md        # Phase 1 output (Prisma schema design)
├── quickstart.md        # Phase 1 output (developer onboarding)
├── contracts/           # Phase 1 output (tRPC procedure contracts)
│   ├── colors.json      # Admin color CRUD procedures
│   ├── model-colors.json # Model color assignment procedures
│   └── quote-colors.json # Client color selection procedures
├── checklists/
│   └── requirements.md  # Spec quality validation (already complete)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

This is a **full-stack web application** using Next.js 15 App Router. The existing structure will be extended:

```text
src/
├── app/                                    # Next.js App Router
│   ├── (dashboard)/                        # Protected admin routes
│   │   └── admin/
│   │       ├── colors/                     # NEW: Color catalog management
│   │       │   ├── _components/
│   │       │   │   ├── color-form.tsx      # Create/edit color form
│   │       │   │   ├── color-list-table.tsx # ServerTable for colors
│   │       │   │   └── color-chip.tsx      # Reusable color preview component
│   │       │   ├── page.tsx                # Color list page (SSR force-dynamic)
│   │       │   ├── new/
│   │       │   │   └── page.tsx            # Create color page
│   │       │   └── [id]/
│   │       │       └── page.tsx            # Edit color page
│   │       └── models/
│   │           └── [id]/
│   │               └── colors/             # NEW: Model color assignment
│   │                   ├── _components/
│   │                   │   └── model-color-form.tsx # Assign colors + surcharges
│   │                   └── page.tsx        # Model colors configuration page
│   │
│   └── (public)/                           # Public routes
│       └── catalog/
│           └── [modelId]/
│               └── _components/
│                   └── color-selector.tsx  # MODIFIED: Add color selection UI
│
├── server/                                 # Backend logic
│   ├── api/
│   │   └── routers/
│   │       ├── colors.ts                   # NEW: Color catalog CRUD router
│   │       ├── model-colors.ts             # NEW: Model color assignment router
│   │       └── models.ts                   # MODIFIED: Extend with color queries
│   │
│   └── services/                           # Business logic
│       └── pricing/
│           └── calculate-price.ts          # MODIFIED: Add color surcharge calculation
│
├── lib/
│   └── validations/
│       ├── color.ts                        # NEW: Zod schemas for color validation
│       └── model-color.ts                  # NEW: Zod schemas for model color assignment
│
prisma/
├── schema.prisma                           # MODIFIED: Add Color, ModelColor models + extend QuoteItem
├── migrations/                             # NEW migration files
└── seeders/
    └── colors.seeder.ts                    # NEW: Seed 10 standard colors

tests/
├── unit/
│   └── pricing/
│       └── color-surcharge.test.ts         # NEW: Unit tests for color pricing
└── integration/
    └── seeders/
        └── colors.seeder.test.ts           # NEW: Seeder idempotency tests

e2e/
└── admin/
    └── colors/
        ├── create-color.spec.ts            # NEW: E2E test for P1 (admin creates color)
        ├── assign-color-to-model.spec.ts   # NEW: E2E test for P2 (assign to model)
        └── client-selects-color.spec.ts    # NEW: E2E test for P3 (client selection + PDF)
```

**Structure Decision**: 

We use the **existing Next.js 15 App Router structure** (Option 1: Single full-stack project). No separate backend/frontend directories needed as Next.js App Router integrates both with Server Components and tRPC API routes.

**Key Additions**:
- New admin route `/admin/colors` for color catalog management (P1)
- New nested route `/admin/models/[id]/colors` for model color assignment (P2)
- Modified catalog components to include color selector (P3)
- New tRPC routers for color operations
- Extended Prisma schema with Color + ModelColor entities
- New seeder for 10 standard colors

## Complexity Tracking

> **No violations detected** - Constitution Check passed with all criteria met. No justifications required.

---

## Phase 1 Completion Summary

### ✅ Completed Artifacts

**Phase 0: Research** (`research.md`)
- [x] Color storage and validation patterns (Zod + Prisma)
- [x] Many-to-many relationship design (explicit ModelColor junction)
- [x] Quote immutability strategy (snapshot pattern with 3 fields)
- [x] Seeder idempotency pattern (upsert with composite unique key)
- [x] Client-side price calculation (no API call, <200ms target)
- [x] Color deletion strategy (three-tier: prevent/soft/hard)
- [x] SSR cache invalidation (two-step: invalidate + refresh)
- [x] Color selector UX pattern (scrollable chips / grid)

**Phase 1: Data Model** (`data-model.md`)
- [x] Color entity specification (master catalog with RAL + hex)
- [x] ModelColor entity specification (junction with surcharge)
- [x] QuoteItem extension (3 snapshot fields for immutability)
- [x] Prisma schema changes (migration SQL included)
- [x] Entity relationships diagram
- [x] Validation rules and business logic
- [x] Performance indexes and query patterns

**Phase 1: API Contracts** (`contracts/*.json`)
- [x] colors.json - 6 admin procedures (list, getById, create, update, delete, checkUsage)
- [x] model-colors.json - 7 procedures (listByModel, assign, updateSurcharge, setDefault, unassign, bulkAssign, getAvailableColors)
- [x] quote-colors.json - 4 procedures (getModelColorsForQuote, calculatePriceWithColor, createQuoteItemWithColor, updateQuoteItemColor)

**Phase 1: Developer Onboarding** (`quickstart.md`)
- [x] 5-minute quick setup guide
- [x] Key concepts explanation
- [x] Data flow diagram
- [x] Common tasks with code examples
- [x] Testing guide (unit/integration/E2E)
- [x] Troubleshooting section
- [x] Performance notes and architecture decisions

**Agent Context Update**
- [x] Updated `.github/copilot-instructions.md` with TypeScript 5.8.2, Next.js 15.2.3, tRPC 11.0.0, Prisma 6.16.2, Zod 4.1.1, React Hook Form 7.63.0

### 📊 Phase 1 Metrics

**Documentation**:
- 4 comprehensive markdown files (research, data-model, quickstart, plan)
- 3 JSON API contract files (17 tRPC procedures total)
- 1 updated agent context file

**Design Decisions**:
- 8 research topics resolved with rationale + alternatives
- 4 entities designed (2 new, 2 extended)
- 17 API procedures specified with input/output schemas
- 3-tier deletion strategy defined
- Snapshot pattern for immutability

**Validation**:
- Constitution Check: ✅ PASS (all 7 core values + language + tech constraints)
- No principle conflicts
- No complexity violations requiring justification

### 🚀 Ready for Phase 2

All prerequisites for `/speckit.tasks` command are met:
- ✅ Specification validated (requirements.md checklist passed)
- ✅ Research complete (all technical unknowns resolved)
- ✅ Data model designed (Prisma schema ready for migration)
- ✅ API contracts defined (17 tRPC procedures with schemas)
- ✅ Developer onboarding prepared (quickstart guide)
- ✅ Constitution compliance verified (no violations)

**Next Command**: `/speckit.tasks` - Generate atomic implementation tasks

**Estimated Implementation Time**: 5-8 days (based on 3 user stories P1-P3 + testing + documentation)

---

## Notes for Implementation

### Critical Path

1. **Database First**: Run Prisma migration + seeder (10 standard colors)
2. **Backend**: Implement tRPC routers (colors, model-colors, quote extensions)
3. **Admin UI**: Color catalog management + model color assignment
4. **Client UI**: Color selector component + price calculation
5. **Testing**: E2E flows (P1 → P2 → P3) + unit tests for pricing
6. **Documentation**: Update CHANGELOG, add migration notes

### Risk Mitigation

- **Snapshot immutability**: Validate with integration test (change surcharge, verify old quotes unchanged)
- **Default color logic**: Test edge cases (last color removal, first color assignment)
- **Client price calculation**: Server-side validation to prevent tampering
- **SSR cache invalidation**: Test two-step pattern (invalidate + refresh) in admin mutations

### Dependencies

- No external API integrations required
- No new npm packages needed (uses existing stack)
- No infrastructure changes (PostgreSQL already in place)
- Compatible with existing multi-tenant architecture
