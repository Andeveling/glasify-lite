# Implementation Plan: Edición de Items del Carrito

**Branch**: `019-edit-cart-items` | **Date**: 2025-11-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-edit-cart-items/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementar funcionalidad de edición en línea de items del carrito de compras, permitiendo a los clientes modificar dimensiones (ancho/alto) y tipo de vidrio sin eliminar y recrear el item. Se utilizará un modal de edición inspirado en el patrón de Just Value Doors con recálculo único al confirmar cambios, no en tiempo real. Incluye visualización de imagen del modelo en cada item del carrito para mejorar la identificación visual.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode), Node.js ES2022  
**Primary Dependencies**: Next.js 16.0.1 (App Router), React 19.2.0, tRPC 11.6.0, React Hook Form 7.64.0, Zod 4.1.12, TanStack Query 5.90.2  
**Storage**: PostgreSQL via Prisma 6.18.0 (existing schema - CartItem, Model, GlassType entities)  
**Testing**: Vitest 4.0.4 (unit/integration), Playwright 1.56.0 (E2E)  
**Target Platform**: Web (Next.js SSR/CSR hybrid)  
**Project Type**: Web application (Next.js App Router with tRPC backend)  
**Performance Goals**: 
- Edición de item completada en <30 segundos (user interaction time)
- Recálculo de precio <2 segundos (server response)
- Carga de imágenes de modelos <1 segundo (optimized thumbnails)
- 95% tasa de éxito en ediciones sin errores de validación

**Constraints**: 
- SSR compatible: Mutations require `router.refresh()` after `invalidate()` (forced-dynamic pages)
- Winston logger SERVER-SIDE ONLY (never in Client Components)
- Dimensiones con precisión decimal según configuración del tenant
- Validación de compatibilidad vidrio-modelo server-side
- Prevención de edición concurrente del mismo item

**Scale/Scope**: 
- ~10-50 items por carrito típico
- Soporte para 100+ modelos con imágenes
- 20+ tipos de vidrio disponibles
- 1000+ usuarios concurrentes esperados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Reference: `.specify/memory/constitution.md` - verify feature complies with all principles.

### Core Values Compliance

- [x] **Clarity Over Complexity**: Design uses clear, descriptive names and simple logic
  - Modal de edición `cart-item-edit-modal.tsx` con intención clara
  - Hooks separados: `use-cart-item-mutations.ts` (mutaciones), `use-cart-data.ts` (fetching)
  - Utils con funciones puras: `getDefaults()`, `transformEditData()`
  
- [x] **Server-First Performance**: Heavy work done on server, appropriate caching strategy defined
  - [x] Caching strategy documented:
    - Cart data: No cache (user-specific, changes frequently)
    - Model images: 5 min cache (rarely changes, shared across users)
    - Glass types per model: 5 min cache (catalog data, semi-static)
  - [x] SSR mutations use two-step invalidation: `invalidate()` + `router.refresh()`
    - Cart page uses `dynamic = 'force-dynamic'` (SSR)
    - After edit mutation: `utils.cart.get.invalidate()` + `router.refresh()`
    
- [x] **One Job, One Place (SOLID Architecture)**: Modular architecture with clear separation
  - [x] Forms follow mandatory file organization:
    ```
    cart/
    ├── _components/
    │   ├── cart-item.tsx                    # UI orchestration <100 lines
    │   ├── cart-item-edit-modal.tsx         # Modal UI <100 lines
    │   └── cart-item-image.tsx              # Image with fallback
    ├── _hooks/
    │   ├── use-cart-item-mutations.ts       # Mutations + cache
    │   └── use-cart-data.ts                 # Data fetching
    ├── _schemas/
    │   └── cart-item-edit.schema.ts         # Zod validation
    ├── _utils/
    │   ├── cart-item-edit.utils.ts          # Defaults, transforms, types
    │   └── cart-price-calculator.ts         # Pricing logic
    └── _constants/
        └── cart-item.constants.ts           # Image sizes, placeholders
    ```
  - [x] No SOLID violations:
    - Forms are UI-only orchestration (<100 lines)
    - Mutations isolated in `use-cart-item-mutations.ts`
    - Schemas extracted to `cart-item-edit.schema.ts`
  - [x] Magic numbers extracted:
    - `CART_ITEM_IMAGE_SIZE = 80` (px)
    - `DEFAULT_IMAGE_PLACEHOLDER = '/assets/placeholder-model.png'`
    - `MIN_DIMENSION = 100` (mm)
    - `MAX_DIMENSION = 3000` (mm)
  - [x] Default values in utils:
    - `getDefaultCartItemValues(item)` in `cart-item-edit.utils.ts`
  - [x] Business logic separated:
    - Price calculation in `cart-price-calculator.ts`
    - Validation in schemas
    - UI rendering in components
    
- [x] **Flexible Testing**: Testing strategy defined
  - Unit tests: Price calculator, utils, transformations
  - Integration tests: tRPC procedures (edit, validate compatibility)
  - E2E tests: Full edit flow (open modal → change dimensions → change glass → confirm → verify update)
  - Tests written during implementation (TDD for critical paths like price calculation)
  
- [x] **Extend, Don't Modify**: New features add code, don't change existing working code
  - Adds new edit functionality without modifying existing cart display logic
  - Reuses existing form components from catalog where possible
  - New tRPC procedures (`cart.updateItem`) don't modify existing ones
  
- [x] **Security From the Start**: Input validation and authorization checks at every entry point
  - [x] User permissions checked server-side:
    - tRPC middleware verifies cart ownership (userId/sessionId)
    - Server-side validation before any database write
  - [x] All user input validated with Zod schemas:
    - `cart-item-edit.schema.ts` validates dimensions, glassTypeId
    - Server-side compatibility check (glass type compatible with model)
    - Dimension range validation against model constraints
    
- [x] **Track Everything Important**: Logging strategy defined
  - [x] Winston logger used ONLY in server-side code:
    - tRPC procedures log edit attempts, validation failures
    - Server Actions log cart modifications
    - NO logging in Client Components (use console in dev)
  - [x] Error messages:
    - Users see Spanish errors: "Las dimensiones exceden el límite del modelo"
    - Logs contain English technical details: "Dimension validation failed for modelId X"

### Language & Communication

- [x] Code/comments/commits in English only
- [x] UI text in Spanish (es-LA) only
  - "Editar" button, "Guardar cambios", "Cancelar"
  - Error messages: "Vidrio incompatible con este modelo"
- [x] Commit messages follow Conventional Commits format
  - `feat(cart): add inline item editing with modal`
  - `feat(cart): display model images in cart items`

### Technology Constraints

- [x] Uses required stack: Next.js 16 (App Router), TypeScript (strict), React 19, tRPC, Prisma, PostgreSQL
- [x] No prohibited technologies
- [x] UI components use Shadcn/ui + Radix UI + TailwindCSS
  - Dialog component for edit modal
  - Form components from shadcn/ui
  - Button, Input, Select from component library

### Quality Gates

- [x] TypeScript strict mode enabled, no type errors expected
- [x] Biome/Ultracite formatting rules followed
- [x] Tests planned for all user journeys
  - P1: Display image in cart (E2E + unit)
  - P2: Edit dimensions (E2E + integration + unit)
  - P2: Change glass type (E2E + integration)
  - P3: Single recalculation (unit + integration)
- [x] Changelog entry planned:
  ```markdown
  ### Added
  - Edición en línea de items del carrito con modal de edición
  - Visualización de imágenes de modelos en items del carrito
  - Recálculo de precio al confirmar cambios (no en tiempo real)
  - Validación de compatibilidad vidrio-modelo en edición
  ```
- [x] Migration notes: No breaking changes (additive feature)

### Principle Priority Resolution

No principle conflicts identified. All principles align for this feature:
- Security (server-side validation) takes priority
- SOLID architecture ensures testability and maintainability
- Server-first performance with appropriate caching
- Clear, simple code structure

**Result**: ✅ PASS - All constitution requirements met

## Project Structure

### Documentation (this feature)

```text
specs/019-edit-cart-items/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (UI patterns, pricing algorithms)
├── data-model.md        # Phase 1 output (CartItem, Model, GlassType schemas)
├── quickstart.md        # Phase 1 output (how to edit cart items)
├── contracts/           # Phase 1 output (tRPC procedures schemas)
│   ├── cart.updateItem.json
│   ├── cart.validateGlassCompatibility.json
│   └── model.getImage.json
├── checklists/
│   └── requirements.md  # Specification quality checklist (already created)
└── spec.md              # Feature specification (already created)
```

### Source Code (Next.js App Router structure)

```text
src/
├── app/
│   └── (public)/
│       └── cart/
│           ├── _components/
│           │   ├── cart-item.tsx                    # Display cart item with image (Client Component)
│           │   ├── cart-item-edit-modal.tsx         # Edit modal (Client Component)
│           │   ├── cart-item-image.tsx              # Model image with fallback (Client Component)
│           │   └── cart-items-list.tsx              # List of cart items (Client Component)
│           ├── _hooks/
│           │   ├── use-cart-item-mutations.ts       # Edit, delete mutations + cache invalidation
│           │   └── use-cart-data.ts                 # Fetch cart with items, models, glass types
│           ├── _schemas/
│           │   └── cart-item-edit.schema.ts         # Zod schema for edit validation
│           ├── _utils/
│           │   ├── cart-item-edit.utils.ts          # getDefaults(), transformEditData(), types
│           │   └── cart-price-calculator.ts         # calculateItemPrice(width, height, glassType)
│           ├── _constants/
│           │   └── cart-item.constants.ts           # CART_ITEM_IMAGE_SIZE, placeholders, limits
│           └── page.tsx                             # Cart page (Server Component, SSR)
│
├── server/
│   └── api/
│       └── routers/
│           └── cart.ts                              # tRPC router (EXISTING - extend with updateItem)
│
├── lib/
│   └── format.ts                                    # EXISTING - currency, dimension formatters
│
└── components/ui/                                   # EXISTING - Shadcn components
    ├── dialog.tsx                                   # For edit modal
    ├── button.tsx
    ├── input.tsx
    └── select.tsx

tests/
├── unit/
│   ├── cart-price-calculator.test.ts                # Price calculation logic
│   └── cart-item-edit.utils.test.ts                 # Transform and default value functions
├── integration/
│   └── cart.updateItem.test.ts                      # tRPC procedure integration test
└── e2e/
    └── cart-item-edit.spec.ts                       # Full edit flow E2E test

public/
└── assets/
    └── placeholder-model.png                        # Fallback image for models without images
```

**Structure Decision**: 

Next.js App Router structure with feature-based organization under `cart/` route. This is a web application using the established Next.js 16 + tRPC + Prisma stack.

**Key Decisions**:
1. **Route Colocation**: All cart-related components, hooks, schemas, and utils colocated under `app/(public)/cart/` using Next.js private folders (`_components/`, `_hooks/`, etc.)
2. **Client/Server Split**: 
   - `page.tsx` = Server Component (SSR, fetches initial cart data)
   - `_components/*` = Client Components (interactivity, mutations, modals)
   - `server/api/routers/cart.ts` = tRPC procedures (server-side validation, database access)
3. **Reuse Existing**:
   - Extend existing `cart.ts` tRPC router (don't create new file)
   - Use existing Shadcn components for UI
   - Use existing formatters from `lib/format.ts`
4. **SOLID Compliance**: Clear separation into _components (UI), _hooks (state), _schemas (validation), _utils (logic), _constants (config)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
