# Glass Solutions & Performance Ratings Guide

**Version**: 1.0  
**Last Updated**: October 9, 2025  
**Owner**: Glasify Development Team

---

## 📋 Overview

This guide documents Glasify's **glass classification system** based on solutions and performance ratings. It provides technical standards, rating calculation formulas, and implementation guidelines for developers working with glass data.

### Purpose

- Define glass solutions and their characteristics
- Establish performance rating standards aligned with EN/ISO norms
- Provide calculation formulas for each performance category
- Guide developers in implementing glass selection features

### Audience

- Backend developers (tRPC, Prisma, database)
- Frontend developers (React components, UI)
- Product managers (feature planning)
- QA engineers (testing criteria)

---

## 🎯 Glass Solutions

### Core Solutions

Glasify categorizes glass types into **7 primary solutions**, each addressing specific use cases:

| Key                   | Name (Spanish)                 | Name (English)            | Icon | Description                                 |
| --------------------- | ------------------------------ | ------------------------- | ---- | ------------------------------------------- |
| `general`             | Vidrio General                 | General Glass             | `🪟`  | Standard glass for basic applications       |
| `security`            | Vidrio de Seguridad            | Security Glass            | `🛡️`  | Laminated glass resistant to impacts        |
| `thermal_insulation`  | Vidrio de Aislamiento Térmico  | Thermal Insulation Glass  | `🌡️`  | Low-E, double glazing for energy efficiency |
| `acoustic_insulation` | Vidrio de Aislamiento Acústico | Acoustic Insulation Glass | `🔇`  | Soundproof glass for noise reduction        |
| `decorative`          | Vidrio Decorativo              | Decorative Glass          | `🎨`  | Tinted, frosted, textured glass             |
| `solar_control`       | Vidrio de Control Solar        | Solar Control Glass       | `☀️`  | Solar reflective, UV protection             |
| `fire_resistant`      | Vidrio Resistente al Fuego     | Fire Resistant Glass      | `🔥`  | Fire-rated glass for safety compliance      |

### Solution Properties

```typescript
interface GlassSolution {
  id: string;                  // UUID
  key: string;                 // Unique identifier (snake_case)
  nameEs: string;              // Spanish name (user-facing)
  nameEn: string;              // English name (technical)
  icon: string;                // Emoji or icon identifier
  descriptionEs: string;       // Detailed Spanish description
  descriptionEn: string | null; // Detailed English description (optional)
  createdAt: Date;
  updatedAt: Date;
}
```

### Many-to-Many Relationship

**Key Insight**: A single glass type can have **multiple solutions**.

**Example**: Guardian Sun Laminated
- Primary solution: `security` (laminated construction)
- Secondary solution: `solar_control` (UV/heat reflection)
- Secondary solution: `thermal_insulation` (Low-E coating)

```typescript
interface GlassTypeSolution {
  id: string;
  glassTypeId: string;         // Foreign key to GlassType
  solutionId: string;          // Foreign key to GlassSolution
  isPrimary: boolean;          // True for primary classification
  securityRating: PerformanceRating;
  acousticRating: PerformanceRating;
  thermalRating: PerformanceRating;
  energyRating: PerformanceRating;
}
```

---

## ⭐ Performance Ratings

### Rating Scale

Glasify uses a **5-level performance rating system** for transparency and user decision-making:

| Rating      | Stars | Label (ES) | Label (EN) | Numeric Value | Description                                    |
| ----------- | ----- | ---------- | ---------- | ------------- | ---------------------------------------------- |
| `basic`     | 1⭐    | Básico     | Basic      | 1             | Minimal performance, standard glass            |
| `standard`  | 2⭐    | Estándar   | Standard   | 2             | Standard performance, meets basic requirements |
| `good`      | 3⭐    | Bueno      | Good       | 3             | Good performance, above average                |
| `very_good` | 4⭐    | Muy Bueno  | Very Good  | 4             | Very good performance, high-quality            |
| `excellent` | 5⭐    | Excelente  | Excellent  | 5             | Excellent/Maximum performance                  |

### Rating Categories

Each glass type is rated in **4 independent categories**:

1. **Security Rating** (`securityRating`) - Physical security and impact resistance
2. **Acoustic Rating** (`acousticRating`) - Sound insulation performance
3. **Thermal Rating** (`thermalRating`) - Thermal insulation (U-value)
4. **Energy Rating** (`energyRating`) - Energy efficiency and solar factor

---

## 🔬 Rating Standards & Formulas

### 1. Security Rating

**Standard**: EN 356 (Resistance to manual attack)

**Measurement**: Impact resistance classes (P1A-P8C)

#### Calculation Formula

```typescript
function calculateSecurityRating(glassType: GlassType): PerformanceRating {
  const { construction, thickness, laminated, pvbLayers } = glassType;
  
  if (!laminated) {
    return 'basic'; // Non-laminated glass has minimal security
  }
  
  // Laminated glass rating based on PVB layers and thickness
  if (pvbLayers >= 4 && thickness >= 12.0) return 'excellent'; // P6B-P8C
  if (pvbLayers >= 2 && thickness >= 8.0) return 'very_good';  // P4A-P5A
  if (pvbLayers >= 1 && thickness >= 6.38) return 'good';      // P2A-P3A
  if (laminated) return 'standard';                            // P1A
  
  return 'basic';
}
```

#### EN 356 Classes Reference

| Class   | Rating      | Description        | Typical Construction        |
| ------- | ----------- | ------------------ | --------------------------- |
| P1A     | `standard`  | Low protection     | 6.38mm laminated (1 PVB)    |
| P2A-P3A | `good`      | Medium protection  | 8-10mm laminated (2 PVB)    |
| P4A-P5A | `very_good` | High protection    | 10-12mm laminated (3-4 PVB) |
| P6B-P8C | `excellent` | Maximum protection | 12-20mm laminated (4+ PVB)  |

**Example**:
- Standard float glass (6mm) → `basic`
- Laminated 6.38mm (3+0.38+3) → `standard`
- Laminated 8.76mm (4+0.76+4) → `good`
- Laminated 12.76mm (6+0.76+6) → `very_good`

---

### 2. Acoustic Rating

**Standard**: ISO 140-3 / ISO 717-1 (Sound insulation)

**Measurement**: Weighted sound reduction index Rw (dB)

#### Calculation Formula

```typescript
function calculateAcousticRating(glassType: GlassType): PerformanceRating {
  const { thickness, laminated, pvbLayers, doubleGlazing, airGap } = glassType;
  
  // Double glazing with acoustic PVB
  if (doubleGlazing && laminated && pvbLayers >= 2 && airGap >= 12) {
    return 'excellent'; // Rw > 42 dB
  }
  
  // Laminated acoustic glass
  if (laminated && pvbLayers >= 2) return 'very_good'; // Rw 38-42 dB
  if (laminated && pvbLayers >= 1) return 'good';      // Rw 34-38 dB
  
  // Standard double glazing
  if (doubleGlazing) return 'standard'; // Rw 30-34 dB
  
  // Single float glass
  if (thickness >= 8.0) return 'standard'; // Rw 28-30 dB
  return 'basic'; // Rw < 28 dB
}
```

#### ISO 717-1 Reference

| Rw (dB) | Rating      | Description          | Typical Construction              |
| ------- | ----------- | -------------------- | --------------------------------- |
| < 28    | `basic`     | Minimal insulation   | 4-6mm float glass                 |
| 28-34   | `standard`  | Standard insulation  | 8-10mm float or simple DGU        |
| 34-38   | `good`      | Good insulation      | Laminated with acoustic PVB       |
| 38-42   | `very_good` | Very good insulation | Asymmetric laminated DGU          |
| > 42    | `excellent` | Excellent insulation | Acoustic laminated + wide air gap |

**Example**:
- Float 6mm → `basic` (Rw ≈ 27 dB)
- Float 10mm → `standard` (Rw ≈ 31 dB)
- Laminated 8.76mm acoustic → `good` (Rw ≈ 36 dB)
- DGU 6+12+44.2 acoustic → `very_good` (Rw ≈ 40 dB)

---

### 3. Thermal Rating

**Standard**: EN 673 (Thermal transmittance - U-value)

**Measurement**: U-value (W/m²·K) - Lower is better

#### Calculation Formula

```typescript
function calculateThermalRating(glassType: GlassType): PerformanceRating {
  const { lowE, doubleGlazing, tripleGlazing, airGap, argonFilled } = glassType;
  
  // Triple glazing with Low-E and argon
  if (tripleGlazing && lowE && argonFilled) {
    return 'excellent'; // U ≤ 0.6 W/m²·K
  }
  
  // Double glazing with Low-E and argon
  if (doubleGlazing && lowE && argonFilled) {
    return 'very_good'; // U = 0.7-1.0 W/m²·K
  }
  
  // Double glazing with Low-E (air)
  if (doubleGlazing && lowE) return 'good'; // U = 1.1-1.4 W/m²·K
  
  // Standard double glazing (no Low-E)
  if (doubleGlazing) return 'standard'; // U = 2.0-2.8 W/m²·K
  
  // Single glazing
  return 'basic'; // U > 5.0 W/m²·K
}
```

#### EN 673 Reference

| U-value (W/m²·K) | Rating      | Description     | Typical Construction    |
| ---------------- | ----------- | --------------- | ----------------------- |
| > 5.0            | `basic`     | Poor insulation | Single float glass      |
| 2.0-2.8          | `standard`  | Standard DGU    | 4+12+4 air-filled       |
| 1.1-1.4          | `good`      | Low-E DGU       | 4 Low-E+12+4 air        |
| 0.7-1.0          | `very_good` | Low-E + argon   | 4 Low-E+16+4 argon      |
| ≤ 0.6            | `excellent` | Triple glazing  | 4+12+4+12+4 Low-E argon |

**Example**:
- Float 6mm → `basic` (U ≈ 5.7 W/m²·K)
- DGU 4+12+4 → `standard` (U ≈ 2.7 W/m²·K)
- DGU 4 Low-E+16+4 argon → `very_good` (U ≈ 1.0 W/m²·K)
- TGU 4+12+4+12+4 Low-E argon → `excellent` (U ≈ 0.5 W/m²·K)

---

### 4. Energy Rating

**Standard**: EN 410 (Solar factor and light transmission)

**Measurement**: Solar factor (g-value, 0-1) and selectivity

#### Calculation Formula

```typescript
function calculateEnergyRating(glassType: GlassType): PerformanceRating {
  const { lowE, solarControl, gValue, lightTransmission } = glassType;
  
  // Calculate selectivity (light transmission / solar factor)
  const selectivity = lightTransmission / gValue;
  
  // High selectivity Low-E + solar control
  if (lowE && solarControl && selectivity > 2.0) {
    return 'excellent'; // g < 0.3, high light transmission
  }
  
  // Low-E with solar control
  if (lowE && solarControl) return 'very_good'; // g = 0.3-0.4
  
  // Low-E without solar control
  if (lowE) return 'good'; // g = 0.4-0.6
  
  // Solar control only (tinted/reflective)
  if (solarControl) return 'standard'; // g = 0.5-0.7
  
  // Clear float glass
  return 'basic'; // g > 0.7
}
```

#### EN 410 Reference

| g-value | Selectivity | Rating      | Description                  |
| ------- | ----------- | ----------- | ---------------------------- |
| > 0.7   | < 1.2       | `basic`     | Clear glass, high solar gain |
| 0.5-0.7 | 1.2-1.5     | `standard`  | Tinted or reflective         |
| 0.4-0.6 | 1.5-1.8     | `good`      | Low-E coating                |
| 0.3-0.4 | 1.8-2.0     | `very_good` | Low-E + solar control        |
| < 0.3   | > 2.0       | `excellent` | High-performance Low-E + SC  |

**Example**:
- Clear float → `basic` (g ≈ 0.85)
- Guardian ClimaGuard Low-E → `good` (g ≈ 0.58, selectivity ≈ 1.5)
- Guardian SunGuard Solar → `very_good` (g ≈ 0.38, selectivity ≈ 1.8)
- Guardian SunGuard SuperNeutral → `excellent` (g ≈ 0.28, selectivity ≈ 2.1)

---

## 💻 Implementation

### Database Schema

```prisma
model GlassSolution {
  id            String   @id @default(cuid())
  key           String   @unique
  nameEs        String
  nameEn        String
  icon          String?
  descriptionEs String
  descriptionEn String?
  
  glassTypes    GlassTypeSolution[]
  
  @@map("glass_solutions")
}

model GlassTypeSolution {
  id        String   @id @default(cuid())
  
  glassTypeId String
  glassType   GlassType @relation(fields: [glassTypeId], references: [id])
  
  solutionId  String
  solution    GlassSolution @relation(fields: [solutionId], references: [id])
  
  isPrimary      Boolean           @default(false)
  securityRating PerformanceRating @default(basic)
  acousticRating PerformanceRating @default(basic)
  thermalRating  PerformanceRating @default(basic)
  energyRating   PerformanceRating @default(basic)
  
  @@unique([glassTypeId, solutionId])
  @@map("glass_type_solutions")
}

enum PerformanceRating {
  basic
  standard
  good
  very_good
  excellent
}
```

### tRPC Queries

#### List Solutions

```typescript
// src/server/api/routers/catalog/catalog.queries.ts
'list-solutions': publicProcedure
  .input(listGlassSolutionsInput)
  .output(listGlassSolutionsOutput)
  .query(async ({ input }) => {
    const { includeGlassCount } = input;
    
    const solutions = await db.glassSolution.findMany({
      include: {
        glassTypes: includeGlassCount ? {
          select: { id: true }
        } : false,
      },
      orderBy: { nameEs: 'asc' },
    });
    
    return solutions.map(solution => ({
      ...solution,
      glassCount: includeGlassCount 
        ? solution.glassTypes?.length ?? 0 
        : undefined,
    }));
  }),
```

#### List Glass Types with Solutions

```typescript
'list-glass-types': publicProcedure
  .input(listGlassTypesInput)
  .output(listGlassTypesOutput)
  .query(async ({ input }) => {
    const { manufacturerId, solutionKey } = input;
    
    const glassTypes = await db.glassType.findMany({
      where: {
        manufacturerId,
        solutions: solutionKey ? {
          some: {
            solution: { key: solutionKey },
          },
        } : undefined,
      },
      include: {
        manufacturer: {
          select: { id: true, name: true },
        },
        solutions: {
          include: {
            solution: {
              select: {
                id: true, key: true, nameEs: true, 
                nameEn: true, icon: true,
              },
            },
          },
          orderBy: [
            { isPrimary: 'desc' }, // Primary first
            { solution: { nameEs: 'asc' } },
          ],
        },
      },
      orderBy: [
        { manufacturer: { name: 'asc' } },
        { name: 'asc' },
      ],
    });
    
    return glassTypes;
  }),
```

### React Components

#### Solution Selector

```tsx
// src/app/(public)/quote/_components/solution-selector.tsx
'use client';

import { api } from '~/trpc/react';

export function SolutionSelector({ 
  value, 
  onChange 
}: SolutionSelectorProps) {
  const { data: solutions, isLoading } = api.catalog['list-solutions']
    .useQuery({ includeGlassCount: true });
  
  return (
    <div className="flex flex-wrap gap-2">
      {solutions?.map(solution => (
        <SolutionChip
          key={solution.id}
          solution={solution}
          selected={value.includes(solution.key)}
          onToggle={() => onChange(solution.key)}
        />
      ))}
    </div>
  );
}
```

#### Performance Ratings Display

```tsx
// src/app/(public)/quote/_components/performance-ratings.tsx
interface PerformanceRatingsProps {
  securityRating: PerformanceRating;
  acousticRating: PerformanceRating;
  thermalRating: PerformanceRating;
  energyRating: PerformanceRating;
  showLabels?: boolean;
}

const RATING_LABELS = {
  security: { icon: '🛡️', nameEs: 'Seguridad' },
  acoustic: { icon: '🔇', nameEs: 'Acústico' },
  thermal: { icon: '🌡️', nameEs: 'Térmico' },
  energy: { icon: '⚡', nameEs: 'Energía' },
};

const RATING_STARS = {
  basic: 1,
  standard: 2,
  good: 3,
  very_good: 4,
  excellent: 5,
};

export function PerformanceRatings({ 
  securityRating,
  acousticRating,
  thermalRating,
  energyRating,
  showLabels = true,
}: PerformanceRatingsProps) {
  const ratings = [
    { key: 'security', rating: securityRating },
    { key: 'acoustic', rating: acousticRating },
    { key: 'thermal', rating: thermalRating },
    { key: 'energy', rating: energyRating },
  ];
  
  return (
    <div className="grid grid-cols-2 gap-2">
      {ratings.map(({ key, rating }) => (
        <div key={key} className="flex items-center gap-2">
          <span className="text-lg">{RATING_LABELS[key].icon}</span>
          {showLabels && (
            <span className="text-sm text-muted-foreground">
              {RATING_LABELS[key].nameEs}
            </span>
          )}
          <StarRating value={RATING_STARS[rating]} max={5} />
        </div>
      ))}
    </div>
  );
}
```

---

## 📚 Best Practices

### 1. Seed Data Quality

**Ensure accurate ratings** when creating seed data:

```typescript
// prisma/seed.ts
const guardianSunLaminated = await db.glassType.create({
  data: {
    name: 'Guardian Sun Laminated',
    manufacturerId: guardianId,
    thickness: new Prisma.Decimal(6.38),
    solutions: {
      create: [
        {
          solutionId: securitySolutionId,
          isPrimary: true,
          securityRating: 'good',        // Laminated 6.38mm
          acousticRating: 'good',        // PVB layer improves sound
          thermalRating: 'standard',     // No Low-E
          energyRating: 'very_good',     // Solar control coating
        },
        {
          solutionId: solarControlId,
          isPrimary: false,
          securityRating: 'good',
          acousticRating: 'standard',
          thermalRating: 'standard',
          energyRating: 'very_good',     // Primary benefit
        },
      ],
    },
  },
});
```

### 2. UI/UX Guidelines

**Display ratings clearly** with visual indicators:

- ✅ Use star icons (⭐) for quick recognition
- ✅ Show category icons (🛡️ 🔇 🌡️ ⚡) for context
- ✅ Provide tooltips with EN/ISO standard references
- ✅ Allow filtering by minimum rating threshold
- ❌ Don't show all 4 ratings on small cards (space)
- ❌ Don't use numeric values without context

### 3. Filtering Logic

**Allow multi-dimensional filtering**:

```typescript
// Filter glass types by minimum ratings
const filteredGlasses = glassTypes.filter(glass => {
  const primarySolution = glass.solutions.find(s => s.isPrimary);
  if (!primarySolution) return false;
  
  return (
    RATING_VALUES[primarySolution.securityRating] >= minSecurity &&
    RATING_VALUES[primarySolution.acousticRating] >= minAcoustic &&
    RATING_VALUES[primarySolution.thermalRating] >= minThermal &&
    RATING_VALUES[primarySolution.energyRating] >= minEnergy
  );
});
```

### 4. Testing

**Validate ratings** in unit tests:

```typescript
// tests/unit/ratings.test.ts
describe('Performance Ratings', () => {
  it('should rate laminated 6.38mm as "good" security', () => {
    const glassType = {
      laminated: true,
      pvbLayers: 1,
      thickness: 6.38,
    };
    
    expect(calculateSecurityRating(glassType)).toBe('good');
  });
  
  it('should rate Low-E + argon DGU as "very_good" thermal', () => {
    const glassType = {
      doubleGlazing: true,
      lowE: true,
      argonFilled: true,
    };
    
    expect(calculateThermalRating(glassType)).toBe('very_good');
  });
});
```

---

## 🔗 References

### Standards

- **EN 356**: Glass in building — Security glazing — Testing and classification of resistance against manual attack
- **ISO 140-3**: Acoustics — Measurement of sound insulation in buildings — Laboratory measurements of airborne sound insulation
- **ISO 717-1**: Acoustics — Rating of sound insulation in buildings — Airborne sound insulation
- **EN 673**: Glass in building — Determination of thermal transmittance (U value)
- **EN 410**: Glass in building — Determination of luminous and solar characteristics of glazing

### Internal Documentation

- [Architecture Document](./architecture.md)
- [Glass Solutions Migration Guide](./migrations/glass-solutions-migration.md)
- [Purpose Removal Plan (v2.0)](./migrations/purpose-removal-plan-v2.md)
- [PRD - Glasify MVP](./prd.md)

### External Resources

- [Guardian Glass Product Catalog](https://www.guardianglass.com/)
- [AGC Glass Europe Technical Documentation](https://www.agc-glass.eu/)
- [Saint-Gobain Glass Performance Data](https://www.saint-gobain-glass.com/)

---

**Questions or Suggestions?**  
Contact the Glasify Development Team or create an issue in the repository.

---

**Last Updated**: October 9, 2025  
**Version**: 1.0  
**Next Review**: April 2026
