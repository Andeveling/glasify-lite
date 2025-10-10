---
goal: Refactor seeders to use Factory Pattern for structured, reusable demo data
version: 1.0
date_created: 2025-01-10
last_updated: 2025-01-10
owner: Development Team
status: 'Planned'
tags: [refactor, data, architecture, pattern]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Refactor the database seeding system to use the **Factory Pattern**, enabling structured, reusable, and realistic demo data for MVP client instances. This implementation will include real market data from Colombian glass and window manufacturers (Deceuninck, Rehau, Alumina, VEKA) and provide preset configurations for different demo scenarios.

**Current Problem:**
- Seeders have hardcoded data inline in `seed.ts`
- Difficult to maintain and update catalog data
- No easy way to create different demo configurations
- Hard to add realistic market data from multiple suppliers
- Cannot easily customize seeds per client/tenant

**Proposed Solution:**
- Implement Factory Pattern for data creation
- Separate concerns: factories (how to create), catalogs (what to create), presets (when to create)
- Support multiple preset configurations (minimal, demo-client, full-catalog)
- Include real market data from documentation
- Type-safe factories with Zod validation
- Composable and testable structure

## 1. Requirements & Constraints

**Business Requirements:**

- **REQ-001**: Support multiple preset configurations (minimal, demo-client, full-catalog)
- **REQ-002**: Include realistic market data from Colombian suppliers (Deceuninck, Rehau, Alumina, VEKA)
- **REQ-003**: Maintain backward compatibility with existing seed scripts
- **REQ-004**: Enable tenant-specific demo configurations
- **REQ-005**: Provide clear documentation for adding new catalog items

**Technical Requirements:**

- **REQ-006**: Use Factory Pattern for object creation
- **REQ-007**: Type-safe factories with Zod schema validation
- **REQ-008**: Composable factory methods for complex entities
- **REQ-009**: Support environment-based preset selection (`SEED_PRESET=demo-client pnpm db:seed`)
- **REQ-010**: Maintain Prisma ORM compatibility

**Data Requirements:**

- **REQ-011**: Include common glass types from Colombian market (see `glassess.catalog.md`)
- **REQ-012**: Include Deceuninck models (correderas, doble contacto)
- **REQ-013**: Include pricing data appropriate for Colombian market (COP)
- **REQ-014**: Include realistic dimension constraints per model type
- **REQ-015**: Include glass solution compatibility matrices

**Security & Validation:**

- **SEC-001**: Validate all seed data against Prisma schema constraints
- **SEC-002**: Validate pricing data is positive and within reasonable ranges
- **SEC-003**: Validate dimension constraints (min < max)
- **SEC-004**: Log all validation errors with actionable messages

**Constraints:**

- **CON-001**: Must not break existing seed scripts during transition
- **CON-002**: Must work with current Prisma schema without modifications
- **CON-003**: Must execute within reasonable time (<30 seconds for full-catalog)
- **CON-004**: Must be executable via `pnpm db:seed` command

**Guidelines:**

- **GUD-001**: Follow DRY principle - reuse catalog data across presets
- **GUD-002**: Use Spanish for UI-facing names (model names, glass types)
- **GUD-003**: Use English for code, comments, and technical documentation
- **GUD-004**: Follow existing naming conventions (kebab-case files, camelCase variables)
- **GUD-005**: Provide TypeScript types for all factory inputs and outputs

**Patterns to Follow:**

- **PAT-001**: Factory Pattern for object creation
- **PAT-002**: Repository Pattern for database operations (via Prisma)
- **PAT-003**: Strategy Pattern for preset selection
- **PAT-004**: Builder Pattern (optional) for complex configurations

## 2. Implementation Steps

### Implementation Phase 1: Foundation & Factory Infrastructure

**GOAL-001**: Create base factory infrastructure with type-safe builders

| Task     | Description                                                                                               | Completed | Date |
| -------- | --------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-001 | Create `prisma/factories/` directory structure                                                            |           |      |
| TASK-002 | Create base factory types in `prisma/factories/types.ts` (FactoryOptions, FactoryResult, ValidationError) |           |      |
| TASK-003 | Create factory utilities in `prisma/factories/utils.ts` (validation helpers, price formatters)            |           |      |
| TASK-004 | Create `prisma/factories/glass-type.factory.ts` with Zod validation                                       |           |      |
| TASK-005 | Create `prisma/factories/service.factory.ts` with Zod validation                                          |           |      |
| TASK-006 | Create `prisma/factories/profile-supplier.factory.ts` with Zod validation                                 |           |      |
| TASK-007 | Create `prisma/factories/model.factory.ts` with compatibility validation                                  |           |      |
| TASK-008 | Create `prisma/factories/index.ts` barrel export                                                          |           |      |
| TASK-009 | Add unit tests for factory validation logic in `tests/unit/factories/`                                    |           |      |

### Implementation Phase 2: Market Data Catalogs

**GOAL-002**: Create realistic catalog data from Colombian market sources

| Task     | Description                                                                                                                   | Completed | Date |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-010 | Create `prisma/data/catalog/` directory structure                                                                             |           |      |
| TASK-011 | Create `glass-types.catalog.ts` with data from `glassess.catalog.md` (monolítico, templado, laminado, DVH, Low-E, reflectivo) |           |      |
| TASK-012 | Create `profile-suppliers.catalog.ts` with Deceuninck, Rehau, Alumina, VEKA data                                              |           |      |
| TASK-013 | Create `models.catalog.ts` with Deceuninck correderas models (Inoutic S5500, Zendow#neo S4100)                                |           |      |
| TASK-014 | Create `models.catalog.ts` with Deceuninck doble contacto models (Elegant S8000)                                              |           |      |
| TASK-015 | Add Rehau models to `models.catalog.ts` (if available from documentation)                                                     |           |      |
| TASK-016 | Add Alumina Koncept series models to `models.catalog.ts` (based on `alumina.info.md`)                                         |           |      |
| TASK-017 | Create `services.catalog.ts` with realistic Colombian services (instalación, sellado, tratamiento)                            |           |      |
| TASK-018 | Add JSDoc documentation to all catalog files explaining data sources                                                          |           |      |

### Implementation Phase 3: Preset Configurations

**GOAL-003**: Create composable preset configurations for different demo scenarios

| Task     | Description                                                                                     | Completed | Date |
| -------- | ----------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-019 | Create `prisma/data/presets/` directory structure                                               |           |      |
| TASK-020 | Create `minimal.preset.ts` (1 supplier, 2 glass types, 2 models, 1 service)                     |           |      |
| TASK-021 | Create `demo-client.preset.ts` (2 suppliers, 5 glass types, 6 models, 3 services)               |           |      |
| TASK-022 | Create `full-catalog.preset.ts` (all suppliers, all glass types, all models, all services)      |           |      |
| TASK-023 | Create preset type definitions in `prisma/data/presets/types.ts` (PresetConfig, PresetName)     |           |      |
| TASK-024 | Create preset selector function in `prisma/data/presets/index.ts` (getPreset, getPresetFromEnv) |           |      |
| TASK-025 | Add environment variable support for preset selection (SEED_PRESET=demo-client)                 |           |      |

### Implementation Phase 4: Seed Orchestration

**GOAL-004**: Refactor seed scripts to use new factory system

| Task     | Description                                                                     | Completed | Date       |
| -------- | ------------------------------------------------------------------------------- | --------- | ---------- |
| TASK-025 | Create `prisma/seeders/seed-orchestrator.ts` with SeedOrchestrator class        | ✅         | 2025-01-10 |
| TASK-026 | Implement sequential seeding: ProfileSuppliers → GlassTypes → Models → Services | ✅         | 2025-01-10 |
| TASK-027 | Add relationship resolution (supplier IDs, glass type IDs compatibility)        | ✅         | 2025-01-10 |
| TASK-028 | Add progress logging with SeedLogger (console-based, with emojis and sections)  | ✅         | 2025-01-10 |
| TASK-029 | Add error handling and rollback on failure (continue-on-error option)           | ✅         | 2025-01-10 |
| TASK-030 | Create `prisma/seed-cli.ts` CLI entry point with parseArgs (node:util)          | ✅         | 2025-01-10 |
| TASK-031 | Update `package.json` scripts: `seed`, `seed:minimal`, `seed:demo`, `seed:full` | ✅         | 2025-01-10 |
| TASK-032 | Add seed statistics summary (created/failed counts, duration, emojis)           | ✅         | 2025-01-10 |
| TASK-033 | Create `MIGRATION.md` guide with examples and troubleshooting                   | ✅         | 2025-01-10 |

### Implementation Phase 5: Testing & Documentation

**GOAL-005**: Ensure quality and provide clear documentation

| Task     | Description                                                                 | Completed | Date |
| -------- | --------------------------------------------------------------------------- | --------- | ---- |
| TASK-033 | Create unit tests for all factories in `tests/unit/factories/`              |           |      |
| TASK-034 | Create integration tests for seed orchestrator in `tests/integration/seed/` |           |      |
| TASK-035 | Test all preset configurations (minimal, demo-client, full-catalog)         |           |      |
| TASK-036 | Create `docs/seeds-architecture.md` documentation                           |           |      |
| TASK-037 | Create `prisma/README.md` with usage examples for adding new catalog items  |           |      |
| TASK-038 | Update main `README.md` with new seed commands                              |           |      |
| TASK-039 | Add JSDoc comments to all factory methods                                   |           |      |
| TASK-040 | Create migration guide in `docs/CHANGELOG-seed-refactor.md`                 |           |      |

## 3. Alternatives

**Alternative Approaches Considered:**

- **ALT-001**: **Builder Pattern** - More verbose than Factory Pattern for this use case. Factories provide sufficient flexibility for composing seed data without the ceremony of separate Director classes.

- **ALT-002**: **JSON/YAML configuration files** - Less type-safe than TypeScript factories. Would require custom validation logic. Factory Pattern provides compile-time type checking with Zod runtime validation.

- **ALT-003**: **Direct Prisma seed scripts per entity** - Harder to compose and reuse. Current approach already shows maintenance challenges. Factory Pattern provides better separation of concerns.

- **ALT-004**: **ORM-agnostic seed framework (e.g., Faker.js directly)** - Would require additional abstraction layer. Prisma client provides type safety we want to leverage. Factories wrap Prisma operations, not replace them.

- **ALT-005**: **Database snapshots** - Faster for resetting to known state, but less flexible for variations. Doesn't solve the problem of maintaining catalog data. Factories + presets provide better balance.

## 4. Dependencies

**External Dependencies:**

- **DEP-001**: `@prisma/client` (already installed) - Database operations
- **DEP-002**: `zod` (already installed v4.1.1) - Schema validation
- **DEP-003**: `winston` (already installed v3.17.0) - Logging

**Internal Dependencies:**

- **DEP-004**: `src/lib/logger.ts` - Winston singleton logger
- **DEP-005**: `prisma/schema.prisma` - Database schema (no changes required)
- **DEP-006**: `prisma/seed-tenant.ts` - Existing tenant seeder (to be refactored)
- **DEP-007**: `prisma/seed-solutions.ts` - Existing solutions seeder (to be refactored)

**Documentation Dependencies:**

- **DEP-008**: `docs/context/glassess.catalog.md` - Glass types market data
- **DEP-009**: `docs/context/alumina.info.md` - Alumina model specifications
- **DEP-010**: `docs/context/veka-example.info.md` - VEKA model specifications
- **DEP-011**: Deceuninck URLs (https://www.deceuninck.co/correderas.html, https://www.deceuninck.co/doble_contacto.html)

## 5. Files

**New Files (Factories):**

- **FILE-001**: `prisma/factories/types.ts` - Factory type definitions
- **FILE-002**: `prisma/factories/utils.ts` - Factory utility functions
- **FILE-003**: `prisma/factories/glass-type.factory.ts` - GlassType factory
- **FILE-004**: `prisma/factories/service.factory.ts` - Service factory
- **FILE-005**: `prisma/factories/profile-supplier.factory.ts` - ProfileSupplier factory
- **FILE-006**: `prisma/factories/model.factory.ts` - Model factory
- **FILE-007**: `prisma/factories/tenant.factory.ts` - TenantConfig factory
- **FILE-008**: `prisma/factories/index.ts` - Barrel export

**New Files (Catalog Data):**

- **FILE-009**: `prisma/data/catalog/glass-types.catalog.ts` - Glass type catalog
- **FILE-010**: `prisma/data/catalog/profile-suppliers.catalog.ts` - Supplier catalog
- **FILE-011**: `prisma/data/catalog/models.catalog.ts` - Model catalog (Deceuninck, Rehau, Alumina)
- **FILE-012**: `prisma/data/catalog/services.catalog.ts` - Service catalog

**New Files (Presets):**

- **FILE-013**: `prisma/data/presets/types.ts` - Preset type definitions
- **FILE-014**: `prisma/data/presets/minimal.preset.ts` - Minimal preset
- **FILE-015**: `prisma/data/presets/demo-client.preset.ts` - Demo client preset
- **FILE-016**: `prisma/data/presets/full-catalog.preset.ts` - Full catalog preset
- **FILE-017**: `prisma/data/presets/index.ts` - Preset selector

**New Files (Orchestration):**

- **FILE-018**: `prisma/seed-orchestrator.ts` - Main seed orchestrator

**Modified Files:**

- **FILE-019**: `prisma/seed.ts` - Refactored to use orchestrator
- **FILE-020**: `prisma/seed-tenant.ts` - Migrated to use tenant factory
- **FILE-021**: `prisma/seed-solutions.ts` - Updated to work with new structure
- **FILE-022**: `package.json` - Add new seed scripts

**New Test Files:**

- **FILE-023**: `tests/unit/factories/glass-type.factory.test.ts`
- **FILE-024**: `tests/unit/factories/model.factory.test.ts`
- **FILE-025**: `tests/unit/factories/service.factory.test.ts`
- **FILE-026**: `tests/integration/seed/orchestrator.test.ts`
- **FILE-027**: `tests/integration/seed/presets.test.ts`

**New Documentation Files:**

- **FILE-028**: `docs/seeds-architecture.md` - Architecture documentation
- **FILE-029**: `prisma/README.md` - Usage guide for adding catalog data
- **FILE-030**: `docs/CHANGELOG-seed-refactor.md` - Migration guide

## 6. Testing

**Unit Tests:**

- **TEST-001**: Validate GlassTypeFactory creates valid Prisma input objects
- **TEST-002**: Validate GlassTypeFactory rejects invalid thickness values (Zod validation)
- **TEST-003**: Validate GlassTypeFactory rejects negative prices (Zod validation)
- **TEST-004**: Validate ModelFactory creates valid Prisma input objects
- **TEST-005**: Validate ModelFactory validates dimension constraints (minWidth < maxWidth)
- **TEST-006**: Validate ModelFactory validates glass type compatibility arrays
- **TEST-007**: Validate ServiceFactory validates service types (fixed, perimeter, area)
- **TEST-008**: Validate ProfileSupplierFactory creates valid supplier data
- **TEST-009**: Validate factory utility functions (formatPrice, validateRange, etc.)

**Integration Tests:**

- **TEST-010**: Test seed orchestrator creates all entities in correct order
- **TEST-011**: Test minimal preset seeds successfully with minimal data
- **TEST-012**: Test demo-client preset seeds successfully with realistic data
- **TEST-013**: Test full-catalog preset seeds successfully with all data
- **TEST-014**: Test preset selector returns correct preset based on environment variable
- **TEST-015**: Test seed rollback on validation error (transaction support)
- **TEST-016**: Test seed idempotency (running twice doesn't create duplicates)
- **TEST-017**: Test backward compatibility with existing seed.ts structure

**Manual Testing:**

- **TEST-018**: Verify seed output includes proper progress logging
- **TEST-019**: Verify seed summary report shows correct counts
- **TEST-020**: Verify seeded data appears correctly in Prisma Studio
- **TEST-021**: Verify Deceuninck models have correct specifications from website
- **TEST-022**: Verify glass types match Colombian market data
- **TEST-023**: Verify pricing is appropriate for Colombian market (COP)

## 7. Risks & Assumptions

**Risks:**

- **RISK-001**: **Data accuracy** - Market data from documentation may be outdated or incomplete
  - *Mitigation*: Include data source URLs in comments, make it easy to update catalogs

- **RISK-002**: **Breaking changes** - Refactoring seed scripts could break existing workflows
  - *Mitigation*: Maintain backward compatibility, provide migration guide, test thoroughly

- **RISK-003**: **Performance** - Factory pattern may add overhead to seed execution
  - *Mitigation*: Profile seed execution time, optimize if needed, constraint is <30s for full catalog

- **RISK-004**: **Validation complexity** - Complex cross-entity validations may be difficult to implement
  - *Mitigation*: Start with simple validations, add complexity incrementally, use Zod's built-in refinements

- **RISK-005**: **Maintenance burden** - More files to maintain than current simple seed.ts
  - *Mitigation*: Clear documentation, examples, and contribution guide

**Assumptions:**

- **ASSUMPTION-001**: Prisma schema will not change significantly during implementation
- **ASSUMPTION-002**: Market data from documentation is representative of real products
- **ASSUMPTION-003**: Colombian market pricing in COP is acceptable (no USD conversion needed)
- **ASSUMPTION-004**: Existing `seed-tenant.ts` and `seed-solutions.ts` can be refactored without schema changes
- **ASSUMPTION-005**: Demo clients will use preset configurations, not custom factories (custom factories can be added later if needed)
- **ASSUMPTION-006**: 30 seconds is acceptable seed execution time for full catalog
- **ASSUMPTION-007**: Developers will prefer TypeScript factories over JSON/YAML configuration

## 8. Related Specifications / Further Reading

**Internal Documentation:**

- [Architecture Documentation](../docs/architecture.md) - Overall system architecture
- [PRD](../docs/prd.md) - Product requirements document
- [Prisma Schema](../prisma/schema.prisma) - Database schema

**Market Data Sources:**

- [Glass Catalog Context](../docs/context/glassess.catalog.md) - Colombian glass market data
- [Windows Info Context](../docs/context/windows.info.md) - Window quality fundamentals
- [Alumina Info Context](../docs/context/alumina.info.md) - Alumina product specifications
- [VEKA Example Context](../docs/context/veka-example.info.md) - VEKA technical specifications
- [Deceuninck Correderas](https://www.deceuninck.co/correderas.html) - Sliding window models
- [Deceuninck Doble Contacto](https://www.deceuninck.co/doble_contacto.html) - Double contact window models

**Design Patterns:**

- [Factory Pattern - Refactoring Guru](https://refactoring.guru/design-patterns/factory-method)
- [Builder Pattern - Refactoring Guru](https://refactoring.guru/design-patterns/builder)
- [Strategy Pattern - Refactoring Guru](https://refactoring.guru/design-patterns/strategy)

**Related Tools & Libraries:**

- [Prisma Documentation](https://www.prisma.io/docs) - Prisma ORM
- [Zod Documentation](https://zod.dev/) - TypeScript-first schema validation
- [Winston Documentation](https://github.com/winstonjs/winston) - Logging library

**Related Issues/PRs:**

- (To be added as issues are created)

---

**Estimation:** ~8-12 hours of development time, spread across 5 phases

**Priority:** Medium - Improves developer experience and demo quality, but not blocking critical features
