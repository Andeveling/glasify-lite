# Implementation Plan: Price Calculation Domain Refactor

**Branch**: `016-price-calculation-refactor` | **Date**: 2025-11-05 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/016-price-calculation-refactor/spec.md`

**Note**: This plan follows hexagonal architecture with pure domain logic, implementing SOLID principles for maximum testability and maintainability.

## Summary

Refactor the price calculation module from a framework-coupled implementation to a **pure domain layer** using **hexagonal architecture** (ports and adapters pattern). The current `calculatePriceItem()` function in `src/server/price/price-item.ts` contains business logic with Prisma dependencies and lacks proper separation of concerns.

**Primary Requirements**:
1. Extract pure domain logic (calculation formulas) into framework-independent modules
2. Implement SOLID principles with single-responsibility calculators
3. Apply correct business rules: color surcharge on components, profit margin on model only
4. Achieve 100% test coverage on domain logic with decimal precision validation
5. Maintain backward compatibility through adapter pattern

**Technical Approach**:
- **Architecture**: Hexagonal (Ports & Adapters) with Domain-Driven Design
- **Paradigm**: Functional programming for calculators (pure functions, immutability)
- **Pattern**: Strategy pattern for different calculation types, Builder pattern for result composition
- **Language**: TypeScript 5.9.3 (strict mode) with ES2022 target
- **Domain Layer**: Zero framework dependencies (no Next.js, tRPC, Prisma types)
- **Adapters**: tRPC adapter (existing), future REST/GraphQL adapters possible

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode), Node.js ES2022  
**Primary Dependencies**: 
  - Domain: `decimal.js` (or Prisma's Decimal.js) for financial precision
  - Adapters: tRPC 11.6.0, Prisma 6.18.0 (at adapter boundary only)  
**Storage**: PostgreSQL (existing schema, no changes required)  
**Testing**: Vitest 4.0.4 (unit/integration), target <10ms per domain test  
**Target Platform**: Node.js server (Next.js 16 App Router backend)  
**Project Type**: Web application (Next.js monorepo, domain refactor)  
**Performance Goals**: <50ms per price calculation (including DB queries)  
**Constraints**: 
  - Decimal precision (no floating-point errors)
  - Deterministic calculations (same input → same output)
  - Framework independence (domain can run in vanilla Node.js)
  - Backward compatibility (existing API contracts unchanged)  
**Scale/Scope**: 
  - 30+ functional requirements (FR-001 to FR-037)
  - 6 calculation types (profile, glass, color, margin, services, adjustments)
  - 100+ test scenarios for domain coverage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Reference: `.specify/memory/constitution.md` - verify feature complies with all principles.

### Core Values Compliance

- [x] **Clarity Over Complexity**: Design uses clear, descriptive names and simple logic
  - Pure functions with single responsibility (e.g., `calculateProfileCost`, `applyColorSurcharge`)
  - Self-documenting code with JSDoc formulas
  - No clever abstractions, straightforward calculation flow

- [x] **Server-First Performance**: Heavy work done on server, appropriate caching strategy defined
  - [x] All calculations execute server-side (tRPC procedures)
  - [x] Caching strategy: Not applicable (calculations are stateless, data cached at query level)
  - [x] SSR mutations: Existing `router.refresh()` pattern maintained in catalog/cart modules

- [x] **One Job, One Place (SOLID Architecture)**: Modular architecture with clear separation
  - [x] Domain organized by responsibility: entities, services, use-cases, adapters
  - [x] Each calculator has one job (e.g., `ProfileCalculator`, `GlassCalculator`)
  - [x] No violations: domain functions are pure (<50 lines each), no UI mixing
  - [x] Magic numbers extracted to `constants.ts`
  - [x] No default values (inputs provided by adapters)
  - [x] Business logic 100% separated from framework code

- [x] **Flexible Testing**: Testing strategy defined
  - Tests written during refactor (TDD for domain layer)
  - 100% coverage requirement on domain (critical business logic)
  - Integration tests for adapters (verify framework integration)

- [x] **Extend, Don't Modify**: New features add code, don't change existing working code
  - Strangler Fig pattern: new domain built alongside current implementation
  - Existing `calculatePriceItem` remains until migration complete
  - Adapters enable gradual replacement (catalog → cart → quotes)

- [x] **Security From the Start**: Input validation and authorization checks at every entry point
  - [x] All calculations via tRPC (existing auth middleware)
  - [x] Zod validation at adapter boundary (existing pattern)
  - [x] Domain functions validate business rules (e.g., margin < 100%)

- [x] **Track Everything Important**: Logging strategy defined
  - [x] Winston logger ONLY in adapters/use-cases (never in domain)
  - [x] Log calculation errors with context (modelId, inputs)
  - [x] Spanish error messages for users, English for technical logs

### Language & Communication

- [x] Code/comments/commits in English only
- [x] UI text in Spanish (es-LA) only - not applicable (no UI changes)
- [x] Commit messages follow Conventional Commits format

### Technology Constraints

- [x] Uses required stack: Next.js 16, TypeScript (strict), tRPC, Prisma (at adapter boundary)
- [x] No prohibited technologies
- [x] UI components: Not applicable (backend refactor only)

### Quality Gates

- [x] TypeScript strict mode enabled, no type errors expected
- [x] Biome/Ultracite formatting rules followed
- [x] Tests planned for all calculation scenarios (unit/integration)
- [x] Changelog entry planned: "refactor: pure domain pricing with hexagonal architecture"
- [x] Migration notes: Gradual replacement (no breaking changes)

### Principle Priority Resolution

No conflicts detected. All principles aligned for domain refactor.

**Result**: ✅ PASS

## Project Structure

### Documentation (this feature)

```text
specs/016-price-calculation-refactor/
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Architecture patterns, decimal libraries, testing strategies
├── data-model.md        # Phase 1: Domain entities and value objects
├── quickstart.md        # Phase 1: Developer onboarding for domain layer
├── contracts/           # Phase 1: TypeScript interfaces (ports)
│   ├── input-ports.ts   # Use case interfaces
│   └── output-ports.ts  # Repository/external service interfaces (if needed)
└── tasks.md             # Phase 2: Detailed implementation tasks (NOT in this plan)
```

### Source Code (repository root)

```text
src/domain/pricing/                    # NEW: Pure domain layer
├── core/                              # Business logic (zero dependencies)
│   ├── entities/
│   │   ├── money.ts                   # Value object for monetary amounts
│   │   ├── dimensions.ts              # Value object for width/height
│   │   ├── price-calculation.ts       # Main calculation aggregate
│   │   └── index.ts                   # Public API
│   ├── services/                      # Domain services (calculators)
│   │   ├── profile-calculator.ts      # Profile cost with color surcharge
│   │   ├── glass-calculator.ts        # Glass area and cost
│   │   ├── service-calculator.ts      # Service quantity and amount
│   │   ├── adjustment-calculator.ts   # Positive/negative adjustments
│   │   ├── margin-calculator.ts       # Profit margin application
│   │   └── index.ts                   # Public API
│   ├── constants.ts                   # MM_PER_METER, ROUND_SCALE, etc.
│   └── types.ts                       # Domain types (no framework deps)
│
├── ports/                             # Interfaces (hexagonal architecture)
│   ├── input/
│   │   └── price-calculator.port.ts   # Use case interface
│   └── output/
│       └── (empty - no external deps for now)
│
├── use-cases/                         # Application layer
│   ├── calculate-item-price.ts        # Main use case implementation
│   ├── calculate-item-price.test.ts   # Integration tests
│   └── index.ts                       # Public API
│
└── adapters/                          # Framework integrations
    └── trpc/
        ├── price-calculator.adapter.ts # Maps tRPC → domain
        └── price-calculator.adapter.test.ts

src/server/price/                      # EXISTING: Current implementation
├── price-item.ts                      # Will be gradually replaced
└── (other files unchanged)

tests/unit/domain/pricing/             # NEW: Domain unit tests
├── entities/
│   ├── money.test.ts
│   ├── dimensions.test.ts
│   └── price-calculation.test.ts
└── services/
    ├── profile-calculator.test.ts
    ├── glass-calculator.test.ts
    ├── service-calculator.test.ts
    ├── adjustment-calculator.test.ts
    └── margin-calculator.test.ts
```

**Structure Decision**: **Single project (Next.js monorepo)** with domain layer addition. Using `src/domain/pricing/` as a new top-level module that can be extracted to a separate package in the future if needed. The hexagonal architecture allows the domain to be completely independent of Next.js/tRPC/Prisma, making future extraction trivial.

## Complexity Tracking

No violations. Architecture choices justified:

| Pattern/Decision                  | Why Needed                                    | Simpler Alternative Rejected Because              |
| --------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| Hexagonal Architecture            | Decouple business logic from frameworks       | Direct DB access couples domain to Prisma types   |
| Multiple Calculator Services      | Each calculation type has distinct logic      | Single god-function violates SRP, hard to test    |
| Value Objects (Money, Dimensions) | Encapsulate validation and precision rules    | Primitive obsession leads to scattered validation |
| Decimal.js for all money          | Financial precision (0.1 + 0.2 = 0.3 exactly) | JavaScript numbers cause rounding errors          |

---

## Phase 0: Outline & Research

### Research Questions

1. **Decimal Library Choice**
   - Research: Compare Prisma's Decimal.js vs standalone decimal.js vs big.js
   - Decision criteria: Performance, bundle size, API compatibility
   - Output: Recommendation in `research.md`

2. **Hexagonal Architecture in TypeScript**
   - Research: Best practices for ports/adapters in TS
   - Patterns: Dependency injection, interface segregation
   - Output: Code structure guidelines in `research.md`

3. **Pure Function Testing Strategies**
   - Research: Property-based testing vs example-based
   - Tools: Vitest + fast-check (property testing)
   - Output: Testing approach in `research.md`

4. **Strangler Fig Migration Pattern**
   - Research: Gradual replacement strategies
   - Approach: Feature flags vs parallel execution
   - Output: Migration plan in `research.md`

5. **Functional Programming Patterns in TypeScript**
   - Research: Immutability, composition, pipeline operators
   - Libraries: fp-ts vs ramda vs vanilla TS
   - Output: FP guidelines for calculators in `research.md`

### Expected Research Output

**File**: `specs/016-price-calculation-refactor/research.md`

**Sections**:
1. Decimal Library Analysis
2. Hexagonal Architecture Pattern
3. Testing Strategy (Unit + Property-Based)
4. Migration Approach (Strangler Fig)
5. Functional Programming Guidelines
6. Performance Benchmarking Plan

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete

### Data Model (`data-model.md`)

**Domain Entities**:

1. **Money** (Value Object)
   ```typescript
   class Money {
     private readonly amount: Decimal;
     static ROUND_SCALE = 2;
     static ROUND_MODE = Decimal.ROUND_HALF_UP;
     
     constructor(value: Decimal | number | string);
     add(other: Money): Money;
     multiply(factor: Decimal | number): Money;
     divide(divisor: Decimal | number): Money;
     toNumber(): number;
   }
   ```

2. **Dimensions** (Value Object)
   ```typescript
   class Dimensions {
     readonly widthMm: number;
     readonly heightMm: number;
     readonly minWidthMm: number;
     readonly minHeightMm: number;
     
     getEffectiveWidth(): number;  // max(width - min, 0)
     getEffectiveHeight(): number;
     toMeters(): { width: number; height: number };
   }
   ```

3. **PriceCalculation** (Aggregate Root)
   ```typescript
   class PriceCalculation {
     readonly profileCost: Money;
     readonly glassCost: Money;
     readonly accessoryCost: Money;
     readonly services: ServiceCalculation[];
     readonly adjustments: AdjustmentCalculation[];
     readonly colorSurchargeAmount: Money;
     readonly profitMarginAmount: Money;
     readonly finalSalesPrice: Money;
     
     static calculate(input: PriceCalculationInput): PriceCalculation;
   }
   ```

**Domain Services** (Stateless Calculators):

1. **ProfileCalculator**
   - `calculateBaseCost(basePrice, colorMultiplier): Money`
   - `calculateWidthCost(costPerMm, extraMm, colorMultiplier): Money`
   - `calculateHeightCost(costPerMm, extraMm, colorMultiplier): Money`

2. **GlassCalculator**
   - `calculateArea(dimensions, discounts): number` (in m²)
   - `calculateCost(area, pricePerSqm): Money`

3. **ServiceCalculator**
   - `calculateQuantity(service, dimensions): number`
   - `calculateAmount(service, quantity): Money`

4. **MarginCalculator**
   - `applyMargin(modelCost, marginPercentage): Money`
   - `calculateMarginAmount(salesPrice, cost): Money`

### API Contracts (`contracts/`)

**Input Port** (Use Case Interface):

```typescript
// contracts/input-ports.ts
export interface PriceCalculatorPort {
  calculateItemPrice(input: PriceCalculationInput): Promise<PriceCalculationResult>;
}

export type PriceCalculationInput = {
  dimensions: {
    widthMm: number;
    heightMm: number;
    minWidthMm: number;
    minHeightMm: number;
  };
  model: {
    basePrice: Decimal | number | string;
    costPerMmWidth: Decimal | number | string;
    costPerMmHeight: Decimal | number | string;
    accessoryPrice?: Decimal | number | string | null;
  };
  glass?: {
    pricePerSqm: Decimal | number | string;
    discountWidthMm: number;
    discountHeightMm: number;
  };
  colorSurchargePercentage?: number;
  profitMarginPercentage?: number;
  services?: ServiceInput[];
  adjustments?: AdjustmentInput[];
};

export type PriceCalculationResult = {
  profileCost: number;
  glassCost: number;
  accessoryCost: number;
  modelCost: number;
  modelSalesPrice: number;
  colorSurchargeAmount?: number;
  profitMarginAmount?: number;
  services: ServiceResult[];
  adjustments: AdjustmentResult[];
  finalSalesPrice: number;
};
```

**tRPC Adapter Contract** (maintains backward compatibility):

```typescript
// Existing tRPC input/output types remain unchanged
// Adapter transforms between tRPC types and domain types
```

### Quickstart (`quickstart.md`)

**Content**:
1. Domain layer overview (hexagonal architecture diagram)
2. How to run domain tests: `npm test -- pricing`
3. How to add a new calculator (step-by-step)
4. How to modify a formula (test-first approach)
5. Common patterns (Money creation, Decimal operations)
6. Migration status (which modules use new vs old calculator)

---

## Phase 2: Implementation Tasks

**Note**: Detailed tasks will be generated by `/speckit.tasks` command (not included in this plan).

**High-Level Task Groups**:

1. **Setup Domain Structure** (1-2 hours)
   - Create `src/domain/pricing/` directory structure
   - Setup test infrastructure for domain layer
   - Configure TypeScript paths for domain imports

2. **Implement Value Objects** (2-3 hours)
   - Money class with Decimal.js
   - Dimensions class with validation
   - Unit tests (100% coverage)

3. **Implement Calculators** (8-10 hours)
   - ProfileCalculator (with color surcharge logic)
   - GlassCalculator (with area and cost)
   - ServiceCalculator (fixed, area, perimeter)
   - AdjustmentCalculator
   - MarginCalculator (model-only application)
   - Unit tests for each (property-based + examples)

4. **Implement Use Case** (3-4 hours)
   - CalculateItemPrice use case
   - Orchestrates all calculators
   - Integration tests (full scenarios)

5. **Implement tRPC Adapter** (2-3 hours)
   - Adapter class (tRPC → domain → tRPC)
   - Integration tests (verify backward compatibility)

6. **Migration** (4-6 hours per module)
   - Update catalog module to use new calculator
   - Update cart module to use new calculator
   - Update quotes module to use new calculator
   - Verify E2E tests pass

7. **Cleanup** (1-2 hours)
   - Remove old `calculatePriceItem` function
   - Update documentation
   - Performance benchmarking

**Total Estimate**: 24-32 hours of development time

---

## Migration Strategy

### Strangler Fig Pattern

**Phase 1: Build New Domain Alongside Old**
- New domain layer created in `src/domain/pricing/`
- Old `price-item.ts` remains unchanged
- Both implementations exist simultaneously

**Phase 2: Gradual Replacement**
- Module-by-module migration (catalog → cart → quotes)
- Feature flag if needed: `USE_NEW_PRICING_ENGINE`
- Parallel execution for validation (optional)

**Phase 3: Cleanup**
- Remove old implementation
- Remove feature flags
- Consolidate tests

### Rollback Plan

If new calculator causes issues:
1. Revert tRPC adapter to use old `calculatePriceItem`
2. Keep domain layer (no harm, zero coupling)
3. Fix issues in domain layer
4. Re-enable new calculator

### Validation Strategy

**Parallel Execution (Optional)**:
- Run both calculators on same inputs
- Compare results (should match exactly)
- Log discrepancies for investigation
- Remove after confidence established

---

## Testing Strategy

### Unit Tests (Domain Layer)

**Target**: 100% coverage on domain/pricing/**

**Approach**:
1. **Example-Based Tests**: Known calculation scenarios from spec
2. **Property-Based Tests**: Mathematical properties (commutativity, associativity)
3. **Edge Case Tests**: Zero values, negative values, very large numbers

**Example Property Test** (with fast-check):
```typescript
fc.assert(
  fc.property(
    fc.float({ min: 0, max: 10000 }),
    fc.float({ min: 0, max: 10000 }),
    (a, b) => {
      const money1 = new Money(a);
      const money2 = new Money(b);
      // Commutative property
      expect(money1.add(money2)).toEqual(money2.add(money1));
    }
  )
);
```

### Integration Tests (Use Cases + Adapters)

**Target**: All user scenarios from spec

**Approach**:
1. Test full calculation flow (use case + all calculators)
2. Verify tRPC adapter transformations
3. Test error handling and validation

### Performance Benchmarks

**Target**: <50ms per calculation

**Approach**:
1. Benchmark suite with realistic inputs
2. Compare old vs new implementation
3. Profile Decimal.js operations
4. Optimize hot paths if needed

---

## Risks & Mitigation

| Risk                                        | Impact | Probability | Mitigation                                     |
| ------------------------------------------- | ------ | ----------- | ---------------------------------------------- |
| Decimal.js performance slower than native   | Medium | Low         | Benchmark early, optimize if needed            |
| Breaking changes during migration           | High   | Medium      | Comprehensive test suite, feature flag         |
| Team unfamiliar with hexagonal architecture | Medium | High        | Documentation, code examples, pair programming |
| Edge cases not covered by tests             | High   | Medium      | Property-based testing, real data validation   |

---

## Success Criteria

**Domain Layer**:
- ✅ Zero framework dependencies (can import in vanilla Node.js)
- ✅ 100% test coverage on calculators
- ✅ All tests < 10ms execution time
- ✅ All property tests pass (mathematical correctness)

**Integration**:
- ✅ Backward compatibility maintained (existing API unchanged)
- ✅ All E2E tests pass after migration
- ✅ Performance: <50ms per calculation (verified with benchmarks)

**Code Quality**:
- ✅ Biome/Ultracite checks pass
- ✅ TypeScript strict mode, zero errors
- ✅ All functions have JSDoc with formula examples
- ✅ No magic numbers (all extracted to constants)

**Business Requirements**:
- ✅ Color surcharge applies to components (base + per-mm costs)
- ✅ Profit margin applies only to model (not glass/services)
- ✅ Minimum dimensions logic correct (no overcharging)
- ✅ All 37 functional requirements (FR-001 to FR-037) verified

---

## Next Steps

1. ✅ **This plan complete** → Review with team
2. ⏭️  **Run `/speckit.tasks`** → Generate detailed implementation tasks
3. ⏭️  **Phase 0: Research** → Complete `research.md` with technology decisions
4. ⏭️  **Phase 1: Design** → Create `data-model.md`, `contracts/`, `quickstart.md`
5. ⏭️  **Phase 2: Implementation** → Execute tasks from `tasks.md`
6. ⏭️  **Phase 3: Migration** → Replace old calculator module by module
7. ⏭️  **Phase 4: Cleanup** → Remove old code, finalize documentation

---

**Plan Status**: ✅ COMPLETE - Ready for `/speckit.tasks`
5. Flexible Testing
6. Extend, Don't Modify
7. Track Everything Important

**Result**: ✅ PASS / ⚠️ VIOLATIONS REQUIRE JUSTIFICATION (see Complexity Tracking section)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
