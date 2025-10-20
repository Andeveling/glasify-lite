---
goal: Refactor Model UI with Sticky Price Header and Visual Stats Integration
version: 1.0
date_created: 2025-10-14
last_updated: 2025-10-14
owner: Frontend Team
status: 'In progress'
tags: ['refactor', 'ux', 'feature', 'catalog']
---

# Introduction

![Status: In progress](https://img.shields.io/badge/status-In_progress-yellow)

This implementation plan refactors the model detail page UI (`/catalog/[modelId]`) to eliminate cognitive friction by:

1. **Making price always visible** with a sticky header showing real-time calculated price
2. **Removing redundant "Solution Selector"** section - solution is auto-inferred from glass type context
3. **Integrating visual performance stats** directly into the 2D window preview (security, thermal, acoustic ratings)
4. **Enhancing glass type selector** with visual performance indicators and price impact badges
5. **Improving information hierarchy** - contextual stats replace abstract solution choices

**UX Principle**: "Show, don't ask" - display relevant information contextually instead of forcing user decisions.

**Current Problem**: Users must scroll to see price, choose abstract "solutions" without context, and specs are disconnected from visual preview.

**Expected Outcome**: Frictionless configuration flow where price is always visible, solution is auto-inferred, and glass characteristics are visually integrated with the preview.

## 1. Requirements & Constraints

**Business Requirements**

- **REQ-001**: Price must be visible at all times during configuration (sticky header)
- **REQ-002**: Solution selection must be automated based on glass type characteristics (no manual selection)
- **REQ-003**: Glass performance stats (security, thermal, acoustic) must be visually integrated with 2D preview
- **REQ-004**: Glass type selector must show visual performance indicators (1-5 scale) and price impact
- **REQ-005**: Current cart functionality must remain unchanged
- **REQ-006**: Form validation and error handling must be preserved
- **REQ-007**: Mobile responsiveness must be maintained (sticky header, compact stats)

**Technical Constraints**

- **CON-001**: Must use Next.js 15 Server Components for page-level rendering
- **CON-002**: Client Components only for interactive elements (form, sticky scroll behavior)
- **CON-003**: Must integrate with existing tRPC price calculation endpoint
- **CON-004**: Must maintain compatibility with React Hook Form validation
- **CON-005**: Must use existing Shadcn/ui components (Badge, Card, etc.)
- **CON-006**: Must follow Atomic Design pattern (atoms in `ui/`, molecules/organisms in `_components/`)
- **CON-007**: Must use TypeScript strict mode with proper type safety
- **CON-008**: Must maintain existing Prisma schema (no database changes)

**UX Guidelines**

- **GUD-001**: Sticky elements must not obstruct content (proper z-index and blur backdrop)
- **GUD-002**: Price changes must have smooth animations (prevent jarring updates)
- **GUD-003**: Performance stats must use semantic colors (green=good, yellow=medium, red=poor)
- **GUD-004**: Touch targets must be minimum 44×44px for mobile accessibility
- **GUD-005**: All interactive elements must be keyboard navigable
- **GUD-006**: Error states must be clear and actionable
- **GUD-007**: Spanish UI text must follow es-LA locale standards

**Architecture Patterns**

- **PAT-001**: Use SOLID principles - Single Responsibility per component
- **PAT-002**: Atoms in `src/components/ui/`, molecules/organisms in route `_components/`
- **PAT-003**: Custom hooks in `_hooks/` for reusable logic (price calculation, solution inference)
- **PAT-004**: Server Components for data fetching, Client Components for interactivity
- **PAT-005**: Use `'use client'` directive only when absolutely necessary
- **PAT-006**: Winston logger only in server-side code (Server Components, API routes, tRPC)

**Security Requirements**

- **SEC-001**: Price calculations must be server-side validated (prevent client manipulation)
- **SEC-002**: Form inputs must be sanitized with Zod schemas
- **SEC-003**: No sensitive business logic exposed to client bundle

## 2. Implementation Steps

### Implementation Phase 1: Sticky Price Header Component

**GOAL-001**: Create a sticky price header that displays real-time calculated price with breakdown popover and smooth animations

| Task     | Description                                                                                                                                                                                    | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-001 | Create `src/components/ui/price-breakdown-popover.tsx` atom component with Shadcn Popover and Table for itemized price details                                                                 |           |      |
| TASK-002 | Create `src/app/(public)/catalog/[modelId]/_components/sticky-price-header.tsx` molecule with sticky positioning (top-0 z-10), backdrop blur, price display, and breakdown popover integration |           |      |
| TASK-003 | Add price change animation using `framer-motion` or CSS transitions (scale/fade effect when price updates)                                                                                     |           |      |
| TASK-004 | Implement responsive design - compact layout on mobile (<768px), full layout on desktop                                                                                                        |           |      |
| TASK-005 | Add TypeScript types for `StickyPriceHeaderProps` with `currentPrice`, `basePrice`, `breakdown: Array<{label: string, amount: number}>`, `currency: string`                                    |           |      |
| TASK-006 | Integrate with `usePriceCalculation` hook in `model-form.tsx` to receive real-time price updates                                                                                               |           |      |
| TASK-007 | Add accessibility attributes (ARIA labels, keyboard navigation for popover)                                                                                                                    |           |      |

### Implementation Phase 2: Visual Stats Integration in Window Preview

**GOAL-002**: Enhance 2D window preview with integrated performance stats (security, thermal, acoustic) as visual overlays

| Task     | Description                                                                                                                                                 | Completed | Date |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-008 | Create `src/components/ui/stat-badge.tsx` atom component with icon, label, value (1-5 scale), tooltip, and semantic color coding                            |           |      |
| TASK-009 | Create `src/components/ui/performance-bar.tsx` atom component with horizontal progress bar, animated fill, and color gradient (green to red based on value) |           |      |
| TASK-010 | Refactor `src/app/(public)/catalog/[modelId]/_components/form/sections/window-2d-preview.tsx` to accept `glassType`, `solution` props                       |           |      |
| TASK-011 | Add stat badges overlay to window preview (absolute positioning top-right) showing security, thermal, acoustic ratings from selected glass type             |           |      |
| TASK-012 | Add dimension labels overlay (absolute positioning bottom-left) showing `{width}mm × {height}mm`                                                            |           |      |
| TASK-013 | Create `src/app/(public)/catalog/[modelId]/_hooks/use-solution-inference.ts` hook to auto-calculate solution from glass type characteristics                |           |      |
| TASK-014 | Update window preview to use inferred solution data (no manual selection required)                                                                          |           |      |

### Implementation Phase 3: Enhanced Glass Type Selector

**GOAL-003**: Redesign glass type selector with visual performance indicators and price impact badges for informed decision-making

| Task     | Description                                                                                                                                                   | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-015 | Create `src/components/ui/price-impact-badge.tsx` atom component showing price differential (+$X / -$X) with green (discount) or red (surcharge) color coding |           |      |
| TASK-016 | Refactor `src/app/(public)/catalog/[modelId]/_components/form/sections/glass-type-selector-section.tsx` to show performance bars for each glass type option   |           |      |
| TASK-017 | Add performance indicators to glass type cards: security, thermal, acoustic bars (1-5 scale) using `PerformanceBar` component                                 |           |      |
| TASK-018 | Integrate `PriceImpactBadge` showing price difference relative to base price for each glass type option                                                       |           |      |
| TASK-019 | Update glass type card layout with compact stats grid (3 columns: security, thermal, acoustic)                                                                |           |      |
| TASK-020 | Enhance accessibility - keyboard navigation, screen reader labels, focus states                                                                               |           |      |

### Implementation Phase 4: Remove Solution Selector Section

**GOAL-004**: Eliminate redundant manual solution selection by using auto-inferred solution from glass type context

| Task     | Description                                                                                                                      | Completed | Date |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-021 | Remove `src/app/(public)/catalog/[modelId]/_components/form/sections/solution-selector-section.tsx` file completely              |           |      |
| TASK-022 | Update `src/app/(public)/catalog/[modelId]/_components/form/model-form.tsx` to remove `SolutionSelectorSection` import and usage |           |      |
| TASK-023 | Update `src/app/(public)/catalog/[modelId]/_utils/validation.ts` schema to make `solution` field optional or remove it           |           |      |
| TASK-024 | Update `usePriceCalculation` hook to use inferred solution from `use-solution-inference.ts` instead of form value                |           |      |
| TASK-025 | Update cart item creation logic to include inferred solution data (if needed for order processing)                               |           |      |
| TASK-026 | Remove `use-solution-selector.ts` hook file (no longer needed)                                                                   |           |      |

### Implementation Phase 5: Layout Refactoring & Integration

**GOAL-005**: Integrate all new components into cohesive layout with proper sticky behavior and responsive design

| Task     | Description                                                                                                                  | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-027 | Update `src/app/(public)/catalog/[modelId]/_components/model-sidebar-wrapper.tsx` to add sticky price header at top          |           |      |
| TASK-028 | Refactor form sections order: 1) Window preview with stats, 2) Dimensions, 3) Glass type selector, 4) Services (collapsible) |           |      |
| TASK-029 | Implement sticky bottom CTA button for "Add to Cart" (mobile only, <768px)                                                   |           |      |
| TASK-030 | Update `model-form.tsx` to pass all required props (glassType, inferredSolution) to child components                         |           |      |
| TASK-031 | Adjust vertical spacing and padding for optimal scroll experience                                                            |           |      |
| TASK-032 | Test sticky behavior on scroll - header should remain visible, content should not jump                                       |           |      |

### Implementation Phase 6: Testing & Validation

**GOAL-006**: Comprehensive testing of new UI components, accessibility, and business logic

| Task     | Description                                                                                                                              | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-033 | Write unit tests for `use-solution-inference.ts` hook (vitest) - test all glass type → solution mapping logic                            |           |      |
| TASK-034 | Write unit tests for `StatBadge`, `PerformanceBar`, `PriceImpactBadge` components (vitest + @testing-library/react)                      |           |      |
| TASK-035 | Write integration test for sticky price header - verify price updates on form changes                                                    |           |      |
| TASK-036 | Write E2E test (Playwright) for complete configuration flow: select glass type → verify stats update → verify price update → add to cart |           |      |
| TASK-037 | Accessibility audit with axe-core - verify keyboard navigation, ARIA labels, color contrast (WCAG AA)                                    |           |      |
| TASK-038 | Mobile responsiveness testing - verify sticky header, stat badges, compact layout on <768px viewport                                     |           |      |
| TASK-039 | Performance testing - verify no layout shift (CLS), smooth animations, no jank on scroll                                                 |           |      |

## 3. Alternatives

**Alternative Approaches Considered:**

- **ALT-001**: **Keep solution selector as optional filter** - Rejected because it adds cognitive load without clear UX benefit. Users don't understand "solutions" without glass type context.

- **ALT-002**: **Show price breakdown in main content instead of popover** - Rejected to avoid visual clutter. Popover keeps UI clean while providing details on demand.

- **ALT-003**: **Use tooltips instead of stat badges for performance indicators** - Rejected because tooltips require hover (bad for mobile). Badges are always visible and tap-friendly.

- **ALT-004**: **Place sticky price header in modal/drawer** - Rejected because it hides price when user scrolls. Sticky header ensures constant visibility.

- **ALT-005**: **Calculate solution client-side only** - Rejected for security. Solution inference logic must be server-validated to prevent price manipulation.

- **ALT-006**: **Use accordion for glass type selector** - Rejected because comparison is harder. Card-based grid allows side-by-side visual comparison of performance stats.

## 4. Dependencies

**External Libraries:**

- **DEP-001**: `framer-motion@^11.0.0` - For smooth price change animations (or use CSS transitions as fallback)
- **DEP-002**: `@radix-ui/react-popover@^1.0.0` - Already installed via Shadcn/ui for price breakdown popover
- **DEP-003**: `@radix-ui/react-tooltip@^1.0.0` - Already installed via Shadcn/ui for stat badge tooltips
- **DEP-004**: `lucide-react@^0.400.0` - Already installed for icons (Shield, ThermometerSun, Volume2)

**Internal Dependencies:**

- **DEP-005**: `usePriceCalculation` hook in `src/app/(public)/catalog/[modelId]/_hooks/use-price-calculation.ts` - Must support inferred solution
- **DEP-006**: tRPC `catalog.calculate-price` endpoint in `src/server/api/routers/catalog.ts` - Must accept optional solution parameter
- **DEP-007**: Prisma `GlassType` model - Must include performance rating fields (securityLevel, thermalRating, soundReduction)
- **DEP-008**: `useCart` hook in `src/app/(public)/cart/_hooks/use-cart.ts` - Must accept inferred solution in cart item data

**Database Schema Requirements:**

- **DEP-009**: Verify `GlassType` table has performance columns: `securityLevel INT`, `thermalRating INT`, `soundReduction INT` (1-5 scale)
- **DEP-010**: Verify `GlassSolution` table has icon mapping for visual display (already exists per current code)

## 5. Files

**New Files to Create:**

- **FILE-001**: `src/components/ui/stat-badge.tsx` - Atom component for performance stat display with icon, label, value, tooltip
- **FILE-002**: `src/components/ui/performance-bar.tsx` - Atom component for horizontal progress bar with animated fill
- **FILE-003**: `src/components/ui/price-impact-badge.tsx` - Atom component for price differential display (+/- with color coding)
- **FILE-004**: `src/components/ui/price-breakdown-popover.tsx` - Atom component for itemized price details in popover
- **FILE-005**: `src/app/(public)/catalog/[modelId]/_components/sticky-price-header.tsx` - Molecule component for sticky price display
- **FILE-006**: `src/app/(public)/catalog/[modelId]/_hooks/use-solution-inference.ts` - Custom hook for auto-calculating solution from glass type

**Files to Modify:**

- **FILE-007**: `src/app/(public)/catalog/[modelId]/_components/form/sections/window-2d-preview.tsx` - Add stat badges overlay and dimension labels
- **FILE-008**: `src/app/(public)/catalog/[modelId]/_components/form/sections/glass-type-selector-section.tsx` - Add performance bars and price impact badges
- **FILE-009**: `src/app/(public)/catalog/[modelId]/_components/form/model-form.tsx` - Integrate sticky header, remove solution selector, use inferred solution
- **FILE-010**: `src/app/(public)/catalog/[modelId]/_components/model-sidebar-wrapper.tsx` - Integrate sticky price header at top of layout
- **FILE-011**: `src/app/(public)/catalog/[modelId]/_utils/validation.ts` - Update schema to make solution field optional or auto-populated
- **FILE-012**: `src/app/(public)/catalog/[modelId]/_hooks/use-price-calculation.ts` - Accept inferred solution parameter

**Files to Delete:**

- **FILE-013**: `src/app/(public)/catalog/[modelId]/_components/form/sections/solution-selector-section.tsx` - Redundant, replaced by auto-inference
- **FILE-014**: `src/app/(public)/catalog/[modelId]/_hooks/use-solution-selector.ts` - No longer needed with auto-inference

## 6. Testing

**Unit Tests (Vitest + @testing-library/react):**

- **TEST-001**: `tests/unit/components/ui/stat-badge.test.tsx` - Verify icon rendering, tooltip behavior, value display (1-5 scale), color coding
- **TEST-002**: `tests/unit/components/ui/performance-bar.test.tsx` - Verify progress calculation, animated fill, color gradient based on value
- **TEST-003**: `tests/unit/components/ui/price-impact-badge.test.tsx` - Verify positive/negative price display, color coding (green/red), formatting
- **TEST-004**: `tests/unit/catalog/model/hooks/use-solution-inference.test.ts` - Verify glass type → solution mapping logic, edge cases (null glass type)
- **TEST-005**: `tests/unit/catalog/model/components/sticky-price-header.test.tsx` - Verify price display, breakdown popover interaction, animation triggers

**Integration Tests (Vitest):**

- **TEST-006**: `tests/integration/catalog/model/price-calculation-integration.test.tsx` - Verify sticky header updates when form values change (width, height, glass type)
- **TEST-007**: `tests/integration/catalog/model/solution-inference-integration.test.tsx` - Verify solution auto-inference updates window preview stats correctly

**E2E Tests (Playwright):**

- **TEST-008**: `e2e/catalog/model-configuration-flow.spec.ts` - Full user flow: navigate to model → change dimensions → select glass type → verify stats update → verify price updates → add to cart → verify cart item includes correct data
- **TEST-009**: `e2e/catalog/sticky-price-scroll.spec.ts` - Verify sticky header remains visible during scroll, no content jump, backdrop blur works
- **TEST-010**: `e2e/catalog/mobile-responsive.spec.ts` - Verify mobile layout (viewport <768px): compact header, stat badges readable, sticky CTA button appears

**Accessibility Tests:**

- **TEST-011**: Keyboard navigation test - Tab through all interactive elements (glass type cards, service checkboxes, CTA button), verify focus states, verify Enter/Space activates controls
- **TEST-012**: Screen reader test (axe-core) - Verify ARIA labels, semantic HTML, proper heading hierarchy, image alt text
- **TEST-013**: Color contrast test (axe-core) - Verify WCAG AA compliance for all text/background combinations (stat badges, price display, buttons)

**Performance Tests:**

- **TEST-014**: Layout shift (CLS) measurement - Verify Cumulative Layout Shift < 0.1 when sticky header appears/disappears
- **TEST-015**: Animation performance - Verify price change animations run at 60fps (no jank), use GPU acceleration

## 7. Risks & Assumptions

**Risks:**

- **RISK-001**: **Database schema missing performance fields** - GlassType table may not have securityLevel, thermalRating, soundReduction columns. *Mitigation*: Add migration to create columns with default values if missing.

- **RISK-002**: **Sticky header causing layout shift on mobile** - May push content down unexpectedly. *Mitigation*: Use fixed height and reserve space in layout to prevent CLS.

- **RISK-003**: **Solution inference logic too simplistic** - May not accurately map glass types to solutions for all edge cases. *Mitigation*: Define clear business rules with product team, add fallback to "Uso General" solution.

- **RISK-004**: **Price calculation endpoint not supporting inferred solutions** - tRPC endpoint may require solution ID. *Mitigation*: Make solution parameter optional in endpoint, calculate based on glass type if not provided.

- **RISK-005**: **Performance degradation from real-time stats updates** - Frequent re-renders when form changes. *Mitigation*: Use React.memo on stat components, optimize useWatch selectors, debounce dimension inputs (already implemented).

- **RISK-006**: **Breaking changes to cart workflow** - Removing solution selector may affect cart item data structure. *Mitigation*: Maintain backward compatibility, include inferred solution in cart item for order processing.

**Assumptions:**

- **ASSUMPTION-001**: GlassType records in database have valid performance rating values (1-5 scale) or can be seeded with defaults
- **ASSUMPTION-002**: Business logic for solution inference is deterministic and can be codified (e.g., high security rating → "Seguridad" solution)
- **ASSUMPTION-003**: Users prefer visual stats over abstract solution names (validated by UX research or will be A/B tested)
- **ASSUMPTION-004**: Price calculation endpoint can handle optional solution parameter without breaking existing functionality
- **ASSUMPTION-005**: Mobile users will benefit from sticky price header (not considered intrusive or obstructive)
- **ASSUMPTION-006**: Current cart and order processing systems can handle inferred solutions (no manual solution selection in future orders)

## 8. Related Specifications / Further Reading

**Internal Documentation:**

- [Catalog Architecture](../docs/architecture.md) - Overall catalog module architecture and data flow
- [Atomic Design Patterns](../.github/copilot-instructions.md#arquitectura-nextjs-15--solid--atomic-design) - Component organization standards
- [UX Principles: Don't Make Me Think](../.github/instructions/dont-make-me-think.instructions.md) - UX guidelines for intuitive interfaces

**External References:**

- [Next.js 15 Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) - Best practices for Server/Client Component split
- [React Hook Form Performance](https://react-hook-form.com/advanced-usage#FormProviderPerformance) - Optimization techniques for form re-renders
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility compliance requirements
- [Sticky Position Best Practices](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky_positioning) - CSS sticky positioning guidelines
- [Cumulative Layout Shift (CLS)](https://web.dev/cls/) - Core Web Vitals metric for visual stability

**Design References:**

- [Radix UI Patterns](https://www.radix-ui.com/primitives/docs/overview/introduction) - Accessible component patterns for Popover, Tooltip, RadioGroup
- [Shadcn/ui Components](https://ui.shadcn.com/) - Reference implementations for Badge, Card, Button with variants
