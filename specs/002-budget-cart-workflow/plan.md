# Implementation Plan: Budget Cart Workflow with Authentication

**Branch**: `002-budget-cart-workflow` | **Date**: 2025-10-09 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-budget-cart-workflow/spec.md`

**Note**: This plan follows the hybrid tRPC + Server Actions architecture as outlined in [tRPC Server Actions blog post](https://trpc.io/blog/trpc-actions).

## Summary

Implement a shopping cart workflow that allows users to configure multiple window models, add them to a cart, authenticate with Google OAuth, and generate formal quotes with 15-day validity. The implementation uses a hybrid approach: **tRPC Server Actions** for mutations (add to cart, generate quote) and traditional tRPC procedures for queries (list quotes, get quote details), following the "Don't Make Me Think" UX principle with auto-generated item names and streamlined quote generation.

**Key Technical Approach**:
- Cart state managed client-side with `sessionStorage` (cleared on browser close)
- tRPC Server Actions for progressive enhancement (works without JS)
- NextAuth.js session-based authentication (already configured)
- Prisma schema extensions for `QuoteItem.name`, `QuoteItem.quantity`, and `Quote` project fields
- Real-time price recalculation using existing `catalog.calculate-price` procedure

## Technical Context

**Language/Version**: TypeScript 5.8.2 (strict mode), ECMAScript ES2022  
**Primary Dependencies**: 
  - Next.js 15.2.3 (App Router with React Server Components)
  - tRPC 11.0.0 (`experimental_caller` + `experimental_nextAppDirCaller` for Server Actions)
  - React 19.0.0 (useActionState for progressive enhancement)
  - React Hook Form 7.63.0 + Zod 4.1.1 (form validation)
  - NextAuth.js 5.0.0-beta.25 (Google OAuth already configured)
  - Prisma 6.16.2 (PostgreSQL ORM)
  - TanStack Query 5.69.0 (client-side caching for queries)
  
**Storage**: PostgreSQL 17 via Prisma ORM (docker-compose local dev)

**Testing**: 
  - Vitest 3.2.4 with jsdom (unit tests)
  - @testing-library/react (component testing)
  - Playwright 1.55.1 (E2E tests)
  - Contract tests for tRPC procedures (Zod schema validation)
  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), mobile-first responsive design, Linux server deployment

**Project Type**: Web application (Next.js full-stack)

**Performance Goals**: 
  - Cart operations < 50ms (client-side state)
  - Price recalculation < 200ms (tRPC procedure)
  - Quote generation < 1000ms (database transaction)
  - Real-time updates < 500ms (SC-004 requirement)

**Constraints**: 
  - Cart persists only during session (cleared on browser close)
  - Prices locked at quote generation time (not cart add time)
  - Authentication required only for quote generation/viewing
  - Must work with progressive enhancement (no-JS fallback)
  
**Scale/Scope**: 
  - Single manufacturer MVP (multi-tenant ready)
  - ~5-20 quote items per cart (typical use case)
  - ~100-1000 quotes per month (initial scale)
  - 3 new pages (`/cart`, `/quotes`, `/quotes/[id]`)
  - 2 schema migrations (QuoteItem + Quote fields)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Single Responsibility (SRP)
- **Cart State Management**: Separate hook (`useCart`) manages cart operations (add, update, remove, clear)
- **Quote Generation Service**: Dedicated tRPC Server Action handles quote creation with transaction
- **Authentication Guard**: Middleware handles auth redirect logic, not mixed with business logic
- **Price Calculation**: Existing `catalog.calculate-price` procedure reused (no duplication)

### ✅ Open/Closed (OCP)  
- **Extending Existing Form**: Adds "Add to Cart" button to existing `ModelForm` without modification
- **tRPC Router Extension**: New `cart` router added to `appRouter` without changing existing routers
- **Schema Extension**: Adds fields to existing `Quote` and `QuoteItem` models (backward compatible)
- **Middleware Pattern**: Auth protection via Next.js middleware (reusable for future protected routes)

### ✅ Test-First (NON-NEGOTIABLE)
- Unit tests for cart state logic (`useCart` hook)
- Unit tests for name generation utility (`generateItemName`)
- Contract tests for new tRPC Server Actions (input/output validation)
- Integration tests for quote generation flow (cart → auth → quote)
- E2E tests for complete user journey (Playwright)

### ✅ Integration & Contract Testing
- **tRPC Server Actions**: Input/output schemas with Zod (auto-validated)
- **Database Integration**: Prisma transaction tests for quote generation
- **Auth Integration**: NextAuth session validation tests
- **Client-Server Contract**: Cart data structure matches `QuoteItem` schema

### ✅ Observability & Versioning
- **Structured Logging**: Winston logger for all cart/quote operations with correlation IDs
- **Error Tracking**: TRPCError codes (BAD_REQUEST, UNAUTHORIZED) for client handling
- **Schema Versioning**: Migration files for Quote/QuoteItem changes (Prisma migrate)
- **API Versioning**: tRPC procedures follow kebab-case naming convention

**Gate Status**: ✅ PASS - All constitutional principles satisfied

## Project Structure

### Documentation (this feature)

```
specs/002-budget-cart-workflow/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── cart-actions.schema.ts    # tRPC Server Action schemas
│   └── quote-queries.schema.ts   # tRPC query schemas
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app/                          # Next.js 15 App Router
│   ├── (dashboard)/              # Route group: authenticated area
│   │   ├── quotes/               # NEW: Quote history page
│   │   │   ├── page.tsx          # List all user quotes
│   │   │   └── [quoteId]/        # NEW: Quote detail page
│   │   │       └── page.tsx
│   │   └── layout.tsx            # Protected layout (auth required)
│   │
│   ├── (public)/                 # Route group: public area
│   │   ├── cart/                 # NEW: Cart management page
│   │   │   ├── _components/      # Cart-specific components
│   │   │   │   ├── cart-item.tsx           # Individual cart item row
│   │   │   │   ├── cart-summary.tsx        # Totals and checkout CTA
│   │   │   │   └── empty-cart-state.tsx    # Empty state component
│   │   │   ├── _hooks/           # Cart-specific hooks
│   │   │   │   ├── use-cart.ts             # Cart state management
│   │   │   │   └── use-cart-storage.ts     # sessionStorage persistence
│   │   │   └── page.tsx          # Cart list view
│   │   │
│   │   ├── catalog/[modelId]/    # EXTEND: Existing model detail page
│   │   │   └── _components/form/
│   │   │       ├── model-form.tsx            # MODIFY: Add "Add to Cart" button
│   │   │       └── add-to-cart-button.tsx    # NEW: Cart button component
│   │   │
│   │   └── quote/                # NEW: Quote generation flow
│   │       └── new/
│   │           ├── _components/
│   │           │   └── quote-generation-form.tsx
│   │           └── page.tsx      # Quote generation page (requires auth)
│   │
│   ├── _components/              # Shared app components
│   │   └── cart-indicator.tsx    # NEW: Cart badge in navbar (item count)
│   │
│   ├── _actions/                 # NEW: tRPC Server Actions directory
│   │   ├── cart.actions.ts       # add-to-cart, update-cart-item, remove-from-cart
│   │   └── quote.actions.ts      # generate-quote-from-cart
│   │
│   └── middleware.ts             # EXTEND: Add auth protection for /quotes
│
├── components/ui/                # Shadcn/ui atoms (no changes needed)
│
├── lib/
│   └── utils/                    # NEW: Utility functions
│       ├── generate-item-name.ts # Auto-generate item names (VEKA-001)
│       └── cart.utils.ts         # Cart-related pure functions
│
├── server/
│   ├── api/
│   │   ├── routers/
│   │   │   ├── cart.ts           # NEW: Cart queries (list items, get totals)
│   │   │   ├── quote.ts          # EXTEND: Add quote queries (list-user-quotes, get-quote-by-id)
│   │   │   └── index.ts          # MODIFY: Export cart router
│   │   │
│   │   ├── trpc.ts               # EXTEND: Add serverActionProcedure + protectedAction
│   │   └── root.ts               # MODIFY: Add cart router to appRouter
│   │
│   └── services/
│       └── quote.service.ts      # NEW: Quote generation business logic
│
├── types/                        # NEW: Shared TypeScript types
│   ├── cart.types.ts             # CartItem, CartState interfaces
│   └── quote.types.ts            # QuoteInput, QuoteOutput interfaces
│
prisma/
├── schema.prisma                 # EXTEND: Add fields to Quote + QuoteItem
└── migrations/
    ├── YYYYMMDD_add_quote_item_name_and_quantity/
    └── YYYYMMDD_add_quote_project_fields/

e2e/                              # NEW: E2E tests
├── cart/
│   ├── add-to-cart.spec.ts       # Test adding items to cart
│   └── cart-management.spec.ts   # Test editing/removing items
└── quote/
    ├── quote-generation.spec.ts  # Test complete quote flow
    └── quote-history.spec.ts     # Test viewing quote history

tests/
├── unit/
│   ├── hooks/
│   │   └── use-cart.test.ts      # Cart hook logic tests
│   └── utils/
│       └── generate-item-name.test.ts
│
├── contract/
│   ├── cart-actions.test.ts      # tRPC Server Action contract tests
│   └── quote-queries.test.ts     # tRPC query contract tests
│
└── integration/
    └── quote-generation.test.ts  # Full quote generation flow test
```

**Structure Decision**: Web application using Next.js 15 App Router with hybrid tRPC architecture. Cart management uses client-side state (sessionStorage) with tRPC Server Actions for mutations. Quote operations use protected procedures requiring authentication. Existing catalog structure extended, not replaced. New routes follow (dashboard) route group pattern for auth-protected pages.

**Key Architectural Decisions**:
1. **Hybrid tRPC Approach**: Server Actions for mutations (progressive enhancement), traditional procedures for queries (caching benefits)
2. **Client-Side Cart**: sessionStorage for cart state (fast UX, no server dependency until quote generation)
3. **Route Organization**: Use Next.js route groups `(dashboard)` for protected routes, `(public)` for open access
4. **Component Colocation**: Cart/Quote components colocated with their pages (`_components`, `_hooks`)
5. **Server Actions Directory**: Centralized `app/_actions/` for tRPC Server Actions (decorated with `"use server"`)

## Complexity Tracking

*No constitutional violations detected - no complexity justification needed.*

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
