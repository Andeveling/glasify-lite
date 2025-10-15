# Feature Specification: Admin Catalog Management

**Feature Branch**: `011-admin-catalog-management`  
**Created**: 2025-10-15  
**Status**: Draft  
**Input**: User description: "Admin catalog management - CRUD operations for models, glass types, and services to configure public catalog data"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Window/Door Models (Priority: P1)

As an admin, I need to create, edit, view, and delete window/door models so that customers can browse and select available products in the public catalog. This includes setting pricing rules, dimensions constraints, compatible glass types, and profile supplier assignments.

**Why this priority**: Models are the core product offerings. Without model management, there's no catalog to display. This is the foundation of the entire catalog system.

**Independent Test**: Can be fully tested by creating a new model with all required fields, viewing it in the admin panel, editing its properties, and deleting it. Delivers immediate value by populating the catalog with products.

**Acceptance Scenarios**:

1. **Given** I am logged in as admin, **When** I navigate to the models management page, **Then** I see a list of all existing models with their key details (name, supplier, status, price range)
2. **Given** I am on the models list page, **When** I click "Create Model", **Then** I see a form with fields for model name, profile supplier, dimensions (min/max width/height), pricing (base price, cost per mm), glass discount settings, compatible glass types, and profit margin
3. **Given** I have filled all required model fields, **When** I submit the form, **Then** the model is created with status "draft" and I see a success confirmation
4. **Given** I have created a model, **When** I edit the model and change its status to "published", **Then** the model becomes visible in the public catalog
5. **Given** I am viewing a model, **When** I click edit, **Then** I can update any field including pricing, dimensions, compatible glass types, and cost breakdown components
6. **Given** I am viewing a model that has no associated quotes, **When** I click delete, **Then** the model is permanently removed from the system
7. **Given** I am viewing a model that has associated quote items, **When** I attempt to delete it, **Then** I see an error message preventing deletion to maintain data integrity

---

### User Story 2 - Manage Glass Types (Priority: P2)

As an admin, I need to create, edit, view, and delete glass types so that customers can select appropriate glass specifications for their window/door models. This includes setting glass properties, pricing, performance ratings, solutions, characteristics, and supplier information.

**Why this priority**: Glass types are essential product variants that work with models. While secondary to models themselves, they're required to complete a functional catalog. Customers need glass options to make informed purchasing decisions.

**Independent Test**: Can be fully tested by creating a glass type with specifications (thickness, price per sqm, thermal properties), assigning it to solutions and characteristics, and verifying it appears as a compatible option for models.

**Acceptance Scenarios**:

1. **Given** I am logged in as admin, **When** I navigate to the glass types management page, **Then** I see a list of all glass types with key details (name, thickness, price per sqm, supplier, active status)
2. **Given** I am on the glass types list page, **When** I click "Create Glass Type", **Then** I see a form with fields for name, thickness, price per sqm, glass supplier, SKU, description, thermal properties (U-value, solar factor, light transmission), and active status
3. **Given** I am creating/editing a glass type, **When** I reach the solutions section, **Then** I can assign multiple glass solutions with performance ratings (basic, standard, good, very good, excellent) and mark one as primary
4. **Given** I am creating/editing a glass type, **When** I reach the characteristics section, **Then** I can assign multiple glass characteristics (tempered, laminated, low-e, triple-glazed, etc.) with optional values and certifications
5. **Given** I have filled all required glass type fields, **When** I submit the form, **Then** the glass type is created and I see a success confirmation
6. **Given** I am viewing a glass type, **When** I click edit, **Then** I can update any field including price, properties, solutions, characteristics, and supplier
7. **Given** I am viewing a glass type that has no associated quote items, **When** I click delete, **Then** the glass type is permanently removed from the system
8. **Given** I am viewing a glass type that has associated quote items, **When** I attempt to delete it, **Then** I see an error message preventing deletion to maintain data integrity
9. **Given** I update a glass type's price per sqm, **When** I submit the form, **Then** a price history record is automatically created with the new price, reason, and effective date

---

### User Story 3 - Manage Services (Priority: P3)

As an admin, I need to create, edit, view, and delete additional services so that customers can add optional services (installation, delivery, custom finishes) to their quotes. This includes setting service types, pricing rates, and units of measurement.

**Why this priority**: Services are supplementary offerings that enhance quote value but aren't required for a basic catalog. They can be added after core products (models and glass types) are established.

**Independent Test**: Can be fully tested by creating a service with pricing (fixed, per sqm, per ml), verifying it appears in quote creation forms, and confirming it calculates correctly when added to a quote.

**Acceptance Scenarios**:

1. **Given** I am logged in as admin, **When** I navigate to the services management page, **Then** I see a list of all services with their type, unit, and rate
2. **Given** I am on the services list page, **When** I click "Create Service", **Then** I see a form with fields for name, service type (area, perimeter, fixed), unit (unit, sqm, ml), and rate
3. **Given** I have filled all required service fields, **When** I submit the form, **Then** the service is created and I see a success confirmation
4. **Given** I am viewing a service, **When** I click edit, **Then** I can update the name, type, unit, and rate
5. **Given** I am viewing a service that has no associated quote item services, **When** I click delete, **Then** the service is permanently removed from the system
6. **Given** I am viewing a service that has associated quote item services, **When** I attempt to delete it, **Then** I see an error message preventing deletion to maintain data integrity

---

### User Story 4 - Manage Profile Suppliers (Priority: P2)

As an admin, I need to create, edit, view, and delete profile suppliers so that I can properly categorize models by their manufacturer and material type. This enables better catalog organization and filtering.

**Why this priority**: Profile suppliers are organizational metadata that enhance model management. While not strictly required to display a catalog, they're important for professional catalog presentation and filtering capabilities.

**Independent Test**: Can be fully tested by creating a profile supplier (e.g., Rehau, PVC), assigning it to models, and verifying the supplier appears in model filters and details.

**Acceptance Scenarios**:

1. **Given** I am logged in as admin, **When** I navigate to the profile suppliers management page, **Then** I see a list of all suppliers with their name, material type, and active status
2. **Given** I am on the profile suppliers list page, **When** I click "Create Supplier", **Then** I see a form with fields for name, material type (PVC, Aluminum, Wood, Mixed), active status, and notes
3. **Given** I have filled all required supplier fields, **When** I submit the form, **Then** the supplier is created and I see a success confirmation
4. **Given** I am viewing a supplier, **When** I click edit, **Then** I can update the name, material type, active status, and notes
5. **Given** I am viewing a supplier that has no associated models, **When** I click delete, **Then** the supplier is permanently removed from the system
6. **Given** I am viewing a supplier that has associated models, **When** I attempt to delete it, **Then** I see an error message preventing deletion (or option to reassign models first)

---

### User Story 5 - Manage Glass Suppliers (Priority: P3)

As an admin, I need to create, edit, view, and delete glass suppliers so that I can track which manufacturers provide our glass types and maintain supplier contact information.

**Why this priority**: Glass suppliers are organizational metadata similar to profile suppliers but less critical since they don't affect pricing calculations. Useful for procurement tracking but not essential for catalog functionality.

**Independent Test**: Can be fully tested by creating a glass supplier (e.g., Guardian, AGC), assigning it to glass types, and viewing supplier details in glass type management.

**Acceptance Scenarios**:

1. **Given** I am logged in as admin, **When** I navigate to the glass suppliers management page, **Then** I see a list of all suppliers with their name, code, country, and active status
2. **Given** I am on the glass suppliers list page, **When** I click "Create Supplier", **Then** I see a form with fields for name, code, country, website, contact email, contact phone, active status, and notes
3. **Given** I have filled all required fields, **When** I submit the form, **Then** the supplier is created and I see a success confirmation
4. **Given** I am viewing a supplier, **When** I click edit, **Then** I can update all fields
5. **Given** I am viewing a supplier that has no associated glass types, **When** I click delete, **Then** the supplier is permanently removed from the system
6. **Given** I am viewing a supplier that has associated glass types, **When** I attempt to delete it, **Then** I see an error message preventing deletion

---

### User Story 6 - Manage Glass Solutions (Priority: P3)

As an admin, I need to create, edit, view, and delete glass solutions so that I can categorize glass types by their intended use (security, thermal insulation, acoustic, decorative). This helps customers find glass types that meet their specific needs.

**Why this priority**: Solutions are categorization tools that improve user experience but aren't required for basic catalog functionality. They can be added as a catalog enhancement after core entities are manageable.

**Independent Test**: Can be fully tested by creating a solution (e.g., "Thermal Insulation"), assigning it to glass types with performance ratings, and verifying it appears in catalog filters.

**Acceptance Scenarios**:

1. **Given** I am logged in as admin, **When** I navigate to the glass solutions management page, **Then** I see a list of all solutions with their key, name (English/Spanish), icon, and active status
2. **Given** I am on the solutions list page, **When** I click "Create Solution", **Then** I see a form with fields for key, name, name (Spanish), description, icon (Lucide React icon name), sort order, and active status
3. **Given** I have filled all required fields, **When** I submit the form, **Then** the solution is created and I see a success confirmation
4. **Given** I am viewing a solution, **When** I click edit, **Then** I can update all fields
5. **Given** I am viewing a solution that has no associated glass type relations, **When** I click delete, **Then** the solution is permanently removed from the system
6. **Given** I am viewing a solution that has associated glass types, **When** I attempt to delete it, **Then** I see an error message preventing deletion

---

### User Story 7 - Manage Glass Characteristics (Priority: P3)

As an admin, I need to create, edit, view, and delete glass characteristics so that I can tag glass types with their properties (tempered, laminated, low-e coating, triple-glazed). This replaces the legacy boolean flags with a flexible tagging system.

**Why this priority**: Characteristics are metadata that enhance glass type descriptions but aren't critical for basic catalog operation. They improve searchability and filtering as a secondary feature.

**Independent Test**: Can be fully tested by creating a characteristic (e.g., "Tempered"), assigning it to glass types with optional certification values, and viewing characteristic tags in glass type details.

**Acceptance Scenarios**:

1. **Given** I am logged in as admin, **When** I navigate to the glass characteristics management page, **Then** I see a list of all characteristics with their key, name (English/Spanish), category, and active status
2. **Given** I am on the characteristics list page, **When** I click "Create Characteristic", **Then** I see a form with fields for key, name, name (Spanish), description, category, active status, and sort order
3. **Given** I have filled all required fields, **When** I submit the form, **Then** the characteristic is created and I see a success confirmation
4. **Given** I am viewing a characteristic, **When** I click edit, **Then** I can update all fields
5. **Given** I am viewing a characteristic that has no associated glass type relations, **When** I click delete, **Then** the characteristic is permanently removed from the system
6. **Given** I am viewing a characteristic that has associated glass types, **When** I attempt to delete it, **Then** I see an error message preventing deletion

---

### Edge Cases

- What happens when an admin tries to delete a model/glass type/service that is referenced in existing quotes?
  - System prevents deletion and shows error message indicating the entity is in use
  - Admin should archive/deactivate instead of delete (set isActive=false or status=draft)

- What happens when an admin tries to create a model with incompatible glass types that don't exist?
  - System validates that all selected glass type IDs exist before saving
  - Form shows real-time validation errors for invalid selections

- What happens when dimension constraints overlap or are invalid (e.g., minWidth > maxWidth)?
  - Form validates that min values are less than max values
  - Shows inline validation errors before submission

- What happens when an admin tries to assign a profile supplier that is marked as inactive?
  - System allows assignment but shows a warning that the supplier is inactive
  - Inactive suppliers don't appear in public-facing catalog filters

- What happens when pricing fields contain invalid values (negative numbers, excessive decimals)?
  - Form validates numeric inputs according to database constraints (Decimal precision)
  - Shows validation errors for out-of-range values

- What happens when an admin updates a glass type price but forgets to provide a reason?
  - System requires a reason for price changes to maintain audit trail
  - Form validates that reason field is filled when price is modified

- What happens when an admin tries to create duplicate entries (same name, same SKU)?
  - System enforces unique constraints at database level
  - Form shows user-friendly error messages for duplicate violations

- What happens when an admin navigates away from a form with unsaved changes?
  - System shows confirmation dialog warning about unsaved changes
  - Admin can choose to stay and save or discard changes

## Requirements *(mandatory)*

### Functional Requirements

#### Model Management

- **FR-001**: System MUST allow admins to create new window/door models with fields: name, profile supplier, status (draft/published), dimensions (min/max width/height in mm), pricing (base price, cost per mm width/height, accessory price), glass discount settings (width/height in mm), compatible glass type IDs (array), profit margin percentage, last cost review date, and cost notes
- **FR-002**: System MUST allow admins to edit existing models including all fields from FR-001
- **FR-003**: System MUST allow admins to view a detailed list of all models with filtering by profile supplier, status, and search by name
- **FR-004**: System MUST allow admins to delete models that have no associated quote items
- **FR-005**: System MUST prevent deletion of models that are referenced in quote items and show explanatory error message
- **FR-006**: System MUST allow admins to manage model cost breakdown components (component name, cost type, unit cost, notes) for detailed pricing analysis
- **FR-007**: System MUST automatically create price history records when base price, cost per mm width, or cost per mm height fields are modified

#### Glass Type Management

- **FR-008**: System MUST allow admins to create new glass types with fields: name, thickness (mm), price per sqm, glass supplier, SKU, description, thermal properties (U-value, solar factor, light transmission), active status, and last review date
- **FR-009**: System MUST allow admins to edit existing glass types including all fields from FR-008
- **FR-010**: System MUST allow admins to view a detailed list of all glass types with filtering by glass supplier, thickness, active status, and search by name/SKU
- **FR-011**: System MUST allow admins to delete glass types that have no associated quote items
- **FR-012**: System MUST prevent deletion of glass types that are referenced in quote items and show explanatory error message
- **FR-013**: System MUST allow admins to assign multiple glass solutions to a glass type with performance rating (basic, standard, good, very good, excellent) and primary flag
- **FR-014**: System MUST allow admins to assign multiple glass characteristics to a glass type with optional value, certification reference, and notes
- **FR-015**: System MUST automatically create price history records when price per sqm is modified, requiring reason and effective date

#### Service Management

- **FR-016**: System MUST allow admins to create new services with fields: name, service type (area, perimeter, fixed), unit (unit, sqm, ml), and rate
- **FR-017**: System MUST allow admins to edit existing services including all fields from FR-016
- **FR-018**: System MUST allow admins to view a detailed list of all services with filtering by service type and search by name
- **FR-019**: System MUST allow admins to delete services that have no associated quote item services
- **FR-020**: System MUST prevent deletion of services that are referenced in quote item services and show explanatory error message

#### Profile Supplier Management

- **FR-021**: System MUST allow admins to create new profile suppliers with fields: name, material type (PVC, Aluminum, Wood, Mixed), active status, and notes
- **FR-022**: System MUST allow admins to edit existing profile suppliers including all fields from FR-021
- **FR-023**: System MUST allow admins to view a detailed list of all profile suppliers with filtering by material type, active status, and search by name
- **FR-024**: System MUST allow admins to delete profile suppliers that have no associated models
- **FR-025**: System MUST prevent deletion of profile suppliers that are referenced in models and show explanatory error message

#### Glass Supplier Management

- **FR-026**: System MUST allow admins to create new glass suppliers with fields: name, code, country, website, contact email, contact phone, active status, and notes
- **FR-027**: System MUST allow admins to edit existing glass suppliers including all fields from FR-026
- **FR-028**: System MUST allow admins to view a detailed list of all glass suppliers with filtering by country, active status, and search by name/code
- **FR-029**: System MUST allow admins to delete glass suppliers that have no associated glass types
- **FR-030**: System MUST prevent deletion of glass suppliers that are referenced in glass types and show explanatory error message

#### Glass Solution Management

- **FR-031**: System MUST allow admins to create new glass solutions with fields: unique key, name (English), name (Spanish), description, icon (Lucide React icon name), sort order, and active status
- **FR-032**: System MUST allow admins to edit existing glass solutions including all fields from FR-031
- **FR-033**: System MUST allow admins to view a detailed list of all glass solutions with filtering by active status and search by name/key
- **FR-034**: System MUST allow admins to delete glass solutions that have no associated glass type relations
- **FR-035**: System MUST prevent deletion of glass solutions that are assigned to glass types and show explanatory error message

#### Glass Characteristic Management

- **FR-036**: System MUST allow admins to create new glass characteristics with fields: unique key, name (English), name (Spanish), description, category, active status, and sort order
- **FR-037**: System MUST allow admins to edit existing glass characteristics including all fields from FR-036
- **FR-038**: System MUST allow admins to view a detailed list of all glass characteristics with filtering by category, active status, and search by name/key
- **FR-039**: System MUST allow admins to delete glass characteristics that have no associated glass type relations
- **FR-040**: System MUST prevent deletion of glass characteristics that are assigned to glass types and show explanatory error message

#### Cross-Cutting Requirements

- **FR-041**: System MUST restrict all catalog management operations (create, read, update, delete) to users with admin role only
- **FR-042**: System MUST validate all numeric inputs according to database constraints (e.g., Decimal(12,2) for prices, positive integers for dimensions)
- **FR-043**: System MUST validate that min dimension values are less than or equal to max dimension values for models
- **FR-044**: System MUST enforce unique constraints (e.g., unique names for suppliers, unique SKUs for glass types, unique keys for solutions/characteristics)
- **FR-045**: System MUST show user-friendly validation error messages in Spanish for all form validation failures
- **FR-046**: System MUST log all create, update, and delete operations for audit purposes including user ID, timestamp, and changed fields
- **FR-047**: System MUST preserve referential integrity by preventing deletion of entities that have dependent records in other tables
- **FR-048**: System MUST provide confirmation dialogs before performing destructive operations (delete)
- **FR-049**: System MUST auto-save timestamps (createdAt, updatedAt) for all entities
- **FR-050**: System MUST allow admins to bulk update active/inactive status for multiple glass types, suppliers, solutions, or characteristics

### Key Entities

- **Model**: Window/door product configuration with pricing rules, dimension constraints, and compatible glass types
- **GlassType**: Glass specification with thermal/optical properties, pricing per sqm, and supplier information
- **Service**: Additional service offering with pricing rate and calculation method (area/perimeter/fixed)
- **ProfileSupplier**: Manufacturer of window/door profiles with material type classification
- **GlassSupplier**: Manufacturer of glass products with contact and geographic information
- **GlassSolution**: Categorization tag for glass types by intended use (security, thermal, acoustic, etc.)
- **GlassCharacteristic**: Property tag for glass types (tempered, laminated, low-e, etc.) with flexible attributes
- **ModelCostBreakdown**: Detailed cost components for a model (profiles, hardware, labor)
- **ModelPriceHistory**: Audit trail of model price changes with reasons and effective dates
- **GlassTypePriceHistory**: Audit trail of glass type price changes with reasons and effective dates
- **GlassTypeSolution**: Many-to-many relationship linking glass types to solutions with performance ratings
- **GlassTypeCharacteristic**: Many-to-many relationship linking glass types to characteristics with optional values/certifications

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin users can create a new model with all required fields in under 3 minutes
- **SC-002**: Admin users can create a new glass type with solutions and characteristics in under 5 minutes
- **SC-003**: Admin users can find and edit any catalog entity using search/filter in under 30 seconds
- **SC-004**: System prevents 100% of invalid deletion attempts (entities with dependencies) with clear error messages
- **SC-005**: All price changes are automatically logged to history tables with complete audit trail (user, timestamp, reason)
- **SC-006**: Forms validate all inputs client-side and show inline errors before submission, reducing failed submissions by 80%
- **SC-007**: Admin dashboard loads catalog entity lists with pagination/filtering in under 2 seconds for up to 500 records
- **SC-008**: All catalog management operations are restricted to admin users only (100% authorization enforcement)
- **SC-009**: System maintains referential integrity across all related entities (zero orphaned records)
- **SC-010**: Admin users can successfully complete all CRUD operations for all 7 entity types without technical assistance

### Assumptions

- Admin users have been trained on catalog structure and pricing methodologies
- Database supports Decimal precision as defined in schema (12,2 for prices, 12,4 for rates)
- Admin role is properly configured in the authentication system (UserRole enum)
- Public catalog rendering system will automatically reflect changes made through admin management interface
- All UI text follows Spanish (es-LA) localization standards as per project guidelines
- Forms follow existing project patterns (React Hook Form + Zod validation + tRPC procedures)
- Inactive entities (isActive=false) are filtered from public catalog but remain visible in admin interface
- Price history records are created automatically through database triggers or application middleware (not manual admin input)
- Lucide React icon library is available for solution icon selection
- System supports server-side pagination and filtering for large datasets (implemented via tRPC procedures)
