# Feature Specification: Static Glass Taxonomy Based on Industry Standards

**Feature Branch**: `015-static-glass-taxonomy`  
**Created**: 2025-01-21  
**Status**: Draft  
**Input**: User description: "Convert GlassType and GlassSolution to static taxonomy based on industry standards. Tenants manage their own suppliers via CRUD."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Standardized Glass Types Catalog (Priority: P1)

When creating quotes, users select from a standardized catalog of glass types based on international norms (ISO, ASTM) and industry leaders (Tecnoglass, Vitro, Guardian). The glass types remain consistent across all tenants, ensuring pricing accuracy and technical specifications align with manufacturer standards.

**Why this priority**: Core value proposition. Without standardized glass types, quotes cannot reference accurate technical specifications (U-values, SHGC, visible light transmission) from manufacturers. This is the foundation for all glass-related calculations.

**Independent Test**: Admin can view complete glass type catalog with all technical specifications. When creating a quote, only industry-standard glass types appear in dropdowns. Changes to glass type data require system-level migration (not tenant CRUD).

**Acceptance Scenarios**:

1. **Given** admin views glass types catalog, **When** filtering by series (Serie-R, Serie-N, Solarban), **Then** all types from that series appear with technical specifications
2. **Given** user creates quote, **When** selecting glass type, **Then** dropdown shows only standardized types with nomenclature (e.g., "N70/38 - Neutral Low-E")
3. **Given** standardized glass type exists, **When** tenant tries to create custom glass type, **Then** system prevents creation (no CRUD for glass types)

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

### User Story 4 - Data Migration from Dynamic to Static (Priority: P1)

Existing glass types and solutions in the database are migrated to static seed data. Historical quotes maintain references to glass types via IDs that now point to seeded data instead of tenant-created records. No data loss occurs.

**Why this priority**: Zero downtime requirement. Cannot break existing quotes or client data during migration. This ensures business continuity.

**Independent Test**: Before migration, count of glass types and solutions matches after migration. Historical quotes still render correctly with all glass type technical specs intact. Tenant-specific suppliers remain unchanged.

**Acceptance Scenarios**:

1. **Given** production database has 50 tenant-created glass types, **When** migration runs, **Then** 50 seed records created with matching IDs (or ID mapping table created)
2. **Given** historical quote references glass type ID, **When** quote loads after migration, **Then** glass type displays with technical specs from seed data
3. **Given** migration completes, **When** attempting to create new glass type via old CRUD, **Then** UI/API returns "Glass types are now system-managed" error

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

- **FR-004**: Glass types and solutions MUST be seeded during application initialization and NOT be modifiable via tenant CRUD operations

- **FR-005**: System MUST maintain existing GlassSupplier CRUD functionality for tenant-specific supplier management (create, read, update, delete suppliers)

- **FR-006**: Tenants MUST be able to associate their suppliers with standardized glass types (many-to-many relationship)

- **FR-007**: System MUST migrate existing tenant-created glass types and solutions to seeded data without breaking historical quote references

- **FR-008**: System MUST prevent creation of new glass types or solutions via previous CRUD endpoints (return clear error message directing admins to request new types via support)

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
