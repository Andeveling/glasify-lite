# Tasks: Catalog Admin Management

**Change ID**: `add-catalog-admin-management`  
**Status**: Draft  
**Last Updated**: 2025-10-15

## Implementation Checklist

This checklist provides a sequential, dependency-aware implementation plan. Tasks are organized by phase and should be completed in order within each phase. Parallelizable tasks are marked with 🔀.

---

## Phase 1: Foundation & Shared Infrastructure (Week 1)

### Database & Schema Validation

- [ ] **T001**: Review Prisma schema for all catalog entities
  - Verify indexes exist for admin queries (status, name, createdAt)
  - Confirm cascade rules for deletions
  - Validate foreign key constraints
  - **Deliverable**: Schema validation report

- [ ] **T002**: Create database seeder for development
  - Seed glass characteristics (tempered, laminated, low-e, etc.)
  - Seed glass solutions (security, thermal, acoustic, etc.)
  - Seed glass suppliers (Guardian, Saint-Gobain, etc.)
  - Seed services (installation, measurement, delivery)
  - **Deliverable**: `prisma/seeders/catalog.seeder.ts`

### Shared tRPC Infrastructure

- [ ] **T003**: Create shared Zod schemas for common patterns
  - Pagination input schema (`paginationInput`)
  - Generic delete input schema (`deleteInput`)
  - Generic get-by-id input schema (`getByIdInput`)
  - Standard response schemas (success/error)
  - **Deliverable**: `src/server/api/routers/admin/_shared-schemas.ts`

- [ ] **T004**: Create shared helper functions for admin operations
  - `checkDependencies()` - Generic dependency checker
  - `createAuditLog()` - Standardized logging
  - `validateUniqueness()` - Name/code uniqueness validator
  - `buildPaginationQuery()` - Prisma pagination helper
  - **Deliverable**: `src/server/api/routers/admin/_helpers.ts`

### Shared UI Components

- [ ] **T005**: 🔀 Create reusable admin data table component
  - Generic table with sorting, pagination
  - Column configuration via props
  - Action buttons (edit, delete)
  - Empty state and loading states
  - **Deliverable**: `src/app/(dashboard)/_components/admin-data-table.tsx`

- [ ] **T006**: 🔀 Create reusable delete confirmation dialog
  - Show entity name and dependency count
  - Confirmation input (type entity name)
  - Error handling with Spanish messages
  - **Deliverable**: `src/app/(dashboard)/_components/delete-confirmation-dialog.tsx`

- [ ] **T007**: 🔀 Create reusable form field components
  - NumberInput with min/max validation
  - SearchableSelect for relationships
  - MultiSelect for arrays (glass types, solutions)
  - RichTextEditor for descriptions
  - **Deliverable**: `src/app/(dashboard)/_components/form-fields/`

---

## Phase 2: Model Management (Week 2)

### Backend (tRPC Router)

- [ ] **T008**: Refactor existing `admin.ts` router to `admin/model.ts`
  - Move `model-upsert` logic to dedicated router
  - Split into separate `create` and `update` procedures
  - Add `delete`, `list`, `get-by-id`, `publish`, `unpublish` procedures
  - Implement dependency checking for deletion
  - Add price history creation on pricing changes
  - **Deliverable**: `src/server/api/routers/admin/model.ts`
  - **Tests**: Unit tests for validation, integration tests for CRUD

- [ ] **T009**: Create model service layer
  - `checkModelDependencies(modelId)` - Check quote items
  - `createPriceHistory(modelId, priceData, userId)` - Audit trail
  - `validateDimensions(input)` - Dimension constraint validation
  - **Deliverable**: `src/server/services/model.service.ts`
  - **Tests**: Unit tests for business logic

### Frontend (Admin UI)

- [ ] **T010**: Enhance existing `/dashboard/models` page
  - Convert to Server Component + Client Content pattern
  - Fetch initial data server-side
  - Pass to ModelsPageContent client component
  - Add metadata for SEO
  - **Deliverable**: `src/app/(dashboard)/models/page.tsx`

- [ ] **T011**: Create ModelsPageContent client component
  - Data table with models list
  - Search and filter controls (status, supplier)
  - Pagination controls
  - Create model button
  - Bulk actions UI (future)
  - **Deliverable**: `src/app/(dashboard)/models/_components/models-page-content.tsx`

- [ ] **T012**: Enhance existing ModelForm component
  - Add publish/unpublish toggle
  - Add glass discount fields
  - Add profit margin field
  - Improve validation feedback
  - Add cost notes field
  - **Deliverable**: `src/app/(dashboard)/models/_components/model-form.tsx`

- [ ] **T013**: Create ModelActions component
  - Edit button → Open form dialog
  - Delete button → Confirmation dialog
  - Publish/Unpublish toggle
  - Duplicate button (future)
  - **Deliverable**: `src/app/(dashboard)/models/_components/model-actions.tsx`

### Testing

- [ ] **T014**: Write E2E tests for model management
  - Admin creates draft model
  - Admin publishes model
  - Admin updates model pricing (verify price history)
  - Admin deletes unused model
  - Admin attempts to delete model in use (should fail)
  - **Deliverable**: `e2e/admin/models.spec.ts`

---

## Phase 3: Glass Type Management (Week 3)

### Backend (tRPC Router)

- [ ] **T015**: Create glass-type router
  - CRUD procedures: `create`, `update`, `delete`, `list`, `get-by-id`
  - Status procedures: `activate`, `deactivate`
  - Relationship procedures: `add-solution`, `remove-solution`, `add-characteristic`, `remove-characteristic`
  - Implement dependency checking (models, quote items)
  - Add price history on pricing changes
  - **Deliverable**: `src/server/api/routers/admin/glass-type.ts`
  - **Tests**: Unit + integration tests

- [ ] **T016**: Create glass-type service layer
  - `checkGlassTypeDependencies(glassTypeId)` - Check models and quotes
  - `createPriceHistory(glassTypeId, priceData, userId)`
  - `validateSKU(sku, excludeId?)` - Uniqueness check
  - `ensureSinglePrimarySolution(glassTypeId, newPrimarySolutionId)` - Primary solution rule
  - **Deliverable**: `src/server/services/glass-type.service.ts`
  - **Tests**: Unit tests

### Frontend (Admin UI)

- [ ] **T017**: Create `/dashboard/glass-types` page (Server Component)
  - Fetch initial glass types list
  - Pass to GlassTypesPageContent
  - **Deliverable**: `src/app/(dashboard)/glass-types/page.tsx`

- [ ] **T018**: Create GlassTypesPageContent client component
  - Data table with glass types
  - Search (name, SKU), filter (thickness, supplier, active)
  - Pagination
  - Create glass type button
  - **Deliverable**: `src/app/(dashboard)/glass-types/_components/glass-types-page-content.tsx`

- [ ] **T019**: Create GlassTypeForm component
  - Basic info section (name, SKU, supplier)
  - Technical specs section (thickness, pricing, uValue, solar factor, light transmission)
  - Solutions section (multi-select with performance ratings)
  - Characteristics section (multi-select with values/certifications)
  - Status toggle
  - Progressive disclosure for advanced fields
  - **Deliverable**: `src/app/(dashboard)/glass-types/_components/glass-type-form.tsx`

- [ ] **T020**: Create GlassSolutionsSection sub-component
  - List assigned solutions with performance ratings
  - Add solution dialog (select solution, set rating, mark primary)
  - Remove solution button
  - Primary badge indicator
  - **Deliverable**: `src/app/(dashboard)/glass-types/_components/glass-solutions-section.tsx`

- [ ] **T021**: Create GlassCharacteristicsSection sub-component
  - List assigned characteristics with values
  - Add characteristic dialog (select, add value/certification)
  - Remove characteristic button
  - **Deliverable**: `src/app/(dashboard)/glass-types/_components/glass-characteristics-section.tsx`

### Testing

- [ ] **T022**: Write E2E tests for glass type management
  - Admin creates glass type with solutions and characteristics
  - Admin updates pricing (verify price history)
  - Admin activates/deactivates glass type
  - Admin attempts to delete glass type in use (should fail)
  - **Deliverable**: `e2e/admin/glass-types.spec.ts`

---

## Phase 4: Supporting Entities (Week 4)

### Glass Solutions

- [ ] **T023**: 🔀 Create glass-solution router
  - CRUD procedures
  - `reorder` procedure for sort order management
  - **Deliverable**: `src/server/api/routers/admin/glass-solution.ts`
  - **Tests**: Unit + integration tests

- [ ] **T024**: 🔀 Create `/dashboard/glass-solutions` page + UI
  - Simple CRUD interface
  - Drag-and-drop reordering
  - Icon picker for Lucide icons
  - **Deliverable**: `src/app/(dashboard)/glass-solutions/`

### Glass Characteristics

- [ ] **T025**: 🔀 Create glass-characteristic router
  - CRUD procedures
  - Category-based filtering
  - **Deliverable**: `src/server/api/routers/admin/glass-characteristic.ts`
  - **Tests**: Unit + integration tests

- [ ] **T026**: 🔀 Create `/dashboard/glass-characteristics` page + UI
  - Grouped by category
  - Simple CRUD interface
  - **Deliverable**: `src/app/(dashboard)/glass-characteristics/`

### Glass Suppliers

- [ ] **T027**: 🔀 Create glass-supplier router
  - CRUD procedures
  - Dependency protection
  - **Deliverable**: `src/server/api/routers/admin/glass-supplier.ts`
  - **Tests**: Unit + integration tests

- [ ] **T028**: 🔀 Create `/dashboard/glass-suppliers` page + UI
  - Data table with suppliers
  - Form with contact info fields
  - **Deliverable**: `src/app/(dashboard)/glass-suppliers/`

### Services

- [ ] **T029**: 🔀 Create service router
  - CRUD procedures
  - Dependency protection (quote items)
  - **Deliverable**: `src/server/api/routers/admin/service.ts`
  - **Tests**: Unit + integration tests

- [ ] **T030**: 🔀 Create `/dashboard/services` page + UI
  - Data table with services
  - Form with type/unit selectors
  - **Deliverable**: `src/app/(dashboard)/services/`

---

## Phase 5: Integration & Polish (Week 5)

### Navigation & Authorization

- [ ] **T031**: Update dashboard navigation
  - Add links to new admin pages
  - Group under "Catálogo" section
  - Icons for each menu item
  - **Deliverable**: Updated `src/app/(dashboard)/_components/sidebar-nav.tsx`

- [ ] **T032**: Verify middleware protection
  - Confirm all `/dashboard/*` routes require admin role
  - Test unauthorized access attempts
  - **Deliverable**: Middleware verification report

### Audit Logging

- [ ] **T033**: Implement standardized audit logging
  - All create/update/delete operations log:
    - User ID and name
    - Entity type and ID
    - Action performed
    - Timestamp
    - Changed fields (for updates)
  - **Deliverable**: Updated service layer with logging

- [ ] **T034**: Create audit log viewer UI (future)
  - Admin page to view system logs
  - Filter by entity type, action, user, date range
  - Export logs to CSV
  - **Deliverable**: `src/app/(dashboard)/audit-logs/` (optional for MVP)

### Public Catalog Integration

- [ ] **T035**: Update public catalog queries to reflect admin changes
  - Verify ISR revalidation triggers on mutations
  - Test catalog pages update after model publish/unpublish
  - **Deliverable**: Integration test + verification

### Performance Optimization

- [ ] **T036**: Add database indexes for admin queries
  - Review slow query logs
  - Add composite indexes as needed
  - Verify query performance with realistic data volumes
  - **Deliverable**: Prisma migration with indexes

- [ ] **T037**: Implement query result caching (optional)
  - Cache glass types, solutions, characteristics for form selectors
  - 5-minute TTL, invalidate on mutations
  - **Deliverable**: TanStack Query caching configuration

---

## Phase 6: Advanced Features (Week 6)

### Bulk Operations

- [ ] **T038**: Create bulk import endpoint
  - Accept JSON payload for each entity type
  - Validate all records before importing
  - Atomic transaction (all or nothing)
  - Return detailed error report for invalid records
  - **Deliverable**: `admin.bulk-import` tRPC procedure

- [ ] **T039**: Create bulk export endpoint
  - Export entity data to JSON
  - Include relationships
  - Support filtering (e.g., export only published models)
  - **Deliverable**: `admin.bulk-export` tRPC procedure

- [ ] **T040**: Create bulk import UI
  - File upload (JSON)
  - Preview import data
  - Show validation errors
  - Confirm and execute import
  - **Deliverable**: `src/app/(dashboard)/_components/bulk-import-dialog.tsx`

### Price History UI

- [ ] **T041**: Create price history viewer component
  - Timeline view of price changes
  - Show reason, user, effective date
  - Chart visualization (optional)
  - **Deliverable**: `src/app/(dashboard)/_components/price-history-viewer.tsx`

- [ ] **T042**: Integrate price history into model and glass type detail views
  - Show last 5 price changes
  - Link to full history modal
  - **Deliverable**: Updated form/detail components

---

## Phase 7: Testing & Documentation (Week 7)

### Comprehensive Testing

- [ ] **T043**: Write unit tests for all routers
  - Validation schemas
  - Authorization checks
  - Business logic
  - Target 80%+ coverage
  - **Deliverable**: Test suite in `tests/unit/admin/`

- [ ] **T044**: Write integration tests
  - Database transactions
  - Referential integrity
  - Cascade deletions
  - **Deliverable**: Test suite in `tests/integration/admin/`

- [ ] **T045**: Write E2E tests for complete workflows
  - Admin creates model → Assigns glass types → Publishes → Appears in catalog
  - Admin creates glass type → Assigns solutions/characteristics → Uses in model
  - Admin attempts unauthorized actions (should fail)
  - **Deliverable**: Test suite in `e2e/admin/catalog-workflows.spec.ts`

### Documentation

- [ ] **T046**: Write admin user guide
  - Step-by-step instructions for each entity
  - Screenshots of UI
  - Best practices and tips
  - Troubleshooting common issues
  - **Deliverable**: `docs/admin/catalog-management-guide.md`

- [ ] **T047**: Write developer documentation
  - API reference for tRPC procedures
  - Database schema explanation
  - Extension guide (adding new catalog entities)
  - **Deliverable**: `docs/dev/catalog-admin-api.md`

- [ ] **T048**: Update README with catalog management info
  - Link to admin guide
  - Mention new admin capabilities
  - **Deliverable**: Updated `README.md`

### Code Quality

- [ ] **T049**: Run full linting and formatting check
  - `pnpm lint:fix`
  - `pnpm typecheck`
  - Resolve all errors and warnings
  - **Deliverable**: Clean lint report

- [ ] **T050**: Perform code review
  - Self-review all changes
  - Check for code duplication
  - Verify naming conventions
  - Ensure Spanish UI text, English code/comments
  - **Deliverable**: Code review checklist

### Final Validation

- [ ] **T051**: Run all tests
  - Unit tests: `pnpm test`
  - E2E tests: `pnpm test:e2e`
  - Verify 100% passing
  - **Deliverable**: Test execution report

- [ ] **T052**: Perform manual QA testing
  - Test all CRUD operations in UI
  - Test edge cases (empty states, max limits, errors)
  - Test on different browsers
  - Test mobile responsiveness
  - **Deliverable**: QA test report

- [ ] **T053**: Validate OpenSpec compliance
  - Run `openspec validate add-catalog-admin-management --strict`
  - Resolve any issues
  - **Deliverable**: Passing validation

---

## Dependencies & Blockers

### External Dependencies
- None (all dependencies already in project)

### Internal Dependencies
- **T003-T007** must complete before starting Phase 2-4 (shared infrastructure)
- **T008-T014** must complete before T035 (model management before catalog integration)
- **T023-T030** can run in parallel (supporting entities independent)
- **T043-T045** depend on all implementation tasks completing

### Critical Path
T001 → T003 → T008 → T015 → T031 → T043 → T051 → T053

### Parallelizable Work
- Phase 4 tasks (T023-T030) can run simultaneously
- UI components (T005-T007) can be built while backend work progresses
- Documentation (T046-T048) can start once implementation is stable

---

## Acceptance Criteria

Before marking this change as complete, verify:

- [ ] All 53 tasks completed and checked off
- [ ] All unit, integration, and E2E tests passing
- [ ] OpenSpec validation passing (`openspec validate --strict`)
- [ ] No linting or type errors
- [ ] Admin can perform all CRUD operations on all catalog entities
- [ ] Referential integrity enforced (no orphaned records)
- [ ] Audit logging working for all mutations
- [ ] Public catalog reflects admin changes (ISR revalidation)
- [ ] Documentation complete and accurate
- [ ] Code reviewed and approved
- [ ] Manual QA completed with no critical bugs

---

## Notes

### Estimated Timeline
- **Phase 1**: 5 days (foundation)
- **Phase 2**: 5 days (model management)
- **Phase 3**: 5 days (glass type management)
- **Phase 4**: 5 days (supporting entities, parallel work)
- **Phase 5**: 3 days (integration)
- **Phase 6**: 4 days (advanced features)
- **Phase 7**: 8 days (testing & docs)
- **Total**: ~35 working days (~7 weeks)

### Resource Requirements
- 1 Full-stack developer (can handle frontend + backend)
- QA support for Phase 7 (optional but recommended)

### Risk Mitigation
- Start with Phase 1 shared infrastructure to reduce duplication
- Complete model management (Phase 2) fully before moving to glass types
- Run E2E tests frequently to catch integration issues early
- Keep tasks small (<1 day) for easier progress tracking
