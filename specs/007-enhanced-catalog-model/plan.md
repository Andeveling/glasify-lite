# Implementation Plan: Enhanced Catalog Model Sidebar Information

**Branch**: `007-enhanced-catalog-model` | **Date**: 2025-10-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-enhanced-catalog-model/spec.md`

## Summary

Enhance the model detail page sidebar to display comprehensive product information including technical specifications, profile supplier details, material characteristics, and practical benefits. This enables users to make informed purchasing decisions by understanding window performance characteristics, dimensional constraints, and material-specific advantages.

**Technical Approach**: Extend existing tRPC `get-model-by-id` query to include `ProfileSupplier.materialType`, enhance client-side adapter to map material types to user-friendly benefits, and create new sidebar card components following Atomic Design pattern.

## Technical Context

**Language/Version**: TypeScript 5.8.2 (strict mode), Node.js (es2022 target)  
**Primary Dependencies**: 
- Next.js 15.2.3 (App Router, React Server Components)
- React 19.0.0
- tRPC 11.0.0 (client, server, react-query)
- Prisma 6.16.2 (PostgreSQL ORM)
- Zod 4.1.1 (schema validation)
- TailwindCSS 4.0.15
- shadcn/ui (Radix UI components)

**Storage**: PostgreSQL via Prisma ORM (existing `Model`, `ProfileSupplier` entities)  
**Testing**: Vitest 3.2.4 (unit tests with jsdom), Playwright 1.55.1 (E2E tests)  
**Target Platform**: Web (Next.js SSR/RSC)  
**Project Type**: Full-stack web application (Next.js App Router)  
**Performance Goals**: 
- Initial sidebar render < 100ms (LCP impact)
- ProfileSupplier data loaded with model (single query, no waterfalls)
- Client bundle increase < 5KB (material benefits utilities)

**Constraints**: 
- MUST use Server Components for page orchestration (Next.js 15 best practice)
- MUST NOT use Winston logger in Client Components (constitution violation)
- MUST maintain existing adapter pattern (adaptModelFromServer)
- MUST display content in Spanish (es-LA) for user-facing text
- MUST handle missing ProfileSupplier gracefully (nullable relationship)

**Scale/Scope**: 
- ~50-100 window models in catalog
- 5-10 ProfileSupplier records (Deceuninck, REHAU, Alumina, etc.)
- 2 MaterialType enum values (PVC, ALUMINUM)
- 4 new sidebar card components (Specifications, Supplier, Enhanced Features, Enhanced Dimensions)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Pragmatic Testing Discipline**: 
- Unit tests for material benefits mapping utilities (pure functions)
- Integration tests for enhanced tRPC query with ProfileSupplier
- E2E tests for sidebar rendering with/without ProfileSupplier data
- Tests MAY be written during/after implementation, MUST exist before merge

✅ **Server-First Architecture**:
- Page (`page.tsx`) remains Server Component (already compliant)
- Material benefits mapping happens client-side in adapter (pure function, no server deps)
- No Winston logger usage in Client Components (sidebar cards are client components)

✅ **Single Responsibility**:
- Separate card components for each information type (Specifications, Supplier, Features, Dimensions)
- Material benefits logic extracted to utility function (reusable, testable)
- Adapter handles server→client data transformation (existing pattern)

✅ **Open/Closed**:
- Extending `modelDetailOutput` schema without modifying existing fields
- Adding new components without modifying existing `ModelSidebar` structure
- Material benefits system allows adding new materials via enum extension

**No violations detected** - Feature aligns with constitution principles.

## Project Structure

### Documentation (this feature)

```
specs/007-enhanced-catalog-model/
├── plan.md              # This file
├── spec.md              # Feature specification ✅ Complete
├── checklists/
│   └── requirements.md  # Quality checklist ✅ Complete
├── research.md          # Phase 0 output (NEXT)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── enhanced-model-detail.yaml  # tRPC contract extension
```

### Source Code (Next.js App Router)

```
src/
├── app/
│   └── (public)/
│       └── catalog/
│           └── [modelId]/
│               ├── page.tsx                    # Server Component (unchanged)
│               ├── _components/
│               │   ├── model-sidebar.tsx       # Orchestrator (modified - add new cards)
│               │   ├── model-info.tsx          # Existing (unchanged)
│               │   ├── model-dimensions.tsx    # Existing (enhanced - more context)
│               │   ├── model-features.tsx      # Existing (enhanced - material-based)
│               │   ├── model-specifications.tsx    # NEW - Technical specs card
│               │   └── profile-supplier-card.tsx   # NEW - Supplier info card
│               ├── _types/
│               │   └── model.types.ts          # Types (modified - add supplier fields)
│               └── _utils/
│                   ├── adapters.ts             # Adapter (modified - map new fields)
│                   └── material-benefits.ts    # NEW - Material→Benefits mapping
│
├── server/
│   └── api/
│       └── routers/
│           └── catalog/
│               ├── catalog.queries.ts          # tRPC queries (modified - include materialType)
│               └── catalog.schemas.ts          # Zod schemas (modified - extend modelDetailOutput)
│
└── components/
    └── ui/                                     # shadcn/ui components (unchanged)
        ├── card.tsx
        └── badge.tsx

tests/
├── unit/
│   └── catalog/
│       ├── material-benefits.test.ts           # NEW - Material mapping tests
│       └── model-adapters.test.ts              # Modified - Test new fields
├── integration/
│   └── catalog/
│       └── get-model-with-supplier.test.ts     # NEW - tRPC query with ProfileSupplier
└── contract/
    └── catalog-model-detail.test.ts            # Modified - Validate schema extension

e2e/
└── catalog/
    └── model-detail-sidebar.spec.ts            # NEW - E2E for sidebar enhancements
```

**Structure Decision**: Following Next.js 15 App Router conventions with feature-based colocation. Components, types, and utilities are colocated under `_components/`, `_types/`, `_utils/` within the route folder. Server-side logic (tRPC) remains in `src/server/api/routers/catalog/`. Tests organized by type (unit/integration/contract/e2e) in dedicated `tests/` and `e2e/` directories.

## Complexity Tracking

*No Constitution violations detected - this section intentionally left empty.*

## Phase 0: Research & Technical Decisions

**Status**: ⏳ Pending (see research.md after generation)

### Research Tasks

1. **Material Benefits Mapping Strategy**
   - Research: How to map `MaterialType` enum (PVC/ALUMINUM) to user-friendly Spanish benefits
   - Options: Static lookup object vs. database-driven vs. CMS-managed
   - Decision criteria: Maintainability, i18n future-proofing, performance

2. **ProfileSupplier Data Structure**
   - Research: Current usage of `ProfileSupplier.notes` field
   - Question: Can we derive performance ratings from notes or need schema extension?
   - Impact: Determines Phase 1 data model changes

3. **Performance Ratings Display**
   - Research: Industry standards for communicating technical ratings (Class 1-6) to consumers
   - Options: Stars (⭐), badges, progress bars, descriptive text
   - Reference: UX principle "Don't Make Me Think" - clarity over accuracy

4. **Responsive Sidebar Layout**
   - Research: Mobile viewport behavior for sidebar content
   - Options: Collapse to accordion, reflow above form, bottom sheet
   - Constraint: Maintain information hierarchy on all viewports

5. **Error Boundaries for Missing Data**
   - Research: Best practices for handling nullable `ProfileSupplier` in React Server Components
   - Options: Suspense boundaries, error boundaries, graceful degradation
   - Related: Constitution requirement to avoid "N/A" placeholders

### Technology Decisions (Preliminary)

- **Material Benefits**: Static TypeScript lookup object (benefits.constant.ts) - fastest, type-safe, easy to i18n later
- **ProfileSupplier Query**: Extend existing Prisma select to include `materialType` - zero additional queries
- **Rating Display**: Badge + descriptive text (e.g., "⭐⭐⭐⭐⭐ Excelente aislamiento térmico") - UX-friendly
- **Mobile Layout**: Cards reflow above form in vertical stack - maintains readability, no interaction needed
- **Missing Data**: Component-level null checks with early return - clean, performant, follows React patterns

**Output**: `research.md` will document final decisions with rationales

## Phase 1: Design & Contracts

**Status**: ⏳ Pending (after Phase 0 complete)

### Data Model Changes

**File**: `data-model.md` (to be generated)

**Entities Modified**:
1. **ModelDetailOutput** (tRPC schema extension):
   ```typescript
   profileSupplier: {
     id: string;
     name: string;
     materialType: 'PVC' | 'ALUMINUM';  // NEW FIELD
   } | null
   ```

**No Prisma Schema Changes Required** - `ProfileSupplier.materialType` already exists, just need to select it in query.

### API Contracts

**File**: `contracts/enhanced-model-detail.yaml` (to be generated)

**tRPC Procedure**: `catalog.get-model-by-id` (extension)

**Input** (unchanged):
```yaml
modelId: string (cuid)
```

**Output** (extended):
```yaml
ModelDetailOutput:
  # ... existing fields
  profileSupplier:
    nullable: true
    type: object
    properties:
      id: string
      name: string
      materialType:  # NEW
        type: string
        enum: [PVC, ALUMINUM, WOOD, MIXED]
```

**Consumer Impact**: 
- Client components receive `materialType` to derive benefits
- Adapter maps `materialType` → Spanish benefit strings
- No breaking changes (materialType is optional via nullable parent)

### Implementation Artifacts

**Files to Generate**:
1. `data-model.md` - Document ModelDetailOutput extension
2. `contracts/enhanced-model-detail.yaml` - OpenAPI-style contract spec
3. `quickstart.md` - Developer setup for testing sidebar changes

### Agent Context Update

After Phase 1 design:
```bash
.specify/scripts/bash/update-agent-context.sh copilot
```

**Updates to `.github/copilot-instructions.md`**:
- Document `MaterialType` → Benefits mapping pattern
- Add sidebar card component creation guidelines
- Reference "Don't Make Me Think" UX principles for specification display

## Phase 2: Task Breakdown

**Status**: ⏳ Deferred to `/speckit.tasks` command

Tasks will be generated in `tasks.md` covering:
1. Backend: Extend tRPC query to select `materialType`
2. Backend: Update `modelDetailOutput` Zod schema
3. Utils: Create material benefits mapping utility
4. Components: Build `ModelSpecifications` card
5. Components: Build `ProfileSupplierCard` card
6. Components: Enhance `ModelFeatures` with material-based benefits
7. Components: Enhance `ModelDimensions` with contextual labels
8. Adapter: Extend `adaptModelFromServer` for new fields
9. Types: Update `Model` type with supplier info
10. Tests: Unit tests for material mapping
11. Tests: Integration test for enhanced query
12. Tests: E2E test for sidebar rendering
13. Docs: Update component README with new cards

**Task Categories** (aligned with constitution):
- 🔧 Implementation (backend, frontend, utils)
- ✅ Testing (unit, integration, E2E)
- 📚 Documentation (README, ADRs)

## Risk Assessment

| Risk                                    | Likelihood | Impact | Mitigation                                                                |
| --------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------- |
| ProfileSupplier missing for many models | High       | Medium | Graceful degradation: Show "Proveedor no especificado" + generic benefits |
| Material benefits not comprehensive     | Medium     | Low    | Start with PVC/Aluminum basics, iterate based on user feedback            |
| Performance impact from additional data | Low        | Low    | ProfileSupplier already in query scope, materialType adds ~20 bytes       |
| Mobile layout breaks on small screens   | Medium     | Medium | Responsive design testing, Cards use flex-wrap                            |
| Users confused by technical terminology | Medium     | High   | UX review: Use visual ratings (stars) + plain Spanish descriptions        |

## Dependencies & Blockers

**External Dependencies**: None

**Internal Prerequisites**:
1. ✅ ProfileSupplier relationship exists in Prisma schema
2. ✅ tRPC `get-model-by-id` query functional
3. ✅ Adapter pattern established (`adaptModelFromServer`)
4. ✅ shadcn/ui Card component available
5. ⏳ TenantConfig singleton initialized (for currency display) - verify in dev env

**Potential Blockers**:
- If ProfileSupplier.materialType is NULL for active suppliers → Need data migration script
- If TenantConfig not seeded → Quote form already depends on it, likely resolved

**Resolution Path**:
1. Run migration check: `pnpm db:studio` → verify ProfileSupplier records have materialType
2. If NULL values found → Create seeder script to backfill from supplier names
3. Test TenantConfig: Query in DB Studio → If missing, run `pnpm db:seed` (tenant config)

## Success Metrics (Post-Implementation)

Aligned with Success Criteria from spec:

1. **Performance**:
   - Sidebar initial render < 100ms (measure with React DevTools Profiler)
   - Zero additional network requests (verify in Network tab)

2. **User Experience**:
   - A/B test: Session time on model pages (target: 45s → 90s)
   - Heatmap: Click density on sidebar cards vs. quote form
   - Analytics: Bounce rate on model pages (target: reduce by 20%)

3. **Data Quality**:
   - Coverage: % of models with ProfileSupplier assigned (target: >80%)
   - Error rate: Zero UI errors when ProfileSupplier is NULL (Sentry monitoring)

4. **Business Impact**:
   - Conversion: Quote request rate increase (target: +40% for complete info models)
   - Support: Ticket volume for "What material?" queries (target: -70%)

**Measurement Tools**:
- Performance: Lighthouse, React DevTools Profiler
- Analytics: Google Analytics 4 (custom events for sidebar interactions)
- Errors: Sentry error tracking
- User feedback: Hotjar session recordings (sample 5% of sessions)

## Next Steps

1. ✅ **Phase 0 Complete**: Run research agent to resolve pending decisions → `research.md`
2. ⏳ **Phase 1 Next**: Generate data model and contracts → `data-model.md`, `contracts/`
3. ⏳ **Agent Context Update**: Run `.specify/scripts/bash/update-agent-context.sh copilot`
4. ⏳ **Phase 2 Planning**: Execute `/speckit.tasks` to generate task breakdown

**Command to Execute Next**:
```bash
# This plan command has completed Phase 0 setup
# Next: Review research.md and approve decisions
# Then: Proceed to /speckit.tasks for implementation breakdown
```
