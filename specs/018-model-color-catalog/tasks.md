---
description: "Implementation tasks for color catalog system"
---

# Tasks: Sistema de Catálogo de Colores para Modelos

**Input**: Design documents from `/specs/001-model-color-catalog/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Constitution Compliance**: Tasks follow principles from `.specify/memory/constitution.md`:
- **Flexible Testing**: E2E tests prioritized for user flows, unit tests for pricing logic
- **One Job, One Place**: Single responsibility per task
- **Clarity Over Complexity**: Descriptive task names with exact file paths
- **Security From the Start**: Validation and authorization in every entry point
- **Server-First Performance**: SSR with force-dynamic for admin, 5min ISR for catalog

**Organization**: Tasks grouped by user story (P1, P2, P3) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database foundation

- [x] T001 Create feature branch `001-model-color-catalog` from develop
- [x] T002 [P] Create directory structure for color feature (admin/colors/, admin/models/[id]/colors/, seeders/)
- [x] T003 [P] Install any missing dependencies (verify Zod, Prisma, React Hook Form versions)

**Checkpoint**: Directory structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema & Migrations

- [x] T004 Create Prisma schema for Color model in `prisma/schema.prisma`
  - Fields: id (String @id @default(cuid())), name (String), ralCode (String?), hexCode (String), isActive (Boolean @default(true)), createdAt, updatedAt
  - Constraints: @@unique([name, hexCode]), @@index([isActive]), @@index([name])
  - Relations: modelColors ModelColor[], quoteItems QuoteItem[]

- [x] T005 Create Prisma schema for ModelColor model in `prisma/schema.prisma`
  - Fields: id, modelId (String), colorId (String), surchargePercentage (Decimal), isDefault (Boolean @default(false)), createdAt, updatedAt
  - Constraints: @@unique([modelId, colorId]), @@index([modelId, isDefault]), @@index([colorId])
  - Relations: model Model @relation, color Color @relation
  - Foreign keys: onDelete CASCADE for model, onDelete RESTRICT for color

- [x] T006 Extend QuoteItem model in `prisma/schema.prisma`
  - Add optional fields: colorId (String?), colorSurchargePercentage (Decimal?), colorHexCode (String?), colorName (String?)
  - Add relation: color Color? @relation

- [x] T007 Generate Prisma migration with `npx prisma migrate dev --name add_color_catalog_system`

- [x] T008 Verify migration success and rollback capability (manual test)

### Validation Schemas

- [x] T009 [P] Create Zod validation schemas in `src/lib/validations/color.ts`
  - colorCreateSchema: name (1-50 chars), ralCode (optional regex /^RAL \d{4}$/), hexCode (required regex /^#[0-9A-Fa-f]{6}$/), isActive (boolean default true)
  - colorUpdateSchema: same as create but all fields optional
  - Spanish error messages: "Formato hexadecimal inválido (#RRGGBB)", "Código RAL inválido (RAL XXXX)"

- [x] T010 [P] Create Zod validation schemas in `src/lib/validations/model-color.ts`
  - modelColorAssignSchema: modelId (string), colorId (string), surchargePercentage (number 0-100), isDefault (boolean)
  - modelColorUpdateSurchargeSchema: surchargePercentage only
  - Spanish error messages: "El recargo debe estar entre 0% y 100%"

### Seeder Infrastructure

- [x] T011 Create color seeder in `prisma/seeders/colors.seeder.ts`
  - Implement idempotent upsert using @@unique([name, hexCode]) constraint
  - Seed 10 standard colors from spec.md FR-001 with exact RAL codes and hex values
  - Add Winston logging (server-side only): "Color seed started", "Upserted X colors", error logs
  - Use try-catch with transaction rollback on failure

- [x] T012 Integrate color seeder into main seed script `prisma/seed-tenant.ts`
  - Import and execute colorSeeder before model seeding
  - Add error handling and logging

**Checkpoint**: Foundation ready - all user stories can now begin in parallel

---

## Phase 3: User Story 1 - Administrador configura catálogo de colores base (Priority: P1) 🎯 MVP

**Goal**: Admin can manage the master color catalog (view, create, edit, deactivate colors)

**Independent Test**: Admin can access `/admin/colors`, see 10 pre-seeded colors, create new color "Verde Musgo" (#6B8E23, RAL 6025), edit existing color hex code, deactivate color, and search/filter by name or status. All changes persist correctly.

### Backend Implementation (US1)

- [x] T013 [P] [US1] Create tRPC colors router in `src/server/api/routers/admin/colors.ts`
  - Export router with namespace 'colors'
  - Initialize with empty procedures object

- [x] T014 [P] [US1] Implement `colors.list` query in `src/server/api/routers/admin/colors.ts`
  - Auth: adminProcedure
  - Input: z.object({ isActive: z.boolean().optional(), search: z.string().optional() })
  - Query: Prisma findMany with where filters, include _count for modelColors and quoteItems
  - Return: Color[] with usage counts

- [x] T015 [P] [US1] Implement `colors.getById` query in `src/server/api/routers/admin/colors.ts`
  - Auth: adminProcedure
  - Input: z.object({ id: z.string() })
  - Query: Prisma findUniqueOrThrow with full relations
  - Error: TRPCError NOT_FOUND if color doesn't exist (Spanish message: "Color no encontrado")

- [x] T016 [P] [US1] Implement `colors.create` mutation in `src/server/api/routers/admin/colors.ts`
  - Auth: adminProcedure
  - Input: colorCreateSchema from validations/color.ts
  - Business logic: Check duplicate name+hexCode before insert
  - Error: TRPCError CONFLICT if duplicate (Spanish: "El color ya existe con este nombre o código hexadecimal")
  - Winston logging: Log color creation with admin user ID

- [x] T017 [P] [US1] Implement `colors.update` mutation in `src/server/api/routers/admin/colors.ts`
  - Auth: adminProcedure
  - Input: z.object({ id: z.string() }).merge(colorUpdateSchema)
  - Business logic: Check duplicate on name+hexCode change
  - Winston logging: Log update with changed fields

- [x] T018 [P] [US1] Implement `colors.delete` mutation in `src/server/api/routers/admin/colors.ts`
  - Auth: adminProcedure
  - Input: z.object({ id: z.string() })
  - Business logic: Three-tier deletion strategy
    - If used in QuoteItem: Throw error (Spanish: "No se puede eliminar. Color usado en X cotizaciones")
    - If used in ModelColor: Soft delete (isActive = false), return warning (Spanish: "Color desactivado. Usado en X modelos")
    - If no references: Hard delete, return success
  - Winston logging: Log deletion attempt and result

- [x] T019 [P] [US1] Implement `colors.checkUsage` query in `src/server/api/routers/admin/colors.ts`
  - Auth: adminProcedure
  - Input: z.object({ id: z.string() })
  - Return: { modelCount: number, quoteCount: number, canDelete: boolean, canHardDelete: boolean }

- [x] T020 [US1] Register colors router in `src/server/api/routers/admin/admin.ts`
  - Import colorsRouter
  - Add to adminRouter: colors: colorsRouter

### Frontend Components (US1)

- [x] T021 [P] [US1] Create ColorChip component in `src/app/(dashboard)/admin/colors/_components/color-chip.tsx`
  - Props: hexCode (string), size ('sm' | 'md' | 'lg')
  - Render: div with background color, border, optional checkmark for selected state
  - Reusable across admin and client UI

- [x] T022 [P] [US1] Create ColorForm component in `src/app/(dashboard)/admin/colors/_components/color-form.tsx`
  - Use React Hook Form 7.63.0 with Zod resolver
  - Fields: name (Input), ralCode (Input with pattern hint "RAL XXXX"), hexCode (Input with color picker preview), isActive (Switch)
  - Client Component with 'use client' directive
  - Real-time hex validation with ColorChip preview
  - Submit handler: call colors.create or colors.update mutation
  - Optimistic UI: Show loading state, toast on success/error (Spanish messages)
  - Error handling: Display Zod validation errors inline

- [x] T023 [P] [US1] Create ColorListTable component in `src/app/(dashboard)/admin/colors/_components/color-list-table.tsx`
  - Use existing ServerTable pattern from project
  - Columns: ColorChip, Name, RAL Code, Hex Code, Status badge (Activo/Inactivo), Usage counts (X modelos, Y cotizaciones), Actions (Edit, Delete)
  - Client Component with search input (debounced 300ms)
  - Filter: Active/Inactive toggle
  - Sort: By name, createdAt
  - Actions: Edit button → navigate to /admin/colors/[id], Delete button → confirm dialog → colors.delete mutation

- [x] T024 [US1] Create color list page in `src/app/(dashboard)/admin/colors/page.tsx`
  - Server Component with export const dynamic = 'force-dynamic'
  - Metadata: title "Gestión de Colores", description
  - Fetch initial colors: const colors = await api.colors.list()
  - Render: ColorListTable with initialData={colors}
  - Add "Nuevo Color" button → navigate to /admin/colors/new

- [x] T025 [US1] Create new color page in `src/app/(dashboard)/admin/colors/new/page.tsx`
  - Server Component with metadata
  - Render: ColorForm in create mode
  - On success: router.push('/admin/colors') + toast notification

- [x] T026 [US1] Create edit color page in `src/app/(dashboard)/admin/colors/[id]/edit/page.tsx`
  - Server Component with dynamic route param
  - Fetch color: const color = await api.colors.getById({ id: params.id })
  - Error boundary: 404 if color not found
  - Render: ColorForm in edit mode with defaultValues={color}
  - On success: Two-step invalidation (utils.colors.list.invalidate() + router.refresh())

### Cache Invalidation Patterns (US1)

- [x] T027 [US1] Implement two-step cache invalidation in ColorForm mutations
  - Import useRouter from 'next/navigation'
  - In onSettled callback: void utils.colors.list.invalidate(); router.refresh();
  - Apply to both create and update mutations
  - Add to delete mutation in ColorListTable

**Checkpoint**: User Story 1 complete - Admin can fully manage color catalog

---

## Phase 4: User Story 2 - Administrador asigna colores a modelo con recargo porcentual (Priority: P2)

**Goal**: Admin can assign colors from catalog to specific models with custom surcharge percentages and mark default color

**Independent Test**: Admin selects model "Ventana Corrediza PVC", assigns 5 colors (Blanco 0%, Gris +10%, Negro +18%, Madera +22%, Champagne +12%), marks Blanco as default, removes Inox color assignment. Validation rejects surcharge >100%. Changes persist and reflect in client quotation flow.

### Backend Implementation (US2)

- [x] T028 [P] [US2] Create tRPC modelColors router in `src/server/api/routers/admin/model-colors.ts`
  - Export router with namespace 'modelColors'
  - All procedures use adminProcedure (admin-only operations)

- [x] T029 [P] [US2] Implement `modelColors.listByModel` query in `src/server/api/routers/admin/model-colors.ts`
  - Input: z.object({ modelId: z.string() })
  - Query: Prisma findMany where modelId, include color relation
  - Ordering: isDefault DESC, color.name ASC (default first)
  - Filter: Only include where color.isActive = true

- [x] T030 [P] [US2] Implement `modelColors.getAvailableColors` query in `src/server/api/routers/admin/model-colors.ts`
  - Input: z.object({ modelId: z.string() })
  - Query: Find all active colors NOT yet assigned to this model
  - Return: Color[] excluding already assigned colors
  - Use case: Populate "Add Color" dropdown

- [x] T031 [P] [US2] Implement `modelColors.assign` mutation in `src/server/api/routers/admin/model-colors.ts`
  - Input: modelColorAssignSchema (modelId, colorId, surchargePercentage, isDefault optional)
  - Business logic: 
    - Check model exists and user has access (tenant validation)
    - Check color exists and isActive = true
    - If isDefault = true: Transactionally set all other modelColors.isDefault = false for this model
    - If this is first color for model: Auto-set isDefault = true
  - Constraint: Prisma handles duplicate prevention via @@unique([modelId, colorId])
  - Error: TRPCError CONFLICT if already assigned (Spanish: "Este color ya está asignado al modelo")
  - Winston logging: Log assignment with modelId, colorId, surchargePercentage

- [x] T032 [P] [US2] Implement `modelColors.updateSurcharge` mutation in `src/server/api/routers/admin/model-colors.ts`
  - Input: z.object({ id: z.string(), surchargePercentage: z.number().min(0).max(100) })
  - Update: Prisma update where id
  - Validation: Reject if surcharge outside 0-100 range (Spanish: "El recargo debe estar entre 0% y 100%")

- [x] T033 [P] [US2] Implement `modelColors.setDefault` mutation in `src/server/api/routers/admin/model-colors.ts`
  - Input: z.object({ id: z.string() })
  - Transaction:
    - Get modelId from the ModelColor being set as default
    - Update all ModelColor where modelId: set isDefault = false
    - Update target ModelColor: set isDefault = true
  - Error handling: TRPCError NOT_FOUND if id doesn't exist

- [x] T034 [P] [US2] Implement `modelColors.unassign` mutation in `src/server/api/routers/admin/model-colors.ts`
  - Input: z.object({ id: z.string() })
  - Business logic:
    - Check if color is used in any QuoteItem for this model (optional safeguard)
    - If removing default color and other colors exist: Auto-promote first remaining color to default
  - Delete: Prisma delete where id
  - Winston logging: Log unassignment

- [x] T035 [P] [US2] Implement `modelColors.bulkAssign` mutation in `src/server/api/routers/admin/model-colors.ts`
  - Input: z.object({ modelId: z.string(), assignments: z.array(z.object({ colorId, surchargePercentage })) })
  - Transaction: Prisma createMany with skipDuplicates
  - Use case: Quick setup when creating new model with standard color set
  - Business logic: First color in array becomes default if no default exists

- [x] T036 [US2] Register modelColors router in `src/server/api/root.ts`
  - Import modelColorsRouter
  - Add to appRouter: modelColors: modelColorsRouter

### Frontend Components (US2)

- [x] T037 [P] [US2] Create ModelColorRow component in `src/app/(dashboard)/admin/models/[id]/colors/_components/model-color-row.tsx`
  - Props: modelColor (with color relation), onUpdateSurcharge, onSetDefault, onRemove
  - Render: ColorChip | Name | RAL | Surcharge input (editable) | Default radio/checkbox | Remove button
  - Client Component with inline surcharge editing (debounced 500ms)
  - Optimistic UI for surcharge updates

- [x] T038 [P] [US2] Create AddColorDialog component in `src/app/(dashboard)/admin/models/[id]/colors/_components/add-color-dialog.tsx`
  - Props: modelId, availableColors (from modelColors.getAvailableColors)
  - Shadcn Dialog with color selection (visual chips grid)
  - Form: Selected color + surcharge percentage input + "Set as default" checkbox
  - Submit: Call modelColors.assign mutation
  - Close on success with toast notification

- [x] T039 [US2] Create model colors page in `src/app/(dashboard)/admin/models/[id]/colors/page.tsx`
  - Server Component with dynamic route params
  - Metadata: title "Colores del Modelo - [Model Name]"
  - Fetch model and assigned colors: const modelColors = await api.modelColors.listByModel({ modelId: params.id })
  - Fetch available colors: const available = await api.modelColors.getAvailableColors({ modelId: params.id })
  - Render: 
    - Breadcrumb: Admin > Modelos > [Model Name] > Colores
    - Table with ModelColorRow for each assigned color
    - "Agregar Color" button → opens AddColorDialog
    - Empty state if no colors assigned: "Este modelo no tiene colores asignados. Agrega el primer color para comenzar."
  - Export const dynamic = 'force-dynamic'

### Integration with Models Module (US2)

- [x] T040 [US2] Add "Configurar Colores" link in model edit page
  - File: `src/app/(dashboard)/admin/models/[id]/page.tsx` or equivalent
  - Add navigation button/link to `/admin/models/[id]/colors`
  - Display color count badge: "X colores configurados"

- [x] T041 [US2] Extend Model list table to show color assignment status
  - File: Model list component (existing)
  - Add column: Color count with badge (0 = warning "Sin colores", >0 = success badge)
  - Optional: Show default color chip preview

**Checkpoint**: User Story 2 complete - Admin can assign and configure colors per model

---

## Phase 5: User Story 3 - Cliente selecciona color en cotización con recálculo automático (Priority: P3)

**Goal**: Client can visually select color during quotation, see instant price recalculation with surcharge breakdown, and color appears in generated PDF

**Independent Test**: Client accesses catalog, selects model "Ventana Corrediza PVC" (base $450), chooses color "Gris Antracita (+10%)", sees updated price $495 (Base $450 + Recargo $45) in <200ms, adds to quote, generates PDF showing color chip + surcharge line item.

### Backend Implementation (US3)

- [x] T042 [P] [US3] Extend quotes router with color procedures in `src/server/api/routers/quote/quote.ts`
  - Add new procedures: getModelColorsForQuote, calculatePriceWithColor, createQuoteItemWithColor, updateQuoteItemColor

- [x] T043 [P] [US3] Implement `quotes.getModelColorsForQuote` query in `src/server/api/routers/quote/quote.ts`
  - Auth: publicProcedure (accessible to anonymous users in catalog)
  - Input: z.object({ modelId: z.string() })
  - Query: modelColors.listByModel with color relation where color.isActive = true
  - Return: { modelId, hasColors: boolean, defaultColorId: string | null, colors: Array<color data + surcharge> }
  - Caching: Add revalidate: 300 (5 minutes - colors rarely change)
  - Ordering: Default first, then alphabetically

- [x] T044 [P] [US3] Implement `quotes.calculatePriceWithColor` query in `src/server/api/routers/quote/quote.ts`
  - Auth: publicProcedure
  - Input: z.object({ modelId: z.string(), colorId: z.string().optional(), quantity: z.number(), dimensions: z.object(...) })
  - Business logic:
    - Calculate base price using existing pricing service
    - If colorId provided: Fetch surchargePercentage from ModelColor
    - Apply surcharge ONLY to model base price (exclude glass, services)
    - Formula: colorSurcharge = modelBasePrice * (surchargePercentage / 100)
  - Return: { basePrice, colorSurcharge, totalWithColor, breakdown: { model, glass, services, color } }
  - Use case: Server-side validation before adding to cart (prevent tampering)

- [x] T045 [P] [US3] Implement `quotes.createQuoteItemWithColor` mutation in `src/server/api/routers/quote/quote.ts`
  - Auth: publicProcedure or authenticatedProcedure (depends on cart flow)
  - Input: Extends existing QuoteItem input with colorId (optional)
  - Business logic:
    - If colorId null: Use default color from model
    - Fetch ModelColor to get surchargePercentage, color.hexCode, color.name
    - Snapshot: Store colorId, colorSurchargePercentage, colorHexCode, colorName in QuoteItem
    - Calculate final price with color surcharge
  - Prisma: Create QuoteItem with all color snapshot fields populated
  - Winston logging: Log quote item creation with color selection

- [ ] T046 [P] [US3] Implement `quotes.updateQuoteItemColor` mutation in `src/server/api/routers/quote/quote.ts`
  - Auth: authenticatedProcedure with ownership validation
  - Input: z.object({ quoteItemId: z.string(), colorId: z.string().optional() })
  - Business logic:
    - Check quote status: Only allow if quote is DRAFT
    - Re-snapshot color data (surcharge, hex, name)
    - Recalculate price
  - Error: TRPCError FORBIDDEN if quote already sent/converted (Spanish: "No se puede modificar una cotización ya enviada")

### Frontend Components (US3)

- [x] T047 [P] [US3] Create ColorSelector component in `src/app/(public)/catalog/[modelId]/_components/color-selector.tsx`
  - Props: modelId, onColorChange (callback with colorId, surchargePercentage)
  - Client Component ('use client')
  - Fetch colors: const { data } = api.quotes.getModelColorsForQuote.useQuery({ modelId })
  - Conditional rendering: If !hasColors, return null (no selector shown)
  - UI: Scrollable horizontal chips (if >6 colors) or grid (if ≤6 colors)
  - Each chip: ColorChip component + name label + surcharge badge ("+X%" or "Incluido" if 0%)
  - State: Selected color (default to defaultColorId on mount)
  - Interaction: Click chip → update selection → call onColorChange with new surcharge
  - Accessibility: Keyboard navigation, aria-labels in Spanish

- [x] T048 [US3] Integrate ColorSelector into catalog model page
  - File: `src/app/(public)/catalog/[modelId]/page.tsx` or quote form component
  - Add ColorSelector before price summary section
  - Wire onColorChange to update price calculation state
  - Client-side price recalculation: newTotal = basePrice + (basePrice * surchargePercentage / 100)
  - Display breakdown: "Precio base: $XXX | Recargo por color: $YYY | Total: $ZZZ"
  - Performance: Calculation must be <200ms (pure JavaScript math, no API call)

- [x] T049 [US3] Update quote form to capture color selection
  - File: Quote creation form component (existing)
  - Add hidden field: colorId (controlled by ColorSelector)
  - On submit: Include colorId in createQuoteItemWithColor mutation
  - Optimistic UI: Show selected color chip in quote item summary

### PDF Generation (US3)

- [x] T050 [US3] Extend PDF template to include color information
  - File: PDF generation service/template (existing - locate via grep_search)
  - For each QuoteItem with colorId:
    - Render color chip (rectangle filled with colorHexCode)
    - Render color name: colorName (from snapshot, not live lookup)
    - If colorSurchargePercentage > 0: Add line item "Recargo por color [Name] (+X%): $YYY"
  - Position: Below model name, before glass type
  - Use snapshot fields ONLY (colorName, colorHexCode, colorSurchargePercentage) - never query Color table for historical quotes

### Pricing Service Integration (US3)

- [x] T051 [US3] Extend pricing calculation service to support color surcharge
  - File: `src/server/services/pricing/calculate-price.ts`
  - Add parameter: colorSurchargePercentage (optional, default 0)
  - Apply surcharge to model base price component only
  - Return breakdown with separate colorSurcharge field
  - Maintain backwards compatibility: Existing calls without color should work unchanged
  - **IMPLEMENTATION NOTE**: Color surcharge applied INLINE in quote router procedures (calculate-price-with-color, add-item) rather than in base pricing service. This maintains separation of concerns and backwards compatibility. Formula: `colorSurcharge = dimPrice * (surchargePercentage / 100)`. No changes needed to base pricing service.

**Checkpoint**: User Story 3 complete - Full client flow with color selection and PDF generation working

---

## Phase 6: Testing & Quality Assurance

**Purpose**: Comprehensive testing across all user stories

### Unit Tests

- [ ] T052 [P] Create unit test for color pricing calculation in `tests/unit/pricing/color-surcharge.test.ts`
  - Test cases:
    - Base price $100, surcharge 10% → $110 total
    - Base price $100, surcharge 0% → $100 total
    - Base price $100, surcharge 50% → $150 total
  - Edge cases: surcharge 100%, surcharge with decimal precision
  - Verify surcharge applies only to model base, not glass/services

- [ ] T053 [P] Create unit test for color validation in `tests/unit/validations/color.test.ts`
  - Test Zod schemas: valid hex codes, invalid hex codes, RAL format validation
  - Error messages in Spanish

### Integration Tests

- [ ] T054 [P] Create seeder idempotency test in `tests/integration/seeders/colors.seeder.test.ts`
  - Test: Run seeder twice, verify only 10 colors exist (no duplicates)
  - Test: Modify hex code of seeded color, run seeder, verify update (upsert behavior)
  - Test: Verify all 10 standard colors from spec.md FR-001 exist with correct RAL and hex values

### E2E Tests (Playwright)

- [ ] T055 [US1] Create E2E test for color catalog management in `e2e/admin/colors/create-color.spec.ts`
  - Scenario: Admin creates color "Verde Musgo" (#6B8E23, RAL 6025)
  - Steps: Login as admin → Navigate to /admin/colors → Click "Nuevo Color" → Fill form → Submit → Verify in list
  - Assertions: Color appears in table, hex chip renders correctly, can be edited, can be deactivated

- [ ] T056 [US2] Create E2E test for model color assignment in `e2e/admin/colors/assign-color-to-model.spec.ts`
  - Scenario: Admin assigns 5 colors to model with different surcharges
  - Steps: Navigate to model → Colors tab → Add each color → Set surcharges → Mark default → Save
  - Assertions: All 5 colors appear, surcharges persist, default badge shows correctly, can remove assignment

- [ ] T057 [US3] Create E2E test for client color selection in `e2e/admin/colors/client-selects-color.spec.ts`
  - Scenario: Client selects color, sees price update, generates PDF
  - Steps: Open catalog → Select model → Choose color "Gris Antracita" → Verify price recalculation → Add to quote → Generate PDF
  - Assertions: Price updates <200ms, breakdown shows surcharge, PDF contains color chip and surcharge line
  - Special: If model has 1 color, verify selector doesn't appear (auto-applied)

**Checkpoint**: All tests passing - feature ready for code review

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and documentation

- [ ] T058 [P] Update CHANGELOG.md with feature entry
  - Section: `## [Unreleased]` under `### Added`
  - Entry: `feat(catalog): Add color selection system with 10 standard colors, model-specific surcharges, and visual color picker for quotations`

- [ ] T059 [P] Create migration notes in docs/migrations/
  - File: `docs/migrations/001-color-catalog-system.md`
  - Content: Migration steps, seeder execution instructions, rollback procedure, breaking changes (none expected)

- [ ] T060 [P] Add user documentation for color feature
  - File: `docs/features/color-catalog.md`
  - Sections: Admin guide (create colors, assign to models), Client guide (select colors), pricing explanation

- [ ] T061 Code cleanup and refactoring
  - Remove any console.log statements (use Winston or remove)
  - Verify all Spanish UI text (no English in user-facing messages)
  - Verify all code comments in English
  - Check TypeScript strict mode compliance

- [ ] T062 Performance optimization review
  - Verify ColorSelector renders <200ms with 10+ colors
  - Check admin color list page loads <2s with 100+ colors
  - Verify database indexes are used (explain query plans)
  - Add pagination if color catalog grows beyond 100 items

- [ ] T063 Security audit
  - Verify adminProcedure on all admin endpoints (colors.*, modelColors.*)
  - Verify tenant isolation in model color assignments
  - Check Zod validation on all user inputs
  - Test SQL injection resistance (Prisma ORM handles this)

- [ ] T064 Accessibility review
  - ColorSelector keyboard navigation works
  - Color chips have sufficient contrast for visibility
  - Screen reader labels in Spanish for all interactive elements
  - Focus states visible on all clickable colors

- [ ] T065 Run quickstart.md validation
  - Follow quickstart guide as new developer
  - Verify all setup steps work (migration, seeder, test)
  - Verify code examples are accurate
  - Update quickstart if any discrepancies found

**Checkpoint**: Feature polished and ready for merge

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - Can proceed independently
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion - Can proceed independently (parallel with US1 if desired)
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion - Can proceed independently BUT benefits from US1 & US2 being complete for full integration
- **Testing (Phase 6)**: Depends on all desired user stories being implemented
- **Polish (Phase 7)**: Depends on Phase 6 (all tests passing)

### User Story Dependencies

- **User Story 1 (P1)**: Independent - Admin color catalog has no dependency on US2 or US3
- **User Story 2 (P2)**: Independent - Can assign colors even if client selection (US3) not built yet
- **User Story 3 (P3)**: Depends on US2 for data - Requires colors assigned to models, but implementation is independent

### Critical Path for MVP (Recommended)

**MVP = User Story 1 ONLY** (smallest deliverable increment):
1. Phase 1: Setup
2. Phase 2: Foundational (T004-T012)
3. Phase 3: User Story 1 (T013-T027)
4. Phase 6: E2E Test for US1 (T055)
5. Phase 7: Documentation (T058-T059)

**MVP Delivery**: Admin can manage color catalog, 10 colors seeded, ready for US2/US3 in next iteration.

**Full Feature Delivery** (all user stories):
- Sequential: Phase 1 → 2 → 3 (US1) → 4 (US2) → 5 (US3) → 6 → 7
- Parallel (if 2+ developers): Phase 1 → 2 → [3, 4, 5 in parallel] → 6 → 7
- Note: US3 E2E test (T057) requires US1 & US2 complete for full integration test

### Within Each User Story

**User Story 1**:
- Backend first: T013-T020 (can parallelize all T0xx marked [P])
- Then frontend: T021-T023 (can parallelize all [P])
- Finally pages: T024-T026 (sequential, depend on components)
- Cache invalidation: T027 (depends on pages)

**User Story 2**:
- Backend first: T028-T036 (can parallelize all [P])
- Then frontend: T037-T038 (can parallelize)
- Finally pages & integration: T039-T041 (sequential)

**User Story 3**:
- Backend first: T042-T046 (can parallelize all [P])
- Then frontend: T047-T049 (sequential, each depends on previous)
- Finally PDF & pricing: T050-T051 (can parallelize)

### Parallel Opportunities (per phase)

**Phase 2 (Foundational)**:
- T004, T005, T006 (Prisma schemas) can be written in parallel - single commit to schema.prisma
- T009, T010 (Zod schemas) fully parallel - different files
- T011, T012 (Seeder) sequential - T012 depends on T011

**Phase 3 (US1)**:
- All T01X marked [P] can run in parallel (7 tasks: T014, T015, T016, T017, T018, T019, T021, T022, T023)
- Maximum parallelization: 3 developers (backend procedures, form components, table component)

**Phase 4 (US2)**:
- All T02X-T03X marked [P] can run in parallel (10 tasks)
- Maximum parallelization: 3 developers (backend, components, integration)

**Phase 5 (US3)**:
- All T04X marked [P] can run in parallel (5 tasks: T042-T046)
- T047 (ColorSelector) can start in parallel with backend
- T050, T051 can run in parallel after core implementation

**Phase 6 (Testing)**:
- All tests marked [P] can run in parallel (T052, T053, T054)
- E2E tests (T055-T057) should run sequentially (share test database)

**Phase 7 (Polish)**:
- All documentation tasks (T058-T060) fully parallel
- Reviews (T061-T065) can overlap

### Task Count Summary

- **Total Tasks**: 65
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 9 tasks ⚠️ BLOCKING
- **Phase 3 (US1)**: 15 tasks 🎯 MVP
- **Phase 4 (US2)**: 14 tasks
- **Phase 5 (US3)**: 10 tasks
- **Phase 6 (Testing)**: 6 tasks
- **Phase 7 (Polish)**: 8 tasks

### Estimated Implementation Time

**Assumptions**: 1 mid-level full-stack developer, 6 hours/day focused work

- **Phase 1**: 0.5 days
- **Phase 2**: 1.5 days (critical path)
- **Phase 3 (US1)**: 3 days (MVP milestone)
- **Phase 4 (US2)**: 2.5 days
- **Phase 5 (US3)**: 2 days
- **Phase 6**: 1.5 days
- **Phase 7**: 1 day

**Total Sequential**: ~12 days  
**Total with Parallelization** (2 developers): ~7 days  
**MVP Only** (US1): ~5 days

### Recommended MVP Scope

**Deliver User Story 1 FIRST** as standalone MVP:
- Why: Establishes foundation, delivers immediate admin value, low risk
- Tasks: T001-T012 (Foundation) + T013-T027 (US1) + T055 (US1 E2E) + T058-T059 (Docs)
- Timeline: ~5 days
- Deliverable: Admin can manage color catalog, ready for US2/US3 in Sprint 2

**Incremental Delivery Plan**:
- Sprint 1: US1 (Admin color catalog) ✅ Can deploy to production
- Sprint 2: US2 (Model color assignment) ✅ Can deploy to production
- Sprint 3: US3 (Client color selection) ✅ Full feature complete

This approach enables:
- Early feedback from admins on color catalog UI
- Phased rollout reduces risk
- Each sprint delivers production-ready value
- User Story independence validated in practice
