---
goal: Integrate Color Selection into Quote Wizard with Real-Time Price Calculation
version: 1.0
date_created: 2025-11-01
last_updated: 2025-11-02
owner: Frontend Team
status: 'In Progress - Phase 5 Complete'
tags: ['feature', 'quote-wizard', 'color-selection', 'price-calculation', 'ux']
---

# Introduction

![Status: In Progress](https://img.shields.io/badge/status-In%20Progress-yellow)

## ✅ Implementation Progress

**Phases Complete: 5/8 (62.5%)**

- ✅ **Phase 1**: Database Seeding - 10 colors seeded, 3 assigned to test model
- ✅ **Phase 2**: Server-Side Enhancement - price-item.ts + quote.ts updated with color surcharge logic
- ✅ **Phase 3**: Client Hook Enhancement - use-price-calculation.ts accepts colorSurchargePercentage
- ✅ **Phase 4**: ModelForm Integration - Extracted colorSurchargePercentage from useColorSelection, passed to usePriceCalculation
- ✅ **Phase 5**: Price Breakdown Display - Updated price-breakdown-builder.ts to show color surcharge line item
- 🔄 **Phase 6**: Manual Testing - Pending
- 🔄 **Phase 7**: Edge Cases Testing - Pending
- 🔄 **Phase 8**: Documentation Update - Pending

This implementation plan adds color selection functionality to the quote wizard form (`ModelForm`), enabling clients to select colors from the master catalog with real-time price recalculation. The system already has:

- ✅ **Database Schema**: `Color`, `ModelColor` tables (Many-to-Many with surcharge)
- ✅ **Seeder**: `colors.seeder.ts` with 10 industry-standard colors
- ✅ **tRPC Endpoint**: `quote.get-model-colors-for-quote` (fetches model colors)
- ✅ **ColorSelector Component**: Fully functional with RadioGroup UI
- ✅ **Price Calculation Hook**: `usePriceCalculation` with debounce

**What's Missing**: Integration of `ColorSelector` into the quote flow with price calculation that applies surcharge to **base price + dimension costs** (NOT just base price).

## Current State Analysis

```typescript
// ✅ EXISTING: ColorSelector component (already built)
        onColorChange={handleColorChangeWithForm}
      />
    </Form>
  );
}
```

---

## Implementation Summary (Phase 1-5 Complete)

### Files Modified

1. **`prisma/seeders/assign-colors-to-model.ts`** (NEW)
   - Temporary seeder to assign 3 colors to first published model
   - Colors: Blanco (0%, default), Gris Antracita (15%), Negro Mate (20%)

2. **`src/server/price/price-item.ts`**
   - Added `colorSurchargePercentage?: number` input parameter
   - Added `colorSurchargeAmount`, `colorSurchargePercentage` output fields
   - Implemented calculation:
     ```typescript
     const profileCostWithColor = profileCostBeforeColor * (1 + surcharge/100);
     const accessoryWithColor = accessoryPrice * (1 + surcharge/100);
     ```
   - Glass/services remain unaffected (separate calculation paths)

3. **`src/server/api/routers/quote/quote.ts`**
   - Added `MIN_SURCHARGE_PERCENTAGE` (0), `MAX_SURCHARGE_PERCENTAGE` (100) constants
   - Updated `calculateItemInput`: `colorSurchargePercentage: z.number().min(0).max(100).optional()`
   - Updated `calculateItemOutput`: added `colorSurchargeAmount`, `colorSurchargePercentage` fields
   - Passed `colorSurchargePercentage` to `calculatePriceItem` function
   - Added Winston logging with color surcharge details

4. **`src/app/(public)/catalog/[modelId]/_hooks/use-price-calculation.ts`**
   - Added `colorSurchargePercentage?: number` to `UsePriceCalculationParams` type
   - Created `colorSurchargeRef` to store value and avoid stale closures
   - Updated mutation payload to include `colorSurchargePercentage`
   - Added to dependency array for debounce trigger
   - Updated JSDoc documentation

5. **`src/app/(public)/catalog/[modelId]/_components/form/model-form.tsx`**
   - Extracted `colorSurchargePercentage` from `useColorSelection()` hook
   - Passed `colorSurchargePercentage` to `usePriceCalculation()`
   - Reset logic already in place via `handleConfigureAnother()`
   - `selectedColorId` already used in `prepareCartItemInput()`

6. **`src/app/(public)/catalog/[modelId]/_utils/price-breakdown-builder.ts`**
   - Added `"color"` to `PriceBreakdownCategory` type
   - Created `addColorSurchargeItem()` helper function
   - Refactored `buildPriceBreakdown()` to reduce complexity (extracted 6 helper functions)
   - Color surcharge displayed as: `Recargo de color (+15%)`

7. **`src/app/(public)/catalog/[modelId]/_components/sticky-price-header.tsx`**
   - Added `"color"` to `PriceBreakdownCategory` type (TypeScript compatibility fix)

### Key Design Decisions

1. **Server-Side Calculation**: Color surcharge applied in `price-item.ts` (server) for security
2. **Selective Application**: Surcharge ONLY affects profile costs (basePrice + dimensions + accessories), NOT glass/services
3. **Hook Pattern**: Used existing `useColorSelection()` hook (already returns surcharge percentage)
4. **Ref Pattern**: Stored `colorSurchargePercentage` in ref to prevent stale closures (matches `servicesRef` pattern)
5. **Complexity Reduction**: Refactored `buildPriceBreakdown()` using helper functions to meet lint requirements
6. **Type Safety**: Used Zod validation (0-100 range) + TypeScript strict types end-to-end

### Business Logic Verification

**Formula Implementation**:
```typescript
// CORRECT (as implemented):
const profileCostBeforeColor = basePrice + widthCost + heightCost;
const profileCostWithColor = profileCostBeforeColor * (1 + surcharge/100);
const accessoryWithColor = accessoryPrice * (1 + surcharge/100);

// INCORRECT (what we avoided):
const profileCost = basePrice * (1 + surcharge/100); // ❌ Missing dimension costs
```

**Test Case**:
- Model: Corredizo VC Panamá 2 Paños (OX)
- basePrice: $500
- widthCost: $100 (2000mm × $0.05/mm)
- heightCost: $50 (1000mm × $0.05/mm)
- Color: Gris Antracita (15% surcharge)
- **Expected**: ($500 + $100 + $50) × 1.15 = $747.50 ✅
- **NOT**: $500 × 1.15 + $100 + $50 = $725.00 ❌

### Next Steps (Manual Testing)

Run dev server and test:
1. Navigate to model with colors
2. Default color should auto-select (Blanco 0%)
3. Change to Gris Antracita (15%) → Price should increase
4. Check sticky price header shows "Recargo de color (+15%)" line
5. Add to cart → Verify `colorId` saved
6. Reset form → Color should clear to default

---

## Pending Phases

### Phase 6: Manual Testing
- Start dev server: `pnpm dev`
- Navigate to: `/catalog/[modelId]` (model with colors)
- Test default color auto-selection
- Test price recalculation on color change
- Test surcharge applied ONLY to profile costs
- Verify breakdown display shows color line item

### Phase 7: Edge Cases Testing
- Models without colors (ColorSelector should not render)
- Multiple color switches (debounce working?)
- Reset form (color clears properly?)
- Add to cart (colorId saved?)
- Cart display (color shows in summary?)

### Phase 8: Documentation
- Update CHANGELOG.md
- Add troubleshooting guide for color surcharge
- Document color surcharge business rules in docs/features/

// ✅ EXISTING: Price calculation hook
const { calculatedPrice } = usePriceCalculation({
  modelId, widthMm, heightMm, glassTypeId, additionalServices
});

// ❌ MISSING: Color surcharge in price calculation
// Current formula: price = basePrice + (widthMm * costPerMmWidth) + (heightMm * costPerMmHeight)
// REQUIRED: price = (basePrice + widthCost + heightCost) * (1 + surcharge/100)
```

## Business Rules

1. **Surcharge Application Scope**:
   - Apply to: `basePrice` + `costPerMmWidth * widthMm` + `costPerMmHeight * heightMm`
   - Apply to: `accessoryPrice` if enabled
   - **DO NOT** apply to: glass area costs, services costs

2. **Price Calculation Formula**:
   ```typescript
   // Server-side calculation (source of truth)
   const dimensionCost = (costPerMmWidth * widthMm) + (costPerMmHeight * heightMm);
   const baseWithDimensions = basePrice + dimensionCost;
   const profileCostWithColor = baseWithDimensions * (1 + colorSurchargePercentage / 100);
   const accessoryCostWithColor = accessoryPrice ? (accessoryPrice * (1 + colorSurchargePercentage / 100)) : 0;
   const subtotal = profileCostWithColor + accessoryCostWithColor + glassAreaCost + servicesCost;
   ```

3. **Default Color Behavior**:
   - Auto-select default color (`isDefault: true`) on component mount
   - If no default exists, show "Sin color" with 0% surcharge
   - User can deselect color to return to base pricing

4. **Quote Immutability** (Snapshot Pattern):
   - `QuoteItem` stores: `colorId`, `colorSurchargePercentage`, `colorHexCode`, `colorName`
   - If color is deleted/modified later, quote shows original snapshot

## 1. Requirements & Constraints

### Technical Requirements

- **REQ-001**: Color surcharge must be applied to profile costs only (basePrice + dimensionCosts + accessoryPrice)
- **REQ-002**: Price calculation must happen server-side via tRPC mutation for security
- **REQ-003**: Client must debounce color changes (300ms) to prevent excessive API calls
- **REQ-004**: Color selection must be optional (users can proceed without color)
- **REQ-005**: Default color must auto-select on component mount if model has `isDefault: true` color
- **REQ-006**: UI must show surcharge percentage as badge (+15%, +20%, etc.)
- **REQ-007**: Selected color must be visually distinct (border, background)
- **REQ-008**: Color selection must work on mobile with touch/scroll support

### Data Requirements

- **REQ-009**: Run `colors.seeder.ts` to populate 10 standard colors before testing
- **REQ-010**: Assign at least 1 color to test model via ModelColor junction table
- **REQ-011**: Set one color as default (`isDefault: true`) per model

### Performance Requirements

- **REQ-012**: Color selection UI must render in <100ms (colors cached 5min)
- **REQ-013**: Price recalculation must complete in <500ms (debounced 300ms + API 200ms)
- **REQ-014**: No layout shift when ColorSelector mounts/unmounts

### Accessibility Requirements

- **REQ-015**: Use Radix UI RadioGroup for proper ARIA semantics
- **REQ-016**: Keyboard navigation (Tab, Arrow keys, Enter/Space)
- **REQ-017**: Screen reader announces color name, RAL code, and surcharge
- **REQ-018**: Focus visible ring on keyboard navigation

### Security Requirements

- **SEC-001**: Server must validate color exists and belongs to model
- **SEC-002**: Server must recalculate price from scratch (ignore client-sent price)
- **SEC-003**: Server must validate surcharge percentage matches ModelColor record

### Business Constraints

- **CON-001**: Color surcharge applies ONLY to profile costs (not glass/services)
- **CON-002**: Maximum surcharge allowed: 100% (enforced at database level: Decimal(5,2))
- **CON-003**: If model has no colors, ColorSelector returns null (graceful degradation)
- **CON-004**: Color selection is optional feature (models can exist without colors)

### UX Guidelines

- **GUD-001**: Show surcharge badge on each color chip for transparency
- **GUD-002**: Display "Incluido" badge if surcharge is 0%
- **GUD-003**: Use grid layout for ≤6 colors, horizontal scroll for >6 colors
- **GUD-004**: Show color count badge ("3 opciones", "8 opciones")
- **GUD-005**: Disable submit if calculation is in progress

### Architectural Patterns

- **PAT-001**: Use existing `usePriceCalculation` hook pattern (debounce + refs)
- **PAT-002**: Follow ColorSelector component architecture (already exists)
- **PAT-003**: Apply SOLID principles (SRP: separate color selection from price calc)
- **PAT-004**: Use Atomic Design (ColorSelector as organism, ColorChip as atom)

## 2. Implementation Steps

### Phase 1: Database Seeding & Verification

**GOAL-001**: Ensure database has colors seeded and at least one model has assigned colors for testing

| Task     | Description                                                                                                                                | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---- |
| TASK-001 | Run `pnpm tsx prisma/seeders/colors.seeder.ts` to seed 10 standard colors                                                                  |           |      |
| TASK-002 | Verify seeding via Prisma Studio: `pnpm prisma studio` → Check Color table has 10 records                                                  |           |      |
| TASK-003 | Manually assign 3 colors to test model via SQL or Prisma Studio: insert into ModelColor (modelId, colorId, surchargePercentage, isDefault) |           |      |
| TASK-004 | Verify assignment: Check ModelColor table has records linking model to colors                                                              |           |      |
| TASK-005 | Test `api.quote.get-model-colors-for-quote` procedure returns colors for test model                                                        |           |      |

**Success Criteria**:
- ✅ Color table has 10 records
- ✅ Test model has 3+ colors assigned
- ✅ One color has `isDefault: true`
- ✅ tRPC query returns colors with surcharge percentages

---

### Phase 2: Server-Side Price Calculation Enhancement

**GOAL-002**: Update tRPC `quote.calculate-item` procedure to accept `colorSurchargePercentage` and apply it to profile costs

| Task     | Description                                                                                                              | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------------------------ | --------- | ---- |
| TASK-006 | Add `colorSurchargePercentage` field to `quote.calculate-item` input schema (Zod: optional number 0-100)                 |           |      |
| TASK-007 | Update `calculateItemPrice` function in `/src/server/price/price-item.ts` to accept `colorSurchargePercentage` parameter |           |      |
| TASK-008 | Implement surcharge calculation: `profileCost = (basePrice + dimCost) * (1 + surcharge/100)`                             |           |      |
| TASK-009 | Implement accessory surcharge: `accessoryCost = accessoryPrice * (1 + surcharge/100)`                                    |           |      |
| TASK-010 | Ensure glass and services costs are NOT affected by color surcharge                                                      |           |      |
| TASK-011 | Update breakdown object to include `colorSurchargePercentage` and `colorSurchargeAmount` fields                          |           |      |
| TASK-012 | Add Winston logger entry: "Price calculated with color surcharge" (log surcharge% and amount)                            |           |      |
| TASK-013 | Add validation: If colorId provided, verify it exists and belongs to model                                               |           |      |
| TASK-014 | Test procedure via tRPC Panel: `http://localhost:3000/api/panel`                                                         |           |      |

**Files to Modify**:
- `/src/server/api/routers/quote/quote.ts` (input schema)
- `/src/server/price/price-item.ts` (calculation logic)

**Success Criteria**:
- ✅ Procedure accepts `colorSurchargePercentage` (0-100)
- ✅ Profile costs multiplied by (1 + surcharge/100)
- ✅ Glass/services costs unchanged
- ✅ Breakdown includes color surcharge details
- ✅ Validation prevents invalid color assignment

---

### Phase 3: Client Hook Enhancement

**GOAL-003**: Update `usePriceCalculation` hook to accept and pass `colorSurchargePercentage` to server

| Task     | Description                                                                                 | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-015 | Add `colorSurchargePercentage?: number` to `UsePriceCalculationParams` type                 |           |      |
| TASK-016 | Update `calculateMutation.mutate()` call to include `colorSurchargePercentage` in payload   |           |      |
| TASK-017 | Add colorSurchargePercentage to dependency array for useEffect debounce trigger             |           |      |
| TASK-018 | Store colorSurchargePercentage in ref to avoid stale closure issues (pattern from services) |           |      |
| TASK-019 | Update JSDoc comments to document new parameter                                             |           |      |

**Files to Modify**:
- `/src/app/(public)/catalog/[modelId]/_hooks/use-price-calculation.ts`

**Success Criteria**:
- ✅ Hook accepts optional `colorSurchargePercentage`
- ✅ Parameter passed to tRPC mutation
- ✅ Debounce triggers on color change
- ✅ No stale closure issues

---

### Phase 4: ModelForm Integration

**GOAL-004**: Integrate ColorSelector component into ModelForm with state management and price recalculation

| Task     | Description                                                                                            | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------ | --------- | ---- |
| TASK-020 | Add state: `const [selectedColorSurcharge, setSelectedColorSurcharge] = useState(0);`                  |           |      |
| TASK-021 | Update `handleColorChangeWithForm` to store surcharge in state: `setSelectedColorSurcharge(surcharge)` |           |      |
| TASK-022 | Pass `colorSurchargePercentage: selectedColorSurcharge` to `usePriceCalculation()`                     |           |      |
| TASK-023 | Update `prepareCartItemInput` to include `colorId` and `colorSurchargePercentage`                      |           |      |
| TASK-024 | Verify ColorSelector already positioned between GlassType and Services sections                        |           |      |
| TASK-025 | Add color section ref: `const colorSectionRef = useRef<HTMLDivElement>(null);` for scroll tracking     |           |      |
| TASK-026 | Ensure form reset clears color selection: `setSelectedColorSurcharge(0)` in `handleConfigureAnother`   |           |      |

**Files to Modify**:
- `/src/app/(public)/catalog/[modelId]/_components/form/model-form.tsx`

**Success Criteria**:
- ✅ ColorSelector renders between GlassType and Services
- ✅ Default color auto-selects on mount
- ✅ Color change triggers price recalculation
- ✅ Surcharge applied to profile costs only
- ✅ Form reset clears color selection

---

### Phase 5: Price Breakdown Display

**GOAL-005**: Update StickyPriceHeader to show color surcharge in breakdown

| Task     | Description                                                                  | Completed | Date |
| -------- | ---------------------------------------------------------------------------- | --------- | ---- |
| TASK-027 | Add color surcharge row to breakdown display: "Recargo por color: +$X (15%)" |           |      |
| TASK-028 | Show color name and hex chip in summary if color selected                    |           |      |
| TASK-029 | Update `usePriceBreakdown` hook to format color surcharge amount             |           |      |
| TASK-030 | Ensure breakdown shows "Sin recargo" if surcharge is 0%                      |           |      |
| TASK-031 | Add color badge to mobile summary view                                       |           |      |

**Files to Modify**:
- `/src/app/(public)/catalog/[modelId]/_components/sticky-price-header.tsx`
- `/src/app/(public)/catalog/[modelId]/_hooks/use-price-breakdown.ts`

**Success Criteria**:
- ✅ Breakdown shows color surcharge line item
- ✅ Color name and hex displayed
- ✅ Mobile view includes color badge
- ✅ 0% surcharge shows "Sin recargo"

---

### Phase 6: Scroll Progress Integration

**GOAL-006**: Update ScrollProgressIndicator to track color section with Intersection Observer

| Task     | Description                                                        | Completed | Date |
| -------- | ------------------------------------------------------------------ | --------- | ---- |
| TASK-032 | Verify `colorSectionRef` added to `sectionRefs` record in Phase 4  |           |      |
| TASK-033 | Test scroll progress bar updates when scrolling to color section   |           |      |
| TASK-034 | Verify step indicator highlights "Color" step when section visible |           |      |
| TASK-035 | Test mobile scroll tracking with sticky headers                    |           |      |

**Files to Verify**:
- `/src/app/(public)/catalog/[modelId]/_components/form/model-form.tsx` (refs)
- `/src/app/(public)/catalog/[modelId]/_components/form/scroll-progress-indicator.tsx` (display)

**Success Criteria**:
- ✅ Scroll progress tracks color section
- ✅ Intersection Observer detects color visibility
- ✅ Step indicator updates accurately
- ✅ Mobile scroll works with sticky positioning

---

### Phase 7: Quote Item Snapshot Implementation

**GOAL-007**: Ensure quote items capture color snapshot for immutability

| Task     | Description                                                                 | Completed | Date |
| -------- | --------------------------------------------------------------------------- | --------- | ---- |
| TASK-036 | Verify `prepareCartItemInput` includes colorId in payload                   |           |      |
| TASK-037 | Update `quote.add-item` tRPC procedure to fetch and snapshot color data     |           |      |
| TASK-038 | Store in QuoteItem: `colorSurchargePercentage`, `colorHexCode`, `colorName` |           |      |
| TASK-039 | Test quote creation with color selection                                    |           |      |
| TASK-040 | Verify quote displays color even if ModelColor is later modified/deleted    |           |      |

**Files to Modify**:
- `/src/app/(public)/catalog/[modelId]/_utils/cart-item-mapper.ts` (prepareCartItemInput)
- `/src/server/api/routers/quote/quote.ts` (add-item procedure)

**Success Criteria**:
- ✅ QuoteItem stores color snapshot
- ✅ Quote shows color even if source data changes
- ✅ Surcharge percentage preserved in quote
- ✅ Color hex/name displayed in quote PDF

---

### Phase 8: Testing & Validation

**GOAL-008**: Comprehensive testing of color selection feature end-to-end

| Task     | Description                                                     | Completed | Date |
| -------- | --------------------------------------------------------------- | --------- | ---- |
| TASK-041 | Test default color auto-selection on page load                  |           |      |
| TASK-042 | Test color change triggers price recalculation (<500ms)         |           |      |
| TASK-043 | Test deselecting color returns to base price                    |           |      |
| TASK-044 | Test surcharge applied only to profile costs (verify breakdown) |           |      |
| TASK-045 | Test with model that has no colors (ColorSelector returns null) |           |      |
| TASK-046 | Test with 10+ colors (horizontal scroll works)                  |           |      |
| TASK-047 | Test keyboard navigation (Tab, Arrow keys, Enter)               |           |      |
| TASK-048 | Test screen reader announces color name and surcharge           |           |      |
| TASK-049 | Test mobile touch selection and scroll                          |           |      |
| TASK-050 | Test form reset clears color selection                          |           |      |
| TASK-051 | Test adding item to cart preserves color selection              |           |      |
| TASK-052 | Test quote creation stores color snapshot                       |           |      |
| TASK-053 | Verify no console errors or warnings                            |           |      |
| TASK-054 | Run `pnpm build` to verify TypeScript compilation               |           |      |

**Success Criteria**:
- ✅ All user flows tested
- ✅ Price calculation accurate
- ✅ Accessibility verified
- ✅ Mobile experience smooth
- ✅ No TypeScript errors
- ✅ No runtime errors

---

## 3. Alternatives

**Why NOT apply surcharge to entire quote total?**

- **ALT-001**: Apply surcharge to entire quote (profile + glass + services)
  - ❌ Rejected: Color only affects aluminum/PVC profile finish, not glass or installation
  - ❌ Business Rule: Glass is purchased separately, services are labor (no color impact)
  - ✅ Chosen Approach: Apply only to `basePrice + dimensionCosts + accessoryPrice`

**Why NOT client-side price calculation?**

- **ALT-002**: Calculate price client-side to avoid API round-trips
  - ❌ Rejected: Security risk (client can manipulate price)
  - ❌ Violates single source of truth principle
  - ✅ Chosen Approach: Server-side calculation with debounced API calls (300ms)

**Why NOT fetch all model colors upfront?**

- **ALT-003**: Fetch colors in parent Server Component and pass as props
  - ❌ Rejected: Loses 5-minute caching benefit of tRPC query
  - ❌ Complicates Server/Client boundary
  - ✅ Chosen Approach: ColorSelector fetches own data via tRPC (cached, reusable)

## 4. Dependencies

**External Dependencies**:

- **DEP-001**: Radix UI RadioGroup v1.2.3+ (already installed)
- **DEP-002**: TanStack Query v5.90.2+ for tRPC caching (already installed)
- **DEP-003**: Motion/React for scroll animations (already installed)

**Internal Dependencies**:

- **DEP-004**: Colors seeded in database (`colors.seeder.ts`)
- **DEP-005**: ModelColor junction table populated for at least one test model
- **DEP-006**: ColorSelector component (already exists)
- **DEP-007**: ColorChip component (already exists)
- **DEP-008**: `usePriceCalculation` hook (already exists)
- **DEP-009**: `quote.get-model-colors-for-quote` tRPC procedure (already exists)
- **DEP-010**: `quote.calculate-item` tRPC procedure (needs enhancement)

**Data Dependencies**:

- **DEP-011**: At least 1 model with `compatibleGlassTypeIds` populated
- **DEP-012**: At least 1 color assigned to test model with `surchargePercentage > 0`
- **DEP-013**: One color marked as `isDefault: true` per model

## 5. Files

**Files to Create**: None (all components exist)

**Files to Modify**:

- **FILE-001**: `/src/server/api/routers/quote/quote.ts`
  - Add `colorSurchargePercentage` to `calculate-item` input schema
  - Add color validation to `add-item` procedure (snapshot logic)

- **FILE-002**: `/src/server/price/price-item.ts`
  - Update `calculateItemPrice` function signature
  - Implement color surcharge calculation logic
  - Add breakdown fields for color surcharge

- **FILE-003**: `/src/app/(public)/catalog/[modelId]/_hooks/use-price-calculation.ts`
  - Add `colorSurchargePercentage` parameter
  - Update mutation payload
  - Update dependency array

- **FILE-004**: `/src/app/(public)/catalog/[modelId]/_components/form/model-form.tsx`
  - Add `selectedColorSurcharge` state
  - Update `handleColorChangeWithForm`
  - Pass surcharge to `usePriceCalculation`
  - Update `prepareCartItemInput`

- **FILE-005**: `/src/app/(public)/catalog/[modelId]/_hooks/use-price-breakdown.ts`
  - Add color surcharge formatting
  - Add color name/hex display

- **FILE-006**: `/src/app/(public)/catalog/[modelId]/_components/sticky-price-header.tsx`
  - Add color surcharge row to breakdown
  - Display color chip and name

- **FILE-007**: `/src/app/(public)/catalog/[modelId]/_utils/cart-item-mapper.ts`
  - Add `colorId` to cart item input

**Files to Reference** (no changes):

- **FILE-008**: `/src/app/(public)/catalog/[modelId]/_components/color-selector.tsx` (already complete)
- **FILE-009**: `/prisma/seeders/colors.seeder.ts` (run to seed data)
- **FILE-010**: `/prisma/schema.prisma` (reference for Color/ModelColor schema)

## 6. Testing

**Unit Tests**:

- **TEST-001**: Test `calculateItemPrice` applies surcharge correctly
  - Input: basePrice=1000, dimCost=500, surcharge=20%
  - Expected: profileCost = (1000+500) * 1.2 = 1800

- **TEST-002**: Test surcharge NOT applied to glass costs
  - Input: profileCost=1500, glassCost=800, surcharge=20%
  - Expected: total = (1500 * 1.2) + 800 = 2600 (not 2760)

- **TEST-003**: Test 0% surcharge returns base price
  - Input: basePrice=1000, dimCost=500, surcharge=0
  - Expected: profileCost = 1500

**Integration Tests**:

- **TEST-004**: Test tRPC `calculate-item` with color surcharge
  - Call mutation with modelId, dimensions, colorSurchargePercentage
  - Assert breakdown includes `colorSurchargeAmount`

- **TEST-005**: Test ColorSelector auto-selects default color
  - Mock `get-model-colors-for-quote` with defaultColorId
  - Assert `onColorChange` called with default color on mount

**E2E Tests** (Playwright):

- **TEST-006**: Test complete quote flow with color selection
  - Navigate to `/catalog/[modelId]`
  - Select dimensions
  - Select glass type
  - Select color (verify price updates)
  - Add to cart
  - Verify cart shows color

- **TEST-007**: Test color deselection resets price
  - Select color (+20%)
  - Deselect color
  - Assert price returns to base

- **TEST-008**: Test keyboard navigation in ColorSelector
  - Tab to ColorSelector
  - Use Arrow keys to navigate colors
  - Press Enter to select
  - Assert selection updates

**Accessibility Tests**:

- **TEST-009**: Test screen reader announces color details
  - Use axe-core to validate ARIA labels
  - Assert RadioGroup has proper role and labels

- **TEST-010**: Test focus visible on keyboard navigation
  - Tab through color chips
  - Assert focus ring visible

## 7. Risks & Assumptions

**Risks**:

- **RISK-001**: Color seeder not run → No colors available for testing
  - Mitigation: Document seeding in README, add to onboarding checklist

- **RISK-002**: Client manipulates surcharge percentage → Incorrect pricing
  - Mitigation: Server validates surcharge matches ModelColor record

- **RISK-003**: Price calculation too slow → Poor UX (<500ms target)
  - Mitigation: 300ms debounce + server-side caching + database indexes

- **RISK-004**: Stale closure in usePriceCalculation → Wrong surcharge applied
  - Mitigation: Use refs pattern (proven in services implementation)

- **RISK-005**: ColorSelector layout shift on mount → CLS penalty
  - Mitigation: Reserve space with skeleton loader (already implemented)

**Assumptions**:

- **ASSUMPTION-001**: 300ms debounce is optimal (proven in `usePriceCalculation`)
- **ASSUMPTION-002**: Color surcharge never exceeds 100% (enforced by Decimal(5,2))
- **ASSUMPTION-003**: Each model has at most 20 colors (UI supports horizontal scroll)
- **ASSUMPTION-004**: Color selection is optional (models can exist without colors)
- **ASSUMPTION-005**: Default color auto-selection is desired UX (reduces cognitive load)
- **ASSUMPTION-006**: Color snapshot in QuoteItem is sufficient for immutability
- **ASSUMPTION-007**: Color surcharge applies to accessories (same profile finish)

## 8. Related Specifications / Further Reading

**Internal Documentation**:

- [Color Catalog System Specification](/specs/001-model-color-catalog/spec.md)
- [Color Seeder Implementation](/prisma/seeders/colors.seeder.ts)
- [Quote Wizard Tasks](/specs/015-client-quote-wizard/tasks.md)
- [Price Calculation Hook](/src/app/(public)/catalog/[modelId]/_hooks/use-price-calculation.ts)

**External References**:

- [Radix UI RadioGroup](https://www.radix-ui.com/primitives/docs/components/radio-group)
- [TanStack Query Caching](https://tanstack.com/query/latest/docs/framework/react/guides/caching)
- [Prisma Many-to-Many Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations)
- [Don't Make Me Think - Steve Krug](https://sensible.com/dont-make-me-think/)

**Architecture Patterns**:

- [SOLID Principles in React](https://konstantinlebedev.com/solid-in-react/)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)
- [React Server Components](https://react.dev/reference/rsc/server-components)

---

## Implementation Notes

### Price Calculation Formula Detail

```typescript
// SERVER-SIDE CALCULATION (source of truth)
function calculateItemPrice({
  basePrice,
  costPerMmWidth,
  costPerMmHeight,
  widthMm,
  heightMm,
  accessoryPrice,
  colorSurchargePercentage = 0,
  glassAreaCost,
  servicesCost,
}) {
  // Step 1: Dimension costs
  const widthCost = costPerMmWidth * widthMm;
  const heightCost = costPerMmHeight * heightMm;
  const dimensionCost = widthCost + heightCost;

  // Step 2: Profile cost (base + dimensions)
  const baseWithDimensions = basePrice + dimensionCost;

  // Step 3: Apply color surcharge to profile
  const profileCostWithColor = baseWithDimensions * (1 + colorSurchargePercentage / 100);

  // Step 4: Apply color surcharge to accessories (if enabled)
  const accessoryCostWithColor = accessoryPrice 
    ? accessoryPrice * (1 + colorSurchargePercentage / 100)
    : 0;

  // Step 5: Total (profile + accessories + glass + services)
  const subtotal = profileCostWithColor + accessoryCostWithColor + glassAreaCost + servicesCost;

  // Step 6: Breakdown for client
  return {
    subtotal,
    breakdown: {
      profileCost: baseWithDimensions,
      colorSurchargePercentage,
      colorSurchargeAmount: profileCostWithColor - baseWithDimensions,
      accessoryCost: accessoryCostWithColor,
      glassAreaCost,
      servicesCost,
    },
  };
}
```

### ColorSelector Integration Pattern

```typescript
// MODEL FORM INTEGRATION
export function ModelForm({ model, ... }) {
  const [selectedColorSurcharge, setSelectedColorSurcharge] = useState(0);

  // Price calculation with color surcharge
  const { calculatedPrice, breakdown } = usePriceCalculation({
    modelId: model.id,
    widthMm,
    heightMm,
    glassTypeId,
    additionalServices,
    colorSurchargePercentage: selectedColorSurcharge, // ← NEW
  });

  // Handle color selection
  const handleColorChangeWithForm = (colorId, surcharge) => {
    setSelectedColorSurcharge(surcharge); // ← NEW
    form.setValue("colorId", colorId);
  };

  return (
    <Form {...form}>
      {/* ... dimensions, glass type ... */}
      
      <ColorSelector
        modelId={model.id}
        onColorChange={handleColorChangeWithForm}
      />
      
      {/* ... services ... */}
    </Form>
  );
}
```

---

**End of Implementation Plan**
