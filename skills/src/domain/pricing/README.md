# Pricing Domain Layer

**Pure Domain Layer with Hexagonal Architecture**

This directory contains the **pure business logic** for price calculations in Glasify, implemented using **Domain-Driven Design (DDD)** and **Hexagonal Architecture (Ports & Adapters)** principles.

---

## Architecture Overview

```
src/domain/pricing/
├── core/                       # Pure domain logic (NO framework dependencies)
│   ├── entities/              # Domain entities (Money, Dimensions, PriceCalculation)
│   ├── services/              # Domain services (calculators)
│   └── value-objects/         # Value objects (immutable business concepts)
│
├── use-cases/                 # Application use cases (orchestration)
│   └── calculate-item-price.ts
│
├── ports/                     # Interfaces (hexagon boundaries)
│   ├── input/                 # Input ports (use case interfaces)
│   └── output/                # Output ports (external dependencies)
│
└── adapters/                  # Framework integration (OUTSIDE hexagon)
    └── trpc/                  # tRPC adapters (Prisma Decimal ↔ Money)
```

---

## Design Principles

### 1. **Pure Domain Layer**
- **NO framework imports** (Next.js, tRPC, Prisma, React)
- **NO database access** (Prisma client)
- **NO HTTP concerns** (requests, responses)
- **ONLY** business logic with primitive types and `decimal.js`

### 2. **Hexagonal Architecture**
- **Core** = Business logic (entities, services, calculators)
- **Ports** = Interfaces (input/output boundaries)
- **Adapters** = Framework integration (tRPC, Prisma)

### 3. **Decimal Precision**
- Uses `decimal.js` for financial calculations
- Guarantees `0.1 + 0.2 = 0.3` (no floating-point errors)
- Tested with property-based tests (fast-check)

### 4. **Immutability**
- All value objects (Money, Dimensions) are immutable
- Operations return new instances (no mutation)
- Pure functions (deterministic, no side effects)

### 5. **Testability**
- 159 unit tests with 100% coverage
- No mocks needed (pure functions)
- Fast execution (<300ms for all tests)

---

## Key Concepts

### Value Objects

#### Money
```typescript
import { Money } from '@/domain/pricing/core/entities/money';

const price = Money.fromNumber(100);
const discounted = price.multiply(0.9); // $90.00
const total = price.add(Money.fromNumber(50)); // $150.00

// Decimal precision guaranteed
const precise = Money.fromNumber(0.1)
  .add(Money.fromNumber(0.2)); // 0.3 (not 0.30000000000000004)
```

#### Dimensions
```typescript
import { Dimensions } from '@/domain/pricing/core/entities/dimensions';

const dims = Dimensions.fromMillimeters(1000, 1200, 800, 800);
// width: 1000mm, height: 1200mm, minWidth: 800mm, minHeight: 800mm

dims.effectiveWidth();  // 200mm (1000 - 800)
dims.effectiveHeight(); // 400mm (1200 - 800)
dims.areaInMeters();    // 1.2 m² (1.0 * 1.2)
```

### Domain Services

#### ProfileCalculator
Calculates aluminum profile cost:
- Base cost + extra millimeters (width/height)
- Color surcharge application

#### GlassCalculator
Calculates glass cost:
- Base cost per m²
- Volume discounts (m² tiers)

#### MarginCalculator
Applies profit margin:
- Margin = (Sales Price - Cost) / Sales Price
- Applied ONLY to model costs (NOT services)

#### ServiceCalculator
Calculates service costs:
- Area-based (sqm): Installation, reinforcement
- Perimeter-based (ml): Seals, weatherstripping
- Fixed: Delivery, inspection
- **Minimum billing unit** support

#### AccessoryCalculator
Calculates accessory cost:
- Fixed price + color surcharge

#### AdjustmentCalculator
Calculates manual adjustments:
- Positive/negative modifications
- Area or perimeter-based

---

## Usage

### Basic Usage (Use Case)

```typescript
import { CalculateItemPrice } from '@/domain/pricing/use-cases/calculate-item-price';

const result = CalculateItemPrice.execute({
  dimensions: { width: 1000, height: 1200, minWidth: 800, minHeight: 800 },
  profile: {
    basePrice: 50,
    widthCostPerMm: 0.05,
    heightCostPerMm: 0.05,
  },
  glass: {
    pricePerSqm: 120,
    discounts: [
      { minArea: 0, maxArea: 1, discount: 0 },
      { minArea: 1, maxArea: 2, discount: 0.05 },
    ],
  },
  color: { multiplier: 1.15 },
  margin: { percentage: 0.30 },
  includeAccessory: true,
  accessory: { price: 25 },
  services: [
    {
      name: 'Instalación',
      unit: 'sqm',
      pricePerUnit: 30,
      minimumBillingUnit: 1.5,
    },
  ],
  adjustments: [],
});

console.log(result.grandTotal); // Money instance
console.log(result.grandTotal.toNumber()); // 450.75 (example)
```

### tRPC Adapter Usage

```typescript
import { calculateItemPriceAdapter } from '@/domain/pricing/adapters/trpc/price-calculator.adapter';
import { Decimal } from '@prisma/client/runtime/library';

// Convert Prisma Decimal types to domain Money
const result = calculateItemPriceAdapter({
  dimensions: {
    width: new Decimal(1000),
    height: new Decimal(1200),
    minWidth: new Decimal(800),
    minHeight: new Decimal(800),
  },
  profile: {
    basePrice: new Decimal(50),
    widthCostPerMm: new Decimal(0.05),
    heightCostPerMm: new Decimal(0.05),
  },
  // ... rest of input
});

// Returns PriceItemCalculationResult with Decimal types
console.log(result.grandTotal.toNumber()); // 450.75
```

---

## Testing

### Run All Tests
```bash
pnpm test
```

### Run Specific Test Suites
```bash
# Money entity tests
pnpm test tests/unit/domain/pricing/entities/money.test.ts

# Calculator tests
pnpm test tests/unit/domain/pricing/services/

# Use case tests
pnpm test tests/unit/domain/pricing/use-cases/

# Adapter tests
pnpm test src/domain/pricing/adapters/
```

### Test Coverage
```bash
pnpm test --coverage
```

**Current Coverage**: 100% (159/159 tests passing)

---

## Adding New Calculators

### 1. Create Calculator in `core/services/`

```typescript
// src/domain/pricing/core/services/new-calculator.ts
import { Money } from '../entities/money';

export class NewCalculator {
  static calculate(input: YourInput): Money {
    // Pure business logic here
    return Money.fromNumber(result);
  }
}
```

### 2. Add Tests

```typescript
// tests/unit/domain/pricing/services/new-calculator.test.ts
import { describe, expect, it } from 'vitest';
import { NewCalculator } from '@/domain/pricing/core/services/new-calculator';

describe('NewCalculator', () => {
  it('should calculate correctly', () => {
    const result = NewCalculator.calculate({ /* input */ });
    expect(result.toNumber()).toBe(expectedValue);
  });
});
```

### 3. Integrate in PriceCalculation Aggregate

```typescript
// src/domain/pricing/core/entities/price-calculation.ts
import { NewCalculator } from '../services/new-calculator';

export class PriceCalculation {
  static calculate(input: PriceCalculationInput): PriceCalculationResult {
    // ... existing calculations
    const newCost = NewCalculator.calculate(input.newData);
    
    return {
      // ... existing fields
      newCost,
      grandTotal: existingTotal.add(newCost),
    };
  }
}
```

---

## Migration Status

### ✅ Migrated Modules
- **Quotes**: `src/server/api/routers/quote/quote.ts` - Uses `CalculateItemPrice.execute()`
- **Catalog**: Uses `quote.calculate-item` procedure (indirect)
- **Cart**: Uses `quote.calculate-item` procedure (indirect)

### 🗑️ Removed
- `src/server/price/price-item.ts` - Old implementation deleted
- `tests/unit/price-item.test.ts` - Old tests deleted

### 📊 Test Results
- **Unit Tests**: 143 tests (domain + services + entities)
- **Adapter Tests**: 16 tests (tRPC adapter)
- **Total**: 159/159 tests passing ✅

---

## Performance

### Targets
- Single calculation: **<50ms**
- 1000 calculations: **<5s**

### Benchmarks
```bash
pnpm test:bench
```

**Current**: Average ~2-3ms per calculation (well below target)

---

## Business Rules Reference

### Color Surcharge
- Applied to: Profile + Accessory
- NOT applied to: Glass, Services, Adjustments
- Multiplier example: 1.15 = +15%

### Profit Margin
- Applied to: Profile + Glass + Accessory (model cost)
- NOT applied to: Services, Adjustments
- Formula: `salesPrice = cost / (1 - marginPercentage)`
- Example: 30% margin → divide by 0.70

### Minimum Dimensions
- Profile charges extra ONLY for dimensions > minimum
- Example: 1000mm width, 800mm min → 200mm extra charged

### Minimum Billing Unit
- Applied to: Area and Perimeter services ONLY
- Ignored for: Fixed services
- Example: 1.2m² calculated, 1.5m² minimum → charged 1.5m²

### Glass Discounts
- Volume-based tiers (m²)
- Applied BEFORE margin
- Example: 1.5m² → 5% discount tier

---

## Related Documentation

- **Architecture**: `/docs/architecture.md`
- **PRD**: `/docs/prd.md`
- **Implementation Plan**: `/specs/016-price-calculation-refactor/plan.md`
- **Task Tracking**: `/specs/016-price-calculation-refactor/tasks.md`
- **Requirements**: `/specs/016-price-calculation-refactor/requirements.md`

---

## Troubleshooting

### Import Issues
```typescript
// ✅ CORRECT: Use path aliases
import { Money } from '@/domain/pricing/core/entities/money';

// ❌ WRONG: Relative paths
import { Money } from '../../domain/pricing/core/entities/money';
```

### Decimal Precision Issues
```typescript
// ✅ CORRECT: Use Money value object
const price = Money.fromNumber(0.1).add(Money.fromNumber(0.2));
console.log(price.toNumber()); // 0.3

// ❌ WRONG: JavaScript native numbers
const wrong = 0.1 + 0.2; // 0.30000000000000004
```

### Type Errors with Prisma Decimal
```typescript
// ✅ CORRECT: Use adapter
import { calculateItemPriceAdapter } from '@/domain/pricing/adapters/trpc/price-calculator.adapter';

const result = calculateItemPriceAdapter({
  dimensions: {
    width: new Decimal(1000), // Prisma Decimal
    // ...
  },
});

// ❌ WRONG: Use domain directly with Prisma types
const wrong = CalculateItemPrice.execute({
  dimensions: { width: new Decimal(1000) }, // Type error!
});
```

---

**Last Updated**: 2025-11-07  
**Status**: ✅ Production Ready  
**Tests**: 159/159 passing  
**Coverage**: 100%
