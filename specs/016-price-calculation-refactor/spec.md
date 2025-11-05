# Feature Specification: Price Calculation Domain Refactor

**Feature Branch**: `020-price-calculation-refactor`  
**Created**: 2025-11-05  
**Status**: Draft  
**Input**: Refactorizar el módulo de cálculo de precios usando SOLID, arquitectura hexagonal y patrones de diseño para dominio puro con máxima precisión

**Note**: This specification must comply with project constitution (`.specify/memory/constitution.md`). The implementation plan (`plan.md`) will perform detailed constitution checks.

---

## Clarifications

### Session 2025-11-05

- **Q**: How is color surcharge applied in the calculation sequence? → **A**: Color surcharge applies to basePrice AND costPerMm (width/height) individually before summing, not to the final profile cost
- **Q**: Which components receive profit margin? → **A**: Profit margin applies ONLY to model costs (profile + accessories), NOT to glass or services
- **Q**: Where must price calculations execute for security? → **A**: All price calculations must occur in backend (server-side) due to sensitivity
- **Q**: How are services priced relative to model pricing? → **A**: Services calculate independently based on their unit and minimums, without profit margin applied

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Accurate Price Calculation with Minimum Dimensions (Priority: P1)

**Description**: When a customer configures a product in the catalog, the system calculates the price considering that the base price already includes the cost of minimum dimensions, and only charges for additional millimeters beyond those minimums.

**Why this priority**: This is the core business logic that directly impacts revenue accuracy. Without this, the company is either overcharging (bad for customers) or undercharging (bad for business).

**Independent Test**: Can be fully tested by providing dimension inputs (width/height) and model configuration, then verifying the calculated cost matches the expected formula: `basePrice + (costPerMmWidth × (width - minWidth)) + (costPerMmHeight × (height - minHeight))`.

**Acceptance Scenarios**:

1. **Given** a model with basePrice=$100, minWidth=800mm, minHeight=800mm, costPerMmWidth=$0.10, costPerMmHeight=$0.10  
   **When** user configures 800mm × 800mm (minimum dimensions)  
   **Then** profile cost = $100 (no additional charges)

2. **Given** same model configuration  
   **When** user configures 1000mm × 1200mm  
   **Then** profile cost = $100 + ($0.10 × 200mm) + ($0.10 × 400mm) = $160

3. **Given** same model configuration  
   **When** user configures 700mm × 900mm (below minimum)  
   **Then** calculation treats as minimum (800mm × 800mm) and profile cost = $100

---

### User Story 2 - Profit Margin on Model Only (Priority: P1)

**Description**: The system applies profit margin as a percentage of the sales price, but ONLY to the model costs (profile + accessories). Glass and services are priced independently without profit margin.

**Why this priority**: This ensures accurate profitability calculations on manufactured components while allowing transparent third-party costs (glass, services) to pass through without markup.

**Independent Test**: Can be fully tested by providing model cost (profile + accessories) and profit margin percentage, then verifying the model sales price matches the formula: `modelSalesPrice = modelCost / (1 - marginPercentage)`, while glass and services add to final price without margin.

**Acceptance Scenarios**:

1. **Given** profile cost=$160, accessory=$50, glass=$148, services=$190, profit margin=20%  
   **When** system calculates sales price  
   **Then** modelCost = $160 + $50 = $210  
   **And** modelSalesPrice = $210 / (1 - 0.20) = $210 / 0.80 = $262.50  
   **And** finalSalesPrice = $262.50 + $148 + $190 = $600.50  
   **And** profit on model = $262.50 - $210 = $52.50 (which is 20% of $262.50) ✅

2. **Given** profile cost=$100, accessory=$0, glass=$0, services=$0, profit margin=25%  
   **When** system calculates sales price  
   **Then** modelCost = $100  
   **And** modelSalesPrice = $100 / 0.75 = $133.33  
   **And** finalSalesPrice = $133.33 (no glass or services to add)

3. **Given** any configuration with profit margin=0%  
   **When** system calculates sales price  
   **Then** modelSalesPrice = modelCost (no margin)  
   **And** finalSalesPrice = modelCost + glass + services

---

### User Story 3 - Billable Glass Area with Profile Discounts (Priority: P1)

**Description**: When calculating glass costs, the system subtracts the space occupied by profiles from the total dimensions to determine the actual billable glass area.

**Why this priority**: Accurate glass area calculation prevents overcharging customers for glass they're not receiving.

**Independent Test**: Can be fully tested by providing dimensions and profile discounts, then verifying billable area matches formula: `((width - discountWidth) × (height - discountHeight)) / 1,000,000 m²`.

**Acceptance Scenarios**:

1. **Given** dimensions 1000mm × 2000mm and profile discounts 50mm × 50mm  
   **When** system calculates glass area  
   **Then** effective dimensions = 950mm × 1950mm = 0.95m × 1.95m  
   **And** billable area = 1.8525 m²

2. **Given** dimensions 800mm × 800mm and profile discounts 100mm × 100mm  
   **When** system calculates glass area  
   **Then** effective dimensions = 700mm × 700mm  
   **And** billable area = 0.49 m²

3. **Given** dimensions 1000mm × 2000mm and zero profile discounts  
   **When** system calculates glass area  
   **Then** billable area = 2.0 m² (full dimensions)

---

### User Story 4 - Color Surcharge Application (Priority: P2)

**Description**: When a customer selects a color, the system applies the color surcharge percentage to the base price AND to the per-millimeter costs BEFORE calculating the total profile cost.

**Why this priority**: Ensures color premiums are applied correctly at the component level, affecting both fixed and variable costs of manufacturing.

**Independent Test**: Can be fully tested by providing base price, per-mm costs, and color surcharge, then verifying the formula: `(basePrice × colorMultiplier) + (costPerMmWidth × colorMultiplier × extraWidth) + (costPerMmHeight × colorMultiplier × extraHeight)`.

**Acceptance Scenarios**:

1. **Given** basePrice=$100, costPerMmWidth=$0.10, costPerMmHeight=$0.10, minWidth=800mm, minHeight=800mm, dimensions=1000mm×1200mm, color surcharge=10%  
   **When** system applies color surcharge  
   **Then** basePriceWithColor = $100 × 1.10 = $110  
   **And** widthCostWithColor = ($0.10 × 1.10) × 200mm = $0.11 × 200 = $22  
   **And** heightCostWithColor = ($0.10 × 1.10) × 400mm = $0.11 × 400 = $44  
   **And** total profile cost = $110 + $22 + $44 = $176

2. **Given** same configuration with color surcharge=0%  
   **When** system applies color surcharge  
   **Then** basePriceWithColor = $100 × 1.00 = $100  
   **And** widthCostWithColor = $0.10 × 200 = $20  
   **And** heightCostWithColor = $0.10 × 400 = $40  
   **And** total profile cost = $100 + $20 + $40 = $160

3. **Given** any configuration with color selected  
   **When** system calculates total price  
   **Then** glass cost and service costs remain unchanged (color surcharge NOT applied)

---

### User Story 5 - Service Calculations (Fixed, Area, Perimeter) (Priority: P2)

**Description**: The system calculates service costs based on their type: fixed quantity, square meters, or linear meters, with support for minimum billing units.

**Why this priority**: Ensures accurate service pricing for different service types commonly used in the glass industry.

**Independent Test**: Can be fully tested by providing service configuration (type, rate, unit) and dimensions, then verifying quantity and amount calculations.

**Acceptance Scenarios**:

1. **Given** a fixed service (Installation) with rate $100  
   **When** system calculates service cost  
   **Then** quantity = 1, amount = $100

2. **Given** a perimeter service (Sealing) with rate $15/ml and dimensions 1.0m × 2.0m  
   **When** system calculates service cost  
   **Then** perimeter = (1.0 + 2.0) × 2 = 6.0 ml  
   **And** amount = $15 × 6.0 = $90

3. **Given** an area service with rate $50/m², dimensions 1.0m × 1.5m, and minimum billing unit 2.0 m²  
   **When** system calculates service cost  
   **Then** area = 1.5 m² < minimum  
   **And** billable area = 2.0 m² (minimum)  
   **And** amount = $50 × 2.0 = $100

---

### User Story 6 - Mathematical Precision with Decimal Arithmetic (Priority: P1)

**Description**: All price calculations use decimal arithmetic (not floating-point) to avoid rounding errors and ensure financial accuracy.

**Why this priority**: Financial calculations with floating-point arithmetic introduce rounding errors that compound over many calculations, leading to incorrect totals.

**Independent Test**: Can be fully tested by performing calculations known to fail with floating-point (e.g., 0.1 + 0.2) and verifying exact results with decimal library.

**Acceptance Scenarios**:

1. **Given** a calculation of 0.1 + 0.2  
   **When** using decimal arithmetic  
   **Then** result = 0.3 exactly (not 0.30000000000000004)

2. **Given** a price calculation with multiple decimal operations  
   **When** final result is rounded to 2 decimals using ROUND_HALF_UP  
   **Then** result is consistent and repeatable across multiple executions

3. **Given** currency values in different formats (string, number, Decimal)  
   **When** converting to Decimal for calculation  
   **Then** all values are normalized correctly before operations

---

### Edge Cases

- **What happens when user enters dimensions below minimum?**  
  System should use minimum dimensions for calculation (not reject the request).

- **What happens when glass discounts exceed total dimensions?**  
  Effective dimensions should be clamped to zero (minimum), resulting in zero glass area.

- **What happens when profit margin is 100% or greater?**  
  Formula `salesPrice = cost / (1 - margin)` becomes invalid. System should validate margin < 100%.

- **What happens when service rate or dimension is zero?**  
  Service amount should be zero (valid calculation).

- **How does system handle very large numbers (e.g., 10,000mm dimensions)?**  
  Decimal library should handle large numbers without overflow, but input validation should enforce business limits.

- **What happens when multiple services and adjustments create negative total?**  
  System should allow negative totals (valid for returns/credits) or reject based on business rules.

---

## Requirements *(mandatory)*

### Functional Requirements

**Core Calculation Logic**

- **FR-001**: System MUST calculate profile cost with color surcharge applied to each component using formula: `(basePrice × colorMultiplier) + (costPerMmWidth × colorMultiplier × max(width - minWidth, 0)) + (costPerMmHeight × colorMultiplier × max(height - minHeight, 0))` where `colorMultiplier = 1 + (colorSurchargePercentage / 100)`

- **FR-002**: System MUST calculate billable glass area using formula: `((width - glassDiscountWidth) × (height - glassDiscountHeight)) / 1,000,000 m²`

- **FR-003**: System MUST calculate glass cost using formula: `billableArea × pricePerSqm`

- **FR-004**: System MUST apply color surcharge to base price, cost-per-mm-width, and cost-per-mm-height individually BEFORE calculating total profile cost

- **FR-005**: System MUST apply color surcharge to accessory cost using formula: `accessoryCost × (1 + colorSurchargePercentage / 100)`

- **FR-006**: System MUST NOT apply color surcharge to glass cost or service costs

- **FR-007**: System MUST calculate model cost as: `profileCost + accessoryCost` (both with color surcharge applied if applicable)

- **FR-008**: System MUST apply profit margin ONLY to model cost (profile + accessories) using formula: `modelSalesPrice = modelCost / (1 - profitMarginPercentage / 100)`

- **FR-009**: System MUST NOT apply profit margin to glass cost or service costs

- **FR-010**: System MUST calculate final sales price as: `modelSalesPrice + glassCost + sum(serviceCosts)`

- **FR-011**: System MUST validate that profit margin percentage is less than 100% (exclusive)

**Service Calculations**

- **FR-012**: System MUST calculate fixed service quantity as 1 (or quantityOverride if provided)

- **FR-013**: System MUST calculate area service quantity as `(widthMeters × heightMeters)` in square meters

- **FR-014**: System MUST calculate perimeter service quantity as `((widthMeters + heightMeters) × 2)` in linear meters

- **FR-015**: System MUST apply minimum billing unit to area/perimeter services when calculated quantity is below minimum

- **FR-016**: System MUST calculate service amount using formula: `serviceRate × quantity`

**Adjustments**

- **FR-017**: System MUST support positive and negative adjustments based on sign configuration

- **FR-018**: System MUST calculate adjustment quantity based on unit type (same as services: unit, sqm, ml)

- **FR-019**: System MUST calculate adjustment amount using formula: `±(adjustmentValue × quantity)`

**Mathematical Precision**

- **FR-020**: System MUST use decimal arithmetic for all monetary calculations (no floating-point)

- **FR-021**: System MUST round all monetary values to 2 decimal places using ROUND_HALF_UP method

- **FR-022**: System MUST round service quantities to 2 decimal places using ROUND_HALF_UP method

- **FR-023**: System MUST round fixed service quantities to 4 decimal places using ROUND_HALF_UP method

- **FR-024**: System MUST ensure all calculations are deterministic (same inputs always produce same outputs)

**Input Handling**

- **FR-025**: System MUST accept dimensions in millimeters (integer or decimal)

- **FR-026**: System MUST accept monetary values as Decimal, number, or string types

- **FR-027**: System MUST normalize all inputs to Decimal type before calculations

- **FR-028**: System MUST treat dimensions below minimum as equal to minimum (no error)

- **FR-029**: System MUST clamp negative effective dimensions (after discounts) to zero

**Output Format**

- **FR-030**: System MUST return breakdown containing: modelCost, modelSalesPrice, glassCost, services[], adjustments[], finalSalesPrice

- **FR-031**: System MUST include colorSurchargePercentage and colorSurchargeAmount in breakdown when applicable

- **FR-032**: System MUST include profitMarginPercentage and profitMarginAmount in breakdown when applicable

- **FR-033**: System MUST return all service items with: serviceId, unit, quantity, amount

- **FR-034**: System MUST return all adjustment items with: concept, amount

**Security & Backend Enforcement**

- **FR-035**: System MUST execute ALL price calculations on the backend (server-side) for security and data integrity

- **FR-036**: System MUST NOT trust any price calculations performed on the client-side

- **FR-037**: System MUST validate all calculation inputs on the backend before processing

### Non-Functional Requirements

**Architecture**

- **NFR-001**: Calculation logic MUST be decoupled from framework dependencies (no Next.js, tRPC, Prisma types in core domain)

- **NFR-002**: Domain logic MUST be organized using hexagonal architecture (ports and adapters pattern)

- **NFR-003**: Code MUST follow SOLID principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion)

- **NFR-004**: Calculation functions MUST be pure (no side effects, deterministic)

**Testing**

- **NFR-005**: Core calculation logic MUST have 100% unit test coverage

- **NFR-006**: All edge cases listed in User Scenarios MUST have explicit test cases

- **NFR-007**: Tests MUST verify mathematical precision using known decimal edge cases

- **NFR-008**: Tests MUST be fast (<10ms per test) since they are pure functions

**Code Quality**

- **NFR-009**: Code MUST be self-documenting (clear naming, minimal comments needed)

- **NFR-010**: All formulas MUST be documented with JSDoc including examples

- **NFR-011**: Magic numbers MUST be extracted to named constants

- **NFR-012**: Type definitions MUST be separated from implementation

- **NFR-013**: Each calculation step MUST be a separate, testable function

**Performance**

- **NFR-014**: Price calculation MUST complete in less than 50ms for typical inputs

- **NFR-015**: Decimal operations MUST not cause memory leaks

### Key Entities *(domain model)*

**PriceCalculationInput** - All data needed to calculate a price:
- Dimensions: `widthMm`, `heightMm`, `minWidthMm`, `minHeightMm`
- Profile costs: `basePrice`, `costPerMmWidth`, `costPerMmHeight`, `accessoryPrice`
- Glass config: `pricePerSqm`, `discountWidthMm`, `discountHeightMm`
- Modifiers: `colorSurchargePercentage`, `profitMarginPercentage`
- Services: array of `{ type, unit, rate, quantityOverride?, minimumBillingUnit? }`
- Adjustments: array of `{ concept, unit, sign, value }`

**PriceCalculationResult** - Complete breakdown of calculated price:
- Model components: `profileCost` (with color), `accessoryCost` (with color), `modelCost` (sum of both)
- Model with margin: `modelSalesPrice` (after applying profit margin to modelCost)
- Glass component: `glassCost` (no color, no margin)
- Service details: `services[]` with `{ serviceId, unit, quantity, amount }` (no margin)
- Adjustment details: `adjustments[]` with `{ concept, amount }`
- Color modifier: `colorSurchargeAmount` (total amount added by color to model)
- Profit modifier: `profitMarginAmount` (total amount added by margin to model)
- Final total: `finalSalesPrice` = modelSalesPrice + glassCost + sum(services) + sum(adjustments)

**Dimensions** - Normalized dimension data:
- Input dimensions: `widthMm`, `heightMm`
- Constraints: `minWidthMm`, `minHeightMm`
- Effective dimensions: `effectiveWidthMm`, `effectiveHeightMm` (for glass)
- Metric conversions: `widthMeters`, `heightMeters`

**ServiceCalculation** - Intermediate service calculation data:
- Configuration: `type`, `unit`, `rate`
- Calculated: `baseQuantity`, `billedQuantity`, `amount`

**Money** - Value object for monetary amounts:
- Internal representation: `Decimal`
- Rounding method: `ROUND_HALF_UP`
- Precision: 2 decimal places for currency, 4 for fixed quantities

### File Organization *(domain architecture)*

Following **Hexagonal Architecture** (Ports and Adapters):

```
src/domain/pricing/
├── core/                              # Domain core (pure business logic)
│   ├── entities/
│   │   ├── money.ts                   # Money value object
│   │   ├── dimensions.ts              # Dimensions value object
│   │   ├── price-calculation.ts       # Main calculation entity
│   │   └── index.ts                   # Public API
│   ├── services/
│   │   ├── profile-calculator.ts      # Profile cost calculation
│   │   ├── glass-calculator.ts        # Glass area and cost calculation
│   │   ├── service-calculator.ts      # Service quantity and cost calculation
│   │   ├── adjustment-calculator.ts   # Adjustment calculation
│   │   ├── margin-calculator.ts       # Profit margin application
│   │   └── index.ts                   # Public API
│   ├── constants.ts                   # Domain constants (MM_PER_METER, ROUND_SCALE, etc.)
│   └── types.ts                       # Domain types (no framework dependencies)
│
├── ports/                             # Interfaces (hexagonal architecture)
│   ├── input/
│   │   └── price-calculator.port.ts   # Input port (use case interface)
│   └── output/
│       └── price-repository.port.ts   # Output port (if needed for persistence)
│
├── use-cases/                         # Application layer (orchestration)
│   ├── calculate-item-price.ts        # Main use case implementation
│   └── index.ts                       # Public API
│
└── adapters/                          # Framework adapters (outside domain)
    ├── trpc/
    │   └── price-calculator.adapter.ts # tRPC adapter (maps tRPC → domain)
    └── prisma/
        └── price-model.adapter.ts      # Prisma adapter (maps DB → domain)
```

**SOLID Compliance**:

1. **Single Responsibility**: Each calculator handles one calculation type
2. **Open/Closed**: New calculation rules can be added without modifying existing code
3. **Liskov Substitution**: All calculators implement same calculation interface
4. **Interface Segregation**: Separate ports for input/output concerns
5. **Dependency Inversion**: Domain depends on abstractions (ports), not concrete implementations

**Testing Structure**:

```
src/domain/pricing/
├── core/
│   ├── entities/
│   │   ├── money.test.ts              # Unit tests for Money value object
│   │   ├── dimensions.test.ts         # Unit tests for Dimensions
│   │   └── price-calculation.test.ts  # Integration tests for full calculation
│   └── services/
│       ├── profile-calculator.test.ts # Unit tests for profile calculation
│       ├── glass-calculator.test.ts   # Unit tests for glass calculation
│       ├── service-calculator.test.ts # Unit tests for service calculation
│       ├── adjustment-calculator.test.ts
│       └── margin-calculator.test.ts
└── use-cases/
    └── calculate-item-price.test.ts   # Use case integration tests
```

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Accuracy**

- **SC-001**: All price calculations produce mathematically exact results (verified against decimal library test cases)

- **SC-002**: Zero rounding errors detected in automated test suite of 100+ calculation scenarios

- **SC-003**: Profit margin calculations produce exact profit percentages (verified: profit/salesPrice = targetMargin)

**Code Quality**

- **SC-004**: Core domain logic has zero framework dependencies (can run in Node.js without Next.js/tRPC/Prisma)

- **SC-005**: 100% unit test coverage on all calculation functions

- **SC-006**: All test cases pass with execution time under 10ms per test

- **SC-007**: Code complexity metrics below threshold (cyclomatic complexity < 10 per function)

**Maintainability**

- **SC-008**: New calculation rules can be added without modifying existing calculator code (Open/Closed principle verified)

- **SC-009**: Each calculation function has a single, clear responsibility (verified in code review)

- **SC-010**: All magic numbers eliminated (100% extracted to named constants)

**Documentation**

- **SC-011**: All calculation functions have JSDoc with formula examples

- **SC-012**: Domain types fully documented with business meaning (no "any" or "unknown" types)

- **SC-013**: Architecture decision records (ADRs) created for key design choices

**Performance**

- **SC-014**: Full price calculation completes in under 50ms (measured with performance benchmarks)

- **SC-015**: Decimal operations verified for memory efficiency (no leaks in long-running tests)

**Business Impact**

- **SC-016**: Price calculations match business requirements (verified by stakeholder test cases)

- **SC-017**: Minimum dimension logic correctly reduces overcharging (verified with real model data)

- **SC-018**: Profit margin formula produces correct profitability (verified against accounting department formulas)

---

## Assumptions

1. **Decimal Library**: We assume the existing `Decimal.js` library (from Prisma) is sufficient for financial precision. If not, we can use `decimal.js` or `big.js` as alternatives.

2. **Rounding Method**: ROUND_HALF_UP (commercial rounding) is the correct method for this business. Other rounding methods (ROUND_DOWN, ROUND_UP) are not considered.

3. **Minimum Dimensions**: When user enters dimensions below minimum, system treats them as minimum (not an error). This is based on current behavior analysis.

4. **Negative Totals**: System allows negative totals (for returns/credits). If business wants to prevent this, validation will be added at application layer (not domain layer).

5. **Currency**: All calculations assume a single currency (USD). Multi-currency support is out of scope for this refactor.

6. **Profit Margin Limit**: Profit margin must be less than 100%. Higher values are mathematically invalid for the formula `salesPrice = cost / (1 - margin)`.

7. **Color Surcharge Application**: Color surcharge applies to basePrice, costPerMmWidth, costPerMmHeight, and accessoryPrice individually BEFORE final calculation. It does NOT apply to glass or services.

8. **Profit Margin Scope**: Profit margin applies ONLY to model costs (profile + accessories). It does NOT apply to glass costs or service costs, which pass through at their cost price.

9. **Service Pricing Independence**: Services are priced based on their unit of measure and minimum billing units, without any profit margin markup.

10. **Backend Calculation Security**: ALL price calculations MUST occur server-side for security and data integrity. Client-side calculations are for display only and never trusted.

11. **Service Minimum Billing**: Minimum billing unit only applies to area and perimeter services, not fixed services.

12. **Dimension Units**: All dimensions are in millimeters (mm). No other units are supported.

13. **Framework Decoupling**: Domain logic will be completely independent of Next.js, tRPC, and Prisma. Adapters will handle all framework-specific concerns.

---

## Out of Scope

1. **Multi-currency support**: All prices in single currency (USD)
2. **Tax calculations**: Tax logic is separate concern
3. **Discount codes/promotions**: Marketing discounts are separate from cost calculations
4. **User interface changes**: This is a backend/domain refactor only
5. **Database schema changes**: Existing schema remains unchanged
6. **API contract changes**: External API remains backward compatible
7. **Performance optimization beyond 50ms**: Current requirement is sufficient
8. **Internationalization of formulas**: Business rules are consistent across markets
9. **Historical price tracking**: This is handled by separate price history feature
10. **Batch calculations**: Single item calculation only (bulk operations out of scope)

---

## Dependencies

**Internal**:
- Existing Prisma schema (Model, GlassType, Service entities)
- Existing tRPC procedures (will be adapted to use new domain layer)
- Existing price calculation usage in catalog and cart modules

**External**:
- Decimal.js library (already included via Prisma)
- Testing framework (Vitest) for unit tests

---

## Risks & Mitigation

| Risk                                           | Impact | Probability | Mitigation                                                           |
| ---------------------------------------------- | ------ | ----------- | -------------------------------------------------------------------- |
| Calculation logic errors in refactor           | High   | Medium      | Comprehensive test suite with real-world test cases before migration |
| Performance regression                         | Medium | Low         | Benchmark tests to verify <50ms requirement                          |
| Breaking existing API contracts                | High   | Medium      | Adapter pattern ensures backward compatibility                       |
| Team learning curve for hexagonal architecture | Medium | High        | Documentation and code examples with clear patterns                  |
| Incomplete edge case coverage                  | Medium | Medium      | Review existing production data for edge cases                       |

---

## Notes

- This refactor follows the **Strangler Fig Pattern**: new domain layer will be built alongside existing code, then gradually replace it.
- All existing tests must continue to pass during refactor (backward compatibility).
- Migration will be done incrementally: first catalog, then cart, then quotes.
- Architecture Decision Records (ADRs) will document key design decisions.
- Code examples and usage documentation will be created for team onboarding.
