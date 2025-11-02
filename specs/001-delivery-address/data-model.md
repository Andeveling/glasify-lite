# Data Model: Geocoded Delivery Addresses

**Feature**: 001-delivery-address  
**Date**: 2025-11-01  
**Purpose**: Define database schema, entities, relationships, and validation rules

---

## Entity Relationship Diagram

```
┌─────────────────┐          ┌──────────────────┐
│  TenantConfig   │          │  ProjectAddress  │
├─────────────────┤          ├──────────────────┤
│ id (PK)         │          │ id (PK)          │
│ ...existing...  │          │ quoteId (FK)     │◀──┐
│                 │          │ label            │   │
│ warehouseLatitude│         │ country          │   │
│ warehouseLongitude│        │ region           │   │
│ warehouseCity   │          │ city             │   │
│ transportBaseRate│         │ district         │   │
│ transportPerKmRate│        │ street           │   │
└─────────────────┘          │ reference        │   │
                              │ latitude         │   │
                              │ longitude        │   │
                              │ postalCode       │   │
                              │ createdAt        │   │
                              │ updatedAt        │   │
                              └──────────────────┘   │
                                                     │
                              ┌──────────────────┐   │
                              │  Quote           │   │
                              ├──────────────────┤   │
                              │ id (PK)          │───┘
                              │ projectAddressId │
                              │ ...existing...   │
                              │                  │
                              │ @deprecated:     │
                              │ projectCity      │
                              │ projectStreet    │
                              │ projectState     │
                              │ projectPostalCode│
                              └──────────────────┘
```

**Relationships**:
- `Quote` → `ProjectAddress`: Optional one-to-one (nullable FK)
- `ProjectAddress` cascade deletes when `Quote` deleted
- `TenantConfig` stores warehouse location (no FK, singleton config)

---

## 1. ProjectAddress Entity

**Purpose**: Structured storage of delivery location with geographic coordinates

### Fields

| Field      | Type          | Nullable | Default | Description                                               |
| ---------- | ------------- | -------- | ------- | --------------------------------------------------------- |
| id         | String (cuid) | No       | cuid()  | Primary key                                               |
| quoteId    | String (FK)   | Yes      | null    | Foreign key to Quote (optional for backward compat)       |
| label      | String(100)   | Yes      | null    | User-defined tag (e.g., "Obra Principal")                 |
| country    | String(100)   | Yes      | null    | Country name (e.g., "Colombia")                           |
| region     | String(100)   | Yes      | null    | Department/State (e.g., "Antioquia")                      |
| city       | String(100)   | Yes      | null    | City/Municipality (e.g., "Medellín")                      |
| district   | String(100)   | Yes      | null    | Neighborhood/District (e.g., "Barrio Granada")            |
| street     | String(200)   | Yes      | null    | Street address (e.g., "Calle 45 #23-10")                  |
| reference  | String(200)   | Yes      | null    | Landmark/reference (e.g., "Frente a finca Los Arrayanes") |
| latitude   | Decimal(10,7) | Yes      | null    | Latitude coordinate (WGS84, -90 to +90)                   |
| longitude  | Decimal(10,7) | Yes      | null    | Longitude coordinate (WGS84, -180 to +180)                |
| postalCode | String(20)    | Yes      | null    | Postal/ZIP code (optional for LATAM rural)                |
| createdAt  | DateTime      | No       | now()   | Creation timestamp                                        |
| updatedAt  | DateTime      | No       | now()   | Last update timestamp                                     |

### Indexes

```prisma
@@index([quoteId])                // FK lookup (most common query)
@@index([city])                   // Search/filter by city
@@index([latitude, longitude])    // Geospatial queries (future: radius search)
```

### Constraints

1. **At least one identifier required**: `city OR street OR reference` must be non-null
2. **Coordinate pairs**: Both `latitude` and `longitude` present OR both null (no partial coords)
3. **Coordinate ranges**: `latitude ∈ [-90, 90]`, `longitude ∈ [-180, 180]`
4. **Field lengths**: All text fields max length enforced (prevent abuse)

### State Transitions

**Create**:
- Autocomplete selected → all fields populated from geocoding API
- Manual entry → only text fields populated, coordinates null

**Update**:
- Edit text fields → coordinates unchanged (unless re-geocoded)
- Select new autocomplete → all fields overwritten

**Delete**:
- Soft delete: Cascade when quote deleted (`onDelete: Cascade`)
- Hard delete: Not implemented (preserve history)

---

## 2. Quote Entity (Modified)

**Changes**: Add optional foreign key to `ProjectAddress`

### New Fields

| Field            | Type        | Nullable | Default | Description                   |
| ---------------- | ----------- | -------- | ------- | ----------------------------- |
| projectAddressId | String (FK) | Yes      | null    | Foreign key to ProjectAddress |

### Deprecated Fields (Maintain for Backward Compatibility)

| Field             | Type        | Status      | Migration Action                       |
| ----------------- | ----------- | ----------- | -------------------------------------- |
| projectCity       | String(100) | @deprecated | Migrate to `ProjectAddress.city`       |
| projectStreet     | String(200) | @deprecated | Migrate to `ProjectAddress.street`     |
| projectState      | String(100) | @deprecated | Migrate to `ProjectAddress.region`     |
| projectPostalCode | String(20)  | @deprecated | Migrate to `ProjectAddress.postalCode` |

**Migration Script** (data migration):
```sql
-- For each Quote with non-null project fields, create ProjectAddress
INSERT INTO "ProjectAddress" (id, "quoteId", city, street, region, "postalCode", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  q.id,
  q."projectCity",
  q."projectStreet",
  q."projectState",
  q."projectPostalCode",
  q."createdAt",
  q."updatedAt"
FROM "Quote" q
WHERE q."projectCity" IS NOT NULL OR q."projectStreet" IS NOT NULL;

-- Update Quote foreign key
UPDATE "Quote" q
SET "projectAddressId" = pa.id
FROM "ProjectAddress" pa
WHERE pa."quoteId" = q.id;
```

---

## 3. TenantConfig Entity (Modified)

**Changes**: Add warehouse location and transportation rates

### New Fields

| Field              | Type          | Nullable | Default | Description                               |
| ------------------ | ------------- | -------- | ------- | ----------------------------------------- |
| warehouseLatitude  | Decimal(10,7) | Yes      | null    | Warehouse latitude (origin for distance)  |
| warehouseLongitude | Decimal(10,7) | Yes      | null    | Warehouse longitude (origin for distance) |
| warehouseCity      | String(100)   | Yes      | null    | Warehouse city name (display only)        |
| transportBaseRate  | Decimal(12,4) | Yes      | null    | Fixed cost per delivery (in currency)     |
| transportPerKmRate | Decimal(12,4) | Yes      | null    | Variable cost per kilometer (in currency) |

**Default Values** (seed data):
```prisma
// Example for Colombian tenant in Buga
warehouseLatitude:  3.9009
warehouseLongitude: -76.2978
warehouseCity:      "Buga"
transportBaseRate:  50000.0000  // 50,000 COP base
transportPerKmRate: 1000.0000   // 1,000 COP/km
```

---

## 4. Validation Rules

### ProjectAddress Validation

**Zod Schema** (`project-address.schema.ts`):

```typescript
import { z } from 'zod';

export const projectAddressSchema = z.object({
  label: z.string().max(100).optional(),
  
  country: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  street: z.string().max(200).optional(),
  reference: z.string().max(200).optional(),
  postalCode: z.string().max(20).optional(),
  
  latitude: z.number()
    .min(-90, 'Latitude must be >= -90')
    .max(90, 'Latitude must be <= 90')
    .optional(),
  
  longitude: z.number()
    .min(-180, 'Longitude must be >= -180')
    .max(180, 'Longitude must be <= 180')
    .optional(),
})
.refine(
  (data) => {
    // At least one identifier required
    return data.city || data.street || data.reference;
  },
  { message: 'Al menos uno de: ciudad, calle o referencia es requerido' }
)
.refine(
  (data) => {
    // Coordinate pairs: both present or both absent
    const hasLat = data.latitude !== undefined && data.latitude !== null;
    const hasLon = data.longitude !== undefined && data.longitude !== null;
    return hasLat === hasLon;
  },
  { message: 'Latitud y longitud deben estar ambos presentes o ambos ausentes' }
);

export type ProjectAddressInput = z.infer<typeof projectAddressSchema>;
```

### TenantConfig Validation (Warehouse)

```typescript
export const warehouseConfigSchema = z.object({
  warehouseLatitude: z.number().min(-90).max(90).optional(),
  warehouseLongitude: z.number().min(-180).max(180).optional(),
  warehouseCity: z.string().max(100).optional(),
  transportBaseRate: z.number().nonnegative().optional(),
  transportPerKmRate: z.number().nonnegative().optional(),
})
.refine(
  (data) => {
    // Warehouse coordinates: both or neither
    const hasLat = data.warehouseLatitude !== undefined;
    const hasLon = data.warehouseLongitude !== undefined;
    return hasLat === hasLon;
  },
  { message: 'Warehouse coordinates must both be present or both absent' }
);
```

---

## 5. Business Rules

### Address Creation Rules

1. **Geocoded addresses** (from autocomplete):
   - All text fields populated from API response
   - Coordinates always present
   - Label optional (user can add custom tag)

2. **Manual addresses**:
   - At least one of: city, street, reference required
   - Coordinates null (no geocoding)
   - All other fields optional

3. **Address updates**:
   - Can edit text fields independently
   - Changing address via autocomplete overwrites all fields
   - Coordinates only change if re-geocoded

### Distance Calculation Rules

1. **Prerequisites**:
   - Warehouse coordinates configured in `TenantConfig`
   - Delivery address has coordinates (latitude/longitude non-null)

2. **Calculation**:
   - Use Haversine formula: `distance = haversineDistance(warehouse, delivery)`
   - Result in kilometers (decimal, 2 places)

3. **Cost formula**:
   - `totalCost = transportBaseRate + (distance * transportPerKmRate)`
   - Apply minimum charge if distance < 10km (base rate only)

4. **Edge cases**:
   - No warehouse coords → disable calculation, show warning
   - No delivery coords → prompt manual distance entry OR leave cost blank
   - Distance > 500km → flag for manual review

### Transportation Cost Integration

**Option A: Quote Adjustment** (recommended for MVP):
- Create `Adjustment` record with scope=`quote`
- Concept: "Transporte a {city}" (e.g., "Transporte a Medellín")
- Amount: Calculated cost
- Sign: `positive` (add to quote total)
- Recalculate on address change (delete old adjustment, create new)

**Option B: Dedicated Field** (future enhancement):
- Add `transportationCost` field to `Quote` model
- Simpler but less flexible (no itemization)

---

## 6. Query Patterns

### Common Queries

**Fetch quote with delivery address**:
```typescript
const quote = await prisma.quote.findUnique({
  where: { id: quoteId },
  include: {
    projectAddress: true,  // Populate delivery location
  },
});
```

**Filter quotes by delivery city**:
```typescript
const quotes = await prisma.quote.findMany({
  where: {
    projectAddress: {
      city: 'Medellín',
    },
  },
  include: { projectAddress: true },
});
```

**Find quotes within radius** (future - requires PostGIS):
```sql
-- Example: Find quotes within 50km of warehouse
SELECT q.*, pa.*
FROM "Quote" q
JOIN "ProjectAddress" pa ON q."projectAddressId" = pa.id
WHERE ST_DWithin(
  ST_MakePoint(pa.longitude, pa.latitude)::geography,
  ST_MakePoint(-76.2978, 3.9009)::geography,
  50000  -- 50km in meters
);
```

---

## 7. Data Migration Strategy

### Phase 1: Schema Migration (Zero Downtime)

**Prisma Migration**:
```prisma
// migration.sql

-- Add ProjectAddress table
CREATE TABLE "ProjectAddress" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "quoteId" TEXT,
  "label" VARCHAR(100),
  "country" VARCHAR(100),
  "region" VARCHAR(100),
  "city" VARCHAR(100),
  "district" VARCHAR(100),
  "street" VARCHAR(200),
  "reference" VARCHAR(200),
  "latitude" DECIMAL(10,7),
  "longitude" DECIMAL(10,7),
  "postalCode" VARCHAR(20),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  
  CONSTRAINT "ProjectAddress_quoteId_fkey" 
    FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") 
    ON DELETE CASCADE
);

CREATE INDEX "ProjectAddress_quoteId_idx" ON "ProjectAddress"("quoteId");
CREATE INDEX "ProjectAddress_city_idx" ON "ProjectAddress"("city");
CREATE INDEX "ProjectAddress_latitude_longitude_idx" 
  ON "ProjectAddress"("latitude", "longitude");

-- Add foreign key to Quote
ALTER TABLE "Quote" 
  ADD COLUMN "projectAddressId" TEXT;

CREATE INDEX "Quote_projectAddressId_idx" ON "Quote"("projectAddressId");

-- Add warehouse fields to TenantConfig
ALTER TABLE "TenantConfig"
  ADD COLUMN "warehouseLatitude" DECIMAL(10,7),
  ADD COLUMN "warehouseLongitude" DECIMAL(10,7),
  ADD COLUMN "warehouseCity" VARCHAR(100),
  ADD COLUMN "transportBaseRate" DECIMAL(12,4),
  ADD COLUMN "transportPerKmRate" DECIMAL(12,4);
```

### Phase 2: Data Migration (Background Job)

**Node.js Script** (`prisma/migrations-scripts/migrate-project-addresses.ts`):
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateProjectAddresses() {
  // Count quotes with old fields
  const quotesWithAddress = await prisma.quote.count({
    where: {
      OR: [
        { projectCity: { not: null } },
        { projectStreet: { not: null } },
      ],
    },
  });

  console.log(`Migrating ${quotesWithAddress} quotes with addresses...`);

  // Fetch quotes in batches
  const batchSize = 100;
  let offset = 0;

  while (offset < quotesWithAddress) {
    const quotes = await prisma.quote.findMany({
      where: {
        OR: [
          { projectCity: { not: null } },
          { projectStreet: { not: null } },
        ],
      },
      skip: offset,
      take: batchSize,
    });

    // Create ProjectAddress records
    for (const quote of quotes) {
      const address = await prisma.projectAddress.create({
        data: {
          quoteId: quote.id,
          city: quote.projectCity,
          street: quote.projectStreet,
          region: quote.projectState,
          postalCode: quote.projectPostalCode,
          createdAt: quote.createdAt,
          updatedAt: quote.updatedAt,
        },
      });

      // Update quote foreign key
      await prisma.quote.update({
        where: { id: quote.id },
        data: { projectAddressId: address.id },
      });
    }

    offset += batchSize;
    console.log(`Migrated ${offset}/${quotesWithAddress} quotes`);
  }

  console.log('Migration complete!');
}

migrateProjectAddresses()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Phase 3: Validation

**Verification Query**:
```typescript
// Check all migrated quotes have addresses
const unmigrated = await prisma.quote.count({
  where: {
    OR: [
      { projectCity: { not: null } },
      { projectStreet: { not: null } },
    ],
    projectAddressId: null,
  },
});

console.log(`Unmigrated quotes: ${unmigrated}`); // Should be 0
```

---

## Summary

- **New entity**: `ProjectAddress` with structured fields + optional coordinates
- **Modified entities**: `Quote` (add FK), `TenantConfig` (add warehouse location + rates)
- **Validation**: Zod schemas enforce coordinate ranges, required identifiers, coordinate pairs
- **Migration**: Zero-downtime schema change, background data migration, full validation
- **Query patterns**: Include relations, filter by city, future geospatial queries
- **Business rules**: Geocoded vs manual addresses, distance calculation prerequisites, cost integration

**Ready for contracts generation (Phase 1 continuation).**
