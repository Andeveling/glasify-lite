# Feature Specification: Standardize Glass Suppliers with SOLID Pattern

**Feature Branch**: `013-standardize-glass-suppliers`  
**Created**: 2025-01-21  
**Status**: Draft  
**Input**: User description: "necesitamos continuar ahora con la vista de Proveedores de Vidrio seria aplicar los mismos ajustes para estandarizar"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Glass Supplier Management (Priority: P1)

Admin users need to manage glass suppliers (glass manufacturers like Vitro, Guardian, AGC) without leaving the list page. Currently, creating or editing a supplier requires navigating to separate pages (`/new` and `/[id]`), which interrupts the workflow and makes the interface inconsistent with recently standardized modules (Services, Profile Suppliers).

**Why this priority**: Core administrative functionality that directly impacts productivity. Glass suppliers are critical data for the quoting system. Streamlining CRUD operations reduces clicks and provides a consistent UX across all admin modules.

**Independent Test**: Admin can create, edit, and delete glass suppliers entirely from the list page using dialog modals, completing all operations in under 30 seconds each.

**Acceptance Scenarios**:

1. **Given** admin is on glass suppliers list page, **When** they click "New Supplier" button, **Then** a dialog modal opens with an empty form
2. **Given** dialog modal is open with form, **When** admin fills required fields (name, code, country) and clicks "Create", **Then** supplier is created and immediately appears in the list without page navigation
3. **Given** admin views a supplier in the list, **When** they click edit icon, **Then** dialog modal opens pre-populated with supplier data including all optional fields
4. **Given** admin edits supplier data in modal, **When** they click "Save Changes", **Then** changes are reflected in the list immediately without page navigation
5. **Given** admin views a supplier in the list, **When** they click delete icon, **Then** confirmation dialog appears with referential integrity warning
6. **Given** delete confirmation dialog is open, **When** admin confirms deletion, **Then** supplier is removed from list immediately (or shows error if has related glass types)

---

### User Story 2 - Improved Code Maintainability with SOLID Principles (Priority: P1)

Developers need a clean, testable codebase following SOLID principles and project patterns. Currently, glass-supplier-form.tsx mixes form state, mutation logic, navigation, and UI rendering in a single 354-line component.

**Why this priority**: Code quality directly impacts development velocity, bug rates, and onboarding time. Glass suppliers form is the most complex (8 fields vs 4 in profile suppliers), making it critical to refactor for maintainability. This establishes consistency across all admin CRUD modules.

**Independent Test**: Form logic, mutation logic, and UI can be tested independently. New developers can understand the component structure in under 5 minutes by reading hook names and component props. Component follows exact same pattern as Services and Profile Suppliers modules.

**Acceptance Scenarios**:

1. **Given** glass supplier form code, **When** developer reviews component file, **Then** component is under 250 lines and only handles UI composition
2. **Given** form state management logic, **When** developer needs to test form validation, **Then** they can test the form hook independently without rendering UI
3. **Given** mutation logic, **When** developer needs to test cache invalidation, **Then** they can test the mutations hook independently without form or UI dependencies
4. **Given** new developer joins team, **When** they compare glass-suppliers with services and profile-suppliers, **Then** all three follow identical architectural patterns (same hook names, same file structure, same dialog pattern)
5. **Given** component structure, **When** developer looks at hooks, **Then** each hook has single responsibility: useGlassSupplierForm (form state), useGlassSupplierMutations (API calls)

---

### User Story 3 - Consistent UX Across All Admin Modules (Priority: P2)

Admin users expect consistent interaction patterns across all admin modules. Services and Profile Suppliers already use dialog modals, but Glass Suppliers still uses separate pages for create/edit.

**Why this priority**: Consistency reduces learning curve and improves user confidence. Glass Suppliers is a frequently used module, so inconsistent UX is highly visible. Users shouldn't have to remember different workflows for similar CRUD operations.

**Independent Test**: Admin can perform create/edit/delete operations on glass suppliers using the exact same interaction pattern as Services and Profile Suppliers modules (dialog modals, same button positions, same confirmation flows, same visual hierarchy).

**Acceptance Scenarios**:

1. **Given** admin manages services and profile suppliers using dialog modals, **When** they manage glass suppliers, **Then** they see identical dialog modal pattern
2. **Given** admin creates a service or profile supplier via dialog, **When** they create a glass supplier, **Then** the form layout, button positions, and field styling are visually consistent
3. **Given** admin deletes any entity with confirmation dialog, **When** they delete a glass supplier, **Then** the confirmation dialog uses identical copy structure and button colors
4. **Given** admin searches/filters in any admin list, **When** they use glass suppliers list, **Then** search input and filter controls are in the same positions

---

### Edge Cases

- What happens when user submits form while network is slow? → Show loading state in submit button, disable all form fields, prevent double submission with disabled state
- What happens when create/update mutation fails? → Show error toast with specific server error message, keep dialog open, allow user to retry without losing form data
- What happens when user closes dialog with unsaved changes? → Dialog closes immediately (form resets), no confirmation needed (follows web convention for modals and matches Services/Profile Suppliers behavior)
- What happens when user edits a supplier that was deleted by another admin? → Show error toast "Proveedor no encontrado", close dialog, refresh list to show current state
- What happens when form validation fails? → Show inline error messages below each invalid field, prevent submission, keep dialog open, highlight first invalid field
- What happens when user tries to delete a supplier with related glass types? → Show error toast explaining referential integrity constraint: "No se puede eliminar este proveedor porque tiene tipos de cristal asociados. Primero elimina o reasigna los tipos de cristal.", keep supplier in list
- What happens when user deletes last supplier in the list? → List shows empty state with "No hay proveedores registrados" message and "Crear Proveedor" call-to-action button
- What happens when user searches and no results are found? → Table shows "No se encontraron proveedores" message with current search term, clear search button visible
- What happens when optional fields (website, contactEmail, contactPhone, notes) are empty? → Form validation passes (they are optional), data is stored as null in database, list displays empty cells or "—" placeholder
- What happens when user enters invalid email format in contactEmail? → Zod validation catches it, shows inline error "Email inválido", prevents submission

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display glass suppliers in a paginated table on the main list page with search and filters
- **FR-002**: System MUST provide "New Supplier" button that opens a dialog modal with empty form
- **FR-003**: System MUST provide edit action for each supplier that opens dialog modal with pre-populated form (all 8 fields)
- **FR-004**: System MUST provide delete action for each supplier that shows confirmation dialog before deletion
- **FR-005**: System MUST validate supplier name (3-100 characters, required, unique per tenant)
- **FR-006**: System MUST validate supplier code (2-20 characters, required, alphanumeric)
- **FR-007**: System MUST validate country (2-50 characters, required)
- **FR-008**: System MUST validate website URL (optional, must be valid URL format if provided)
- **FR-009**: System MUST validate contact email (optional, must be valid email format if provided)
- **FR-010**: System MUST validate contact phone (optional, 7-20 characters if provided)
- **FR-011**: System MUST allow optional notes field (max 500 characters)
- **FR-012**: System MUST show loading states during create/update/delete operations
- **FR-013**: System MUST show toast notifications for success and error states with specific error messages
- **FR-014**: System MUST update the list immediately after create/update/delete without full page reload
- **FR-015**: System MUST invalidate TanStack Query cache and trigger Next.js server refresh after mutations (SSR cache invalidation pattern)
- **FR-016**: System MUST extract form state management into useGlassSupplierForm custom hook
- **FR-017**: System MUST extract mutation logic into useGlassSupplierMutations custom hook
- **FR-018**: System MUST remove separate pages for create (new/page.tsx) and edit ([id]/page.tsx)
- **FR-019**: System MUST maintain RBAC - only admin role can access glass suppliers management
- **FR-020**: System MUST perform complete cleanup: remove directories (new/, [id]/), old form component, unused imports, navigation-related functions in list component
- **FR-021**: System MUST implement optimistic UI updates for delete operations with automatic rollback on error (consistent with Services and Profile Suppliers pattern)
- **FR-022**: System MUST prevent deletion if supplier has related glass types (referential integrity)
- **FR-023**: System MUST maintain existing search functionality (by name, code, country)
- **FR-024**: System MUST maintain existing filter functionality (by country, active status)
- **FR-025**: System MUST maintain existing pagination with same page size (20 items per page)

### Key Entities

- **GlassSupplier**: Represents a manufacturer of glass products (e.g., Vitro, Guardian, AGC, Saint-Gobain)
  - **name**: Supplier name (e.g., "Vitro", "Guardian Glass"), unique per tenant, required
  - **code**: Short identifier code (e.g., "VIT", "GUA"), required, used in product codes
  - **country**: Country of origin (e.g., "México", "Estados Unidos"), required
  - **website**: Supplier website URL (e.g., "https://www.vitro.com"), optional
  - **contactEmail**: Primary contact email, optional
  - **contactPhone**: Primary contact phone, optional
  - **notes**: Additional information about the supplier, optional
  - **isActive**: Whether supplier is active (default: true), used for filtering
  - **tenantId**: Tenant isolation (multi-tenant architecture)
  - **createdAt**: Timestamp when supplier was created
  - **updatedAt**: Timestamp when supplier was last modified
  - **Relationships**: Has many GlassTypes (one-to-many)

### Technical Constraints

- **TC-001**: Must follow exact same pattern as Services and Profile Suppliers modules (dialog modal + SOLID hooks)
- **TC-002**: Must use existing tRPC procedures (api.admin['glass-supplier'].*)
- **TC-003**: Must maintain SSR with force-dynamic (no ISR for admin routes)
- **TC-004**: Must use existing Prisma schema (no database changes)
- **TC-005**: Must use existing validation schema (glass-supplier.schema.ts)
- **TC-006**: Must maintain Spanish UI text (es-LA), English code/comments
- **TC-007**: Component file must be under 250 lines after refactoring (more complex than profile-suppliers due to 8 fields vs 4)
- **TC-008**: Must maintain tenant isolation (all queries filtered by tenantId from session)
- **TC-009**: Must use @lib/format as single source for all data formatting. If formatter doesn't exist, extend @lib/format first
- **TC-010**: Must handle referential integrity for delete operations (GlassSupplier has GlassTypes relationship)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can create a new glass supplier in under 25 seconds (down from 50 seconds with page navigation)
- **SC-002**: Admin can edit a glass supplier in under 20 seconds (down from 35 seconds)
- **SC-003**: Admin can delete a glass supplier in under 10 seconds (including confirmation)
- **SC-004**: Form state management hook (useGlassSupplierForm) is under 120 lines
- **SC-005**: Mutations hook (useGlassSupplierMutations) is under 120 lines
- **SC-006**: Main component file (GlassSupplierDialog) is under 250 lines (down from 354)
- **SC-007**: List page shows changes immediately after mutations (no perceptible delay)
- **SC-008**: Zero navigation to separate pages for CRUD operations
- **SC-009**: 100% consistency with Services and Profile Suppliers module interaction patterns
- **SC-010**: New developers can identify component responsibilities in under 5 minutes
- **SC-011**: All three admin CRUD modules (Services, Profile Suppliers, Glass Suppliers) use identical architectural patterns

### Technical Quality Criteria

- **TQC-001**: Form hook can be tested independently (unit tests)
- **TQC-002**: Mutations hook can be tested independently (unit tests)
- **TQC-003**: Component follows Single Responsibility Principle (only UI composition)
- **TQC-004**: No business logic in component file (delegated to hooks)
- **TQC-005**: SSR cache invalidation uses two-step pattern (invalidate + router.refresh)
- **TQC-006**: All TypeScript strict mode rules pass
- **TQC-007**: No console errors or warnings in browser
- **TQC-008**: No Winston logger usage in client components/hooks. Use console for dev debugging (remove before merge) and toast for user feedback
- **TQC-009**: Referential integrity errors are handled gracefully with user-friendly Spanish messages

## Assumptions

- **A-001**: Glass supplier form fits in a dialog modal despite having 8 fields (name, code, country, website, contactEmail, contactPhone, notes, isActive) - form is vertically scrollable if needed
- **A-002**: Current tRPC procedures support all required operations (list, create, update, delete) with proper tenant isolation
- **A-003**: Country field is free text (not dropdown) - no predefined country list needed in this iteration
- **A-004**: Code field is manually entered (no auto-generation from name) - users prefer explicit control
- **A-005**: Website field accepts any valid URL format (no restriction to specific protocols)
- **A-006**: Phone field accepts international formats (no strict validation beyond length)
- **A-007**: No bulk operations needed in this iteration (can be added later using same hooks pattern)
- **A-008**: Existing Prisma schema relationships (GlassSupplier → GlassTypes) work with dialog pattern - delete is prevented if relationships exist
- **A-009**: Network latency is reasonable (<2s) - optimistic UI updates provide good UX
- **A-010**: Admin users are comfortable with dialog modal pattern from Services and Profile Suppliers modules
- **A-011**: Search and filter functionality remains outside dialog (in list page) - no need to refactor these in this iteration
- **A-012**: Pagination size (20 items per page) is appropriate for glass suppliers volume - no change needed

## Dependencies

- **D-001**: Existing tRPC router: api.admin['glass-supplier']
- **D-002**: Existing validation schema: @/lib/validations/admin/glass-supplier.schema
- **D-003**: Existing Prisma schema: GlassSupplier model with GlassTypes relationship
- **D-004**: Services module implementation as primary reference pattern
- **D-005**: Profile Suppliers module implementation as secondary reference pattern (spec 012-simplify-profile-suppliers)
- **D-006**: DeleteConfirmationDialog shared component
- **D-007**: SSR cache invalidation pattern documented in copilot-instructions.md
- **D-008**: Empty state UI components from @/components/ui/empty (Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia)
- **D-009**: Tenant context from session (for multi-tenant isolation)

## Out of Scope

- **OOS-001**: Bulk delete operations (future enhancement)
- **OOS-002**: Import/export suppliers from CSV/Excel (future enhancement)
- **OOS-003**: Supplier audit history/changelog (future enhancement)
- **OOS-004**: Advanced search with multiple fields simultaneously (current search is sufficient)
- **OOS-005**: Supplier logo upload (future enhancement)
- **OOS-006**: Supplier address details beyond country (future enhancement)
- **OOS-007**: Integration with external supplier databases or APIs (future enhancement)
- **OOS-008**: Supplier performance metrics or analytics (future enhancement)
- **OOS-009**: Country dropdown with predefined list (free text is sufficient for now)
- **OOS-010**: Automatic code generation from name (manual entry gives more control)
- **OOS-011**: Supplier status workflow (active/inactive is binary toggle for now)
- **OOS-012**: Email verification for contactEmail field (future enhancement)
- **OOS-013**: Phone number formatting/validation by country (basic length validation is sufficient)

## Clarifications

### Session 2025-01-21

_No clarifications requested yet. Spec is complete based on established patterns from Services (primary reference) and Profile Suppliers (secondary reference) modules._

## References

- **Services Module Pattern (Primary Reference)**: `/src/app/(dashboard)/admin/services/_components/`
- **Profile Suppliers Module Pattern (Secondary Reference)**: `/src/app/(dashboard)/admin/profile-suppliers/_components/` (spec 012-simplify-profile-suppliers)
- **SOLID Architecture Documentation**: `/src/app/(dashboard)/admin/services/_components/README.md`
- **SSR Cache Invalidation Pattern**: `.github/copilot-instructions.md` (section "SSR Cache Invalidation Pattern")
- **Constitution**: `.specify/memory/constitution.md` (section "One Job, One Place")
- **Original Implementation**: `/src/app/(dashboard)/admin/glass-suppliers/`
- **Formatting Utilities**: `@lib/format` (única fuente de formatters del proyecto)
- **Empty State Components**: `@/components/ui/empty` (Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia with variant icon)
- **Referential Integrity Patterns**: Existing delete confirmation dialogs with relationship checks


