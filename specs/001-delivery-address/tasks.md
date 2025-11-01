# Tasks: Geocoded Delivery Addresses for Quotes

**Input**: Design documents from `/specs/001-delivery-address/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Constitution Compliance**: Tasks follow principles from `.specify/memory/constitution.md`:
- **Flexible Testing**: E2E tests included for each user story (Playwright)
- **One Job, One Place**: Each task has single responsibility with SOLID file organization
- **Clarity Over Complexity**: Descriptive task names with exact file paths
- **Security From the Start**: Validation and authorization tasks included

**Tests**: E2E tests are included for each user story to verify independent functionality before merge to main.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

## Path Conventions

Next.js 16 App Router monorepo structure:
- `prisma/` - Database schema and migrations
- `src/app/(dashboard)/admin/quotes/` - Quote feature folder
- `src/server/api/routers/` - tRPC routers
- `src/server/services/` - Business logic services
- `src/lib/utils/` - Shared utilities
- `tests/` - Unit/integration tests
- `e2e/` - Playwright E2E tests

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database schema setup

- [x] T001 Install required npm dependencies (haversine-distance)
- [x] T002 Create Prisma schema migration for ProjectAddress model in `prisma/schema.prisma`
- [x] T003 [P] Create Prisma schema migration for TenantConfig warehouse fields in `prisma/schema.prisma`
- [x] T004 [P] Create Prisma schema migration for Quote.projectAddressId FK in `prisma/schema.prisma`
- [x] T005 Generate Prisma migration SQL in `prisma/migrations/YYYYMMDDHHMMSS_add_project_address/`
- [x] T006 Run migration on development database
- [x] T007 Create data migration script for existing Quote addresses in `prisma/migrations-scripts/migrate-project-addresses.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create ProjectAddress base types in `src/app/(dashboard)/admin/quotes/_types/address.types.ts`
- [x] T009 Create address validation schema with coordinate rules in `src/app/(dashboard)/admin/quotes/_schemas/project-address.schema.ts`
- [x] T010 [P] Create geocoding constants (API URL, timeout, rate limits) in `src/app/(dashboard)/admin/quotes/_constants/geocoding.constants.ts`
- [x] T011 [P] Create coordinate validation utility in `src/lib/utils/coordinates.ts`
- [x] T012 Implement Haversine distance calculator in `src/lib/utils/coordinates.ts`
- [x] T013 Create Nominatim geocoding service in `src/server/services/geocoding.service.ts`
  - Implement searchAddress() with 5s timeout
  - Add User-Agent header for Nominatim compliance
  - Transform response to standardized schema
  - Add Winston logging (server-side only)
- [x] T014 Create transportation cost service in `src/server/services/transportation.service.ts`
  - Implement calculateTransportationCost() using Haversine
  - Read warehouse location from TenantConfig
  - Apply baseRate + perKmRate formula
- [x] T015 Create address tRPC router skeleton in `src/server/api/routers/address.ts`
- [x] T016 [P] Create geocoding tRPC router skeleton in `src/server/api/routers/geocoding.ts`
- [x] T017 [P] Create transportation tRPC router skeleton in `src/server/api/routers/transportation.ts`
- [x] T018 Export new routers in `src/server/api/root.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Specify Delivery Address with Geographic Search (Priority: P1) 🎯 MVP

**Goal**: Enable sellers to search and select delivery addresses using autocomplete, capturing full address details and coordinates

**Independent Test**: Create quote → type "Medellín" in delivery address field → select from autocomplete → verify latitude/longitude saved → view quote displays formatted address

### E2E Tests for User Story 1

- [x] T019 [P] [US1] Create E2E test fixture for geocoding responses in `e2e/fixtures/geocoding-responses.json`
- [ ] T020 [US1] Create E2E test for address autocomplete flow in `e2e/delivery-address-autocomplete.spec.ts`
  - Test: Type city name → suggestions appear <500ms
  - Test: Select suggestion → coordinates populated
  - Test: Save quote → address persisted
  - Test: View quote → formatted address displayed

### tRPC Endpoints for User Story 1

- [x] T021 [P] [US1] Implement geocoding.search procedure in `src/server/api/routers/geocoding.ts`
  - Input: query string, limit (default 5)
  - Call geocodingService.searchAddress()
  - Add rate limiting (1 req/sec using rate-limiter-flexible)
  - Return structured results with lat/lon/address components
  - Authorization: adminProcedure (admin/seller only)
- [x] T022 [P] [US1] Implement address.create procedure in `src/server/api/routers/address.ts`
  - Input: projectAddressSchema validation
  - Prisma create with all fields
  - Return created ProjectAddress
  - Authorization: adminProcedure
- [x] T023 [P] [US1] Implement address.getById procedure in `src/server/api/routers/address.ts`
  - Input: id string
  - Prisma findUnique with quote relationship
  - Return ProjectAddress or NOT_FOUND
  - Authorization: adminProcedure or quote owner
- [x] T024 [P] [US1] Implement address.listByQuote procedure in `src/server/api/routers/address.ts`
  - Input: quoteId string
  - Prisma findMany where quoteId
  - Return ProjectAddress array
  - Authorization: adminProcedure or quote owner

### UI Components for User Story 1

- [x] T025 [US1] Create address formatter utility in `src/app/(dashboard)/admin/quotes/_utils/address-formatter.ts`
  - formatAddress(address): string - join non-null fields with ", "
  - parseCoordinates(lat, lon): { latitude, longitude } - validate ranges
- [x] T026 [US1] Create address defaults utility in `src/app/(dashboard)/admin/quotes/_utils/address-defaults.ts`
  - getEmptyAddress(): ProjectAddress - return initial state
- [x] T027 [US1] Create address autocomplete hook in `src/app/(dashboard)/admin/quotes/_hooks/use-address-autocomplete.ts`
  - Use useDebouncedValue(query, 300ms)
  - Call api.geocoding.search.useQuery()
  - Return results array, isLoading, setQuery
- [x] T028 [US1] Create address mutations hook in `src/app/(dashboard)/admin/quotes/_hooks/use-address-mutations.ts`
  - api.address.create.useMutation()
  - api.address.update.useMutation()
  - api.address.delete.useMutation()
  - Include utils.quote.getById.invalidate() + router.refresh()
  - Spanish toast notifications
- [x] T029 [US1] Create DeliveryAddressPicker component in `src/app/(dashboard)/admin/quotes/_components/delivery-address-picker.tsx`
  - Shadcn Input + Popover + Command for autocomplete
  - Use useAddressAutocomplete hook
  - Display suggestions with displayName
  - On select: call onChange with full address + coordinates
  - Show loading state while fetching
  - Target: <150 lines (UI orchestration only)
- [x] T030 [US1] Integrate DeliveryAddressPicker into QuoteForm in `src/app/(public)/cart/_components/quote-generation-drawer.tsx`
  - Add deliveryAddress field to form schema
  - Render DeliveryAddressPicker in form
  - Connect to useAddressMutations hook
  - Save projectAddressId on quote save

**Checkpoint**: User Story 1 complete - sellers can search and select addresses with geocoding ✅

---

## Phase 4: User Story 2 - Manual Address Entry for Rural/Specific Locations (Priority: P2)

**Goal**: Enable manual entry of detailed address information when autocomplete fails (rural areas, specific landmarks)

**Independent Test**: Create quote → switch to manual mode → type "Vereda El Carmelo, Km 5 vía Buga-Tuluá" + reference "Frente a finca Los Arrayanes" → save → verify all text fields persisted (null coordinates OK)

### E2E Tests for User Story 2

- [ ] T031 [P] [US2] Create E2E test for manual address entry in `e2e/delivery-address-manual.spec.ts`
  - Test: Toggle manual mode → text fields appear
  - Test: Enter street + reference → save → verify persistence
  - Test: No coordinates required → latitude/longitude null OK
  - Test: At least one field required → validation error if all empty

### UI Components for User Story 2

- [ ] T032 [P] [US2] Create ManualAddressForm component in `src/app/(dashboard)/admin/quotes/_components/manual-address-form.tsx`
  - Inputs for: label, country, region, city, district, street, reference, postalCode
  - All fields optional except "at least one of city/street/reference"
  - Use projectAddressSchema for validation
  - Spanish field labels and placeholders
  - Target: <150 lines
- [ ] T033 [US2] Add manual/autocomplete mode toggle to DeliveryAddressPicker in `src/app/(dashboard)/admin/quotes/_components/delivery-address-picker.tsx`
  - Shadcn Tabs: "Buscar dirección" | "Ingresar manualmente"
  - Tab 1: Existing autocomplete component
  - Tab 2: ManualAddressForm component
  - Preserve value when switching modes
- [ ] T034 [US2] Update address.create procedure validation to allow null coordinates in `src/server/api/routers/address.ts`
  - Verify "at least one identifier" rule enforced
  - Verify coordinate pair validation (both or neither)

**Checkpoint**: User Story 2 complete - sellers can manually enter addresses for rural areas ✅

---

## Phase 5: User Story 3 - Calculate Transportation Cost Based on Distance (Priority: P2)

**Goal**: Automatically calculate and display transportation costs based on warehouse-to-delivery distance

**Independent Test**: Create quote with delivery address in Medellín → system calculates ~240km → transportation cost appears in quote summary → edit address → cost recalculates

### E2E Tests for User Story 3

- [ ] T035 [P] [US3] Create E2E test for transportation cost calculation in `e2e/transportation-cost.spec.ts`
  - Test: Select address with coordinates → cost appears <500ms
  - Test: Cost includes distance breakdown (km)
  - Test: Cost includes rate formula (baseRate + distanceKm * perKmRate)
  - Test: Edit address → cost updates automatically
  - Test: Address without coordinates → show warning or manual input

### tRPC Endpoints for User Story 3

- [ ] T036 [P] [US3] Implement transportation.getWarehouseLocation procedure in `src/server/api/routers/transportation.ts`
  - Read TenantConfig warehouseLatitude/Longitude/City
  - Return coordinates + city name
  - Cache result 5 minutes (warehouse location rarely changes)
  - Authorization: publicProcedure (no auth required)
- [ ] T037 [P] [US3] Implement transportation.calculateCost procedure in `src/server/api/routers/transportation.ts`
  - Input: deliveryLatitude, deliveryLongitude
  - Call transportationService.calculateTransportationCost()
  - Return: distance object + cost breakdown
  - Validation: Check warehouse configured (throw if null)
  - Authorization: adminProcedure

### UI Components for User Story 3

- [ ] T038 [US3] Create transportation cost hook in `src/app/(dashboard)/admin/quotes/_hooks/use-transportation-cost.ts`
  - api.transportation.calculateCost.useQuery()
  - Input: deliveryAddress coordinates
  - Enabled: only if coordinates exist
  - StaleTime: 5 minutes
  - Return: cost object, isLoading, error
- [ ] T039 [US3] Create TransportationCostDisplay component in `src/app/(dashboard)/admin/quotes/_components/transportation-cost-display.tsx`
  - Show distance (km) and cost breakdown
  - Format currency using tenant locale
  - Show warehouse city → delivery city
  - Handle loading/error states
  - Spanish labels
- [ ] T040 [US3] Integrate TransportationCostDisplay into QuoteSummary in `src/app/(dashboard)/admin/quotes/_components/quote-summary.tsx`
  - Read deliveryAddress from quote
  - Use useTransportationCost hook
  - Display as line item above total
  - Add cost to quote total
- [ ] T041 [US3] Update Quote model to recalculate total on address change in `src/server/api/routers/quote.ts`
  - Listen for projectAddressId change
  - Trigger transportation cost recalculation
  - Update quote.total field

### Admin Configuration for User Story 3

- [ ] T042 [P] [US3] Add warehouse configuration UI to TenantConfig admin page in `src/app/(dashboard)/admin/settings/_components/warehouse-config-form.tsx`
  - Input fields: warehouseLatitude, warehouseLongitude, warehouseCity
  - Input fields: transportBaseRate, transportPerKmRate
  - Validation: coordinates required together
  - Save to TenantConfig singleton
- [ ] T043 [US3] Seed default warehouse location in `prisma/seed-tenant.ts`
  - Buga, Colombia: lat 3.9009, lon -76.2978
  - Default rates: baseRate 50000 COP, perKmRate 1000 COP

**Checkpoint**: User Story 3 complete - transportation costs calculated automatically ✅

---

## Phase 6: User Story 4 - Map Visualization for Address Verification (Priority: P3)

**Goal**: Display interactive map with delivery location marker for visual address verification

**Independent Test**: Select address → map appears with marker → pan/zoom to verify surrounding area → click marker shows address tooltip

### E2E Tests for User Story 4

- [ ] T044 [P] [US4] Create E2E test for map visualization in `e2e/delivery-address-map.spec.ts`
  - Test: Address with coordinates → map loads
  - Test: Marker appears at correct location
  - Test: Click marker → tooltip shows formatted address
  - Test: Address without coordinates → map hidden or shows warehouse only

### UI Components for User Story 4

- [ ] T045 [P] [US4] Install react-map-gl and mapbox-gl dependencies
- [ ] T046 [US4] Create DeliveryAddressMap component in `src/app/(dashboard)/admin/quotes/_components/delivery-address-map.tsx`
  - Lazy-load react-map-gl (dynamic import)
  - Display Mapbox map with marker at delivery coordinates
  - Show formatted address in marker popup
  - Handle null coordinates (hide map)
  - Show warehouse location as secondary marker
  - Default zoom level from constants
  - Spanish UI labels
- [ ] T047 [US4] Add map display to DeliveryAddressPicker in `src/app/(dashboard)/admin/quotes/_components/delivery-address-picker.tsx`
  - Render DeliveryAddressMap below address input
  - Show only if coordinates exist
  - Responsive: hide on mobile, show on desktop
- [ ] T048 [US4] Add Mapbox token to environment variables in `.env.example`
  - NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
  - Add documentation in quickstart.md

**Checkpoint**: User Story 4 complete - map visualization available for address verification ✅

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finalize feature with testing, documentation, and error handling

### Unit Tests

- [ ] T049 [P] Create unit tests for haversineDistance in `tests/unit/distance-calculator.test.ts`
  - Test: Buga → Medellín = ~238.7 km
  - Test: Same coordinates = 0 km
  - Test: Antipodal points = ~20,000 km
  - Test: Invalid coordinates throw error
- [ ] T050 [P] Create unit tests for formatAddress in `tests/unit/address-formatter.test.ts`
  - Test: All fields → comma-separated string
  - Test: Partial fields → skip nulls
  - Test: Null address → "Sin dirección"
- [ ] T051 [P] Create unit tests for projectAddressSchema in `tests/unit/project-address-schema.test.ts`
  - Test: Valid address with coordinates passes
  - Test: Valid address without coordinates passes
  - Test: Invalid coordinate ranges fail
  - Test: Coordinate pair mismatch (only lat) fails
  - Test: All fields null fails "at least one identifier"

### Integration Tests

- [ ] T052 Create integration test for address CRUD in `tests/integration/address-crud.test.ts`
  - Test: Create address via tRPC → verify in database
  - Test: Update address → verify changes
  - Test: Delete address → verify soft delete
  - Test: List by quote → verify filtering
- [ ] T053 Create integration test for transportation cost in `tests/integration/transportation.test.ts`
  - Test: Calculate cost with valid coordinates
  - Test: Warehouse not configured → error
  - Test: Invalid coordinates → validation error

### Error Handling & Edge Cases

- [ ] T054 Add error boundary for geocoding API failures in `src/app/(dashboard)/admin/quotes/_components/delivery-address-picker.tsx`
  - Show fallback to manual mode on timeout
  - Display Spanish error message
  - Log error with Winston (server-side only)
- [ ] T055 Add validation for warehouse configuration in `src/server/services/transportation.service.ts`
  - Throw "Warehouse location not configured" if null
  - Spanish error message for users
  - Log warning with Winston
- [ ] T056 Add coordinate range validation in `src/lib/utils/coordinates.ts`
  - Latitude ∈ [-90, 90]
  - Longitude ∈ [-180, 180]
  - Throw validation error if out of range

### Documentation & Migration

- [ ] T057 Update CHANGELOG.md with feature entry
  - "feat: Agregada selección de dirección de entrega con geocodificación y cálculo automático de costos de transporte"
- [ ] T058 Add migration notes to docs/migrations/
  - Document backward compatibility with projectCity/projectStreet
  - Data migration script usage
  - Rollback procedure
- [ ] T059 Update quickstart.md with troubleshooting section
  - Geocoding API not responding
  - Warehouse location not configured
  - Invalid coordinate pairs
- [ ] T060 Run data migration script on staging environment
  - Verify existing addresses migrated correctly
  - Test rollback procedure

**Checkpoint**: All user stories tested and production-ready ✅

---

## Implementation Strategy

### MVP Scope (Suggested)

**Ship User Story 1 ONLY as MVP**:
- ✅ Address autocomplete with geocoding
- ✅ Save delivery addresses with coordinates
- ✅ Display formatted addresses in quotes

**Defer to v1.1**:
- ⏳ Manual address entry (User Story 2)
- ⏳ Transportation cost calculation (User Story 3)
- ⏳ Map visualization (User Story 4)

**Rationale**: User Story 1 delivers immediate value (precise delivery locations) without complex dependencies. Transportation cost requires warehouse configuration (admin task). Manual entry is fallback for edge cases.

### Parallel Execution Opportunities

**Phase 2 (Foundational)**: Run in parallel after T008-T012 complete:
- Track A: T013 (geocoding service) → T015-T016 (routers)
- Track B: T014 (transportation service) → T017 (router)

**Phase 3 (User Story 1)**: Run in parallel after T021-T024 (endpoints) complete:
- Track A: T025-T026 (utilities) → T027 (autocomplete hook)
- Track B: T028 (mutations hook) → T029 (picker component)
- Track C: T019-T020 (E2E tests)

**Phase 5 (User Story 3)**: Run in parallel after T036-T037 (endpoints) complete:
- Track A: T038-T039 (cost display) → T040 (integration)
- Track B: T042-T043 (admin config)
- Track C: T035 (E2E test)

**Phase 7 (Polish)**: Run all tasks in parallel:
- Track A: T049-T051 (unit tests)
- Track B: T052-T053 (integration tests)
- Track C: T054-T056 (error handling)
- Track D: T057-T060 (documentation)

---

## Dependencies

### User Story Completion Order

```
Foundation (Phase 2)
    ↓
User Story 1 (P1) ← MVP
    ↓ (optional dependency)
User Story 2 (P2) - extends US1 with manual mode
    ↓ (optional dependency)
User Story 3 (P2) - requires US1 for addresses
    ↓ (optional dependency)
User Story 4 (P3) - requires US1 for coordinates
```

**Key Insights**:
- User Stories 2, 3, 4 are **independent** of each other
- All depend on User Story 1 (address input foundation)
- Can ship US1 alone as MVP
- Can add US2, US3, US4 in any order after US1

### Task Dependencies Within User Stories

**User Story 1** (linear path):
```
T021-T024 (endpoints) → T025-T028 (hooks/utils) → T029 (component) → T030 (integration)
```

**User Story 3** (linear path):
```
T036-T037 (endpoints) → T038-T039 (cost display) → T040-T041 (integration)
T042-T043 (admin config) can run in parallel
```

---

## Summary

**Total Tasks**: 60  
**MVP Tasks** (User Story 1 only): 25 tasks (T001-T030, excluding US2-US4)  
**Parallel Opportunities**: 23 tasks marked [P] can run simultaneously  
**Independent Stories**: 4 user stories, each with clear test criteria

**Constitution Compliance**:
- ✅ SOLID file organization: _components, _hooks, _schemas, _utils, _constants, _types
- ✅ Security: Zod validation, adminProcedure authorization, coordinate range checks
- ✅ Testing: E2E tests for each story, unit tests for utilities, integration tests for endpoints
- ✅ Tracking: Winston logging server-side only, Spanish errors for users
- ✅ Cache strategy: 5-minute warehouse cache, no geocoding cache, no cost cache
- ✅ SSR mutations: Two-step invalidation (invalidate + router.refresh)

**Validation**: All tasks follow checklist format (checkbox, ID, [P]/[Story] labels, file paths) ✅
