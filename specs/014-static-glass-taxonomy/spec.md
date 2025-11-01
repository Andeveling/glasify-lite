# Feature Specification: Static Glass Taxonomy Based on Industry Standards

**Feature Branch**: `015-static-glass-taxonomy`  
**Created**: 2025-01-21  
**Status**: Draft  
**Input**: User description: "Convert GlassType and GlassSolution to static taxonomy based on industry standards. Tenants manage their own suppliers via CRUD."

## Clarifications

### Session 2025-10-22

- Q: GlassType management model (fully static seed-only vs admin CRUD) → A: **Hybrid Model** - Seed initial 30 types from Tecnoglass + Admin has full CRUD (create/update/delete) for custom types. Field `isSeeded` distinguishes base types from custom types.
- Q: How to populate GlassCharacteristic and GlassTypeSolution data → A: **Seed both** - Seed ~10-15 standard characteristics (tempered, laminated, low-e, triple-glazed, acoustic, hurricane-resistant) + seed GlassTypeSolution relationships for 30 Tecnoglass types with performanceRating. Admin can assign via CRUD to custom types.
- Q: Handle deprecated fields in GlassType (isTempered, isLaminated, isLowE, isTripleGlazed, purpose, glassSupplierId, pricePerSqm, sku) → A: **Delete immediately** - App not in production yet, remove all deprecated fields, migration script only, clean schema for v1.0 launch.
- Q: Role-based access for glass taxonomy CRUD (admin/seller/user permissions) → A: **Admin-only CRUD** - Only role='admin' can manage GlassType, GlassCharacteristic, and GlassTypeSolution. Sellers/users have read-only access for quote creation.
- Q: Migration strategy for legacy data (preserve existing 4 glass types vs clean slate) → A: **Clean slate** - Delete all existing glass types, remove deprecated fields from schema, start fresh with 30 seeded Tecnoglass types. App not in production, no legacy data to preserve.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Standardized Glass Types Catalog (Priority: P1)

When creating quotes, users select from a standardized catalog of glass types based on international norms (ISO, ASTM) and industry leaders (Tecnoglass, Vitro, Guardian). The glass types remain consistent across all tenants, ensuring pricing accuracy and technical specifications align with manufacturer standards.

**Why this priority**: Core value proposition. Without standardized glass types, quotes cannot reference accurate technical specifications (U-values, SHGC, visible light transmission) from manufacturers. This is the foundation for all glass-related calculations.

**Independent Test**: Admin can view complete glass type catalog with all technical specifications. When creating a quote, only industry-standard glass types appear in dropdowns. Changes to glass type data require system-level migration (not tenant CRUD).

**Acceptance Scenarios**:

1. **Given** admin views glass types catalog, **When** filtering by series (Serie-R, Serie-N, Solarban), **Then** all seeded types from that series appear with technical specifications and badge indicating "Seeded"
2. **Given** user creates quote, **When** selecting glass type, **Then** dropdown shows both seeded standard types and admin-created custom types with nomenclature (e.g., "N70/38 - Neutral Low-E")
3. **Given** admin needs custom glass type, **When** accessing glass type management, **Then** can create new type with full technical specs (marked `isSeeded: false`)

---

### User Story 2 - Universal Glass Solutions Taxonomy (Priority: P1)

Users assign glass solutions (purposes) from a fixed taxonomy aligned with industry certifications and building codes. Solutions like "Control Solar" (solar control), "Eficiencia Energética" (energy efficiency), "Seguridad" (safety/security), and "Acústico" (acoustic) are universal standards that don't vary by manufacturer or tenant.

**Why this priority**: Glass solutions map to building certifications (LEED, EDGE, local codes). These must be standardized to ensure compliance documentation is consistent. Without this, quotes cannot properly document regulatory compliance.

**Independent Test**: Admin views complete solutions catalog. Each solution has clear definition matching industry standards. Quotes can associate multiple solutions to glass types (many-to-many). No tenant can create custom solutions.

**Acceptance Scenarios**:

1. **Given** admin views solutions catalog, **When** reviewing solution "Control Solar", **Then** definition matches ISO 9050 solar control standards
2. **Given** user creates quote, **When** selecting glass with Low-E coating, **Then** "Control Solar" and "Eficiencia Energética" solutions are available
3. **Given** glass type has solution association, **When** generating quote PDF, **Then** solution appears in technical specifications section with standard description

---

### User Story 3 - Tenant-Specific Supplier Management (Priority: P2)

Each tenant maintains their own supplier catalog via existing CRUD operations. Tenants can add local distributors, negotiate custom pricing, and manage supplier relationships independently. Glass suppliers are NOT standardized because distribution networks vary by region.

**Why this priority**: Business flexibility. While glass types are universal (N70/38 is the same worldwide), suppliers are regional (Tecnoglass in Latin America, Guardian in USA, local distributors). Each tenant needs control over their supplier relationships.

**Independent Test**: Tenant A creates supplier "Vidrios Colombia SAS" with contact info. Tenant B cannot see Tenant A's suppliers. Both tenants reference the same standardized glass types but through different suppliers.

**Acceptance Scenarios**:

1. **Given** tenant admin logs in, **When** viewing suppliers, **Then** only their tenant's suppliers appear
2. **Given** tenant creates new supplier, **When** associating glass types, **Then** can select from standardized glass types catalog
3. **Given** tenant deletes supplier, **When** supplier has active quotes, **Then** system prevents deletion (referential integrity)

---

### User Story 4 - Schema Migration & Clean Slate (Priority: P1)

Database schema is cleaned of all deprecated fields and legacy data. Fresh start with 30 seeded Tecnoglass types and proper relational structure (GlassCharacteristic, GlassTypeSolution). App not in production allows complete schema refactoring without legacy constraints.

**Why this priority**: Clean architecture from start. No technical debt, no deprecated fields, no migration complexity. Foundation for production launch.

**Independent Test**: After migration, GlassType table has 30 seeded Tecnoglass records with clean schema (no deprecated fields). GlassCharacteristic has ~10-15 records. GlassTypeSolution has relationships defined. All models match final production schema.

**Acceptance Scenarios**:

1. **Given** schema migration runs, **When** inspecting GlassType table, **Then** deprecated fields do not exist (isTempered, isLaminated, isLowE, isTripleGlazed, purpose, glassSupplierId, pricePerSqm, sku removed)
2. **Given** seed script runs, **When** querying GlassType, **Then** exactly 30 Tecnoglass types exist with isSeeded=true and all technical specs populated
3. **Given** admin accesses glass type management, **When** viewing catalog, **Then** can create new custom types and see seeded types clearly marked

---

### Edge Cases

- **Migration edge case**: What happens when tenant has custom glass type name that conflicts with standard nomenclature (e.g., tenant called something "N70/38 Custom" but standard is "N70/38")?
  - **Resolution**: Migration script prefixes tenant custom types with "Legacy -" to preserve historical data
  
- **Supplier without glass types**: What happens when tenant creates supplier but doesn't associate any glass types?
  - **Resolution**: System allows empty associations. Supplier is valid for non-glass products (frames, hardware)
  
- **Deleted glass type with active quotes**: What happens if a seeded glass type needs to be removed (discontinued by manufacturers)?
  - **Resolution**: Soft delete pattern. Mark as `isActive: false` in seed data. Historical quotes still reference, but new quotes cannot select
  
- **Multi-tenant data isolation**: How to ensure Tenant A cannot access Tenant B's supplier pricing?
  - **Resolution**: Existing tenant isolation via tenantId foreign key on GlassSupplier remains unchanged

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a standardized catalog of glass types based on Tecnoglass, Vitro, and Guardian product lines (minimum 30 types covering Serie-R, Serie-N, and Solarban series)

- **FR-002**: System MUST include technical specifications for each glass type: visible light transmission (%), solar transmission (%), reflectance (exterior/interior), U-value (winter/summer), SHGC (Solar Heat Gain Coefficient), and LSG (Light to Solar Gain ratio)

- **FR-003**: System MUST provide a fixed taxonomy of glass solutions: Control Solar, Eficiencia Energética, Seguridad, Acústico, Privacidad, and Resistencia a Huracanes

- **FR-004**: System MUST seed 30 standard glass types from Tecnoglass during initial deployment (Serie-R, Serie-N, Solarban) marked with `isSeeded: true`

- **FR-005**: Admin users MUST have full CRUD capabilities for GlassType (create, read, update, delete) to manage custom types marked with `isSeeded: false`

- **FR-006**: GlassSolution MUST remain fully static (seed-only, no CRUD) as solutions are universal industry standards

- **FR-007**: System MUST seed ~10-15 GlassCharacteristic records (tempered, laminated, low-e, triple-glazed, acoustic, hurricane-resistant, etc.) and GlassTypeSolution relationships linking 30 Tecnoglass types to applicable solutions with performanceRating (basic/standard/good/very_good/excellent)

- **FR-008**: System MUST maintain existing GlassSupplier CRUD functionality for tenant-specific supplier management (create, read, update, delete suppliers)

- **FR-009**: Tenants MUST be able to associate their suppliers with glass types (both seeded and custom) via many-to-many relationship

- **FR-010**: System MUST delete all existing glass types from database (clean slate approach - app not in production) and start fresh with 30 seeded Tecnoglass types

- **FR-011**: System MUST remove all deprecated fields from GlassType model in schema migration (`isTempered`, `isLaminated`, `isLowE`, `isTripleGlazed`, `purpose` enum, `glassSupplierId`, `pricePerSqm`, `sku`, `glassSupplier` relation)

- **FR-012**: System MUST remove deprecated Manufacturer model entirely, migrating businessName/currency/quoteValidityDays to TenantConfig singleton

- **FR-013**: System MUST restrict GlassType, GlassCharacteristic, and GlassTypeSolution CRUD operations to users with role='admin' only. Sellers and users have read-only access for catalog browsing and quote creation

- **FR-009**: Quote forms MUST display glass types with nomenclature format: `[Code] - [Description]` (e.g., "N70/38 - Neutral Low-E, 72.7% visible transmission")

- **FR-010**: System MUST support soft delete for discontinued glass types (isActive flag) to preserve historical data while preventing new usage

### Key Entities *(include if feature involves data)*

- **GlassType (Static)**: Represents standardized glass products from manufacturers
  - Attributes: code (e.g., "N70/38"), name, series (Serie-R/Serie-N/Solarban), visible transmission %, solar transmission %, reflectance %, U-value, SHGC, LSG, substrate types, treatment (Low-E/Tempered/Laminated/Insulated), isActive status
  - Relationships: Many-to-many with GlassSolution, many-to-many with GlassSupplier (via tenant association)

- **GlassSolution (Static)**: Universal glass purposes aligned with building codes
  - Attributes: code (e.g., "SOLAR_CONTROL"), name (Spanish), description (technical definition), associated certifications (LEED, EDGE, ISO standards), isActive status
  - Relationships: Many-to-many with GlassType

- **GlassSupplier (Dynamic - Tenant-managed)**: Regional distributors and manufacturers
  - Attributes: tenantId, name, code, country, contactEmail, contactPhone, website, notes, isActive status
  - Relationships: Belongs to Tenant, many-to-many with GlassType (each tenant associates their suppliers with standard types)

- **GlassTypeGlassSolution (Static Join Table)**: Defines which solutions apply to which glass types
  - Attributes: glassTypeId, glassSolutionId
  - Managed via seed data, not tenant CRUD

- **TenantGlassSupplierType (Dynamic Join Table)**: Associates tenant suppliers with standard glass types
  - Attributes: tenantId, glassSupplierId, glassTypeId, customPricing (optional), notes
  - Managed via tenant CRUD

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All quotes reference glass types with accurate technical specifications matching manufacturer datasheets (100% accuracy for Tecnoglass Serie-N, Serie-R, and Solarban types)

- **SC-002**: Zero data loss during migration - all historical quotes maintain correct glass type references and render identically pre/post migration

- **SC-003**: Tenants can create and manage suppliers in under 2 minutes using existing CRUD interface (no regression in supplier management UX)

- **SC-004**: Glass type catalog loads in under 500ms and displays manufacturer-accurate technical specs for all 30+ standard types

- **SC-005**: System prevents creation of custom glass types, reducing support tickets related to incorrect glass specifications by 90%

- **SC-006**: Quote PDFs include standardized glass solution descriptions that match building code terminology (enabling faster permit approvals)

## Assumptions

1. **Industry standards are stable**: Glass type nomenclature (N70/38, R47/31, etc.) follows Tecnoglass/Vitro naming conventions which are industry-standard and unlikely to change frequently

2. **Manufacturer data is authoritative**: Technical specifications from Tecnoglass documentation (U-values, SHGC, transmission percentages) are accurate and certified

3. **Seed data updates are infrequent**: New glass types from manufacturers are released quarterly at most, allowing manual seed data updates via migrations

4. **Tenant suppliers are regional**: Each tenant operates in specific geographic markets and maintains relationships with local distributors, justifying tenant-specific supplier management

5. **English nomenclature with Spanish UI**: Glass type codes (N70/38, Serie-R) use English industry standard, but UI labels and descriptions are in Spanish for Latin American market

6. **Soft delete is sufficient**: Discontinued glass types can be marked inactive rather than hard deleted, preserving referential integrity for historical quotes

## Dependencies

1. **Tecnoglass product catalog**: Requires official technical datasheets for Serie-R, Serie-N, and Solarban products to populate seed data

2. **Existing GlassSupplier CRUD**: Must preserve current supplier management functionality (no breaking changes to supplier creation/editing)

3. **Quote model relationships**: QuoteItem model must support FK references to static glass types (may require migration to update FK constraints)

4. **Tenant isolation**: Existing tenantId-based data isolation must remain intact for GlassSupplier while GlassType becomes tenant-agnostic

5. **Prisma seed workflow**: Application must support seed scripts that run on deployment to populate static glass taxonomy

## Out of Scope

- Custom glass type creation by tenants (explicitly removed)
- Custom glass solution creation by tenants (explicitly removed)
- Real-time synchronization with manufacturer APIs (seed data updated manually)
- Multi-language support for glass type descriptions (Spanish only for MVP)
- Pricing management for glass types (pricing remains at supplier-tenant association level)
- Automated migration of legacy custom glass types (manual review required for non-standard types)
