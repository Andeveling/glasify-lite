# Feature Specification: Simplify Profile Suppliers with SOLID Pattern

**Feature Branch**: `012-simplify-profile-suppliers`  
**Created**: 2025-01-20  
**Status**: Draft  
**Input**: User description: "necesitamos aplicar y simplificar tambien las vistas de profile-suppliers para que sea mas facil e intuitivo, el crear editar y borrar sumando a tener buenas practicas, recuerda que las ramas son en ingles y si un formulario no tiene mucha complejidad en un modal pasa"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Profile Supplier Management (Priority: P1)

Admin users need to manage profile suppliers (window and door frame manufacturers) without leaving the list page. Currently, creating or editing a supplier requires navigating to separate pages, which interrupts the workflow and makes the interface feel clunky.

**Why this priority**: Core administrative functionality that directly impacts user productivity. Streamlining CRUD operations reduces clicks and cognitive load.

**Independent Test**: Admin can create, edit, and delete profile suppliers entirely from the list page using dialog modals, completing all operations in under 30 seconds each.

**Acceptance Scenarios**:

1. **Given** admin is on profile suppliers list page, **When** they click "New Supplier" button, **Then** a dialog modal opens with an empty form
2. **Given** dialog modal is open with form, **When** admin fills name and material type and clicks "Create", **Then** supplier is created and immediately appears in the list without page navigation
3. **Given** admin views a supplier in the list, **When** they click edit icon, **Then** dialog modal opens pre-populated with supplier data
4. **Given** admin edits supplier data in modal, **When** they click "Save Changes", **Then** changes are reflected in the list immediately without page navigation
5. **Given** admin views a supplier in the list, **When** they click delete icon, **Then** confirmation dialog appears asking for confirmation
6. **Given** delete confirmation dialog is open, **When** admin confirms deletion, **Then** supplier is removed from list immediately

---

### User Story 2 - Improved Code Maintainability (Priority: P1)

Developers need a clean, testable codebase following SOLID principles. Currently, profile-supplier-form.tsx mixes form state, mutation logic, navigation, and UI rendering in a single 247-line component.

**Why this priority**: Code quality directly impacts development velocity, bug rates, and onboarding time. This refactoring establishes a reusable pattern for other admin modules.

**Independent Test**: Form logic, mutation logic, and UI can be tested independently. New developers can understand the component structure in under 5 minutes by reading hook names and component props.

**Acceptance Scenarios**:

1. **Given** profile supplier form code, **When** developer reviews component file, **Then** component is under 200 lines and only handles UI composition
2. **Given** form state management logic, **When** developer needs to test form validation, **Then** they can test the form hook independently without rendering UI
3. **Given** mutation logic, **When** developer needs to test cache invalidation, **Then** they can test the mutations hook independently without form or UI dependencies
4. **Given** new developer joins team, **When** they review the code structure, **Then** they can identify responsibilities by hook names (useProfileSupplierForm, useProfileSupplierMutations)

---

### User Story 3 - Consistent UX Across Admin Modules (Priority: P2)

Admin users expect consistent interaction patterns across all admin modules. Services module already uses dialog modals, but profile-suppliers still uses separate pages.

**Why this priority**: Consistency reduces learning curve and improves user confidence. Users shouldn't have to remember different workflows for similar operations.

**Independent Test**: Admin can perform create/edit/delete operations on profile suppliers using the exact same interaction pattern as services module (dialog modals, same button positions, same confirmation flows).

**Acceptance Scenarios**:

1. **Given** admin manages services using dialog modals, **When** they manage profile suppliers, **Then** they see the same dialog modal pattern
2. **Given** admin creates a service via dialog, **When** they create a profile supplier, **Then** the form layout and button positions are consistent
3. **Given** admin deletes a service with confirmation dialog, **When** they delete a profile supplier, **Then** the confirmation dialog uses identical copy and buttons

---

### Edge Cases

- What happens when user submits form while network is slow? → Show loading state in submit button, disable form fields, prevent double submission
- What happens when create/update mutation fails? → Show error toast with specific error message, keep dialog open, allow user to retry without losing form data
- What happens when user closes dialog with unsaved changes? → Dialog closes (form resets), no confirmation needed (follows web convention for modals)
- What happens when user edits a supplier that was deleted by another admin? → Show error toast "Supplier not found", refresh list to show current state
- What happens when form validation fails? → Show inline error messages below each field, prevent submission, keep dialog open
- What happens when user deletes last supplier in the list? → List shows empty state with "No suppliers found" message and "Create Supplier" call-to-action

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display profile suppliers in a paginated table on the main list page
- **FR-002**: System MUST provide "New Supplier" button that opens a dialog modal with empty form
- **FR-003**: System MUST provide edit action for each supplier that opens dialog modal with pre-populated form
- **FR-004**: System MUST provide delete action for each supplier that shows confirmation dialog before deletion
- **FR-005**: System MUST validate supplier name (3-100 characters, required)
- **FR-006**: System MUST validate material type (required, one of: PVC, ALUMINUM, WOOD, MIXED)
- **FR-007**: System MUST allow optional notes field (max 500 characters)
- **FR-008**: System MUST show loading states during create/update/delete operations
- **FR-009**: System MUST show toast notifications for success and error states
- **FR-010**: System MUST update the list immediately after create/update/delete without full page reload
- **FR-011**: System MUST invalidate TanStack Query cache and trigger Next.js server refresh after mutations (SSR cache invalidation pattern)
- **FR-012**: System MUST extract form state management into useProfileSupplierForm custom hook
- **FR-013**: System MUST extract mutation logic into useProfileSupplierMutations custom hook
- **FR-014**: System MUST remove separate pages for create (new/page.tsx) and edit ([id]/page.tsx)
- **FR-015**: System MUST maintain RBAC - only admin role can access profile suppliers management
- **FR-016**: System MUST perform complete cleanup: remove directories (new/, [id]/), old form component, unused imports, navigation-related functions in list component, and any shared components exclusively used by old implementation
- **FR-017**: System MUST implement optimistic UI updates for delete operations with automatic rollback on error (consistent with Services module pattern)

### Key Entities

- **ProfileSupplier**: Represents a manufacturer of window/door frames
  - **name**: Supplier name (e.g., "Rehau", "Deceuninck"), unique, required
  - **materialType**: Type of material (PVC, ALUMINUM, WOOD, MIXED), required
  - **notes**: Optional additional information about the supplier
  - **isActive**: Whether supplier is active (default: true)
  - **createdAt**: Timestamp when supplier was created
  - **updatedAt**: Timestamp when supplier was last modified

### Technical Constraints

- **TC-001**: Must follow existing Services module pattern exactly (dialog modal + SOLID hooks)
- **TC-002**: Must use existing tRPC procedures (api.admin['profile-supplier'].*)
- **TC-003**: Must maintain SSR with force-dynamic (no ISR for admin routes)
- **TC-004**: Must use existing Prisma schema (no database changes)
- **TC-005**: Must use existing validation schema (profile-supplier.schema.ts)
- **TC-006**: Must maintain Spanish UI text (es-LA), English code/comments
- **TC-007**: Component file must be under 200 lines after refactoring
- **TC-008**: Must use @lib/format as single source for all data formatting (dates, currency, etc.). If formatter doesn't exist, extend @lib/format first before using

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can create a new profile supplier in under 20 seconds (down from 45 seconds with page navigation)
- **SC-002**: Admin can edit a profile supplier in under 15 seconds (down from 30 seconds)
- **SC-003**: Admin can delete a profile supplier in under 10 seconds (including confirmation)
- **SC-004**: Form state management hook (useProfileSupplierForm) is under 100 lines
- **SC-005**: Mutations hook (useProfileSupplierMutations) is under 100 lines
- **SC-006**: Main component file (ProfileSupplierDialog) is under 200 lines (down from 247)
- **SC-007**: List page shows changes immediately after mutations (no perceptible delay)
- **SC-008**: Zero navigation to separate pages for CRUD operations
- **SC-009**: 100% consistency with Services module interaction pattern
- **SC-010**: New developers can identify component responsibilities in under 5 minutes

### Technical Quality Criteria

- **TQC-001**: Form hook can be tested independently (unit tests)
- **TQC-002**: Mutations hook can be tested independently (unit tests)
- **TQC-003**: Component follows Single Responsibility Principle (only UI composition)
- **TQC-004**: No business logic in component file (delegated to hooks)
- **TQC-005**: SSR cache invalidation uses two-step pattern (invalidate + router.refresh)
- **TQC-006**: All TypeScript strict mode rules pass
- **TQC-007**: No console errors or warnings in browser
- **TQC-008**: No Winston logger usage in client components/hooks. Use console for dev debugging (remove before merge) and toast for user feedback

## Assumptions

- **A-001**: Profile supplier form is simple enough to fit in a dialog modal (4 fields: name, material type, notes, isActive)
- **A-002**: Current tRPC procedures support all required operations (list, create, update, delete)
- **A-003**: Material type options remain fixed (PVC, ALUMINUM, WOOD, MIXED) - no dynamic loading needed
- **A-004**: No bulk operations needed in this iteration (can be added later using same hooks pattern)
- **A-005**: Existing Prisma schema relationships work with dialog pattern (no cascading delete issues)
- **A-006**: Network latency is reasonable (<2s) - optimistic UI updates provide good UX
- **A-007**: Admin users are comfortable with dialog modal pattern from Services module

### Dependencies

- **D-001**: Existing tRPC router: api.admin['profile-supplier']
- **D-002**: Existing validation schema: @/lib/validations/admin/profile-supplier.schema
- **D-003**: Existing Prisma schema: ProfileSupplier model
- **D-004**: Services module implementation as reference pattern
- **D-005**: DeleteConfirmationDialog shared component
- **D-006**: SSR cache invalidation pattern documented in copilot-instructions.md
- **D-007**: Empty state UI components from @/components/ui/empty (Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia)

## Out of Scope

- **OOS-001**: Bulk delete operations (future enhancement)
- **OOS-002**: Import/export suppliers (future enhancement)
- **OOS-003**: Supplier audit history (future enhancement)
- **OOS-004**: Search and advanced filtering (can use existing table search pattern)
- **OOS-005**: Supplier logo upload (future enhancement)
- **OOS-006**: Supplier contact information (phone, email, address) - not in current schema
- **OOS-007**: Integration with external supplier databases
- **OOS-008**: Supplier performance metrics or analytics

## Clarifications

### Session 2025-01-20

- Q: ¿Cómo se deben formatear los datos de visualización (fechas, enums, etc.)? → A: @lib/format es la única fuente de formatters. Si no existe el formatter necesario, se debe extender en @lib/format. Aplicar condicionalmente: si se necesita formateo, usar @lib/format; si no existe, extender ahí primero.
- Q: ¿Qué archivos y código se debe eliminar después del refactor? → A: Eliminar new/ y [id]/ directories, profile-supplier-form.tsx, imports no usados relacionados, funciones/constantes en profile-supplier-list.tsx para navegación a páginas, Y revisar shared components que solo usaba profile-suppliers (si existen)
- Q: ¿Qué estrategia de logging usar en hooks y componentes cliente? → A: Console.log en desarrollo para debugging, toasts para usuarios, sin logging persistente. Winston solo server-side según constitution.
- Q: ¿Qué estrategia de optimistic updates usar para delete? → A: Optimistic delete con rollback on error (consistente con Services TC-001). Proporciona feedback inmediato y mantiene coherencia de arquitectura.
- Q: ¿Qué empty state UI usar cuando la lista está vacía? → A: Reutilizar componentes Empty de @/components/ui/empty (variant icon, EmptyHeader, EmptyTitle, EmptyDescription). Mantiene consistencia con otros módulos y usa componentes UI existentes.

## References

- **Services Module Pattern**: `/src/app/(dashboard)/admin/services/_components/`
- **SOLID Architecture Documentation**: `/src/app/(dashboard)/admin/services/_components/README.md`
- **SSR Cache Invalidation Pattern**: `.github/copilot-instructions.md` (section "SSR Cache Invalidation Pattern")
- **Constitution**: `.specify/memory/constitution.md` (section "One Job, One Place")
- **Original Implementation**: `/src/app/(dashboard)/admin/profile-suppliers/`
- **Formatting Utilities**: `@lib/format` (única fuente de formatters del proyecto)
- **Empty State Components**: `@/components/ui/empty` (Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia con variant icon)
