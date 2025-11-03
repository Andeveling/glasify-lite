---
description: "Task list for cart item editing feature implementation"
---

# Tasks: Edición de Items del Carrito

**Input**: Design documents from `/specs/019-edit-cart-items/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Constitution Compliance**: Tasks follow principles from `.specify/memory/constitution.md`:
- **Flexible Testing**: Tests written during implementation for critical paths (price calculation, validation)
- **One Job, One Place**: Each file has single responsibility per SOLID architecture
- **Clarity Over Complexity**: Descriptive task names with exact file paths
- **Security From the Start**: Server-side validation for all mutations

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and file structure creation

- [ ] T001 Create SOLID file structure for cart feature in `src/app/(public)/cart/` with `_components/`, `_hooks/`, `_schemas/`, `_utils/`, `_constants/` directories
- [ ] T002 [P] Verify Shadcn/ui components installed: `dialog`, `button`, `input`, `select`, `label`, `form`
- [ ] T003 [P] Verify Next.js Image component configured in `next.config.ts` for model image optimization

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create cart item constants in `src/app/(public)/cart/_constants/cart-item.constants.ts`
  - CART_ITEM_IMAGE_SIZE = 80
  - DEFAULT_MODEL_PLACEHOLDER path
  - MIN_DIMENSION = 100, MAX_DIMENSION = 3000
  - UI text constants in Spanish
- [ ] T005 [P] Create Zod validation schema in `src/app/(public)/cart/_schemas/cart-item-edit.schema.ts`
  - widthMm: integer, min 100, max 3000, Spanish error messages
  - heightMm: integer, min 100, max 3000, Spanish error messages
  - glassTypeId: uuid format, required
  - name: string, max 50 chars, optional
  - roomLocation: string, max 100 chars, optional
  - quantity: integer, min 1, default 1
  - Export CartItemEditInput type
- [ ] T006 [P] Create utility functions in `src/app/(public)/cart/_utils/cart-item-edit.utils.ts`
  - CartItemWithRelations type definition
  - getDefaultCartItemValues(item) function
  - transformEditData(itemId, formData) function
- [ ] T007 [P] Create price calculator in `src/app/(public)/cart/_utils/cart-price-calculator.ts`
  - calculateItemPrice(params) function using Decimal precision
  - Formula: (width * height / 1,000,000) * pricePerM2 * quantity + colorSurcharge
  - PriceCalculationParams interface
- [ ] T008 Create unit tests for price calculator in `tests/unit/cart-price-calculator.test.ts`
  - Test basic calculation (1000x1000mm at $100/m2 = $100)
  - Test quantity multiplication
  - Test color surcharge application (10% on $100 = $110)
  - Test decimal precision (no rounding errors)
  - Test edge cases (min dimensions, max dimensions)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Visualizar Imagen del Modelo (Priority: P1) 🎯 MVP

**Goal**: Display model images in cart items with optimized loading and fallback placeholders

**Independent Test**: Add item to cart and verify model image displays with correct dimensions (80x80px) and fallback works when image missing

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create cart item image component in `src/app/(public)/cart/_components/cart-item-image.tsx`
  - Use Next.js Image component with width={80} height={80}
  - Accept modelImageUrl and modelName props
  - Show DEFAULT_MODEL_PLACEHOLDER when imageUrl is null/undefined
  - Add alt text with model name for accessibility
  - Apply rounded corners and border styling
- [ ] T010 [US1] Update cart item display component in `src/app/(public)/cart/_components/cart-item.tsx`
  - Import and render CartItemImage component
  - Pass model.imageUrl and model.name as props
  - Position image at left side of item card
  - Ensure item layout is responsive (flexbox with image + content)
- [ ] T011 [US1] Add E2E test for image display in `e2e/cart/item-image.spec.ts`
  - Test 1: Create cart item and verify image renders
  - Test 2: Verify image has correct src, alt text, and dimensions
  - Test 3: Test placeholder image when model has no image
  - Test 4: Verify image loads with Next.js optimization

**Checkpoint**: At this point, cart items display model images correctly

---

## Phase 4: User Story 2 - Editar Dimensiones de Item (Priority: P2)

**Goal**: Allow users to edit width and height of cart items with validation and price recalculation

**Independent Test**: Create cart item, click edit, change dimensions, confirm, verify price updates correctly

### Implementation for User Story 2

- [ ] T012 [P] [US2] Create data fetching hook in `src/app/(public)/cart/_hooks/use-cart-data.ts`
  - useCartData() hook wrapping api.cart.get.useQuery()
  - Set staleTime: 0 (cart data changes frequently)
  - Return cart with items including model and glassType relations
  - Handle loading and error states
- [ ] T013 [P] [US2] Create mutations hook in `src/app/(public)/cart/_hooks/use-cart-item-mutations.ts`
  - useCartItemMutations() hook wrapping api.cart.updateItem.useMutation()
  - Include onSuccess with Spanish toast notification "Item actualizado correctamente"
  - Include onError with Spanish toast notification from error message
  - Include onSettled with utils.cart.get.invalidate() + router.refresh() (SSR two-step pattern)
  - Import useRouter from 'next/navigation'
  - Return updateItem mutation function
- [ ] T014 [US2] Create edit modal component in `src/app/(public)/cart/_components/cart-item-edit-modal.tsx`
  - Accept open, onOpenChange, item props
  - Use Dialog from Shadcn/ui
  - Use React Hook Form with zodResolver(cartItemEditSchema)
  - Initialize form with getDefaultCartItemValues(item)
  - Render width and height inputs (number type, Spanish labels)
  - Show current price and "El precio se recalculará al confirmar" message
  - Disable save button while submitting
  - Call updateItem mutation on submit with transformEditData()
  - Close modal on success
  - Show validation errors inline in Spanish
  - Form should be < 100 lines (UI orchestration only)
- [ ] T015 [US2] Update cart item component to add edit button in `src/app/(public)/cart/_components/cart-item.tsx`
  - Add "Editar" button using EDIT_BUTTON_TEXT constant
  - Manage modal open state with useState
  - Import and render CartItemEditModal component
  - Pass current item data to modal
- [ ] T016 [US2] Extend tRPC router with updateItem procedure in `src/server/api/routers/cart.ts`
  - Procedure name: 'updateItem'
  - Type: mutation
  - Input: Zod schema from contracts/cart.updateItem.json
  - Authorization: Check user owns the quote (quote.userId === ctx.user.id OR quote is draft with session)
  - Validation steps:
    1. Fetch QuoteItem with model relation
    2. Verify quote status is 'draft' (throw "Solo se pueden editar items de cotizaciones en borrador")
    3. Verify widthMm >= model.minWidth AND <= model.maxWidth (throw "Ancho fuera del rango permitido")
    4. Verify heightMm >= model.minHeight AND <= model.maxHeight (throw "Alto fuera del rango permitido")
  - Update QuoteItem fields: widthMm, heightMm, name, roomLocation, quantity
  - Recalculate subtotal using calculateItemPrice() from utils
  - Update Quote.total by summing all item subtotals
  - Return updated item with model and glassType relations
  - Use Prisma transaction for atomic update
  - Log with Winston (server-side): "Cart item updated: {itemId}"
- [ ] T017 [US2] Add integration test for updateItem procedure in `tests/integration/cart-update-item.test.ts`
  - Test 1: Successful dimension update with price recalculation
  - Test 2: Validation error when width exceeds model.maxWidth
  - Test 3: Validation error when height below model.minHeight
  - Test 4: Authorization error when user doesn't own quote
  - Test 5: Error when trying to edit non-draft quote
  - Test 6: Verify Quote.total updates after item edit
- [ ] T018 [US2] Update cart page to use force-dynamic in `src/app/(public)/cart/page.tsx`
  - Add export const dynamic = 'force-dynamic'
  - Fetch cart data server-side with tRPC caller
  - Pass initialData to client component
  - Ensure SSR compatibility with mutations

**Checkpoint**: Users can now edit dimensions and see price updates

---

## Phase 5: User Story 3 - Cambiar Tipo de Vidrio (Priority: P2)

**Goal**: Allow users to change glass type with compatibility validation

**Independent Test**: Create cart item, click edit, change glass type to compatible option, confirm, verify price updates

### Implementation for User Story 3

- [ ] T019 [P] [US3] Extend tRPC router with getAvailableGlassTypes query in `src/server/api/routers/model.ts`
  - Procedure name: 'getAvailableGlassTypes'
  - Type: query
  - Input: Zod schema { modelId: z.string().uuid() }
  - No authorization (public catalog data)
  - Query ModelGlassType junction with glassType relation
  - Filter by modelId
  - Order by glassType.pricePerM2 ASC (cheapest first)
  - Return array of GlassType with id, name, pricePerM2, thickness, description
  - Cache with staleTime: 5 minutes
  - Log with Winston: "Fetched glass types for model: {modelId}"
- [ ] T020 [P] [US3] Extend tRPC router with validateGlassCompatibility query in `src/server/api/routers/cart.ts`
  - Procedure name: 'validateGlassCompatibility'
  - Type: query
  - Input: Zod schema { modelId: z.string().uuid(), glassTypeId: z.string().uuid() }
  - No authorization (public validation)
  - Query ModelGlassType junction for matching record
  - Return { compatible: boolean, message: string }
  - Spanish messages: "Este vidrio es compatible" / "Este vidrio no es compatible con el modelo"
  - Cache with staleTime: 5 minutes
- [ ] T021 [US3] Update edit modal to add glass type selector in `src/app/(public)/cart/_components/cart-item-edit-modal.tsx`
  - Add api.model.getAvailableGlassTypes.useQuery(item.modelId)
  - Render Select component with available glass types
  - Show glass name and price in dropdown options
  - Pre-select current glass type (item.glassTypeId)
  - Update form field on selection
  - Handle loading state while fetching glass types
- [ ] T022 [US3] Update updateItem procedure to validate glass compatibility in `src/server/api/routers/cart.ts`
  - Before updating, query ModelGlassType for (modelId, glassTypeId)
  - Throw TRPCError if not compatible: "El vidrio seleccionado no es compatible con este modelo"
  - Update glassTypeId in QuoteItem
  - Refetch glassType.pricePerM2 for recalculation
  - Recalculate subtotal with new glass price
- [ ] T023 [US3] Add integration test for glass type change in `tests/integration/cart-change-glass.test.ts`
  - Test 1: Successful glass type change with price update
  - Test 2: Error when selecting incompatible glass type
  - Test 3: Verify price changes correctly (cheaper glass = lower price)
  - Test 4: Verify glass type list only shows compatible types
- [ ] T024 [US3] Add E2E test for glass type editing in `e2e/cart/edit-glass-type.spec.ts`
  - Test 1: Open modal, change glass type, confirm, verify update
  - Test 2: Verify dropdown only shows compatible glass types
  - Test 3: Verify price updates after glass change
  - Test 4: Cancel modal and verify glass type unchanged

**Checkpoint**: Users can now change glass types with validation

---

## Phase 6: User Story 4 - Recálculo Manual de Precio (Priority: P3)

**Goal**: Price recalculates only on confirm, not during typing (UX optimization)

**Independent Test**: Edit multiple fields, verify price doesn't change until "Guardar" clicked

### Implementation for User Story 4

- [ ] T025 [US4] Update edit modal to show current vs future price in `src/app/(public)/cart/_components/cart-item-edit-modal.tsx`
  - Display current item.subtotal at top of modal (read-only)
  - Add helper text: "El precio se recalculará al confirmar" using constant
  - Do NOT show live price preview during editing
  - Keep form simple with only input fields (no calculation preview)
- [ ] T026 [US4] Add visual feedback for saving state in `src/app/(public)/cart/_components/cart-item-edit-modal.tsx`
  - Disable all inputs while mutation.isPending
  - Show loading spinner on save button during submit
  - Change save button text to "Guardando..." while pending
  - Prevent modal close during save
- [ ] T027 [US4] Add E2E test for single recalculation in `e2e/cart/price-recalculation.spec.ts`
  - Test 1: Change width, verify price doesn't update in modal
  - Test 2: Change height, verify price doesn't update in modal
  - Test 3: Change glass type, verify price doesn't update in modal
  - Test 4: Click save, verify price updates on cart page (not modal)
  - Test 5: Verify updated price matches expected calculation

**Checkpoint**: Price recalculation optimized for better UX

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, edge cases, accessibility, and final testing

- [ ] T028 [P] Add error boundary for cart page in `src/app/(public)/cart/error.tsx`
  - Catch and display errors in Spanish
  - Provide "Recargar" button to retry
  - Log errors with Winston (server-side only)
- [ ] T029 [P] Add loading skeleton for cart items in `src/app/(public)/cart/_components/cart-skeleton.tsx`
  - Use Shadcn/ui Skeleton component
  - Match cart item layout (image + content)
  - Show 3 skeleton items by default
- [ ] T030 [P] Add accessibility improvements to edit modal in `src/app/(public)/cart/_components/cart-item-edit-modal.tsx`
  - aria-label on close button
  - Proper focus management (first input on open)
  - Keyboard navigation (Escape to close, Enter to submit)
  - Screen reader announcements for validation errors
- [ ] T031 Update CHANGELOG.md with feature entry
  - Add to "Unreleased" section under "Added"
  - Entry: "Edición de items del carrito con cambio de dimensiones y tipo de vidrio (#019)"
  - Include breaking changes if any
- [ ] T032 Manual testing checklist
  - [ ] Create cart item and verify image displays
  - [ ] Edit dimensions within valid range, confirm, verify price updates
  - [ ] Edit dimensions outside range, verify error message in Spanish
  - [ ] Change glass type to compatible option, verify price updates
  - [ ] Attempt to select incompatible glass (if UI allows), verify server error
  - [ ] Cancel edit modal, verify no changes applied
  - [ ] Edit same item twice consecutively, verify both edits work
  - [ ] Test with model that has no image, verify placeholder shows
  - [ ] Test with slow network, verify loading states
  - [ ] Test keyboard navigation in modal
  - [ ] Test screen reader compatibility

---

## Dependencies

**User Story Completion Order**:

1. **US1** (Display Images) → Independent, can complete first
2. **US2** (Edit Dimensions) → Depends on US1 (edit button on cart item)
3. **US3** (Change Glass) → Depends on US2 (extends same modal)
4. **US4** (Manual Recalc) → Depends on US2 & US3 (UX refinement of modal)

**Parallel Execution Opportunities**:

- **Phase 2**: All foundational tasks (T004-T007) can run in parallel
- **Phase 3**: T009 and T011 can run in parallel (component + test)
- **Phase 4**: T012 and T013 can run in parallel (both hooks)
- **Phase 5**: T019 and T020 can run in parallel (both tRPC procedures)
- **Phase 7**: T028, T029, T030 can run in parallel (all polish tasks)

---

## Implementation Strategy

**MVP Scope** (Minimum Viable Product):
- **User Story 1 only**: Display model images in cart
- Estimated effort: ~2-3 hours
- Delivers immediate value: Better visual identification

**Incremental Delivery**:
1. **Sprint 1**: US1 (images) → Production
2. **Sprint 2**: US1 + US2 (dimensions) → Production
3. **Sprint 3**: US1 + US2 + US3 (glass types) → Production
4. **Sprint 4**: All user stories → Production

**Testing Approach**:
- Unit tests for price calculator (Phase 2, T008)
- Integration tests per user story (T017, T023)
- E2E tests for critical paths (T011, T024, T027)
- Manual testing checklist before merge (T032)

---

## Task Summary

**Total Tasks**: 32
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 5 tasks
- Phase 3 (US1 - Images): 3 tasks
- Phase 4 (US2 - Dimensions): 7 tasks
- Phase 5 (US3 - Glass Type): 6 tasks
- Phase 6 (US4 - Recalc UX): 3 tasks
- Phase 7 (Polish): 5 tasks

**Parallelizable Tasks**: 14 tasks marked with [P]

**Test Tasks**: 8 tasks (unit, integration, E2E, manual)

**Suggested MVP**: US1 only (T001-T011) = 11 tasks, ~2-3 hours

---

## Format Validation ✅

All tasks follow required format:
- ✅ Checkbox prefix: `- [ ]`
- ✅ Task ID: Sequential (T001-T032)
- ✅ [P] marker: Applied to parallelizable tasks
- ✅ [Story] label: Applied to user story phase tasks (US1-US4)
- ✅ Description: Clear action with exact file path
- ✅ Organization: Grouped by user story for independent implementation
