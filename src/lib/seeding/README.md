# Seeding Architecture (Drizzle ORM)# Seeding Architecture



**Last Updated**: 2025-11-09  **ORM-Agnostic Seeding System** for Glasify Lite

**Version**: 2.0.0 - Complete Drizzle Migration  

**Status**: ✅ Production Ready (MVP)---



## Overview## 📋 Overview



This directory contains the **new Drizzle-based seeding architecture** that replaces the old Prisma-based system in `/prisma/`. The architecture is completely ORM-agnostic, using pure TypeScript functions and Zod validation.The seeding system is designed to be **completely independent of any ORM** (Prisma, Drizzle, etc.). This architecture allows:



**Key Principles**:- ✅ Safe parallel execution (old Prisma + new Drizzle)

- ✅ **ORM-Independent**: Factories produce plain JavaScript objects (POJOs)- ✅ Type-safe factories producing plain objects (POJOs)

- ✅ **Zod Validation**: Single source of truth for runtime validation- ✅ Validated data with Zod before persistence

- ✅ **Type Safety**: TypeScript types derived from Drizzle schemas- ✅ Flexible persistence layer (swap ORM without changing factories)

- ✅ **Testable**: Pure functions without side effects- ✅ Comprehensive error handling and logging

- ✅ **Maintainable**: Clean separation of concerns

---

---

## 🏗️ Architecture Layers

## Quick Start

```

### Run Seed with Minimal Preset┌─────────────────────────────────────┐

│   Orchestrator (Coordinates all)    │

```bash├─────────────────────────────────────┤

pnpm seed:drizzle:minimal│  Seeders (Drizzle persistence)      │

```├─────────────────────────────────────┤

│  Factories (Generate POJOs)         │

### Run Seed with Vitro Rojas Panama Preset├─────────────────────────────────────┤

│  Utilities (No ORM deps)            │

```bash│  - Validation (Zod)                 │

pnpm seed:drizzle:vitro│  - Decimals (decimal.js)            │

```│  - Formatting                       │

├─────────────────────────────────────┤

---│  Types & Contracts (Interfaces)     │

└─────────────────────────────────────┘

## Architecture```



### Complete Drizzle Stack### Layer Responsibilities



**New System (This Directory)**:| Layer            | Purpose                       | Dependencies                  | Examples                                |

```| ---------------- | ----------------------------- | ----------------------------- | --------------------------------------- |

src/lib/seeding/| **Types**        | Interfaces & type definitions | TypeScript only               | `ISeeder`, `FactoryResult<T>`           |

├── cli/seed.cli.ts                 # CLI interface| **Utilities**    | Pure functions, no ORM        | Zod, decimal.js               | `validateWithSchema()`, `toDecimal()`   |

├── orchestrators/seed-orchestrator.ts  # Coordinates seeders| **Contracts**    | Base classes for seeding      | Types, utilities              | `BaseSeeder<T>`, `ISeederLogger`        |

├── presets/| **Factories**    | Generate test data (POJOs)    | Utilities, Zod                | `UserFactory`, `ProfileSupplierFactory` |

│   ├── minimal.preset.ts           # Test data| **Seeders**      | Persist data to database      | Drizzle, Factories, Utilities | `UserSeeder`, `ProfileSupplierSeeder`   |

│   └── vitro-rojas-panama.preset.ts # Production data| **Orchestrator** | Coordinate seeding workflow   | All above                     | Seeds all entities in order             |

├── factories/ + schemas/ + seeders/ # Entity implementations

└── types/ + utils/ + contracts/     # Shared utilities---

```

## 📁 Directory Structure

**Old System (Deprecated)**:

``````

prisma/src/lib/seeding/

├── seed-cli.ts                     # Old Prisma-based CLI├── README.md                         # This file

├── seeders/seed-orchestrator.ts    # Old Prisma orchestrator├── types/

└── factories/ + seeders/           # Old Prisma implementations│   └── base.types.ts                 # Core interfaces (ISeeder, FactoryResult, etc.)

```├── utils/

│   ├── validation.utils.ts           # Zod-based validation helpers

---│   ├── decimal.utils.ts              # Decimal arithmetic (decimal.js)

│   └── formatting.utils.ts           # Phone, email, formatting (TODO)

## Usage├── contracts/

│   └── seeder.interface.ts           # BaseSeeder<T>, ConsoleSeederLogger

### Available Commands├── schemas/

│   ├── profile-supplier.schema.ts    # Zod schemas from Drizzle models

```bash│   ├── glass-supplier.schema.ts

# Drizzle-based seeding (NEW)│   ├── manufacturer.schema.ts

pnpm seed:drizzle                    # Run with minimal preset│   ├── glass-type.schema.ts

pnpm seed:drizzle:minimal            # Verbose minimal preset│   ├── model.schema.ts

pnpm seed:drizzle:vitro              # Verbose Vitro Rojas preset│   ├── quote.schema.ts

│   └── cart-item.schema.ts

# Prisma-based seeding (OLD - Deprecated)├── factories/

pnpm seed                            # Old system│   ├── profile-supplier.factory.ts   # Generates ProfileSupplier POJOs

pnpm seed:minimal                    # Old minimal preset│   ├── glass-supplier.factory.ts

```│   ├── manufacturer.factory.ts

│   ├── glass-type.factory.ts

### Example Output│   ├── model.factory.ts

│   ├── quote.factory.ts

```bash│   └── cart-item.factory.ts

$ pnpm seed:drizzle:minimal└── seeders/

    ├── profile-supplier.seeder.ts    # Persists with Drizzle

🌱 Glasify Seed CLI (Drizzle)    ├── glass-supplier.seeder.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    ├── manufacturer.seeder.ts

    ├── glass-type.seeder.ts

📦 Using preset: minimal    ├── model.seeder.ts

🔗 Database: localhost:5432/neondb    ├── quote.seeder.ts

    └── cart-item.seeder.ts

━━━ Seeding with preset: minimal ━━━```



━━━ Step 1/2: Profile Suppliers ━━━---

Seeding 2 profile suppliers...

✅ Profile suppliers: 2 inserted, 0 updated, 0 failed## 🔄 Data Flow



━━━ Step 2/2: Glass Suppliers ━━━### Factory → Seeder Pipeline

Seeding 2 glass suppliers...

✅ Glass suppliers: 2 inserted, 0 updated, 0 failed```typescript

// 1. FACTORY: Generate POJO

━━━ Seeding Summary ━━━const profileData = ProfileSupplierFactory.generate(5);

Total: 4 created, 0 updated, 0 failed// Returns: ProfileSupplier[] (plain objects, no ORM)

Duration: 45ms

✅ All records seeded successfully!// 2. VALIDATION: Zod schema validation

const validated = await validateWithSchema(

✅ Seeding completed successfully!  profileDataSchema, 

  profileData

Statistics:);

  Profile Suppliers: 2 created, 0 updated// Returns: FactoryResult<ProfileSupplier[]>

  Glass Suppliers: 2 created, 0 updated

  Total: 4 created, 0 updated// 3. SEEDER: Persist to database

  Duration: 45msconst result = await seeder.seed(validated.data);

```// Executes: INSERT INTO profile_suppliers VALUES (...)

// Returns: SeederResult { inserted: 5, failed: 0, ... }

---```



## Migration Status### Why This Order?



| Component              | Status | Description                                  |1. **Factory produces data** → No database involved, pure logic

| ---------------------- | ------ | -------------------------------------------- |2. **Validation happens** → Catch errors early before database roundtrip

| **CLI**                | ✅      | New Drizzle-based CLI (165 lines)            |3. **Seeder persists** → Single responsibility (just INSERT)

| **Orchestrator**       | ✅      | Drizzle orchestrator (250+ lines)            |

| **Presets**            | ✅      | minimal + vitro-rojas-panama (150+ lines)    |---

| **ProfileSupplier**    | ✅      | Factory + Seeder + Schema (1,031 lines)      |

| **GlassSupplier**      | ✅      | Factory + Seeder + Schema (687 lines)        |## 💻 Usage Examples

| **Infrastructure**     | ✅      | Types, utils, contracts (950+ lines)         |

| **GlassCharacteristic** | ⏳      | Pending migration                            |### Basic Factory Usage

| **Service**            | ⏳      | Pending migration                            |

| **GlassType**          | ⏳      | Pending migration                            |```typescript

| **Model**              | ⏳      | Pending migration                            |import { ProfileSupplierFactory } from '@/lib/seeding/factories/profile-supplier.factory';



**Total Delivered**: 3,233+ lines (MVP complete)// Single record

const one = ProfileSupplierFactory.generate();

---// { id: 'ps_1', name: 'Supplier Name', ... }



## Testing// Multiple records

const many = ProfileSupplierFactory.generate(10);

### Verify Seeding

// With overrides

```bashconst custom = ProfileSupplierFactory.generate(1, {

# Run seed  name: 'Custom Name',

pnpm seed:drizzle:minimal  taxId: '123456789',

});

# Query database```

psql $DATABASE_URL -c "SELECT name FROM profile_supplier ORDER BY name;"

psql $DATABASE_URL -c "SELECT name FROM glass_supplier ORDER BY name;"### Using Seeders

```

```typescript

### Expected Resultsimport { ProfileSupplierSeeder } from '@/lib/seeding/seeders/profile-supplier.seeder';

import { db } from '@/server/db';

**Profile Suppliers** (2 records):

- Aluminios del Pacífico (ALUMINUM)const seeder = new ProfileSupplierSeeder(db);

- PVC Profiles International (PVC)const result = await seeder.seed(data, { batchSize: 50 });



**Glass Suppliers** (2 records):console.log(`Inserted: ${result.inserted}, Failed: ${result.failed}`);

- Guardian Glass (GG-001)```

- Vidriera Local (VL-001)

### Full Orchestration

---

```typescript

## Presetsimport { SeedingOrchestrator } from '@/lib/seeding/orchestrator';

import { db } from '@/server/db';

### Minimal Preset

const orchestrator = new SeedingOrchestrator(db);

**Purpose**: Testing and development

// Clear all data and seed from scratch

**Data**:await orchestrator.reset();

- 2 Profile Suppliers (ALUMINUM, PVC)await orchestrator.seedAll();

- 2 Glass Suppliers (local + international)

// Or just seed specific entities

**Command**: `pnpm seed:drizzle:minimal`await orchestrator.seedEntity('ProfileSupplier', 10);

```

### Vitro Rojas Panama Preset

---

**Purpose**: Production data for Vitro Rojas client

## 🎯 Key Features

**Data**:

- 2 Profile Suppliers (Aluminios Técnicos, PVC Solutions)### 1. **ORM Agnostic**

- 2 Glass Suppliers (Vidriera Nacional, Guardian Glass Panamá)

All utilities and factories have **zero knowledge of ORM**:

**Command**: `pnpm seed:drizzle:vitro`

```typescript

---// ✅ Good: No ORM imports

import { toDecimal } from '@/lib/seeding/utils/decimal.utils';

## Architecture Deep Diveimport { ProfileSupplierFactory } from '@/lib/seeding/factories/profile-supplier.factory';



### 1. Factories (Pure Functions)// ❌ Bad: Would break ORM independence

import { prisma } from '@prisma/client';

Create validated data objects without side effects.import { drizzle } from 'drizzle-orm';

```

**Example**:

```typescript### 2. **Type-Safe Validation**

import { createGlassSupplier } from './factories/glass-supplier.factory';

Factories produce data validated against Zod schemas:

const result = createGlassSupplier({

  name: "Vidrios Test",```typescript

  code: "VT-001",// Schema enforces constraints at the type level

});const profileSchema = z.object({

  name: z.string().min(2).max(100),

if (result.success) {  taxId: z.string().regex(/^\d{8,}$/),

  console.log(result.data); // Validated POJO  email: z.string().email(),

}});

```

// Factories respect these constraints

### 2. Seeders (Drizzle Persistence)const data = ProfileSupplierFactory.generate();

// All fields guaranteed to match schema

Handle database operations using Drizzle ORM.```



**Example**:### 3. **Decimal Precision**

```typescript

import { GlassSupplierSeeder } from './seeders/glass-supplier.seeder';Decimal calculations use `decimal.js`, not floats:



const seeder = new GlassSupplierSeeder(db, logger);```typescript

const result = await seeder.upsert(data);import { multiply, increaseByPercentage } from '@/lib/seeding/utils/decimal.utils';

console.log(`Inserted: ${result.inserted}`);

```const price = new Decimal('10.50');

const withTax = increaseByPercentage(price, 21); // VAT 21%

### 3. Orchestrator (Coordination)// Result: Decimal('12.705') - NOT 12.704999...

```

Coordinates multiple seeders with logging and stats.

### 4. **Batch Processing**

**Example**:

```typescriptLarge datasets are automatically batched:

import { DrizzleSeedOrchestrator } from './orchestrators/seed-orchestrator';

```typescript

const orchestrator = new DrizzleSeedOrchestrator(db, { verbose: true });const result = await seeder.seed(1000000, {

const stats = await orchestrator.seedWithPreset(minimalPreset);  batchSize: 100, // Insert 100 records at a time

```  continueOnError: true, // Don't fail on first error

});

---```



## Troubleshooting---



### Issue: Type errors with materialType## 🧪 Testing



**Problem**: Preset uses lowercase string like `"aluminum"`.### Factory Unit Tests



**Solution**: Use uppercase enums: `"ALUMINUM"`, `"PVC"`, `"WOOD"`, `"MIXED"`.Test factories in isolation (no database):



```typescript```typescript

// ❌ WRONGimport { ProfileSupplierFactory } from '@/lib/seeding/factories/profile-supplier.factory';

{ materialType: "aluminum" }import { profileSupplierSchema } from '@/lib/seeding/schemas/profile-supplier.schema';



// ✅ CORRECTdescribe('ProfileSupplierFactory', () => {

{ materialType: "ALUMINUM" }  it('should generate valid data', () => {

```    const data = ProfileSupplierFactory.generate();

    expect(profileSupplierSchema.parse(data)).toBeDefined();

### Issue: Database connection error  });

});

**Problem**: `DATABASE_URL` not set.```



**Solution**: Set environment variable in `.env.local`:### Seeder Integration Tests



```bashTest seeding against real database:

DATABASE_URL="postgres://user:password@localhost:5432/dbname"

``````typescript

import { ProfileSupplierSeeder } from '@/lib/seeding/seeders/profile-supplier.seeder';

---

describe('ProfileSupplierSeeder', () => {

## Next Steps  it('should seed data', async () => {

    const seeder = new ProfileSupplierSeeder(db);

1. ✅ **MVP Complete**: ProfileSupplier + GlassSupplier working    const result = await seeder.seed(data);

2. ⏳ **Phase 4**: Migrate GlassCharacteristic entity    expect(result.success).toBe(true);

3. ⏳ **Phase 5**: Migrate Service entity    expect(result.inserted).toBe(data.length);

4. ⏳ **Phase 6-8**: Migrate GlassType, GlassSolution, Model  });

5. ⏳ **Phase 9-12**: Deprecate Prisma system});

```

**See**: `/plan/refactor-orm-agnostic-factories-seeders-1.md` for complete roadmap

---

---

## 🚀 Parallel Execution Strategy

## Related Documentation

The ORM-agnostic design enables safe parallel execution of old and new systems:

- **Migration Plan**: `/plan/refactor-orm-agnostic-factories-seeders-1.md`

- **Old System**: `/prisma/factories/` and `/prisma/seeders/` (deprecated)```

- **Architecture**: Clean Architecture + SOLID principlesPhase 1: Foundation

  ✅ Utilities (decimal, validation, formatting)

---  ✅ Contracts (BaseSeeder, interfaces)



## SupportPhase 2: ProfileSupplier Pilot

  ✅ Factory (Drizzle-based, no Prisma)

For questions or issues, contact the Glasify Lite team.  ✅ Seeder (Drizzle insert)

  ✅ Old Prisma system still active ← PARALLEL EXECUTION

**Maintainers**: @glasify-team

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
