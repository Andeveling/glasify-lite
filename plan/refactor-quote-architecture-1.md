---
goal: Refactor quote.ts to Clean Architecture with SOLID principles
version: 1.0
date_created: 2026-01-10
last_updated: 2026-01-10
owner: Andres (Lead Developer)
status: 'In progress'
tags: [refactor, architecture, solid, clean-architecture, quote-system]
---

# Introduction

![Status: In progress](https://img.shields.io/badge/status-In_progress-yellow)

This implementation plan outlines the systematic refactoring of `src/server/api/routers/quote/quote.ts` (1509 lines) into a Clean Architecture structure following SOLID principles. The goal is to extract business logic into testable domain services and use-cases, reducing the router file to ~250 lines and achieving 60%+ test coverage.

**Problem Statement:**
- Current `quote.ts` violates Single Responsibility Principle (7+ responsibilities in one file)
- Logic is tightly coupled to Prisma (violates Dependency Inversion)
- Impossible to test without spinning up PostgreSQL database
- 200+ line transactions mixing reads and writes
- No separation between domain logic and infrastructure

**Success Criteria:**
- `quote.ts` reduced from 1509 lines to ≤250 lines
- Test coverage: 0% → 60%+
- All business logic in testable domain layer
- Zero direct Prisma dependencies in use-cases
- P95 latency reduced by 30% (optimized queries outside transactions)

## 1. Requirements & Constraints

**Domain Requirements:**
- **REQ-001**: All quote business logic must be in `src/domain/quotes/`
- **REQ-002**: Use-cases must be framework-agnostic (no tRPC, no Prisma imports)
- **REQ-003**: Routers must ONLY handle HTTP concerns (input validation, auth, error mapping)
- **REQ-004**: All validations must have corresponding unit tests
- **REQ-005**: Repository pattern must abstract ALL database operations

**Architecture Constraints:**
- **CON-001**: Must maintain backward compatibility with existing tRPC API contracts
- **CON-002**: Cannot change Prisma schema during this refactor
- **CON-003**: Must use existing `domain/pricing` as reference architecture
- **CON-004**: No new external dependencies allowed (use existing stack)
- **CON-005**: Refactor must be incremental (deploy after each phase)

**Security Requirements:**
- **SEC-001**: All user-facing errors must NOT leak database details
- **SEC-002**: Maintain existing authorization checks (protectedProcedure)
- **SEC-003**: Validate all user inputs at use-case boundary

**Testing Guidelines:**
- **GUD-001**: All domain services must have 80%+ test coverage
- **GUD-002**: Use-cases must be testable with mock repositories
- **GUD-003**: No integration tests requiring real database for domain layer
- **GUD-004**: Follow existing test structure in `tests/unit/domain/pricing/`

**Architectural Patterns:**
- **PAT-001**: Hexagonal Architecture (Ports & Adapters)
- **PAT-002**: Repository Pattern for data access
- **PAT-003**: Use-Case Pattern for orchestration
- **PAT-004**: Dependency Injection via function parameters
- **PAT-005**: Pure functions for validations (no side effects)

## 2. Implementation Steps

### Phase A: Foundation - Testable Infrastructure (COMPLETED ✅)

- **GOAL-001**: Create repository abstraction layer and validation services that are 100% testable without database

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-A01 | Create `src/domain/quotes/repositories/quote.repository.ts` port with 10 methods (findById, create, updateTotal, etc.) | ✅ | 2026-01-10 |
| TASK-A02 | Implement `src/infrastructure/prisma/prisma-quote.repository.ts` adapter | ✅ | 2026-01-10 |
| TASK-A03 | Extract validations to `src/domain/quotes/services/quote-validator.service.ts` (7 pure functions) | ✅ | 2026-01-10 |
| TASK-A04 | Create `tests/unit/domain/quotes/quote-validator.test.ts` with 32+ test cases | ✅ | 2026-01-10 |
| TASK-A05 | Verify all tests pass (32/32 passing in <20ms) | ✅ | 2026-01-10 |

### Phase B: Use-Cases - Business Logic Extraction (COMPLETED ✅)

- **GOAL-002**: Extract all business logic from `quote.ts` into use-cases with dependency injection

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-B01 | Create `src/domain/quotes/use-cases/add-item-to-quote.ts` (replaces add-item procedure logic) | ✅ | 2026-01-10 |
| TASK-B02 | Create `src/domain/quotes/use-cases/calculate-item-price.ts` (replaces calculate-item procedure logic) | ✅ | 2026-01-10 |
| TASK-B03 | Create `src/domain/quotes/use-cases/get-quote-by-id.ts` (replaces get-by-id procedure logic) | ✅ | 2026-01-10 |
| TASK-B04 | Create `src/domain/quotes/use-cases/list-user-quotes.ts` (replaces list-user-quotes procedure logic) | ✅ | 2026-01-10 |
| TASK-B05 | Create `src/domain/quotes/use-cases/send-quote-to-vendor.ts` (replaces send-to-vendor procedure logic) | ✅ | 2026-01-10 |
| TASK-B06 | Create `src/domain/quotes/use-cases/calculate-price-with-color.ts` (replaces calculate-price-with-color procedure logic) | ✅ | 2026-01-10 |
| TASK-B07 | Create dependency injection container in `src/domain/quotes/di/quote.container.ts` | ✅ | 2026-01-10 |
| TASK-B08 | Add unit tests for each use-case (target: 80% coverage per use-case) | ✅ | 2026-01-10 |

**Phase B Results:**
- ✅ 6 use-cases created with dependency injection pattern
- ✅ 90 unit tests passing (58 new tests for use-cases + 32 validator tests)
- ✅ DI container with factory functions for all use-cases
- ✅ All tests run in <2 seconds without database

### Phase C: Router Refactoring - Thin Adapters (PARTIAL ⚠️)

- **GOAL-003**: Refactor tRPC routers to thin adapters that only handle HTTP concerns and delegate to use-cases

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-C01 | Refactor `add-item` procedure: reduce from 200+ lines to ~30 lines using `addItemToQuote` use-case | ⏳ | Phase D |
| TASK-C02 | Refactor `calculate-item` procedure: delegate to `calculateItemPrice` use-case | ✅ | 2026-01-10 |
| TASK-C03 | Refactor `get-by-id` procedure: delegate to `getQuoteById` use-case | ✅ | 2026-01-10 |
| TASK-C04 | Refactor `list-user-quotes` procedure: delegate to `listUserQuotes` use-case | ✅ | 2026-01-10 |
| TASK-C05 | Refactor `send-to-vendor` procedure: delegate to `sendQuoteToVendor` use-case | ✅ | 2026-01-10 |
| TASK-C06 | Refactor `calculate-price-with-color` procedure: delegate to `calculatePriceWithColor` use-case | ✅ | 2026-01-10 |
| TASK-C07 | Verify `quote.ts` is ≤250 lines after all refactors | ⚠️ | 1111 lines |
| TASK-C08 | Run all existing E2E tests to verify backward compatibility | ⚠️ | Infra issue |

**Phase C Results:**
- ✅ 5 procedures refactored to thin adapters (C02-C06)
- ⏳ `add-item` deferred - requires addItemWithColorUseCase (complex color handling)
- 📉 Line count: 1510 → 1111 lines (27% reduction, ~400 lines saved)
- ⚠️ E2E tests blocked by Playwright browser install (infrastructure issue, not code)
- ✅ Unit tests: 90/90 passing
- ✅ TypeScript: compiles without errors

### Phase D: Transaction Optimization

- **GOAL-004**: Optimize database queries by moving reads outside transactions and reducing transaction scope

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-D01 | Analyze current transactions in refactored use-cases (identify long-running txs) | | |
| TASK-D02 | Move all READ queries (model, glassType, services) outside of transaction in `addItemToQuote` | | |
| TASK-D03 | Reduce transaction scope to ONLY writes (createQuoteItem, updateQuoteTotal) | | |
| TASK-D04 | Add retry logic for deadlock scenarios in repository adapter | | |
| TASK-D05 | Benchmark P95 latency before/after optimization (target: -30% reduction) | | |

### Phase E: Integration Testing & Validation

- **GOAL-005**: Ensure refactored code maintains backward compatibility and improve test coverage to 60%+

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-E01 | Create `tests/integration/domain/quotes/` directory structure | | |
| TASK-E02 | Add integration tests for use-cases with mock repositories (no real DB) | | |
| TASK-E03 | Run full E2E test suite (`pnpm test:e2e`) and verify 100% pass rate | | |
| TASK-E04 | Generate coverage report (`pnpm test:coverage`) and verify ≥60% for domain/quotes | | |
| TASK-E05 | Manual QA: Test quote creation flow end-to-end in dev environment | | |
| TASK-E06 | Deploy to staging and monitor error rates for 24h | | |

### Phase F: Documentation & Cleanup

- **GOAL-006**: Document new architecture and remove legacy code/comments

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-F01 | Create `src/domain/quotes/README.md` explaining architecture and use-case patterns | | |
| TASK-F02 | Add JSDoc comments to all public APIs in use-cases and repositories | | |
| TASK-F03 | Remove `biome-ignore` comment from `quote.ts` line 1 (no longer needed) | | |
| TASK-F04 | Update `AGENTS.md` with new architecture patterns for quotes domain | | |
| TASK-F05 | Create ADR (Architecture Decision Record) in `docs/architecture/adr-001-quote-refactor.md` | | |

## 3. Alternatives

**Alternative Approaches Considered:**

- **ALT-001**: **Big Bang Refactor** - Rewrite entire `quote.ts` in one go
  - **Rejected**: High risk of breaking production, no incremental rollback strategy
  - **Timeline**: 3 weeks feature freeze unacceptable for active product

- **ALT-002**: **Keep Status Quo + Code Guidelines** - Don't refactor, just enforce rules for new code
  - **Rejected**: Technical debt compounds, existing code remains untestable
  - **Long-term cost**: Estimated 40% velocity decrease due to fragile codebase

- **ALT-003**: **Microservices Split** - Extract quote logic to separate service
  - **Rejected**: Over-engineering for current scale, adds network latency and complexity
  - **Prerequisites not met**: No service mesh, no distributed tracing infrastructure

- **ALT-004**: **Use tRPC Context for Dependency Injection** - Inject repositories into ctx
  - **Rejected**: Still couples domain logic to tRPC framework, harder to test
  - **Violates**: REQ-002 (framework-agnostic use-cases)

- **ALT-005**: **ORM Migration (Prisma → Drizzle/Kysely)** - Switch ORM entirely
  - **Rejected**: Out of scope, too risky to do simultaneously with refactor
  - **Future consideration**: Repository pattern makes this easier later if needed

## 4. Dependencies

**Internal Dependencies:**

- **DEP-001**: `domain/pricing` - Reference implementation for hexagonal architecture patterns
- **DEP-002**: `@prisma/client` v6.18.0 - Database ORM (no version changes)
- **DEP-003**: `@trpc/server` v11.6.0 - API framework (no breaking changes to procedures)
- **DEP-004**: `zod` - Input validation schemas (existing schemas remain unchanged)
- **DEP-005**: `vitest` v4.x - Testing framework for unit/integration tests

**External Services:**

- **DEP-006**: PostgreSQL (Neon) - Database with existing schema (no migrations required)
- **DEP-007**: `better-auth` v1.4.10 - Authentication (session/user context in tRPC)

**Configuration Dependencies:**

- **DEP-008**: `src/server/utils/tenant.ts` - Tenant config utilities (getTenantCurrency, getQuoteValidityDays)
- **DEP-009**: `src/server/services/email.ts` - Email service for quote notifications
- **DEP-010**: `src/lib/logger.ts` - Winston logger for structured logging

## 5. Files

**Files Created:**

- **FILE-001**: `src/domain/quotes/repositories/quote.repository.ts` - Repository port (interface)
- **FILE-002**: `src/infrastructure/prisma/prisma-quote.repository.ts` - Prisma adapter implementation
- **FILE-003**: `src/domain/quotes/services/quote-validator.service.ts` - Pure validation functions
- **FILE-004**: `src/domain/quotes/use-cases/add-item-to-quote.ts` - Add item orchestration
- **FILE-005**: `src/domain/quotes/use-cases/calculate-item-price.ts` - Price calculation use-case
- **FILE-006**: `src/domain/quotes/use-cases/get-quote-by-id.ts` - Quote retrieval use-case
- **FILE-007**: `src/domain/quotes/use-cases/list-user-quotes.ts` - Quote listing with filters
- **FILE-008**: `src/domain/quotes/use-cases/send-quote-to-vendor.ts` - Quote submission use-case
- **FILE-009**: `src/domain/quotes/use-cases/calculate-price-with-color.ts` - Color surcharge calculation
- **FILE-010**: `src/domain/quotes/di/quote.container.ts` - Dependency injection container
- **FILE-011**: `src/domain/quotes/README.md` - Architecture documentation
- **FILE-012**: `tests/unit/domain/quotes/quote-validator.test.ts` - Validator tests (32 tests)
- **FILE-013**: `tests/unit/domain/quotes/add-item-to-quote.test.ts` - Use-case tests
- **FILE-014**: `tests/integration/domain/quotes/quote-workflow.test.ts` - Integration tests
- **FILE-015**: `docs/architecture/adr-001-quote-refactor.md` - Architecture Decision Record

**Files Modified:**

- **FILE-016**: `src/server/api/routers/quote/quote.ts` - Refactored from 1509 lines → ~250 lines
- **FILE-017**: `src/server/api/routers/quote/quote.schemas.ts` - May need minor adjustments for use-case inputs
- **FILE-018**: `AGENTS.md` - Update with new quote domain patterns
- **FILE-019**: `package.json` - No changes (using existing dependencies)

**Files Deprecated (Not Deleted):**

- **FILE-020**: `src/server/api/routers/quote/quote.service.ts` (570 lines) - Logic moved to use-cases, keep for reference during transition

## 6. Testing

**Unit Tests (No Database Required):**

- **TEST-001**: `tests/unit/domain/quotes/quote-validator.test.ts`
  - 32 test cases covering all validation functions
  - Tests: validateDimensions, validateGlassTypeCompatibility, validateQuoteStatus, validateModelAvailability, validateQuantity, validateColorSurcharge
  - Status: ✅ 32/32 passing (12ms execution)

- **TEST-002**: `tests/unit/domain/quotes/add-item-to-quote.test.ts`
  - Test use-case with mock dependencies (no Prisma)
  - Scenarios: valid item, invalid dimensions, non-existent model, draft validation, total calculation

- **TEST-003**: `tests/unit/domain/quotes/calculate-item-price.test.ts`
  - Test price calculation logic with mock pricing domain
  - Scenarios: base price, with services, with adjustments, with color surcharge

- **TEST-004**: `tests/unit/domain/quotes/send-quote-to-vendor.test.ts`
  - Test email notification logic with mock email service
  - Scenarios: successful send, invalid vendor, already sent, update status

**Integration Tests (Mock Repository):**

- **TEST-005**: `tests/integration/domain/quotes/quote-workflow.test.ts`
  - Full workflow: create quote → add items → calculate total → send to vendor
  - Uses in-memory mock repository (no Prisma)
  - Validates state transitions and business rules

**E2E Tests (Existing - Must Pass):**

- **TEST-006**: `e2e/cart/price-recalculation.spec.ts` - Must pass after refactor
- **TEST-007**: `e2e/cart/edit-glass-type.spec.ts` - Must pass after refactor
- **TEST-008**: Manual testing checklist:
  - Create new quote from catalog
  - Add multiple items with different glass types
  - Apply color surcharge
  - Add custom adjustments
  - Send quote to vendor (verify email)

**Coverage Targets:**

- **TEST-009**: Domain layer coverage: ≥60% (measured by lines)
- **TEST-010**: Use-cases coverage: ≥80% per file
- **TEST-011**: Validation services coverage: 100% (already achieved)

## 7. Risks & Assumptions

**Technical Risks:**

- **RISK-001**: **Backward Compatibility Breakage** (Severity: HIGH)
  - Mitigation: Maintain exact same tRPC input/output schemas, run full E2E suite before deployment
  - Rollback: Keep old `quote.ts` logic commented out for 1 sprint

- **RISK-002**: **Performance Regression** (Severity: MEDIUM)
  - Mitigation: Benchmark P95 latency before/after each phase, optimize transactions
  - Monitoring: Add APM traces to use-cases, alert on >200ms P95

- **RISK-003**: **Transaction Deadlocks** (Severity: MEDIUM)
  - Mitigation: Reduce transaction scope, add retry logic with exponential backoff
  - Detection: Monitor Prisma logs for deadlock errors

- **RISK-004**: **Dependency Injection Complexity** (Severity: LOW)
  - Mitigation: Use simple function parameter injection (no IoC containers)
  - Documentation: Clear examples in README.md

**Business Risks:**

- **RISK-005**: **Feature Development Slowdown** (Severity: LOW)
  - Impact: 20% velocity decrease during refactor (estimated 2 weeks)
  - Mitigation: Refactor in small phases, deploy after each phase
  - Justification: Long-term velocity increase of 40% after completion

- **RISK-006**: **Team Onboarding to New Architecture** (Severity: LOW)
  - Mitigation: Pair programming sessions, detailed documentation, code reviews
  - Timeline: 1 week ramp-up period for team members

**Assumptions:**

- **ASSUMPTION-001**: Prisma schema remains stable (no breaking migrations during refactor)
- **ASSUMPTION-002**: tRPC API contracts must remain unchanged (external clients depend on them)
- **ASSUMPTION-003**: Current quote validation logic is correct (we're refactoring, not fixing bugs)
- **ASSUMPTION-004**: Team has capacity for 2 weeks of focused refactoring work
- **ASSUMPTION-005**: Existing domain/pricing implementation is approved reference architecture
- **ASSUMPTION-006**: Test coverage can be measured accurately with Vitest coverage tools
- **ASSUMPTION-007**: Deployment to staging is possible after each phase for validation

## 8. Related Specifications / Further Reading

**Internal Documentation:**

- [Domain Pricing Architecture](../src/domain/pricing/README.md) - Reference hexagonal architecture
- [AGENTS.md](../AGENTS.md) - Project rules and architecture guidelines
- [Project Architecture](../docs/architecture.md) - High-level system architecture
- [Prisma Schema](../prisma/schema.prisma) - Database schema reference

**External Resources:**

- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Dependency Injection](https://martinfowler.com/articles/injection.html)
- [tRPC Best Practices](https://trpc.io/docs/server/procedures)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

**Related Plans:**

- [Phase C Optimization Plan] - To be created after Phase B completion
- [Catalog Domain Refactor] - Future plan following same patterns
- [Administration Domain Refactor] - Future plan following same patterns

---

**Next Actions:**

1. Complete Phase B (TASK-B02 through TASK-B08)
2. Review with team and gather feedback
3. Create PR for Phase B completion
4. Deploy Phase B to staging for validation
5. Begin Phase C router refactoring
