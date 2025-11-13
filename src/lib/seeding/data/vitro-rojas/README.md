# Vitro Rojas Panama - Production Data Preset

Production-ready dataset for Vitro Rojas Panama client.

## Overview

This preset contains real business data for a Panama-based glass and window company. All data is production-ready and reflects actual suppliers, products, and pricing structures.

## Data Files

### 1. **tenant-config.data.ts**
Business configuration and branding.
- Business Name: Vitro Rojas S.A.
- Location: Panama City, Panama
- Currency: USD
- Language: Spanish (Panama)
- Contact info, branding colors, logo

### 2. **glass-characteristics.data.ts** (16 items)
Glass characteristics across 7 categories:
- **Safety**: tempered, laminated
- **Thermal**: low_e, double_glazed
- **Acoustic**: acoustic
- **Coating**: reflective
- **Solar**: solar_control
- **Privacy**: frosted, privacy
- **Substrate**: clear_float

### 3. **glass-solutions.data.ts** (10 items)
Business solutions for client needs:
- Security (burglary protection)
- Hurricane Impact (coastal protection)
- Energy Efficiency (HVAC savings)
- Solar Control (tropical climate)
- Noise Reduction (urban areas)
- Privacy
- Aesthetic (architectural glass)
- Coastal Protection (salt resistance)
- UV Protection
- Natural Light

### 4. **profile-suppliers.data.ts** (6 suppliers)
Window/door profile manufacturers:
- Aluminios Panamá (ALUMINUM)
- Perfiles del Istmo (ALUMINUM)
- Ventanas PVC Premium (PVC)
- Sistemas Mixtos Elite (MIXED)
- Alumicorp (ALUMINUM)
- Maderas Tropicales (WOOD - inactive)

### 5. **glass-suppliers.data.ts** (6 suppliers)
Glass manufacturers and distributors:
- Guardian Glass (USA) - Low-E, SunGuard
- Saint-Gobain (France) - Acoustic, tempered
- AGC Glass (Japan) - Solar control
- Vitro Architectural Glass (Mexico) - Value line
- Cristales Centroamericanos (Panama) - Local distributor
- Pilkington (UK) - Inactive

### 6. **glass-types.data.ts** (10 products)
Specific glass products with technical specs:
- Guardian Clear 6mm/8mm ($25.50/$32.00)
- Guardian SunGuard Low-E 6mm ($45.00)
- Saint-Gobain Stadip Silence 8mm ($65.00 - acoustic)
- Saint-Gobain Securit 10mm ($52.00 - tempered)
- AGC Sunergy 6mm ($48.00 - solar control)
- AGC Stopray Vision 50 - 6mm ($55.00 - reflective)
- Vitro Claro/Tintado 6mm ($18.00/$22.00 - value)
- Cristalca Float 4mm ($20.00 - basic)

All include: thickness, pricePerSqm, uValue, solarFactor, lightTransmission

### 7. **models.data.ts** (10 models)
Window and door models with pricing formulas:
- Sliding Windows (2h/3h): $150-$220 base
- Projecting Windows: $180 base
- Fixed Windows: $80 base
- Sliding Doors (2h): $400 base
- Hinged Doors (1h): $350 base
- PVC Windows: $280 base (premium)
- Premium Oscilobatiente: $450 base
- Folding Door 4h: $800 base (draft status)

Pricing: `basePrice + (width × costPerMmWidth) + (height × costPerMmHeight) + accessoryPrice`

### 8. **services.data.ts** (14 services)
Installation and maintenance services:
- Installation (standard/premium/urgent): $15-$35/m²
- Waterproof sealing: $3.50-$6.00/ml
- Anti-hurricane sealing: $8.00/ml
- Local/Regional transport: $50-$120
- Special services (custom fabrication, repairs): $85-$90/unit
- Maintenance inspection: $45/unit
- Beta service (inactive)

### 9. **glass-type-solutions.data.ts** (40+ relationships)
Maps glass types to solutions with performance ratings (1-5 scale):
- 5: Excellent - Maximum performance
- 4: Very Good - Almost optimal
- 3: Good - Meets requirements
- 2: Fair - Acceptable, not ideal
- 1: Poor - Low performance

**Note**: This file uses reference codes (glassTypeCode, solutionKey) that must be resolved to database IDs after inserting glass types and solutions.

## Usage

### Using with Seed Orchestrator

```typescript
import { DrizzleSeedOrchestrator } from "@/lib/seeding/orchestrators/seed-orchestrator";
import { vitroRojasPanamaPreset } from "@/lib/seeding/presets/vitro-rojas-panama.preset";
import { db } from "@/server/db/drizzle";

const orchestrator = new DrizzleSeedOrchestrator(db, { verbose: true });
const result = await orchestrator.seedWithPreset(vitroRojasPanamaPreset);

console.log(`Seeded ${result.totalCreated} records in ${result.durationMs}ms`);
```

### Foreign Key Resolution

The preset requires FK resolution for:

1. **Models → Profile Suppliers**: `profileSupplierId` (currently null)
2. **Glass Types → Glass Suppliers**: `glassSupplierId` (currently null)
3. **Glass Type Solutions**: Requires mapping codes to IDs

**Recommended approach**:
```typescript
// 1. Insert suppliers first
const profileSuppliers = await orchestrator.seedProfileSuppliers(...);
const glassSuppliers = await orchestrator.seedGlassSuppliers(...);

// 2. Map by name/code
const supplierIdMap = new Map(profileSuppliers.map(s => [s.name, s.id]));

// 3. Resolve FKs before inserting models/glass types
const modelsWithFKs = vitroRojasModels.map(model => ({
  ...model,
  profileSupplierId: supplierIdMap.get("Aluminios Panamá") || null
}));

// 4. Insert dependent entities
await orchestrator.seedModels(modelsWithFKs);
```

### Glass Type Solutions Resolution

```typescript
import { vitroRojasGlassTypeSolutionsRefs } from "@/lib/seeding/presets/vitro-rojas-panama.preset";

// 1. Insert glass types and solutions, get IDs
const glassTypes = await orchestrator.seedGlassTypes(...);
const solutions = await orchestrator.seedGlassSolutions(...);

// 2. Create ID maps
const glassTypeIdMap = new Map(glassTypes.map(gt => [gt.code, gt.id]));
const solutionIdMap = new Map(solutions.map(s => [s.key, s.id]));

// 3. Transform references to actual records
const glassTypeSolutions = vitroRojasGlassTypeSolutionsRefs.map(ref => ({
  glassTypeId: glassTypeIdMap.get(ref.glassTypeCode)!,
  solutionId: solutionIdMap.get(ref.solutionKey)!,
  performanceRating: ref.performanceRating,
  isPrimary: ref.isPrimary
}));

// 4. Insert resolved records
await orchestrator.seedGlassTypeSolutions(glassTypeSolutions);
```

## Data Quality Notes

### Pricing Strategy
- All prices in USD
- Glass types: Market rates for Panama (as of Nov 2025)
- Models: Base pricing + dimensional costs
- Services: Competitive rates for Panama market
- Profit margins: 30-45% depending on model complexity

### Suppliers
- International suppliers: Guardian, Saint-Gobain, AGC, Vitro, Pilkington
- Local distributor: Cristalca (immediate stock)
- Profile suppliers: Mix of aluminum, PVC, and mixed systems
- One inactive supplier (Pilkington) for historical data

### Glass Specifications
- Thickness: 4mm-10mm range
- U-Values: 1.5-5.9 W/(m²·K)
- Solar Factors: 0.32-0.88
- Light Transmission: 30%-90%
- All specs comply with international standards (ASTM, EN)

### Climate Considerations
- Tropical climate (Panama)
- High UV exposure solutions
- Hurricane impact resistance (coastal)
- Salt air resistance (coastal protection)
- High humidity considerations

## Testing

```bash
# Test preset compilation
pnpm tsc --noEmit

# Test seeding (dry run recommended first)
pnpm seed:vitro-rojas --dry-run

# Full seeding
pnpm seed:vitro-rojas
```

## Version History

- **v3.0.0** (2025-11-13): Complete dataset with all 9 data files
- **v2.0.0** (2025-11-09): Drizzle ORM migration
- **v1.0.0** (2025-10-15): Initial Prisma version

## Maintenance

Update prices and specs quarterly:
- Glass suppliers: Price updates from distributors
- Services: Labor cost adjustments
- Models: Review cost formulas annually

## Support

For questions about this dataset:
- Technical: Check seed-orchestrator.ts implementation
- Business: Verify with Vitro Rojas client contact
- Pricing: Review with procurement team
