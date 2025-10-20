---
goal: Normalize and enhance Glass data structure with suppliers, characteristics, and price history
version: 1.0
date_created: 2025-10-14
last_updated: 2025-10-14
owner: Database Architecture Team
status: Planned
tags: [refactor, data, migration, normalization, database]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This implementation plan addresses the normalization and enhancement of the Glass-related data structure in Glasify Lite. The current structure has several limitations including deprecated fields, rigid characteristic definitions, lack of supplier tracking, and no price history auditing. This refactor will introduce a flexible, extensible architecture that supports glass suppliers, dynamic characteristics, price history tracking, and improved catalog management.

## 1. Requirements & Constraints

### Business Requirements
- **REQ-001**: Glass types must be associated with their suppliers (Guardian, Saint-Gobain, Pilkington, etc.)
- **REQ-002**: Glass characteristics must be extensible without requiring schema migrations
- **REQ-003**: Price changes must be tracked with full audit trail (who, when, why)
- **REQ-004**: Glass types must support soft deletion (isActive flag) to maintain referential integrity
- **REQ-005**: System must support both legacy (boolean) and new (flexible) characteristic definitions during migration
- **REQ-006**: All glass technical properties must be queryable and filterable
- **REQ-007**: Maintain backward compatibility during migration phases

### Data Integrity Constraints
- **CON-001**: Existing QuoteItem references to GlassType must not break during migration
- **CON-002**: All existing glass data must be migrated without data loss
- **CON-003**: Boolean characteristics (isTempered, isLaminated, etc.) must be accurately converted to the new characteristic system
- **CON-004**: Price history must include an initial record for all existing glass types
- **CON-005**: Glass types without suppliers must be allowed (nullable glassSupplierId)

### Technical Constraints
- **CON-006**: Use Prisma ORM for all database operations
- **CON-007**: PostgreSQL database with support for complex queries
- **CON-008**: Migrations must be reversible with documented rollback procedures
- **CON-009**: Zero downtime deployment required (no breaking changes until final cleanup phase)
- **CON-010**: Must maintain TypeScript type safety throughout refactor

### Security Requirements
- **SEC-001**: Price history changes must track the user who made the modification (createdBy)
- **SEC-002**: Glass supplier contact information must be protected (no public API exposure)
- **SEC-003**: Only authorized users can modify glass characteristics and suppliers

### Architectural Guidelines
- **GUD-001**: Follow SOLID principles (Single Responsibility, Open/Closed for characteristics)
- **GUD-002**: Use Many-to-Many relationships for extensible associations
- **GUD-003**: Implement soft deletes over hard deletes where referential integrity matters
- **GUD-004**: Include comprehensive indexes for common query patterns
- **GUD-005**: Use semantic field naming (glassSupplierId not supplierId)

### Pattern to Follow
- **PAT-001**: Follow existing ProfileSupplier pattern for GlassSupplier implementation
- **PAT-002**: Follow existing ModelPriceHistory pattern for GlassTypePriceHistory
- **PAT-003**: Follow existing GlassTypeSolution pattern for GlassTypeCharacteristic
- **PAT-004**: Use factory pattern for seed data generation (see prisma/factories/)
- **PAT-005**: Migration phases must be incremental and non-breaking until final cleanup

## 2. Implementation Steps

### Implementation Phase 1: Create New Tables and Relationships

**GOAL-001**: Add new database tables (GlassSupplier, GlassCharacteristic, GlassTypeCharacteristic, GlassTypePriceHistory) without breaking existing functionality

| Task     | Description                                                                                                                                                          | Completed | Date |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-001 | Update `prisma/schema.prisma` to add GlassSupplier model with all fields (id, name, code, country, website, contactEmail, contactPhone, isActive, notes, timestamps) |           |      |
| TASK-002 | Update `prisma/schema.prisma` to add GlassCharacteristic model with fields (id, key, name, nameEs, description, category, isActive, sortOrder, timestamps)           |           |      |
| TASK-003 | Update `prisma/schema.prisma` to add GlassTypeCharacteristic pivot table with fields (id, glassTypeId, characteristicId, value, certification, notes, createdAt)     |           |      |
| TASK-004 | Update `prisma/schema.prisma` to add GlassTypePriceHistory model with fields (id, glassTypeId, pricePerSqm, reason, effectiveFrom, createdBy, createdAt)             |           |      |
| TASK-005 | Add indexes to GlassSupplier: [isActive], [code]                                                                                                                     |           |      |
| TASK-006 | Add indexes to GlassCharacteristic: [category], [isActive]                                                                                                           |           |      |
| TASK-007 | Add indexes to GlassTypeCharacteristic: [glassTypeId], [characteristicId], unique constraint on [glassTypeId, characteristicId]                                      |           |      |
| TASK-008 | Add indexes to GlassTypePriceHistory: [glassTypeId, effectiveFrom], [createdBy]                                                                                      |           |      |
| TASK-009 | Run `npx prisma format` to validate schema syntax                                                                                                                    |           |      |
| TASK-010 | Create Prisma migration: `npx prisma migrate dev --name add_glass_supplier_and_characteristics --create-only`                                                        |           |      |
| TASK-011 | Review generated SQL migration file for correctness                                                                                                                  |           |      |
| TASK-012 | Apply migration: `npx prisma migrate dev`                                                                                                                            |           |      |
| TASK-013 | Verify tables created successfully: `npx prisma studio`                                                                                                              |           |      |
| TASK-014 | Run `npx prisma generate` to regenerate Prisma Client with new models                                                                                                |           |      |

### Implementation Phase 2: Extend GlassType Model

**GOAL-002**: Add new fields to GlassType model while maintaining backward compatibility with existing boolean characteristics

| Task     | Description                                                                                                     | Completed | Date |
| -------- | --------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-015 | Update `prisma/schema.prisma` GlassType model: add glassSupplierId String? field with relation to GlassSupplier |           |      |
| TASK-016 | Update `prisma/schema.prisma` GlassType model: add sku String? @unique field                                    |           |      |
| TASK-017 | Update `prisma/schema.prisma` GlassType model: add description String? field                                    |           |      |
| TASK-018 | Update `prisma/schema.prisma` GlassType model: add solarFactor Decimal? @db.Decimal(4,2) field                  |           |      |
| TASK-019 | Update `prisma/schema.prisma` GlassType model: add lightTransmission Decimal? @db.Decimal(4,2) field            |           |      |
| TASK-020 | Update `prisma/schema.prisma` GlassType model: add isActive Boolean @default(true) field                        |           |      |
| TASK-021 | Update `prisma/schema.prisma` GlassType model: add lastReviewDate DateTime? field                               |           |      |
| TASK-022 | Update `prisma/schema.prisma` GlassType model: add relation fields for characteristics[] and priceHistory[]     |           |      |
| TASK-023 | Add indexes to GlassType: [glassSupplierId], [isActive], [thicknessMm], [sku]                                   |           |      |
| TASK-024 | Update comment on pricePerSqm field to reference TenantConfig currency                                          |           |      |
| TASK-025 | Run `npx prisma format` to validate changes                                                                     |           |      |
| TASK-026 | Create migration: `npx prisma migrate dev --name extend_glass_type_fields --create-only`                        |           |      |
| TASK-027 | Review and edit migration SQL if needed                                                                         |           |      |
| TASK-028 | Apply migration: `npx prisma migrate dev`                                                                       |           |      |
| TASK-029 | Run `npx prisma generate` to update Prisma Client                                                               |           |      |

### Implementation Phase 3: Create Seed Data and Factories

**GOAL-003**: Implement factory pattern for generating seed data for new tables (GlassSupplier, GlassCharacteristic)

| Task     | Description                                                                                                                                                | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-030 | Create `prisma/factories/glass-supplier.factory.ts` with GlassSupplierFactory class following existing factory pattern                                     |           |      |
| TASK-031 | Implement createGlassSupplier() method with faker data for common suppliers (Guardian, Saint-Gobain, Pilkington, AGC, Vitro)                               |           |      |
| TASK-032 | Create `prisma/factories/glass-characteristic.factory.ts` with GlassCharacteristicFactory class                                                            |           |      |
| TASK-033 | Implement createGlassCharacteristic() method with predefined characteristics (tempered, laminated, low_e, triple_glazed, acoustic, solar_control, privacy) |           |      |
| TASK-034 | Create `prisma/seeders/glass-supplier.seeder.ts` following existing seeder pattern                                                                         |           |      |
| TASK-035 | Implement seed() method to create 5-10 common glass suppliers with realistic data                                                                          |           |      |
| TASK-036 | Create `prisma/seeders/glass-characteristic.seeder.ts`                                                                                                     |           |      |
| TASK-037 | Implement seed() method to create all standard glass characteristics grouped by category (safety, thermal, acoustic, coating)                              |           |      |
| TASK-038 | Update `prisma/seed-tenant.ts` to import and execute glass supplier seeder                                                                                 |           |      |
| TASK-039 | Update `prisma/seed-tenant.ts` to import and execute glass characteristic seeder                                                                           |           |      |
| TASK-040 | Run seed: `npx tsx prisma/seed-tenant.ts` and verify data in Prisma Studio                                                                                 |           |      |
| TASK-041 | Add JSDoc comments to all factory methods explaining parameters and return types                                                                           |           |      |

### Implementation Phase 4: Migrate Existing Data

**GOAL-004**: Migrate existing glass data to new structure including boolean characteristics to GlassTypeCharacteristic and initial price history

| Task     | Description                                                                                            | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------ | --------- | ---- |
| TASK-042 | Create `scripts/migrate-glass-characteristics.ts` script                                               |           |      |
| TASK-043 | Implement logic to read all GlassType records with isTempered = true                                   |           |      |
| TASK-044 | Create GlassTypeCharacteristic records linking to 'tempered' characteristic                            |           |      |
| TASK-045 | Repeat for isLaminated, isLowE, isTripleGlazed characteristics                                         |           |      |
| TASK-046 | Add error handling and transaction support to migration script                                         |           |      |
| TASK-047 | Add progress logging (e.g., "Migrated 50/100 glass types")                                             |           |      |
| TASK-048 | Create `scripts/create-initial-price-history.ts` script                                                |           |      |
| TASK-049 | Implement logic to create initial GlassTypePriceHistory record for each existing GlassType             |           |      |
| TASK-050 | Set effectiveFrom to GlassType.createdAt, reason to 'Initial price record from migration'              |           |      |
| TASK-051 | Add dry-run mode to both scripts (--dry-run flag)                                                      |           |      |
| TASK-052 | Run migration scripts in dry-run mode and validate output                                              |           |      |
| TASK-053 | Run migration scripts for real: `npx tsx scripts/migrate-glass-characteristics.ts`                     |           |      |
| TASK-054 | Run migration scripts for real: `npx tsx scripts/create-initial-price-history.ts`                      |           |      |
| TASK-055 | Verify migrated data in Prisma Studio (check GlassTypeCharacteristic and GlassTypePriceHistory tables) |           |      |

### Implementation Phase 5: Update Application Code

**GOAL-005**: Refactor tRPC procedures, services, and components to use new glass structure while maintaining backward compatibility

| Task     | Description                                                                                                                  | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-056 | Update `src/server/api/routers/catalog.ts` to include glassSupplier in 'list-models' query                                   |           |      |
| TASK-057 | Update catalog list query to include characteristics relationship with nested characteristic data                            |           |      |
| TASK-058 | Create new tRPC procedure 'catalog.list-glass-suppliers' in catalog router                                                   |           |      |
| TASK-059 | Create new tRPC procedure 'catalog.list-glass-characteristics' with category filter support                                  |           |      |
| TASK-060 | Create new tRPC procedure 'catalog.get-glass-price-history' with glassTypeId input                                           |           |      |
| TASK-061 | Update `src/types/glass.ts` (or create if needed) with GlassSupplier, GlassCharacteristic types                              |           |      |
| TASK-062 | Create `src/app/(public)/catalog/_components/glass-characteristics-badge.tsx` component to display characteristics as badges |           |      |
| TASK-063 | Update catalog grid/card components to show glass supplier name                                                              |           |      |
| TASK-064 | Update catalog filter bar to add glass supplier filter dropdown                                                              |           |      |
| TASK-065 | Create admin form component for managing glass characteristics (if admin panel exists)                                       |           |      |
| TASK-066 | Update quote calculation logic to use new glass structure (if affected)                                                      |           |      |
| TASK-067 | Add isActive filter to all glass queries (exclude inactive by default)                                                       |           |      |
| TASK-068 | Update seed scripts to set glassSupplierId for existing glass types (assign to default supplier or leave null)               |           |      |

### Implementation Phase 6: Testing and Validation

**GOAL-006**: Comprehensive testing of new glass structure including unit tests, integration tests, and E2E tests

| Task     | Description                                                                                                | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-069 | Create `tests/unit/glass-supplier.factory.test.ts` to test factory methods                                 |           |      |
| TASK-070 | Create `tests/unit/glass-characteristic.factory.test.ts` to test factory methods                           |           |      |
| TASK-071 | Create `tests/integration/catalog-glass-filters.test.ts` to test filtering by supplier and characteristics |           |      |
| TASK-072 | Create `tests/contract/catalog-router-glass.test.ts` to test new tRPC procedures                           |           |      |
| TASK-073 | Update existing catalog E2E tests in `e2e/catalog/` to verify glass supplier display                       |           |      |
| TASK-074 | Create `e2e/catalog/glass-characteristics-filter.spec.ts` for characteristic filtering                     |           |      |
| TASK-075 | Test price history retrieval with multiple price changes                                                   |           |      |
| TASK-076 | Test soft delete (isActive = false) on glass types and verify they don't appear in catalog                 |           |      |
| TASK-077 | Test backward compatibility: verify existing quotes still reference correct glass types                    |           |      |
| TASK-078 | Run full test suite: `pnpm test` and fix any failures                                                      |           |      |
| TASK-079 | Run E2E tests: `pnpm test:e2e` and fix any failures                                                        |           |      |
| TASK-080 | Perform manual testing in development environment                                                          |           |      |

### Implementation Phase 7: Documentation and Cleanup

**GOAL-007**: Document new structure, update API documentation, and prepare for deprecated field removal in future version

| Task     | Description                                                                                           | Completed | Date |
| -------- | ----------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-081 | Update `docs/architecture.md` to document new glass data structure                                    |           |      |
| TASK-082 | Create ERD diagram showing relationships between GlassType, GlassSupplier, GlassCharacteristic tables |           |      |
| TASK-083 | Update API documentation for new tRPC procedures (if API docs exist)                                  |           |      |
| TASK-084 | Create `docs/migrations/glass-structure-migration-guide.md` with step-by-step migration process       |           |      |
| TASK-085 | Document rollback procedure in migration guide                                                        |           |      |
| TASK-086 | Add @deprecated JSDoc comments to isTempered, isLaminated, isLowE, isTripleGlazed fields in schema    |           |      |
| TASK-087 | Add @deprecated JSDoc comment to purpose field in GlassType model                                     |           |      |
| TASK-088 | Create GitHub issue or task for Phase 8 (removal of deprecated fields) scheduled for v2.0             |           |      |
| TASK-089 | Update CHANGELOG.md with new features and migration notes                                             |           |      |
| TASK-090 | Create PR with title "refactor: normalize glass data structure with suppliers and characteristics"    |           |      |

### Implementation Phase 8: Deprecated Field Removal (Future - v2.0)

**GOAL-008**: Remove deprecated fields (purpose, isTempered, isLaminated, isLowE, isTripleGlazed) after validation period

| Task     | Description                                                                                             | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-091 | Verify no application code references deprecated boolean fields (grep search)                           |           |      |
| TASK-092 | Verify all glass types have at least one characteristic assigned                                        |           |      |
| TASK-093 | Create migration to drop purpose column from GlassType: `ALTER TABLE "GlassType" DROP COLUMN "purpose"` |           |      |
| TASK-094 | Create migration to drop isTempered column: `ALTER TABLE "GlassType" DROP COLUMN "isTempered"`          |           |      |
| TASK-095 | Create migration to drop isLaminated column: `ALTER TABLE "GlassType" DROP COLUMN "isLaminated"`        |           |      |
| TASK-096 | Create migration to drop isLowE column: `ALTER TABLE "GlassType" DROP COLUMN "isLowE"`                  |           |      |
| TASK-097 | Create migration to drop isTripleGlazed column: `ALTER TABLE "GlassType" DROP COLUMN "isTripleGlazed"`  |           |      |
| TASK-098 | Remove GlassPurpose enum from schema if no longer used                                                  |           |      |
| TASK-099 | Update Prisma schema to remove deprecated field definitions                                             |           |      |
| TASK-100 | Run `npx prisma migrate dev --name remove_deprecated_glass_fields`                                      |           |      |
| TASK-101 | Update documentation to reflect final structure                                                         |           |      |
| TASK-102 | Tag release as v2.0 with breaking changes noted                                                         |           |      |

## 3. Alternatives

### Alternative Approaches Considered

- **ALT-001**: Keep boolean characteristics and add GlassCharacteristic as optional enhancement
  - **Reason Not Chosen**: Dual system would create confusion and maintenance burden. Migration complexity similar, but end result less clean.

- **ALT-002**: Use JSONB column for characteristics instead of Many-to-Many table
  - **Reason Not Chosen**: JSONB loses type safety, harder to query/filter, no referential integrity for characteristic catalog.

- **ALT-003**: Embed supplier information directly in GlassType (denormalized)
  - **Reason Not Chosen**: Violates normalization principles, causes data duplication, makes supplier updates difficult.

- **ALT-004**: Use single "Property" table for all glass attributes (EAV pattern)
  - **Reason Not Chosen**: EAV pattern reduces query performance, loses type safety, harder to understand schema.

- **ALT-005**: Keep price history in application logs instead of database table
  - **Reason Not Chosen**: Logs are not queryable, not integrated with data model, harder to generate reports/analytics.

## 4. Dependencies

### External Dependencies
- **DEP-001**: Prisma ORM v6.16.2 (already installed)
- **DEP-002**: PostgreSQL database with uuid and timestamp support (already configured)
- **DEP-003**: TypeScript v5.8.2 for type safety (already installed)
- **DEP-004**: Faker.js for factory seed data generation (check if installed in devDependencies)

### Internal Dependencies
- **DEP-005**: TenantConfig must exist and be populated (for currency reference)
- **DEP-006**: User model must exist (for priceHistory.createdBy reference)
- **DEP-007**: Existing factory pattern in `prisma/factories/` (for consistency)
- **DEP-008**: Existing seeder pattern in `prisma/seeders/` (for consistency)
- **DEP-009**: tRPC router setup in `src/server/api/routers/catalog.ts`

### Migration Dependencies
- **DEP-010**: All existing GlassType records must have non-null pricePerSqm values
- **DEP-011**: Database must be in clean state (no pending migrations) before starting
- **DEP-012**: Backup of production database before applying migrations

## 5. Files

### Schema and Migration Files
- **FILE-001**: `prisma/schema.prisma` - Add 4 new models and extend GlassType model
- **FILE-002**: `prisma/migrations/YYYYMMDDHHMMSS_add_glass_supplier_and_characteristics/migration.sql` - Generated migration
- **FILE-003**: `prisma/migrations/YYYYMMDDHHMMSS_extend_glass_type_fields/migration.sql` - Generated migration
- **FILE-004**: `prisma/migrations/YYYYMMDDHHMMSS_remove_deprecated_glass_fields/migration.sql` - Future cleanup migration

### Factory and Seeder Files
- **FILE-005**: `prisma/factories/glass-supplier.factory.ts` - Factory for creating glass suppliers
- **FILE-006**: `prisma/factories/glass-characteristic.factory.ts` - Factory for creating characteristics
- **FILE-007**: `prisma/seeders/glass-supplier.seeder.ts` - Seeder for initial suppliers
- **FILE-008**: `prisma/seeders/glass-characteristic.seeder.ts` - Seeder for standard characteristics
- **FILE-009**: `prisma/seed-tenant.ts` - Update to include new seeders

### Migration Scripts
- **FILE-010**: `scripts/migrate-glass-characteristics.ts` - Script to migrate boolean fields to characteristics
- **FILE-011**: `scripts/create-initial-price-history.ts` - Script to create initial price history records

### Application Code Files
- **FILE-012**: `src/server/api/routers/catalog.ts` - Update queries and add new procedures
- **FILE-013**: `src/types/glass.ts` - Type definitions for glass-related entities
- **FILE-014**: `src/app/(public)/catalog/_components/glass-characteristics-badge.tsx` - New component for displaying characteristics
- **FILE-015**: `src/app/(public)/catalog/_components/catalog-grid.tsx` - Update to show supplier info
- **FILE-016**: `src/app/(public)/catalog/_components/catalog-filter-bar.tsx` - Update to add supplier filter

### Test Files
- **FILE-017**: `tests/unit/glass-supplier.factory.test.ts` - Unit tests for supplier factory
- **FILE-018**: `tests/unit/glass-characteristic.factory.test.ts` - Unit tests for characteristic factory
- **FILE-019**: `tests/integration/catalog-glass-filters.test.ts` - Integration tests for filtering
- **FILE-020**: `tests/contract/catalog-router-glass.test.ts` - Contract tests for tRPC procedures
- **FILE-021**: `e2e/catalog/glass-characteristics-filter.spec.ts` - E2E test for characteristic filtering

### Documentation Files
- **FILE-022**: `docs/migrations/glass-structure-migration-guide.md` - Comprehensive migration guide
- **FILE-023**: `docs/architecture.md` - Update with new data structure documentation
- **FILE-024**: `docs/migrations/glass-structure-improvements-plan.md` - This plan document (already exists)
- **FILE-025**: `docs/migrations/glass-structure-comparison.md` - Before/after comparison (already exists)
- **FILE-026**: `CHANGELOG.md` - Update with migration notes

## 6. Testing

### Unit Tests
- **TEST-001**: Test GlassSupplierFactory.createGlassSupplier() generates valid supplier data
- **TEST-002**: Test GlassCharacteristicFactory.createGlassCharacteristic() generates valid characteristic data
- **TEST-003**: Test characteristic factory creates characteristics with correct categories (safety, thermal, acoustic, coating)
- **TEST-004**: Test factory-generated data passes Zod validation schemas

### Integration Tests
- **TEST-005**: Test catalog query includes glass supplier relationship correctly
- **TEST-006**: Test catalog query includes characteristics relationship with nested data
- **TEST-007**: Test filtering glass types by supplier code (e.g., 'GRD' for Guardian)
- **TEST-008**: Test filtering glass types by characteristic key (e.g., 'tempered')
- **TEST-009**: Test filtering glass types by multiple characteristics (AND condition)
- **TEST-010**: Test isActive filter excludes inactive glass types from catalog
- **TEST-011**: Test price history query returns records in descending order by effectiveFrom

### Contract Tests (tRPC)
- **TEST-012**: Test 'catalog.list-glass-suppliers' returns suppliers with correct schema
- **TEST-013**: Test 'catalog.list-glass-characteristics' returns characteristics grouped by category
- **TEST-014**: Test 'catalog.get-glass-price-history' with valid glassTypeId returns history array
- **TEST-015**: Test 'catalog.get-glass-price-history' with invalid ID returns empty array or error
- **TEST-016**: Test catalog list procedures respect isActive filter by default

### E2E Tests (Playwright)
- **TEST-017**: Test user can view glass supplier name in catalog card
- **TEST-018**: Test user can filter catalog by glass supplier dropdown
- **TEST-019**: Test user can see characteristics displayed as badges on glass type cards
- **TEST-020**: Test user can filter catalog by selecting characteristics (if UI implemented)
- **TEST-021**: Test admin can view price history for a glass type (if admin panel exists)
- **TEST-022**: Test inactive glass types do not appear in public catalog

### Migration Tests
- **TEST-023**: Test migrate-glass-characteristics script creates correct number of GlassTypeCharacteristic records
- **TEST-024**: Test migrate-glass-characteristics script dry-run mode doesn't modify database
- **TEST-025**: Test create-initial-price-history script creates one record per GlassType
- **TEST-026**: Test price history effectiveFrom dates match original GlassType.createdAt

### Regression Tests
- **TEST-027**: Test existing quotes still load correctly with glass type references
- **TEST-028**: Test quote calculation still works with migrated glass types
- **TEST-029**: Test cart functionality still works with migrated glass types

## 7. Risks & Assumptions

### Risks

- **RISK-001**: **Data Migration Failure** - Migration scripts fail mid-execution leaving inconsistent state
  - **Mitigation**: Use database transactions, implement rollback procedures, test on copy of production data
  - **Severity**: High
  - **Likelihood**: Low

- **RISK-002**: **Performance Degradation** - Many-to-Many queries slow down catalog loading
  - **Mitigation**: Add strategic indexes, implement pagination, use select/include optimization, monitor query performance
  - **Severity**: Medium
  - **Likelihood**: Medium

- **RISK-003**: **Breaking Changes** - Existing code references removed fields causing runtime errors
  - **Mitigation**: Comprehensive grep search before removal, TypeScript compile-time checks, phased deprecation
  - **Severity**: High
  - **Likelihood**: Low

- **RISK-004**: **Incomplete Data** - Some glass types missing characteristics after migration
  - **Mitigation**: Validation scripts, manual review in Prisma Studio, default characteristics for edge cases
  - **Severity**: Medium
  - **Likelihood**: Medium

- **RISK-005**: **User Confusion** - UI changes confuse users familiar with old structure
  - **Mitigation**: Gradual UI rollout, user documentation, training materials
  - **Severity**: Low
  - **Likelihood**: Medium

### Assumptions

- **ASSUMPTION-001**: All glass types currently have at least one boolean characteristic set to true (can be converted)
- **ASSUMPTION-002**: Glass supplier information can be manually added post-migration (not critical for launch)
- **ASSUMPTION-003**: Users will benefit from enhanced filtering capabilities (justifies complexity)
- **ASSUMPTION-004**: Performance impact of additional joins is acceptable given hardware/infrastructure
- **ASSUMPTION-005**: No glass types need more than 10 characteristics simultaneously
- **ASSUMPTION-006**: Price changes are infrequent enough that history table won't grow excessively
- **ASSUMPTION-007**: TenantConfig currency is already set up and used for all prices
- **ASSUMPTION-008**: Database has sufficient storage for new tables and indexes

## 8. Related Specifications / Further Reading

### Internal Documentation
- [Glass Structure Improvements Plan](../docs/migrations/glass-structure-improvements-plan.md) - Detailed technical proposal
- [Glass Structure Comparison](../docs/migrations/glass-structure-comparison.md) - Before/after visual comparison
- [Architecture Documentation](../docs/architecture.md) - Overall system architecture
- [Cleanup Deprecated Fields Migration](../docs/migrations/cleanup-deprecated-fields-migration.md) - Related cleanup work

### Similar Implementation Patterns
- [Feature: Glass Solutions Many-to-Many](./feature-glass-solutions-many-to-many-1.md) - Reference for Many-to-Many pattern
- [Refactor: Manufacturer to Tenant Config](./refactor-manufacturer-to-tenant-config-1.md) - Similar migration pattern
- [Refactor: Seeders Factory Pattern](./refactor-seeders-factory-pattern-1.md) - Factory pattern reference

### External Resources
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Many-to-Many Relationships](https://www.postgresql.org/docs/current/tutorial-join.html)
- [Database Normalization Best Practices](https://en.wikipedia.org/wiki/Database_normalization)
- [Soft Delete Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/soft-delete)
- [Audit Trail Implementation](https://martinfowler.com/eaaDev/AuditLog.html)
