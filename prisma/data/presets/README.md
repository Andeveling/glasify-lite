# Seed Presets - Data Configuration Presets

## Overview

Presets are predefined data configurations that allow you to quickly seed your database with different levels of data depending on your use case.

## Available Presets

### 1. **minimal** - Basic Configuration
**File**: `minimal.preset.ts`

**Use Cases**:
- Quick testing and development
- CI/CD pipelines
- Minimal viable product (MVP)
- Fast database resets

**Contents**:
- 3 glass types (simple, tempered, DVH)
- 2 profile suppliers (Deceuninck PVC, Alumina Aluminum)
- 2 window models (standard sliding)
- 3 core services (installation, sealing, removal)
- **Total**: 10 records

**When to use**:
```bash
# Fast testing
pnpm db:seed -- --preset=minimal

# CI/CD
NODE_ENV=test pnpm db:seed -- --preset=minimal
```

---

### 2. **demo-client** - Realistic Demo Configuration
**File**: `demo-client.preset.ts`

**Use Cases**:
- Client presentations
- Sales demos
- Realistic MVP showcase
- Training new team members
- Investor pitches

**Contents**:
- 10 glass types (monolithic, tempered, laminated, DVH, Low-E)
- 4 profile suppliers (mix of PVC and Aluminum)
- 6 window/door models (sliding, tilt&turn, casement)
- 10 common services (installation, finishing, accessories)
- **Total**: 30 records

**Features**:
- Diverse pricing tiers (budget to premium)
- Realistic Colombian market data
- Common use case coverage
- Professional product variety

**When to use**:
```bash
# Client demo
pnpm db:seed -- --preset=demo-client

# MVP showcase
pnpm db:seed -- --preset=demo-client --verbose
```

---

### 3. **full-catalog** - Complete Market Data
**File**: `full-catalog.preset.ts`

**Use Cases**:
- Production database
- Complete feature testing
- Full market analysis
- Maximum product variety
- Comprehensive reporting

**Contents**:
- 21 glass types (all categories: monolithic, tempered, laminated, DVH, Low-E, specialty)
- 7 profile suppliers (Deceuninck, Rehau, VEKA, Alumina, Sistemas Europeos, etc.)
- 10 window/door models (all Deceuninck and Alumina series)
- 19 services (complete service catalog)
- **Total**: 57 records

**Coverage**:
- **Glass**: Monolithic (4-8mm), Tempered (6-12mm), Laminated (6-10mm), DVH (20-28mm), Low-E, Solar control, Acoustic
- **Materials**: PVC (European premium), Aluminum (local & imported), Wood (limited)
- **Services**: Installation, sealing, finishing, treatments, accessories, demolition, maintenance

**When to use**:
```bash
# Production setup
pnpm db:seed -- --preset=full-catalog

# Complete testing
pnpm db:seed -- --preset=full-catalog --reset
```

---

## Usage Examples

### Basic Usage
```bash
# Default preset (minimal)
pnpm db:seed

# Specific preset
pnpm db:seed -- --preset=demo-client

# With database reset
pnpm db:seed -- --preset=full-catalog --reset

# Verbose output
pnpm db:seed -- --preset=minimal --verbose
```

### Programmatic Usage
```typescript
import { minimalPreset } from './prisma/data/presets/minimal.preset';
import { demoClientPreset } from './prisma/data/presets/demo-client.preset';
import { fullCatalogPreset } from './prisma/data/presets/full-catalog.preset';

// Access preset data
console.log(minimalPreset.stats);
// { glassTypes: 3, profileSuppliers: 2, models: 2, services: 3, total: 10 }

// Seed with specific preset
await seedWithPreset(demoClientPreset);
```

---

## Preset Comparison

| Feature            | Minimal | Demo Client | Full Catalog |
| ------------------ | ------- | ----------- | ------------ |
| Glass Types        | 3       | 10          | 21           |
| Profile Suppliers  | 2       | 4           | 7            |
| Window/Door Models | 2       | 6           | 10           |
| Services           | 3       | 10          | 19           |
| **Total Records**  | **10**  | **30**      | **57**       |
| Seed Time          | <1s     | ~2s         | ~5s          |
| Use Case           | Testing | Demos       | Production   |

---

## Creating Custom Presets

You can create custom presets by combining data from catalogs:

```typescript
// prisma/data/presets/custom.preset.ts
import type { GlassTypeInput } from '../../factories/glass-type.factory';
import { deceuninckInouticS5500 } from '../catalog/models.catalog';
import { standardInstallation, perimeterSealing } from '../catalog/services.catalog';

export const customPreset = {
  name: 'custom-residential',
  description: 'Custom preset for residential projects',
  glassTypes: [
    // Your selected glass types
  ],
  profileSuppliers: [
    // Your selected suppliers
  ],
  models: [
    deceuninckInouticS5500,
    // Other models
  ],
  services: [
    standardInstallation,
    perimeterSealing,
  ],
};
```

---

## Best Practices

### Development
- Use **minimal** preset for fast iteration
- Reset database frequently: `pnpm db:reset && pnpm db:seed -- --preset=minimal`

### Testing
- Use **minimal** in CI/CD for speed
- Use **demo-client** for E2E tests requiring realistic data
- Use **full-catalog** for comprehensive integration tests

### Production
- Use **full-catalog** for initial production setup
- Consider creating custom presets for specific business needs
- Document any custom presets in your team wiki

### Demos & Sales
- Use **demo-client** for client presentations
- Prepare sample quotes beforehand
- Use realistic Colombian pricing

---

## Environment Variables

Some preset data comes from environment variables (TenantConfig):

```env
# .env
TENANT_BUSINESS_NAME="Mi Empresa de Ventanas"
TENANT_CURRENCY="COP"
TENANT_LOCALE="es-CO"
TENANT_TIMEZONE="America/Bogota"
TENANT_QUOTE_VALIDITY_DAYS=30
```

See `src/env-seed.ts` for complete validation schema.

---

## Data Sources

All preset data is based on:
- **Glass Types**: Colombian market pricing 2025
- **Profile Suppliers**: Real manufacturers (Deceuninck, Rehau, Alumina, VEKA)
- **Models**: Actual product specifications from manufacturer websites
- **Services**: Standard Colombian construction/installation rates

### References
- Deceuninck Colombia: https://www.deceuninck.co/
- Alumina specifications: `docs/context/alumina.info.md`
- VEKA examples: `docs/context/veka-example.info.md`

---

## Troubleshooting

### Preset not found
```bash
Error: Preset 'unknown' not found
```
**Solution**: Use `minimal`, `demo-client`, or `full-catalog`

### Validation errors
```bash
Error: Glass type validation failed
```
**Solution**: Check factory validation rules in `prisma/factories/`

### Missing environment variables
```bash
Error: TENANT_BUSINESS_NAME is required
```
**Solution**: Copy `.env.example` to `.env` and fill required fields

---

## Next Steps

After seeding with a preset:

1. **Verify data**: `pnpm db:studio`
2. **Run app**: `pnpm dev`
3. **Test quotes**: Navigate to `/catalog` and create test quotes
4. **Check logs**: Review Winston logs in `logs/` directory

---

**Last Updated**: 2025-01-10  
**Version**: 1.0.0
