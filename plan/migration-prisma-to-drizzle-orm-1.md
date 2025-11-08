---
goal: Complete Migration from Prisma ORM to Drizzle ORM
version: 1.0
date_created: 2025-11-08
last_updated: 2025-11-08
owner: Backend Team
status: In progress
tags: [migration, orm, drizzle, prisma, database, refactor]
---

# Introduction

![Status: In progress](https://img.shields.io/badge/status-In_progress-yellow)

Complete migration from Prisma ORM to Drizzle ORM for the Glasify Lite T3 stack application. This migration maintains type safety while improving performance and reducing build complexity. The migration includes schema definitions, database client configuration, tRPC router updates, seeder scripts, and complete removal of Prisma dependencies.

**Current Status**: 
- ✅ Phase 1 Complete: All 25 Drizzle schemas created
- ✅ Phase 2 Complete: Database setup and initial migration applied
- ✅ Phase 3 Partial: User router migrated (1/9 routers)
- ⏳ Phase 4-7: Pending

## 1. Requirements & Constraints

### Database Requirements
- **REQ-001**: Must maintain PostgreSQL compatibility with Neon cloud and Neon local
- **REQ-002**: Must preserve all 25 existing data models without schema changes
- **REQ-003**: Must support both pooled (DATABASE_URL) and direct (DIRECT_URL) connections
- **REQ-004**: Must maintain snake_case column naming convention in database
- **REQ-005**: All migrations must be reversible and track changes in `_drizzle_migrations` table

### Type Safety Requirements
- **REQ-006**: Must maintain full TypeScript type safety across application
- **REQ-007**: Must export Zod schemas from Drizzle using drizzle-zod
- **REQ-008**: Must export TypeScript types (Model, NewModel) from each schema
- **REQ-009**: Enum values must be exported as const arrays to prevent duplication
- **REQ-010**: Must maintain tRPC input/output validation with Zod schemas

### Architecture Requirements
- **REQ-011**: Central schema export file at `src/server/db/schema.ts`
- **REQ-012**: Modular constants in `src/server/db/schemas/constants/` subfolder
- **REQ-013**: Enum definitions in `src/server/db/schemas/enums.schema.ts`
- **REQ-014**: Database client must auto-detect local vs cloud environment
- **REQ-015**: Must support both node-postgres (local) and neon-http (cloud) drivers

### Compatibility Requirements
- **REQ-016**: Next.js 16.0.1 App Router compatibility
- **REQ-017**: React Server Components support
- **REQ-018**: tRPC 11.6.0 compatibility
- **REQ-019**: Better Auth 1.2.7 integration maintained
- **REQ-020**: Existing authentication flow must remain unchanged

### Performance Requirements
- **REQ-021**: Query performance must match or exceed Prisma baseline
- **REQ-022**: Build time must be reduced (no Prisma generate step)
- **REQ-023**: Migration execution must complete under 30 seconds for initial schema
- **REQ-024**: Development server hot reload must remain under 3 seconds

### Security Requirements
- **SEC-001**: Must maintain existing RBAC (Role-Based Access Control) patterns
- **SEC-002**: Database credentials must remain in environment variables only
- **SEC-003**: SQL injection prevention through parameterized queries
- **SEC-004**: Audit logging must be preserved in all mutation procedures
- **SEC-005**: Winston logger must only be used server-side (not in Client Components)

### Testing Requirements
- **REQ-025**: All existing Vitest unit tests must pass after migration
- **REQ-026**: All Playwright E2E tests must pass without modification
- **REQ-027**: Must add integration tests for Drizzle queries
- **REQ-028**: Database seeding must work with new ORM

### Constraints
- **CON-001**: Cannot modify database schema structure during migration
- **CON-002**: Cannot break existing API contracts (tRPC procedures)
- **CON-003**: Must complete migration without downtime in production
- **CON-004**: Cannot introduce new runtime dependencies beyond Drizzle ecosystem
- **CON-005**: Must maintain backward compatibility with existing data
- **CON-006**: Cache Components (Next.js 16) must not use headers() in "use cache" functions
- **CON-007**: SSR pages with force-dynamic must use router.refresh() after mutations

### Guidelines
- **GUD-001**: Follow established naming conventions (kebab-case files, PascalCase components)
- **GUD-002**: Maintain English for code/comments, Spanish for UI text
- **GUD-003**: Use conventional commit format for all changes
- **GUD-004**: Document breaking changes in CHANGELOG.md
- **GUD-005**: Follow SOLID principles and Atomic Design patterns
- **GUD-006**: Prioritize Server Components over Client Components

### Patterns to Follow
- **PAT-001**: Query pattern: `db.select().from(table).where(conditions)`
- **PAT-002**: Insert pattern: `db.insert(table).values(data).returning()`
- **PAT-003**: Update pattern: `db.update(table).set(data).where(conditions).returning()`
- **PAT-004**: Delete pattern: `db.delete(table).where(conditions).returning()`
- **PAT-005**: Join pattern: `db.select().from(table1).leftJoin(table2, eq(...))`
- **PAT-006**: Aggregate pattern: Use `sql` template for COUNT, SUM, AVG, etc.
- **PAT-007**: Transaction pattern: `db.transaction(async (tx) => { ... })`
- **PAT-008**: Type extraction: `type User = typeof users.$inferSelect`

## 2. Implementation Steps

### Phase 1: Schema Definition & Migration Setup ✅ COMPLETED

- GOAL-001: Create all Drizzle schema files with proper types, constraints, and exports

| Task     | Description                                                                                        | Completed | Date       |
| -------- | -------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-001 | Create `src/server/db/schemas/enums.schema.ts` with all 11 PostgreSQL enums and value exports      | ✅         | 2025-11-08 |
| TASK-002 | Migrate Auth models (User, Account, Session, VerificationToken, Verification) to Drizzle           | ✅         | 2025-11-08 |
| TASK-003 | Migrate TenantConfig model with geometry types for coordinates                                     | ✅         | 2025-11-08 |
| TASK-004 | Migrate Catalog models (ProfileSupplier, Manufacturer, Model, GlassType, GlassSupplier, Service)   | ✅         | 2025-11-08 |
| TASK-005 | Migrate Quote system (Quote, QuoteItem, QuoteItemService, Adjustment, ProjectAddress)              | ✅         | 2025-11-08 |
| TASK-006 | Migrate Pricing models (ModelCostBreakdown, ModelPriceHistory)                                     | ✅         | 2025-11-08 |
| TASK-007 | Migrate Solutions (GlassSolution, GlassTypeSolution, GlassCharacteristic, GlassTypeCharacteristic) | ✅         | 2025-11-08 |
| TASK-008 | Migrate Colors (Color, ModelColor)                                                                 | ✅         | 2025-11-08 |
| TASK-009 | Create constants files in `src/server/db/schemas/constants/` for each model                        | ✅         | 2025-11-08 |
| TASK-010 | Export TypeScript types from each schema (Model, NewModel, SelectModel, InsertModel)               | ✅         | 2025-11-08 |

### Phase 2: Database Client & Migration Configuration ✅ COMPLETED

- GOAL-002: Configure Drizzle client, migration tools, and apply initial schema to database

| Task     | Description                                                                                               | Completed | Date       |
| -------- | --------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-011 | Create `src/server/db/schema.ts` central export file with all 25 schemas organized by category            | ✅         | 2025-11-08 |
| TASK-012 | Create `src/server/db/drizzle.ts` with dual-driver support (node-postgres for local, neon-http for cloud) | ✅         | 2025-11-08 |
| TASK-013 | Configure `drizzle.config.ts` for Neon with schema path, migration output, and database credentials       | ✅         | 2025-11-08 |
| TASK-014 | Add npm scripts to package.json: drizzle:generate, drizzle:migrate, drizzle:status, drizzle:studio        | ✅         | 2025-11-08 |
| TASK-015 | Generate initial migration with `pnpm drizzle-kit generate --name initial_schema`                         | ✅         | 2025-11-08 |
| TASK-016 | Create `scripts/migrate-drizzle.ts` for programmatic migrations with node-postgres driver                 | ✅         | 2025-11-08 |
| TASK-017 | Execute migration on Neon local: drop existing schema, apply 25 tables with indexes and constraints       | ✅         | 2025-11-08 |
| TASK-018 | Verify migration success: confirm 25 tables created with correct structure                                | ✅         | 2025-11-08 |
| TASK-019 | Create `scripts/test-drizzle-connection.ts` to validate client connectivity and query execution           | ✅         | 2025-11-08 |
| TASK-020 | Update `.env.local` with correct DATABASE_URL and DIRECT_URL for Neon local (neondb database)             | ✅         | 2025-11-08 |

### Phase 3: tRPC Router Migration (1/9 Complete)

- GOAL-003: Migrate all tRPC routers from Prisma queries to Drizzle queries maintaining API contracts

| Task     | Description                                                                                                | Completed | Date       |
| -------- | ---------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-021 | Update `src/server/api/trpc.ts` to import db from `@/server/db/drizzle` instead of Prisma client           | ✅         | 2025-11-08 |
| TASK-022 | Export enum types from `src/server/db/schemas/enums.schema.ts` for use in Zod schemas                      | ✅         | 2025-11-08 |
| TASK-023 | Migrate `src/server/api/routers/user.ts` - list-all and update-role procedures (2 procedures)              | ✅         | 2025-11-08 |
| TASK-024 | Migrate `src/server/api/routers/dashboard.ts` - admin dashboard stats and metrics                          |           |            |
| TASK-025 | Migrate `src/server/api/routers/address.ts` - project address CRUD operations                              |           |            |
| TASK-026 | Migrate `src/server/api/routers/geocoding.ts` - geocoding integration procedures                           |           |            |
| TASK-027 | Migrate `src/server/api/routers/transportation.ts` - transportation cost calculations                      |           |            |
| TASK-028 | Migrate `src/server/api/routers/cart/` directory - all cart-related procedures (add, update, remove items) |           |            |
| TASK-029 | Migrate `src/server/api/routers/quote/` directory - quote CRUD and calculations (15+ procedures)           |           |            |
| TASK-030 | Migrate `src/server/api/routers/catalog/` directory - model, glass type, supplier queries (10+ procedures) |           |            |
| TASK-031 | Migrate `src/server/api/routers/admin/` directory - admin dashboard and management (8+ procedures)         |           |            |
| TASK-032 | Update all Zod schemas to use enum arrays from Drizzle (replace z.nativeEnum with z.enum)                  |           |            |
| TASK-033 | Replace Prisma aggregations (_count, _sum, _avg) with Drizzle sql template functions                       |           |            |
| TASK-034 | Update pagination queries to use Drizzle limit() and offset() methods                                      |           |            |
| TASK-035 | Verify all tRPC procedures compile without TypeScript errors                                               |           |            |

### Phase 4: Seeder Script Migration

- GOAL-004: Update all database seeding scripts to use Drizzle insert methods

| Task     | Description                                                                                                     | Completed | Date |
| -------- | --------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-036 | Update `prisma/seed-cli.ts` to import from `@/server/db/drizzle` and use Drizzle insert syntax                  |           |      |
| TASK-037 | Migrate `prisma/seeders/glass-types.seeder.ts` - convert Prisma upsert to Drizzle insert with conflict handling |           |      |
| TASK-038 | Migrate `prisma/seeders/glass-solutions.seeder.ts` - batch insert with onConflictDoUpdate                       |           |      |
| TASK-039 | Migrate `prisma/seeders/glass-characteristics.seeder.ts` - handle many-to-many relationships                    |           |      |
| TASK-040 | Migrate `prisma/seeders/tenant-config.seeder.ts` - single record upsert pattern                                 |           |      |
| TASK-041 | Migrate `prisma/seeders/profile-supplier.seeder.ts` - supplier data insertion                                   |           |      |
| TASK-042 | Migrate `prisma/seeders/models.seeder.ts` - complex model data with relations                                   |           |      |
| TASK-043 | Update seeder CLI commands in package.json to reference Drizzle-compatible scripts                              |           |      |
| TASK-044 | Test seed:minimal preset with clean database                                                                    |           |      |
| TASK-045 | Test seed:demo preset with sample quotes and users                                                              |           |      |
| TASK-046 | Test seed:full-catalog preset with complete product catalog                                                     |           |      |

### Phase 5: Testing Infrastructure Update

- GOAL-005: Update all test files to use Drizzle and ensure test suite passes

| Task     | Description                                                                      | Completed | Date |
| -------- | -------------------------------------------------------------------------------- | --------- | ---- |
| TASK-047 | Create `tests/helpers/drizzle-test-setup.ts` with test database utilities        |           |      |
| TASK-048 | Update `tests/unit/auth/` - authentication unit tests to use Drizzle queries     |           |      |
| TASK-049 | Update `tests/integration/auth/` - authentication integration tests              |           |      |
| TASK-050 | Update `tests/unit/cart/` - cart logic unit tests                                |           |      |
| TASK-051 | Update `tests/integration/quote/` - quote calculation integration tests          |           |      |
| TASK-052 | Update `tests/unit/pricing/` - pricing formula unit tests                        |           |      |
| TASK-053 | Create new integration tests for Drizzle queries in `tests/integration/drizzle/` |           |      |
| TASK-054 | Update test fixtures to use Drizzle insert methods                               |           |      |
| TASK-055 | Verify all Vitest tests pass with `pnpm test`                                    |           |      |
| TASK-056 | Verify Playwright E2E tests pass with `pnpm test:e2e`                            |           |      |

### Phase 6: Migration Scripts & Data Integrity

- GOAL-006: Migrate existing migration scripts and ensure data integrity validation

| Task     | Description                                                                       | Completed | Date |
| -------- | --------------------------------------------------------------------------------- | --------- | ---- |
| TASK-057 | Update `scripts/migrate-glass-taxonomy.ts` to use Drizzle transactions            |           |      |
| TASK-058 | Update `scripts/rollback-glass-taxonomy.ts` with Drizzle delete operations        |           |      |
| TASK-059 | Update `scripts/validate-seed-data.ts` to query with Drizzle                      |           |      |
| TASK-060 | Update `scripts/migrate-glass-characteristics.ts` for many-to-many updates        |           |      |
| TASK-061 | Create `scripts/validate-migration.ts` to compare Prisma vs Drizzle query results |           |      |
| TASK-062 | Run validation script on staging environment with production data copy            |           |      |
| TASK-063 | Document any data discrepancies found and create fix scripts                      |           |      |
| TASK-064 | Create rollback plan document in `docs/drizzle-rollback-plan.md`                  |           |      |

### Phase 7: Prisma Removal & Cleanup

- GOAL-007: Remove all Prisma dependencies and files from the project

| Task     | Description                                                                                    | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-065 | Remove `@prisma/client` from package.json dependencies                                         |           |      |
| TASK-066 | Remove `prisma` from package.json devDependencies                                              |           |      |
| TASK-067 | Delete `prisma/` directory (schema.prisma, migrations, client files)                           |           |      |
| TASK-068 | Remove Prisma-related scripts from package.json (db:generate, db:push, db:studio, postinstall) |           |      |
| TASK-069 | Delete `src/server/db.ts` (old Prisma client singleton)                                        |           |      |
| TASK-070 | Remove `@prisma/client` imports from any remaining files                                       |           |      |
| TASK-071 | Update `.gitignore` to remove Prisma-specific entries                                          |           |      |
| TASK-072 | Update `tsconfig.json` to remove Prisma type references if any                                 |           |      |
| TASK-073 | Run `pnpm install` to update lockfile and remove Prisma packages                               |           |      |
| TASK-074 | Verify application builds successfully with `pnpm build`                                       |           |      |
| TASK-075 | Verify dev server starts without errors with `pnpm dev`                                        |           |      |

## 3. Alternatives

### Alternative Approaches Considered

- **ALT-001**: **Keep Prisma alongside Drizzle** - Rejected due to increased bundle size, build complexity, and maintaining two ORM APIs
- **ALT-002**: **Use Drizzle Prisma adapter** - Rejected because it doesn't solve the type generation complexity and still requires Prisma dependency
- **ALT-003**: **Migrate to Kysely instead of Drizzle** - Rejected due to less mature ecosystem, fewer integrations, and steeper learning curve
- **ALT-004**: **Use TypeORM** - Rejected due to decorator-based approach incompatibility with Next.js App Router and larger bundle size
- **ALT-005**: **Raw SQL with Postgres.js** - Rejected due to loss of type safety and increased maintenance burden
- **ALT-006**: **Drizzle-kit pull for migration generation** - Rejected because we have existing Prisma schema as source of truth
- **ALT-007**: **Separate migration per model** - Rejected in favor of single initial migration to simplify rollback
- **ALT-008**: **Use Drizzle Studio instead of custom admin dashboard** - Considered for future but not part of this migration scope

## 4. Dependencies

### External Dependencies
- **DEP-001**: `drizzle-orm@0.44.7` - Core Drizzle ORM functionality
- **DEP-002**: `drizzle-kit@0.30.0+` - Migration generation and schema management
- **DEP-003**: `drizzle-zod@0.5.1` - Zod schema generation from Drizzle tables
- **DEP-004**: `@neondatabase/serverless@1.0.2` - Neon serverless driver for cloud
- **DEP-005**: `pg@8.16.3` - Node.js PostgreSQL driver for local development
- **DEP-006**: `dotenv@17.2.3` - Environment variable loading for migration scripts
- **DEP-007**: `tsx@4.0.0+` - TypeScript execution for migration and seed scripts

### Internal Dependencies
- **DEP-008**: Better Auth 1.2.7 - Must maintain compatibility with auth tables
- **DEP-009**: tRPC 11.6.0 - Router context typing must work with Drizzle client
- **DEP-010**: Next.js 16.0.1 - Server Actions and RSC must work with Drizzle
- **DEP-011**: Zod 4.1.12 - Schema validation must integrate with Drizzle types
- **DEP-012**: Winston 3.18.3 - Server-side logging must remain unchanged
- **DEP-013**: TanStack Query 5.90.2 - Client-side caching must work with new API

### Environment Dependencies
- **DEP-014**: Neon PostgreSQL (local) - Development database with postgres://neon:npg@localhost:5432/neondb
- **DEP-015**: Neon PostgreSQL (cloud) - Production database with pooled connection
- **DEP-016**: Node.js 18+ - Required for Drizzle and migration scripts
- **DEP-017**: pnpm 8.0+ - Package manager for dependency installation

## 5. Files

### Schema Files (Created)
- **FILE-001**: `src/server/db/schemas/enums.schema.ts` - All PostgreSQL enums and type exports (11 enums)
- **FILE-002**: `src/server/db/schemas/user.schema.ts` - User model with Better Auth compatibility
- **FILE-003**: `src/server/db/schemas/account.schema.ts` - OAuth account model
- **FILE-004**: `src/server/db/schemas/session.schema.ts` - User session model
- **FILE-005**: `src/server/db/schemas/verification-token.schema.ts` - Email verification tokens
- **FILE-006**: `src/server/db/schemas/verification.schema.ts` - Verification records
- **FILE-007**: `src/server/db/schemas/tenant-config.schema.ts` - Tenant configuration with branding
- **FILE-008**: `src/server/db/schemas/profile-supplier.schema.ts` - Window/door profile suppliers
- **FILE-009**: `src/server/db/schemas/manufacturer.schema.ts` - Deprecated manufacturer model
- **FILE-010**: `src/server/db/schemas/model.schema.ts` - Window/door models with pricing
- **FILE-011**: `src/server/db/schemas/glass-type.schema.ts` - Glass specifications
- **FILE-012**: `src/server/db/schemas/glass-supplier.schema.ts` - Glass manufacturers
- **FILE-013**: `src/server/db/schemas/service.schema.ts` - Installation/delivery services
- **FILE-014**: `src/server/db/schemas/quote.schema.ts` - Quote header with status
- **FILE-015**: `src/server/db/schemas/quote-item.schema.ts` - Quote line items
- **FILE-016**: `src/server/db/schemas/quote-item-service.schema.ts` - Services per quote item
- **FILE-017**: `src/server/db/schemas/adjustment.schema.ts` - Quote adjustments (discounts/surcharges)
- **FILE-018**: `src/server/db/schemas/project-address.schema.ts` - Delivery addresses with coordinates
- **FILE-019**: `src/server/db/schemas/model-cost-breakdown.schema.ts` - Cost component analysis
- **FILE-020**: `src/server/db/schemas/model-price-history.schema.ts` - Price change tracking
- **FILE-021**: `src/server/db/schemas/glass-solution.schema.ts` - Solution catalog (security, thermal, etc.)
- **FILE-022**: `src/server/db/schemas/glass-type-solution.schema.ts` - Glass-to-solution many-to-many
- **FILE-023**: `src/server/db/schemas/glass-characteristic.schema.ts` - Characteristic definitions
- **FILE-024**: `src/server/db/schemas/glass-type-characteristic.schema.ts` - Glass-to-characteristic many-to-many
- **FILE-025**: `src/server/db/schemas/color.schema.ts` - Color catalog with RAL codes
- **FILE-026**: `src/server/db/schemas/model-color.schema.ts` - Model-to-color many-to-many with surcharge
- **FILE-027**: `src/server/db/schema.ts` - Central export file (47 export statements)

### Constants Files (Created)
- **FILE-028**: `src/server/db/schemas/constants/user.constants.ts` - User schema constants
- **FILE-029**: `src/server/db/schemas/constants/account.constants.ts` - Account schema constants
- **FILE-030**: `src/server/db/schemas/constants/*.constants.ts` - Constants for remaining 23 models

### Configuration Files (Modified)
- **FILE-031**: `src/server/db/drizzle.ts` - Drizzle client with dual-driver support (MODIFIED)
- **FILE-032**: `drizzle.config.ts` - Drizzle Kit configuration for migrations (MODIFIED)
- **FILE-033**: `src/server/api/trpc.ts` - tRPC context updated to use Drizzle (MODIFIED)
- **FILE-034**: `package.json` - Added Drizzle scripts, will remove Prisma scripts (MODIFIED)
- **FILE-035**: `.env.local` - Updated DATABASE_URL to use neondb database (MODIFIED)

### Migration Files (Generated)
- **FILE-036**: `drizzle/migrations/20251108154909_initial_schema.sql` - Initial migration with 25 tables (451 lines)
- **FILE-037**: `drizzle/migrations/meta/_journal.json` - Migration tracking metadata

### Script Files (Created/Modified)
- **FILE-038**: `scripts/migrate-drizzle.ts` - Programmatic migration runner (CREATED)
- **FILE-039**: `scripts/test-drizzle-connection.ts` - Connection validation script (CREATED)
- **FILE-040**: `scripts/test-user-router.ts` - User router test script (CREATED)

### Router Files (To Be Modified - Phase 3)
- **FILE-041**: `src/server/api/routers/user.ts` - User management (MODIFIED - 2/2 procedures complete)
- **FILE-042**: `src/server/api/routers/dashboard.ts` - Admin dashboard stats (PENDING)
- **FILE-043**: `src/server/api/routers/address.ts` - Project addresses (PENDING)
- **FILE-044**: `src/server/api/routers/geocoding.ts` - Geocoding integration (PENDING)
- **FILE-045**: `src/server/api/routers/transportation.ts` - Transportation costs (PENDING)
- **FILE-046**: `src/server/api/routers/cart/*.ts` - Cart management (PENDING - 5+ files)
- **FILE-047**: `src/server/api/routers/quote/*.ts` - Quote operations (PENDING - 8+ files)
- **FILE-048**: `src/server/api/routers/catalog/*.ts` - Catalog queries (PENDING - 6+ files)
- **FILE-049**: `src/server/api/routers/admin/*.ts` - Admin operations (PENDING - 4+ files)

### Seeder Files (To Be Modified - Phase 4)
- **FILE-050**: `prisma/seed-cli.ts` - Main seeder CLI (PENDING)
- **FILE-051**: `prisma/seeders/glass-types.seeder.ts` - Glass type seeding (PENDING)
- **FILE-052**: `prisma/seeders/glass-solutions.seeder.ts` - Solution seeding (PENDING)
- **FILE-053**: `prisma/seeders/glass-characteristics.seeder.ts` - Characteristic seeding (PENDING)
- **FILE-054**: `prisma/seeders/*.seeder.ts` - Remaining 6+ seeder files (PENDING)

### Test Files (To Be Modified - Phase 5)
- **FILE-055**: `tests/unit/auth/*.test.ts` - Auth unit tests (PENDING - 3+ files)
- **FILE-056**: `tests/integration/auth/*.test.ts` - Auth integration tests (PENDING - 2+ files)
- **FILE-057**: `tests/unit/cart/*.test.ts` - Cart unit tests (PENDING - 4+ files)
- **FILE-058**: `tests/integration/quote/*.test.ts` - Quote integration tests (PENDING - 3+ files)
- **FILE-059**: `tests/unit/pricing/*.test.ts` - Pricing unit tests (PENDING - 2+ files)

### Files to Delete (Phase 7)
- **FILE-060**: `prisma/schema.prisma` - Prisma schema definition (DELETE)
- **FILE-061**: `prisma/migrations/` - Prisma migration history (DELETE)
- **FILE-062**: `src/server/db.ts` - Old Prisma client singleton (DELETE)
- **FILE-063**: `node_modules/.prisma/` - Generated Prisma client (DELETE via pnpm install)

## 6. Testing

### Unit Tests
- **TEST-001**: Drizzle client initialization - Verify client connects to both local and cloud Neon
- **TEST-002**: Schema type exports - Verify all 25 models export correct TypeScript types
- **TEST-003**: Enum value exports - Verify all enum arrays are accessible and match database enums
- **TEST-004**: Query builder syntax - Test select, where, join operations on all tables
- **TEST-005**: Insert operations - Test single and batch inserts with returning() on all tables
- **TEST-006**: Update operations - Test conditional updates with returning() on mutable tables
- **TEST-007**: Delete operations - Test conditional deletes with cascade behavior
- **TEST-008**: Transaction handling - Test rollback on error and commit on success
- **TEST-009**: Foreign key constraints - Verify cascade, restrict, and set null behaviors
- **TEST-010**: Unique constraints - Verify duplicate prevention on unique indexes

### Integration Tests
- **TEST-011**: User router procedures - Test list-all and update-role with real database
- **TEST-012**: Quote calculation flow - End-to-end quote creation with items and services
- **TEST-013**: Cart operations - Add, update, remove items with proper state management
- **TEST-014**: Authentication flow - User registration, login, session management
- **TEST-015**: Admin dashboard queries - Aggregate queries for stats and metrics
- **TEST-016**: Catalog search - Full-text search on models and glass types
- **TEST-017**: Address geocoding - Project address creation with coordinate validation
- **TEST-018**: Seeder execution - Run all seed presets and verify data integrity
- **TEST-019**: Migration rollback - Test schema downgrade and data preservation
- **TEST-020**: Concurrent mutations - Test race conditions with optimistic locking

### E2E Tests (Playwright)
- **TEST-021**: User authentication flow - Sign in, sign out, role-based access
- **TEST-022**: Quote creation wizard - Complete quote from model selection to submission
- **TEST-023**: Cart management - Add items, modify quantities, apply discounts
- **TEST-024**: Admin user management - List users, change roles, verify permissions
- **TEST-025**: Catalog browsing - Search models, filter by glass type, view details
- **TEST-026**: Address management - Add delivery address, geocode, validate coordinates
- **TEST-027**: Dashboard analytics - View statistics, charts, recent activity
- **TEST-028**: Model configuration - Configure model options, colors, glass types

### Performance Tests
- **TEST-029**: Query performance baseline - Compare Drizzle vs Prisma query execution time
- **TEST-030**: Pagination performance - Test limit/offset on large result sets (10k+ rows)
- **TEST-031**: Join performance - Test complex joins with 3+ tables
- **TEST-032**: Aggregate performance - Test COUNT, SUM, AVG on large datasets
- **TEST-033**: Build time comparison - Measure build duration with and without Prisma
- **TEST-034**: Cold start time - Measure serverless function initialization time
- **TEST-035**: Memory usage - Compare memory footprint of Drizzle vs Prisma client

### Data Integrity Tests
- **TEST-036**: Migration completeness - Verify all 25 tables created with correct structure
- **TEST-037**: Index creation - Verify all 73 indexes created correctly
- **TEST-038**: Foreign key validation - Test all relationships between tables
- **TEST-039**: Enum value sync - Verify database enums match TypeScript enum arrays
- **TEST-040**: Data migration accuracy - Compare Prisma and Drizzle query results on same data

## 7. Risks & Assumptions

### High-Risk Items
- **RISK-001**: **Breaking changes in production** - Mitigation: Blue-green deployment with Prisma rollback option
- **RISK-002**: **Data loss during migration** - Mitigation: Full database backup before migration, validation scripts
- **RISK-003**: **Performance regression** - Mitigation: Benchmark queries before/after, optimize slow queries
- **RISK-004**: **Type safety gaps** - Mitigation: Strict TypeScript checks, comprehensive test coverage
- **RISK-005**: **Auth integration breakage** - Mitigation: Maintain Better Auth table structure unchanged
- **RISK-006**: **tRPC contract changes** - Mitigation: Maintain exact input/output types, version API if needed
- **RISK-007**: **Concurrent request failures** - Mitigation: Test transaction isolation levels, use optimistic locking
- **RISK-008**: **Migration script failure mid-execution** - Mitigation: Transactional migrations, checkpoint tracking

### Medium-Risk Items
- **RISK-009**: **Seeder script errors** - Mitigation: Test all seed presets in CI/CD pipeline
- **RISK-010**: **Test suite failures** - Mitigation: Update tests incrementally, maintain test coverage above 80%
- **RISK-011**: **Winston logger incompatibility** - Mitigation: Keep logger server-side only, no Client Component usage
- **RISK-012**: **Build time increase** - Mitigation: Profile build steps, optimize if needed (though Drizzle should improve this)
- **RISK-013**: **Development experience degradation** - Mitigation: Hot reload testing, ensure fast feedback loop
- **RISK-014**: **Documentation drift** - Mitigation: Update all docs and implementation plans during migration

### Low-Risk Items
- **RISK-015**: **Drizzle Studio setup** - Mitigation: Optional tool, not critical for development workflow
- **RISK-016**: **Migration versioning conflicts** - Mitigation: Timestamp-based naming prevents conflicts
- **RISK-017**: **Environment variable errors** - Mitigation: Validation in drizzle.ts with clear error messages

### Assumptions
- **ASSUMPTION-001**: Neon local and cloud behave identically for query operations
- **ASSUMPTION-002**: Better Auth 1.2.7 does not depend on Prisma-specific features
- **ASSUMPTION-003**: All foreign key relationships are correctly defined in Prisma schema
- **ASSUMPTION-004**: Database schema will not change during migration period
- **ASSUMPTION-005**: Team members are familiar with SQL and can debug Drizzle queries
- **ASSUMPTION-006**: Drizzle ORM is stable and production-ready (v0.44.7 is mature)
- **ASSUMPTION-007**: TypeScript 5.9.3 strict mode is compatible with Drizzle types
- **ASSUMPTION-008**: Next.js 16.0.1 App Router supports Drizzle without issues
- **ASSUMPTION-009**: TanStack Query invalidation patterns work the same with Drizzle mutations
- **ASSUMPTION-010**: Existing data in production database is valid and consistent

### Rollback Plan
- **ROLLBACK-001**: Keep Prisma dependencies installed until Phase 7 is complete
- **ROLLBACK-002**: Maintain `src/server/db.ts` (Prisma client) as fallback until verified
- **ROLLBACK-003**: Git branch strategy: `fix/ORM` branch can be reverted to `develop` baseline
- **ROLLBACK-004**: Database rollback: Restore from backup taken before migration
- **ROLLBACK-005**: Code rollback: Revert tRPC context import, restore Prisma queries
- **ROLLBACK-006**: Deploy rollback: Keep previous production deployment ready for quick revert

## 8. Related Specifications / Further Reading

### Internal Documentation
- [Project Architecture](../docs/architecture.md) - Overall system architecture and patterns
- [Glasify Copilot Instructions](../.github/copilot-instructions.md) - Development guidelines and conventions
- [Pricing Domain Layer](../docs/pricing-domain-layer-implementation.md) - Business logic patterns
- [Drizzle Migration Guide](../docs/DRIZZLE_MIGRATION_GUIDE.md) - Quick reference for Drizzle usage (created during migration)

### External Resources
- [Drizzle ORM Documentation](https://orm.drizzle.team/) - Official Drizzle ORM docs
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview) - Migration and schema management
- [Neon + Drizzle Guide](https://neon.tech/docs/guides/drizzle) - Neon-specific Drizzle setup
- [tRPC with Drizzle](https://trpc.io/docs/server/context#example-with-drizzle) - tRPC context patterns
- [Drizzle Zod Integration](https://orm.drizzle.team/docs/zod) - Zod schema generation
- [PostgreSQL Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK) - FK behavior reference

### Migration Guides
- [Prisma to Drizzle Migration](https://orm.drizzle.team/docs/migrations) - Official migration guidance
- [SQL Query Patterns](https://orm.drizzle.team/docs/select) - Drizzle query builder examples
- [Transaction Patterns](https://orm.drizzle.team/docs/transactions) - Transaction handling in Drizzle

### Community Resources
- [Drizzle Discord](https://discord.gg/drizzle) - Community support and discussions
- [Drizzle GitHub Issues](https://github.com/drizzle-team/drizzle-orm/issues) - Bug reports and feature requests
- [T3 Stack with Drizzle](https://create.t3.gg/en/usage/drizzle) - T3 stack integration examples
