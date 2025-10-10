---
goal: Refactor Manufacturer Model to Tenant Configuration Singleton and Profile Supplier Entity
version: 1.0
date_created: 2025-10-10
last_updated: 2025-10-10
owner: Andeveling
status: 'Planned'
tags: [refactor, architecture, database, migration, breaking-change]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This implementation plan addresses a critical conceptual error in the current database architecture. The `Manufacturer` model is incorrectly used to represent **profile suppliers** (Rehau, Deceuninck, Azembla) when it should represent the **tenant configuration** (the carpentry shop owner using the application).

## Current Problem

The existing `Manufacturer` model has dual responsibility:
1. **Incorrectly**: Storing multiple profile supplier records (Rehau, Deceuninck, etc.)
2. **Should be**: Singleton tenant configuration (currency, quote validity, locale, timezone)

## Correct Architecture

```
TenantConfig (1 singleton record)
  ├── businessName: "Carpintería El Sol"
  ├── currency: "COP"
  ├── quoteValidityDays: 15
  ├── locale: "es-CO"
  └── timezone: "America/Bogota"

ProfileSupplier (many records)
  ├── Rehau (PVC)
  ├── Deceuninck (PVC)
  ├── Azembla (Aluminum)
  └── Aluflex (Aluminum)

Model (Window/Door products)
  ├── profileSupplierId: "rehau-abc123"
  ├── name: "Ventana Corredera 2 Hojas"
  └── ...
```

## 1. Requirements & Constraints

- **REQ-001**: Rename `Manufacturer` model to `TenantConfig` representing single tenant configuration
- **REQ-002**: Create new `ProfileSupplier` model to represent profile manufacturers (Rehau, Deceuninck, etc.)
- **REQ-003**: Ensure `TenantConfig` is a singleton (only 1 record allowed in database)
- **REQ-004**: Migrate all existing `Manufacturer` references to `ProfileSupplier`
- **REQ-005**: Preserve all existing data during migration (zero data loss)
- **REQ-006**: Update all tRPC routers, services, and UI components
- **REQ-007**: Maintain backward compatibility during migration phase
- **REQ-008**: Update seed scripts to reflect new architecture
- **REQ-009**: Generate TypeScript types automatically from new Prisma schema
- **REQ-010**: Update all E2E and unit tests to use new models

- **SEC-001**: Ensure tenant configuration cannot be deleted (protected singleton)
- **SEC-002**: Validate only one `TenantConfig` record exists at schema level
- **SEC-003**: Prevent cascade deletion of critical business data

- **CON-001**: Must use Prisma migrations for schema changes
- **CON-002**: Migration must be reversible (rollback strategy required)
- **CON-003**: Zero downtime migration (use multi-step deployment)
- **CON-004**: Current PostgreSQL database constraints apply
- **CON-005**: TypeScript strict mode must remain enabled

- **GUD-001**: Follow SOLID principles (Single Responsibility)
- **GUD-002**: Use Atomic Design pattern for component updates
- **GUD-003**: Maintain tRPC type-safety end-to-end
- **GUD-004**: Use Zod validation schemas consistently
- **GUD-005**: Follow Next.js 15 App Router conventions

- **PAT-001**: Use transaction-based data migration scripts
- **PAT-002**: Implement database constraints for singleton enforcement
- **PAT-003**: Use Prisma schema deprecation comments during transition
- **PAT-004**: Create comprehensive rollback migration script

## 2. Implementation Steps

### Implementation Phase 1: Schema Design & Migration Preparation

- GOAL-001: Design new Prisma schema with `TenantConfig` and `ProfileSupplier` models

| Task     | Description                                                                                                           | Completed | Date       |
| -------- | --------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-001 | Create new `TenantConfig` model in `prisma/schema.prisma` with singleton constraint                                   | ✅         | 2025-10-10 |
| TASK-002 | Create new `ProfileSupplier` model with fields: id, name, materialType (PVC/Aluminum), isActive, createdAt, updatedAt | ✅         | 2025-10-10 |
| TASK-003 | Add `profileSupplierId` foreign key to `Model` table                                                                  | ✅         | 2025-10-10 |
| TASK-004 | Add deprecation comments to old `Manufacturer` model                                                                  | ✅         | 2025-10-10 |
| TASK-005 | Update `User` model to reference `TenantConfig` instead of `Manufacturer`                                             | ✅         | 2025-10-10 |
| TASK-006 | Remove `manufacturerId` from `Quote`, `Model`, `GlassType`, `Service` tables                                          | ✅         | 2025-10-10 |
| TASK-007 | Add `@@unique` constraint to `TenantConfig` to enforce singleton pattern                                              | ✅         | 2025-10-10 |
| TASK-008 | Validate schema with `pnpm prisma validate`                                                                           | ✅         | 2025-10-10 |

### Implementation Phase 2: Data Migration Scripts

- GOAL-002: Create migration scripts to transform existing data safely

| Task     | Description                                                                                      | Completed | Date       |
| -------- | ------------------------------------------------------------------------------------------------ | --------- | ---------- |
| TASK-009 | Create Prisma migration: `pnpm prisma migrate dev --name refactor_manufacturer_to_tenant_config` | ✅         | 2025-10-10 |
| TASK-010 | Create TypeScript data migration script `scripts/migrate-manufacturer-to-tenant.ts`              | ✅         | 2025-10-10 |
| TASK-011 | Implement logic to convert first `Manufacturer` record to `TenantConfig` singleton               | ✅         | 2025-10-10 |
| TASK-012 | Implement logic to convert remaining `Manufacturer` records to `ProfileSupplier`                 | ✅         | 2025-10-10 |
| TASK-013 | Update all `Model.manufacturerId` references to `Model.profileSupplierId`                        | ✅         | 2025-10-10 |
| TASK-014 | Create rollback migration script `scripts/rollback-tenant-config.ts`                             | ✅         | 2025-10-10 |
| TASK-015 | Test migration on local database copy with production-like data                                  | ✅         | 2025-10-10 |
| TASK-016 | Validate data integrity post-migration (row counts, foreign keys)                                | ✅         | 2025-10-10 |

### Phase 3: tRPC Router Updates
**Status**: 🔄 IN PROGRESS  
**Estimated Time**: 3 hours  
**Dependencies**: Phase 2 complete

**Goal**: Update all tRPC routers to use TenantConfig and ProfileSupplier instead of Manufacturer.

- [x] **TASK-014**: Create utility functions in `src/server/utils/tenant.ts` for accessing TenantConfig
  - [x] `getTenantConfig()` - Get full TenantConfig (updated with transaction support)
  - [x] `getTenantCurrency()` - Get currency field (updated with transaction support)
  - [x] `getQuoteValidityDays()` - Get validity days (updated with transaction support)
- [x] **TASK-015**: Create Zod validation schemas for new models
  - [x] `src/server/schemas/tenant.schema.ts` - TenantConfig schemas
  - [x] `src/server/schemas/supplier.schema.ts` - ProfileSupplier schemas
- [x] **TASK-016**: Create `src/server/api/routers/admin/tenant-config.ts` with CRUD procedures
- [x] **TASK-017**: Create `src/server/api/routers/admin/profile-supplier.ts` with CRUD procedures
- [x] **TASK-018**: Update `src/server/api/routers/admin/admin.ts` to use ProfileSupplier instead of Manufacturer
- [x] **TASK-019**: Update catalog schemas in `src/server/api/routers/catalog/catalog.schemas.ts`
  - [x] Updated `glassTypeOutput` to have nullable manufacturerId and optional profileSupplierId
  - [x] Updated `serviceOutput` to have nullable manufacturerId
- [x] **TASK-020**: Update tenant utilities to support transaction clients
  - [x] Added optional `client` parameter to all tenant utility functions
  - [x] Functions now work with both standalone and transaction contexts
- [x] **TASK-021**: Update `src/server/api/routers/quote/quote.ts` to use TenantConfig (PARTIAL)
  - [x] Added imports for `getTenantCurrency` and `getQuoteValidityDays`
  - [x] Updated quote creation to use tenant utilities instead of model.manufacturer
  - [ ] Fix remaining manufacturer references in quote procedures (IN PROGRESS)

### Implementation Phase 4: Service Layer Updates

- GOAL-004: Update business logic services to use new architecture

| Task     | Description                                                                     | Completed | Date |
| -------- | ------------------------------------------------------------------------------- | --------- | ---- |
| TASK-025 | Update `src/server/services/email.ts` to fetch `TenantConfig` for business name |           |      |
| TASK-026 | Create utility function `getTenantConfig()` in `src/server/utils/tenant.ts`     |           |      |
| TASK-027 | Update quote calculation logic to use `TenantConfig.currency`                   |           |      |
| TASK-028 | Update all currency formatting to use tenant currency setting                   |           |      |
| TASK-029 | Remove `manufacturerId` parameter from all service function signatures          |           |      |

### Implementation Phase 5: UI Component Updates

- GOAL-005: Update React components and forms to use new models

| Task     | Description                                                                                             | Completed | Date |
| -------- | ------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-030 | Update `src/app/(dashboard)/_components/model-form.tsx` to use `ProfileSupplier` selector               |           |      |
| TASK-031 | Update `src/app/(dashboard)/models/page.tsx` to display `ProfileSupplier` name                          |           |      |
| TASK-032 | Update `src/app/(public)/catalog/_components/organisms/model-filter.tsx` for profile supplier filtering |           |      |
| TASK-033 | Update `src/app/(public)/catalog/_utils/catalog.utils.ts` to map `profileSupplier` field                |           |      |
| TASK-034 | Update `src/app/(public)/catalog/[modelId]/_utils/adapters.ts` to use `model.profileSupplier.name`      |           |      |
| TASK-035 | Remove all `manufacturer` prop references from `CatalogGrid` and `ModelCard` components                 |           |      |
| TASK-036 | Create admin UI for `TenantConfig` management at `src/app/(dashboard)/settings/tenant/page.tsx`         |           |      |
| TASK-037 | Create admin UI for `ProfileSupplier` CRUD at `src/app/(dashboard)/settings/suppliers/page.tsx`         |           |      |

### Implementation Phase 6: Type Definitions & Validation

- GOAL-006: Update TypeScript types and Zod schemas

| Task     | Description                                                                                   | Completed | Date |
| -------- | --------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-038 | Update `src/types/quote.types.ts` to remove `InconsistentManufacturer` error                  |           |      |
| TASK-039 | Update `src/app/(public)/catalog/[modelId]/_types/model.types.ts` to use `profileSupplier`    |           |      |
| TASK-040 | Generate Prisma Client types: `pnpm prisma generate`                                          |           |      |
| TASK-041 | Update all type imports from `Manufacturer` to `TenantConfig` and `ProfileSupplier`           |           |      |
| TASK-042 | Create Zod schema for `TenantConfig` validation in `src/server/schemas/tenant.schema.ts`      |           |      |
| TASK-043 | Create Zod schema for `ProfileSupplier` validation in `src/server/schemas/supplier.schema.ts` |           |      |
| TASK-044 | Run TypeScript type check: `pnpm typecheck`                                                   |           |      |

### Implementation Phase 7: Testing & Validation

- GOAL-007: Update all tests to use new architecture

| Task     | Description                                                             | Completed | Date |
| -------- | ----------------------------------------------------------------------- | --------- | ---- |
| TASK-045 | Update `src/tests/setup.ts` to seed `TenantConfig` singleton            |           |      |
| TASK-046 | Update test fixtures to use `ProfileSupplier` instead of `Manufacturer` |           |      |
| TASK-047 | Update unit tests in `tests/unit/` for services using new models        |           |      |
| TASK-048 | Update contract tests in `tests/contract/` for tRPC routers             |           |      |
| TASK-049 | Update E2E tests in `e2e/catalog/` to verify profile supplier filtering |           |      |
| TASK-050 | Update E2E tests in `e2e/quote/` to verify tenant configuration usage   |           |      |
| TASK-051 | Run all tests: `pnpm test && pnpm test:e2e`                             |           |      |
| TASK-052 | Verify zero test failures before merging                                |           |      |

### Implementation Phase 8: Seed Scripts & Documentation

- GOAL-008: Update seed scripts and project documentation

| Task     | Description                                                                              | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-053 | Update `prisma/seed.ts` to create `TenantConfig` singleton                               |           |      |
| TASK-054 | Update `prisma/seed.ts` to create `ProfileSupplier` records (Rehau, Deceuninck, Azembla) |           |      |
| TASK-055 | Update `prisma/seed.ts` to link `Model` records to `ProfileSupplier`                     |           |      |
| TASK-056 | Update `prisma/seed-solutions.ts` if affected                                            |           |      |
| TASK-057 | Run seed script: `pnpm db:seed` and verify data                                          |           |      |
| TASK-058 | Update `docs/architecture.md` to document new tenant architecture                        |           |      |
| TASK-059 | Update `docs/prd.md` to reflect new business domain model                                |           |      |
| TASK-060 | Create `docs/migrations/manufacturer-to-tenant-migration.md` guide                       |           |      |

### Implementation Phase 9: Deployment & Rollback Strategy

- GOAL-009: Prepare production deployment and rollback procedures

| Task     | Description                                                                  | Completed | Date |
| -------- | ---------------------------------------------------------------------------- | --------- | ---- |
| TASK-061 | Create database backup before migration: `pg_dump glasify_lite > backup.sql` |           |      |
| TASK-062 | Test migration on staging environment with production data copy              |           |      |
| TASK-063 | Document rollback procedure in `docs/migrations/rollback-procedure.md`       |           |      |
| TASK-064 | Create monitoring alerts for migration validation queries                    |           |      |
| TASK-065 | Run Ultracite linting: `pnpm lint:fix`                                       |           |      |
| TASK-066 | Run final type check: `pnpm typecheck`                                       |           |      |
| TASK-067 | Deploy to production with migration                                          |           |      |
| TASK-068 | Verify production data integrity post-deployment                             |           |      |

## 3. Alternatives

- **ALT-001**: Keep `Manufacturer` name but add `type` field (`tenant` | `supplier`) - **Rejected**: Violates Single Responsibility Principle, creates confusion
- **ALT-002**: Use polymorphic association with single table inheritance - **Rejected**: Overly complex for this use case, harder to maintain
- **ALT-003**: Create `BusinessConfig` instead of `TenantConfig` - **Rejected**: Less clear naming, "Tenant" is industry standard for SaaS architecture
- **ALT-004**: Add `isTenant` boolean flag to existing `Manufacturer` - **Rejected**: Does not solve conceptual confusion, leads to technical debt
- **ALT-005**: Keep current structure and rename in UI only - **Rejected**: Does not fix underlying data model issues

## 4. Dependencies

- **DEP-001**: Prisma ORM `6.16.2` for schema migrations and data access
- **DEP-002**: PostgreSQL database with migration support
- **DEP-003**: tRPC `11.0.0` for type-safe API updates
- **DEP-004**: Zod `4.1.1` for runtime validation schemas
- **DEP-005**: Next.js `15.2.3` for UI routing and server components
- **DEP-006**: TypeScript `5.8.2` for static type checking
- **DEP-007**: Vitest `3.2.4` for unit test updates
- **DEP-008**: Playwright `1.55.1` for E2E test updates
- **DEP-009**: Winston `3.17.0` for migration logging
- **DEP-010**: Ultracite `5.4.4` for code quality validation

## 5. Files

### Schema & Migrations
- **FILE-001**: `prisma/schema.prisma` - Add `TenantConfig` and `ProfileSupplier` models, deprecate `Manufacturer`
- **FILE-002**: `prisma/migrations/YYYYMMDDHHMMSS_refactor_manufacturer_to_tenant_config/migration.sql` - Auto-generated migration
- **FILE-003**: `scripts/migrate-manufacturer-to-tenant.ts` - Data migration script
- **FILE-004**: `scripts/rollback-tenant-config.ts` - Rollback migration script
- **FILE-005**: `prisma/seed.ts` - Update seed data for new models

### tRPC Routers & Services
- **FILE-006**: `src/server/api/routers/admin/admin.ts` - Update to use `ProfileSupplier`
- **FILE-007**: `src/server/api/routers/admin/tenant-config.ts` - New router for tenant configuration
- **FILE-008**: `src/server/api/routers/catalog/catalog.ts` - Update profile supplier queries
- **FILE-009**: `src/server/api/routers/quote/quote.ts` - Use `TenantConfig` for currency/validity
- **FILE-010**: `src/server/api/routers/quote/quote.service.ts` - Remove `manufacturerId` params
- **FILE-011**: `src/server/api/root.ts` - Export new `tenantConfig` router
- **FILE-012**: `src/server/services/email.ts` - Fetch tenant business name
- **FILE-013**: `src/server/utils/tenant.ts` - New utility for tenant config access

### Type Definitions & Schemas
- **FILE-014**: `src/types/quote.types.ts` - Remove `InconsistentManufacturer` error
- **FILE-015**: `src/app/(public)/catalog/[modelId]/_types/model.types.ts` - Update to `profileSupplier`
- **FILE-016**: `src/server/schemas/tenant.schema.ts` - Zod validation for `TenantConfig`
- **FILE-017**: `src/server/schemas/supplier.schema.ts` - Zod validation for `ProfileSupplier`

### UI Components
- **FILE-018**: `src/app/(dashboard)/_components/model-form.tsx` - Use `ProfileSupplier` selector
- **FILE-019**: `src/app/(dashboard)/models/page.tsx` - Display profile supplier names
- **FILE-020**: `src/app/(public)/catalog/_components/organisms/model-filter.tsx` - Profile supplier filter
- **FILE-021**: `src/app/(public)/catalog/_utils/catalog.utils.ts` - Map `profileSupplier` field
- **FILE-022**: `src/app/(public)/catalog/[modelId]/_utils/adapters.ts` - Adapt `profileSupplier.name`
- **FILE-023**: `src/app/(public)/catalog/_components/organisms/catalog-grid.tsx` - Update prop types
- **FILE-024**: `src/app/(dashboard)/settings/tenant/page.tsx` - New tenant config admin UI
- **FILE-025**: `src/app/(dashboard)/settings/suppliers/page.tsx` - New profile supplier CRUD UI

### Testing
- **FILE-026**: `src/tests/setup.ts` - Seed `TenantConfig` singleton for tests
- **FILE-027**: `tests/unit/**/*.test.ts` - Update service unit tests
- **FILE-028**: `tests/contract/**/*.test.ts` - Update tRPC router contract tests
- **FILE-029**: `e2e/catalog/**/*.spec.ts` - Update catalog E2E tests
- **FILE-030**: `e2e/quote/**/*.spec.ts` - Update quote E2E tests

### Documentation
- **FILE-031**: `docs/architecture.md` - Document new tenant architecture
- **FILE-032**: `docs/prd.md` - Update business domain model
- **FILE-033**: `docs/migrations/manufacturer-to-tenant-migration.md` - Migration guide
- **FILE-034**: `docs/migrations/rollback-procedure.md` - Rollback instructions

## 6. Testing

### Unit Tests
- **TEST-001**: Test `TenantConfig` singleton constraint enforcement in `tests/unit/tenant-config.test.ts`
- **TEST-002**: Test `ProfileSupplier` CRUD operations in `tests/unit/profile-supplier.test.ts`
- **TEST-003**: Test tenant config utility functions in `tests/unit/tenant-utils.test.ts`
- **TEST-004**: Test data migration script logic in `tests/unit/migrate-manufacturer.test.ts`

### Contract Tests (tRPC)
- **TEST-005**: Test `tenantConfig.get` procedure in `tests/contract/tenant-config.test.ts`
- **TEST-006**: Test `tenantConfig.update` procedure with validation
- **TEST-007**: Test `profileSupplier.list` procedure in `tests/contract/profile-supplier.test.ts`
- **TEST-008**: Test `profileSupplier.create` with duplicate name validation
- **TEST-009**: Test `admin.create-model` with `profileSupplierId` validation

### Integration Tests
- **TEST-010**: Test quote creation with tenant currency in `tests/integration/quote-with-tenant.test.ts`
- **TEST-011**: Test quote validity calculation using `TenantConfig.quoteValidityDays`
- **TEST-012**: Test model catalog filtering by profile supplier

### E2E Tests (Playwright)
- **TEST-013**: Test catalog page displays profile supplier names in `e2e/catalog/supplier-display.spec.ts`
- **TEST-014**: Test filtering models by profile supplier in catalog
- **TEST-015**: Test quote generation uses correct tenant currency in `e2e/quote/tenant-currency.spec.ts`
- **TEST-016**: Test admin can update tenant configuration in `e2e/admin/tenant-settings.spec.ts`
- **TEST-017**: Test admin can manage profile suppliers (CRUD) in `e2e/admin/supplier-management.spec.ts`

### Migration Tests
- **TEST-018**: Test migration script on database snapshot with multiple manufacturers
- **TEST-019**: Test rollback script restores original structure
- **TEST-020**: Test data integrity validation queries post-migration

## 7. Risks & Assumptions

### Risks
- **RISK-001**: **Data Loss During Migration** - Mitigation: Test migration on production copy, create full database backup, implement transaction-based migration
- **RISK-002**: **Breaking Changes in Production** - Mitigation: Multi-step deployment, feature flags, backward compatibility period
- **RISK-003**: **Foreign Key Constraint Violations** - Mitigation: Validate all relationships before migration, use Prisma transaction isolation
- **RISK-004**: **Singleton Constraint Violation** - Mitigation: Add database-level unique constraint, implement application-level validation
- **RISK-005**: **TypeScript Compilation Errors** - Mitigation: Incremental refactoring, extensive type checking, CI/CD validation
- **RISK-006**: **Test Suite Failures** - Mitigation: Update tests incrementally, run full test suite before each phase
- **RISK-007**: **Performance Degradation** - Mitigation: Add database indexes, monitor query performance, use query optimization
- **RISK-008**: **Incomplete Migration Rollback** - Mitigation: Comprehensive rollback script, database backup retention, staging environment testing

### Assumptions
- **ASSUMPTION-001**: Current `Manufacturer` table has <= 10 records (manageable for migration)
- **ASSUMPTION-002**: First `Manufacturer` record represents the actual tenant (business owner)
- **ASSUMPTION-003**: Remaining `Manufacturer` records are profile suppliers (Rehau, Deceuninck, etc.)
- **ASSUMPTION-004**: No production traffic during migration window (or handled with maintenance mode)
- **ASSUMPTION-005**: Database supports PostgreSQL-specific features (UNIQUE constraints, transactions)
- **ASSUMPTION-006**: All existing `manufacturerId` references point to valid records
- **ASSUMPTION-007**: Tenant configuration fields (currency, quoteValidityDays) are sufficient for current business needs
- **ASSUMPTION-008**: Profile suppliers only need basic fields (name, materialType, isActive)
- **ASSUMPTION-009**: UI components can be updated without breaking existing user workflows
- **ASSUMPTION-010**: Test coverage is sufficient to catch regression issues

## 8. Related Specifications / Further Reading

- [Prisma Schema Best Practices](https://www.prisma.io/docs/orm/prisma-schema/data-model/models)
- [Singleton Pattern in Database Design](https://www.prisma.io/docs/orm/prisma-schema/data-model/models#defining-a-singleton-model)
- [Next.js App Router Architecture](https://nextjs.org/docs/app/building-your-application/routing)
- [tRPC Type-Safe API Design](https://trpc.io/docs/server/routers)
- [SOLID Principles in TypeScript](https://khalilstemmler.com/articles/solid-principles/solid-typescript/)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)
- [Database Migration Strategies](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/migration-histories)
- [Zero Downtime Deployments](https://docs.gitlab.com/ee/topics/autodevops/upgrading_postgresql.html)
- [Multi-Tenancy Architecture Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)
- `docs/architecture.md` - Project architecture documentation
- `docs/prd.md` - Product requirements document
- `.github/copilot-instructions.md` - Project coding standards
