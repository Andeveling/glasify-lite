# Seeding Architecture

**ORM-Agnostic Seeding System** for Glasify Lite

---

## 📋 Overview

The seeding system is designed to be **completely independent of any ORM** (Prisma, Drizzle, etc.). This architecture allows:

- ✅ Safe parallel execution (old Prisma + new Drizzle)
- ✅ Type-safe factories producing plain objects (POJOs)
- ✅ Validated data with Zod before persistence
- ✅ Flexible persistence layer (swap ORM without changing factories)
- ✅ Comprehensive error handling and logging

---

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────┐
│   Orchestrator (Coordinates all)    │
├─────────────────────────────────────┤
│  Seeders (Drizzle persistence)      │
├─────────────────────────────────────┤
│  Factories (Generate POJOs)         │
├─────────────────────────────────────┤
│  Utilities (No ORM deps)            │
│  - Validation (Zod)                 │
│  - Decimals (decimal.js)            │
│  - Formatting                       │
├─────────────────────────────────────┤
│  Types & Contracts (Interfaces)     │
└─────────────────────────────────────┘
```

### Layer Responsibilities

| Layer            | Purpose                       | Dependencies                  | Examples                                |
| ---------------- | ----------------------------- | ----------------------------- | --------------------------------------- |
| **Types**        | Interfaces & type definitions | TypeScript only               | `ISeeder`, `FactoryResult<T>`           |
| **Utilities**    | Pure functions, no ORM        | Zod, decimal.js               | `validateWithSchema()`, `toDecimal()`   |
| **Contracts**    | Base classes for seeding      | Types, utilities              | `BaseSeeder<T>`, `ISeederLogger`        |
| **Factories**    | Generate test data (POJOs)    | Utilities, Zod                | `UserFactory`, `ProfileSupplierFactory` |
| **Seeders**      | Persist data to database      | Drizzle, Factories, Utilities | `UserSeeder`, `ProfileSupplierSeeder`   |
| **Orchestrator** | Coordinate seeding workflow   | All above                     | Seeds all entities in order             |

---

## 📁 Directory Structure

```
src/lib/seeding/
├── README.md                         # This file
├── types/
│   └── base.types.ts                 # Core interfaces (ISeeder, FactoryResult, etc.)
├── utils/
│   ├── validation.utils.ts           # Zod-based validation helpers
│   ├── decimal.utils.ts              # Decimal arithmetic (decimal.js)
│   └── formatting.utils.ts           # Phone, email, formatting (TODO)
├── contracts/
│   └── seeder.interface.ts           # BaseSeeder<T>, ConsoleSeederLogger
├── schemas/
│   ├── profile-supplier.schema.ts    # Zod schemas from Drizzle models
│   ├── glass-supplier.schema.ts
│   ├── manufacturer.schema.ts
│   ├── glass-type.schema.ts
│   ├── model.schema.ts
│   ├── quote.schema.ts
│   └── cart-item.schema.ts
├── factories/
│   ├── profile-supplier.factory.ts   # Generates ProfileSupplier POJOs
│   ├── glass-supplier.factory.ts
│   ├── manufacturer.factory.ts
│   ├── glass-type.factory.ts
│   ├── model.factory.ts
│   ├── quote.factory.ts
│   └── cart-item.factory.ts
└── seeders/
    ├── profile-supplier.seeder.ts    # Persists with Drizzle
    ├── glass-supplier.seeder.ts
    ├── manufacturer.seeder.ts
    ├── glass-type.seeder.ts
    ├── model.seeder.ts
    ├── quote.seeder.ts
    └── cart-item.seeder.ts
```

---

## 🔄 Data Flow

### Factory → Seeder Pipeline

```typescript
// 1. FACTORY: Generate POJO
const profileData = ProfileSupplierFactory.generate(5);
// Returns: ProfileSupplier[] (plain objects, no ORM)

// 2. VALIDATION: Zod schema validation
const validated = await validateWithSchema(
  profileDataSchema, 
  profileData
);
// Returns: FactoryResult<ProfileSupplier[]>

// 3. SEEDER: Persist to database
const result = await seeder.seed(validated.data);
// Executes: INSERT INTO profile_suppliers VALUES (...)
// Returns: SeederResult { inserted: 5, failed: 0, ... }
```

### Why This Order?

1. **Factory produces data** → No database involved, pure logic
2. **Validation happens** → Catch errors early before database roundtrip
3. **Seeder persists** → Single responsibility (just INSERT)

---

## 💻 Usage Examples

### Basic Factory Usage

```typescript
import { ProfileSupplierFactory } from '@/lib/seeding/factories/profile-supplier.factory';

// Single record
const one = ProfileSupplierFactory.generate();
// { id: 'ps_1', name: 'Supplier Name', ... }

// Multiple records
const many = ProfileSupplierFactory.generate(10);

// With overrides
const custom = ProfileSupplierFactory.generate(1, {
  name: 'Custom Name',
  taxId: '123456789',
});
```

### Using Seeders

```typescript
import { ProfileSupplierSeeder } from '@/lib/seeding/seeders/profile-supplier.seeder';
import { db } from '@/server/db';

const seeder = new ProfileSupplierSeeder(db);
const result = await seeder.seed(data, { batchSize: 50 });

console.log(`Inserted: ${result.inserted}, Failed: ${result.failed}`);
```

### Full Orchestration

```typescript
import { SeedingOrchestrator } from '@/lib/seeding/orchestrator';
import { db } from '@/server/db';

const orchestrator = new SeedingOrchestrator(db);

// Clear all data and seed from scratch
await orchestrator.reset();
await orchestrator.seedAll();

// Or just seed specific entities
await orchestrator.seedEntity('ProfileSupplier', 10);
```

---

## 🎯 Key Features

### 1. **ORM Agnostic**

All utilities and factories have **zero knowledge of ORM**:

```typescript
// ✅ Good: No ORM imports
import { toDecimal } from '@/lib/seeding/utils/decimal.utils';
import { ProfileSupplierFactory } from '@/lib/seeding/factories/profile-supplier.factory';

// ❌ Bad: Would break ORM independence
import { prisma } from '@prisma/client';
import { drizzle } from 'drizzle-orm';
```

### 2. **Type-Safe Validation**

Factories produce data validated against Zod schemas:

```typescript
// Schema enforces constraints at the type level
const profileSchema = z.object({
  name: z.string().min(2).max(100),
  taxId: z.string().regex(/^\d{8,}$/),
  email: z.string().email(),
});

// Factories respect these constraints
const data = ProfileSupplierFactory.generate();
// All fields guaranteed to match schema
```

### 3. **Decimal Precision**

Decimal calculations use `decimal.js`, not floats:

```typescript
import { multiply, increaseByPercentage } from '@/lib/seeding/utils/decimal.utils';

const price = new Decimal('10.50');
const withTax = increaseByPercentage(price, 21); // VAT 21%
// Result: Decimal('12.705') - NOT 12.704999...
```

### 4. **Batch Processing**

Large datasets are automatically batched:

```typescript
const result = await seeder.seed(1000000, {
  batchSize: 100, // Insert 100 records at a time
  continueOnError: true, // Don't fail on first error
});
```

---

## 🧪 Testing

### Factory Unit Tests

Test factories in isolation (no database):

```typescript
import { ProfileSupplierFactory } from '@/lib/seeding/factories/profile-supplier.factory';
import { profileSupplierSchema } from '@/lib/seeding/schemas/profile-supplier.schema';

describe('ProfileSupplierFactory', () => {
  it('should generate valid data', () => {
    const data = ProfileSupplierFactory.generate();
    expect(profileSupplierSchema.parse(data)).toBeDefined();
  });
});
```

### Seeder Integration Tests

Test seeding against real database:

```typescript
import { ProfileSupplierSeeder } from '@/lib/seeding/seeders/profile-supplier.seeder';

describe('ProfileSupplierSeeder', () => {
  it('should seed data', async () => {
    const seeder = new ProfileSupplierSeeder(db);
    const result = await seeder.seed(data);
    expect(result.success).toBe(true);
    expect(result.inserted).toBe(data.length);
  });
});
```

---

## 🚀 Parallel Execution Strategy

The ORM-agnostic design enables safe parallel execution of old and new systems:

```
Phase 1: Foundation
  ✅ Utilities (decimal, validation, formatting)
  ✅ Contracts (BaseSeeder, interfaces)

Phase 2: ProfileSupplier Pilot
  ✅ Factory (Drizzle-based, no Prisma)
  ✅ Seeder (Drizzle insert)
  ✅ Old Prisma system still active ← PARALLEL EXECUTION

Phase 3-8: Remaining Entities
  ✅ GlassSupplier, Manufacturer, GlassType, Model, Quote, CartItem
  ✅ Each entity: Factory → Schema → Seeder
  ✅ Old Prisma system gradually removed

Phase 9: Cleanup
  ✅ Remove all Prisma dependencies
  ✅ Update tests to use Drizzle
```

---

## ⚠️ Important Rules

### ✅ DO

- ✅ Import types from `./types/base.types.ts`
- ✅ Use utilities from `./utils/` (no ORM)
- ✅ Extend `BaseSeeder<T>` for new seeders
- ✅ Use `decimal.js` for all monetary values
- ✅ Validate with Zod before seeding
- ✅ Batch large datasets (50-100 records per batch)
- ✅ Implement clear() method in all seeders
- ✅ Use server-side logging (not console)

### ❌ DON'T

- ❌ Import Prisma in factories (breaks ORM independence)
- ❌ Use TypeScript `any` type (always explicit types)
- ❌ Use `Date.now()` in factories (non-deterministic)
- ❌ Store raw floats (use Decimal always)
- ❌ Import Winston logger in factories (server-side only)
- ❌ Create barrel files (index.ts) in this directory
- ❌ Use `console` in seeders (use ISeederLogger)

---

## 📝 Implementation Checklist

Before adding a new entity to seeding:

- [ ] Create Zod schema in `schemas/`
- [ ] Create factory in `factories/`
- [ ] Create seeder in `seeders/`
- [ ] Implement `insertBatch()` in seeder
- [ ] Implement `clear()` in seeder
- [ ] Write factory unit tests
- [ ] Write seeder integration tests
- [ ] Update orchestrator to include new entity
- [ ] Test parallel execution with old system
- [ ] Document any special considerations

---

## 🔗 Related Files

- **Orchestrator**: `src/lib/seeding/orchestrator.ts` (TODO)
- **Utilities tests**: `tests/unit/lib/seeding/` (TODO)
- **Seeds endpoint**: `src/app/api/admin/seeds/route.ts` (TODO)
- **Migration guide**: `docs/seeding-migration.md` (TODO)

---

## 🆘 Troubleshooting

### "Unknown ORM imports in factory"

**Problem**: Factory imports from `@prisma/client`

**Solution**: Remove all Prisma imports. Factories generate POJOs only.

### "Decimal precision lost"

**Problem**: Using `number` instead of `Decimal`

**Solution**: Always use `decimal.js`:
```typescript
import { toDecimal } from '@/lib/seeding/utils/decimal.utils';
const price = toDecimal('10.50'); // Not 10.50 as number
```

### "Seeder fails silently"

**Problem**: No error logging

**Solution**: Implement `ISeederLogger` and pass to seeder:
```typescript
const seeder = new ProfileSupplierSeeder(db, logger);
```

---

**Last Updated**: 2025-01-10
**Architecture**: ORM-Agnostic, Type-Safe, Decimal-Precise
**Status**: Phase 1 Foundation Complete → Phase 2 ProfileSupplier Ready
