# Data Model: Static Glass Taxonomy

**Feature**: 015-static-glass-taxonomy  
**Phase**: 1 (Design)  
**Date**: 2025-01-21  
**Status**: Complete

## Overview

This document defines the complete data model for static glass taxonomy, including Prisma schema changes, relationships, constraints, and migration strategy. All changes preserve backward compatibility with existing QuoteItem references.

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     Tenant      │
│─────────────────│
│ id (PK)         │
│ name            │
│ ...             │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────┴────────────────────┐
│      GlassSupplier          │ (Tenant-Specific CRUD)
│─────────────────────────────│
│ id (PK)                     │
│ tenantId (FK) ──────────────┘
│ name                        │
│ code                        │
│ country                     │
│ contactEmail                │
│ contactPhone                │
│ isActive                    │
│ notes                       │
└────────┬────────────────────┘
         │ 1
         │
         │ N
┌────────┴────────────────────────────┐
│    TenantGlassTypePrice             │ (NEW: Per-Tenant Pricing)
│─────────────────────────────────────│
│ id (PK)                             │
│ tenantId (FK) ──> Tenant            │
│ glassTypeId (FK) ──> GlassType      │
│ supplierId (FK) ──> GlassSupplier   │
│ price                               │
│ effectiveDate                       │
│ expiryDate                          │
│ notes                               │
└────────┬────────────────────────────┘
         │ N
         │
         │ 1
┌────────┴────────────────────────────┐
│         GlassType                   │ (Static, Seeded)
│─────────────────────────────────────│
│ id (PK)                             │
│ code (UK) ────────> "N70/38"        │
│ name (UK) ────────> "Neutral Low-E" │
│ series ────────────> "Serie-N"      │
│ manufacturer ──────> "Tecnoglass"   │
│ thicknessMm                         │
│ uValue                              │
│ solarFactor                         │
│ lightTransmission                   │
│ isSeeded ──────────> true/false     │
│ seedVersion ───────> "1.0"          │
│ isActive ──────────> true/false     │
│ description                         │
│ lastReviewDate                      │
└────────┬────────────────────────────┘
         │ N
         │
         │ M
┌────────┴────────────────────────────┐
│    GlassTypeSolution                │ (Many-to-Many Join)
│─────────────────────────────────────│
│ id (PK)                             │
│ glassTypeId (FK) ──> GlassType      │
│ solutionId (FK) ──> GlassSolution   │
│ performanceRating                   │
│ isPrimary                           │
└────────┬────────────────────────────┘
         │ M
         │
         │ N
┌────────┴────────────────────────────┐
│       GlassSolution                 │ (Static, Seeded)
│─────────────────────────────────────│
│ id (PK)                             │
│ key (UK) ──────────> "solar_control"│
│ name ──────────────> "Solar Control"│
│ nameEs ────────────> "Control Solar"│
│ description                         │
│ icon                                │
│ isSeeded ──────────> true/false     │
│ seedVersion ───────> "1.0"          │
│ isActive                            │
│ sortOrder                           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         QuoteItem                   │ (Unchanged)
│─────────────────────────────────────│
│ id (PK)                             │
│ quoteId (FK) ──> Quote              │
│ glassTypeId (FK) ──> GlassType ────┐│
│ ...                                 ││
└─────────────────────────────────────┘│
                                       │
                                       │ References static
                                       │ GlassType (seeded or legacy)
                                       └──────────────────────
```

---

## Prisma Schema Changes

### GlassType (Modified)

**Changes**:
- Add `code` (unique): Manufacturer product code
- Add `series`: Product line grouping
- Add `manufacturer`: Manufacturer name
- Add `isSeeded`: Flag for seed-generated types
- Add `seedVersion`: Seed data version tracking
- Make `name` unique (prevent duplicates)
- Remove `glassSupplierId` FK (moved to pricing table)

```prisma
model GlassType {
  id                String                    @id @default(cuid())
  
  // Product identification (NEW)
  code              String                    @unique // e.g., "N70/38", "R47/31"
  name              String                    @unique // e.g., "Neutral Low-E, 70% visible"
  series            String?                   // e.g., "Serie-N", "Serie-R", "Solarban"
  manufacturer      String?                   // e.g., "Tecnoglass", "Vitro", "Guardian"
  
  // Technical specifications (EXISTING)
  thicknessMm       Int
  uValue            Decimal?                  @db.Decimal(5, 2) // W/m²·K
  solarFactor       Decimal?                  @db.Decimal(4, 2) // 0.00-1.00 (SHGC)
  lightTransmission Decimal?                  @db.Decimal(4, 2) // 0.00-1.00 (%)
  
  // Deprecated fields (keep for backward compatibility)
  /// @deprecated Use solutions relationship instead
  purpose           GlassPurpose              @default(general)
  /// @deprecated Use characteristics relationship instead
  isTempered        Boolean                   @default(false)
  /// @deprecated Use characteristics relationship instead
  isLaminated       Boolean                   @default(false)
  /// @deprecated Use characteristics relationship instead
  isLowE            Boolean                   @default(false)
  /// @deprecated Use characteristics relationship instead
  isTripleGlazed    Boolean                   @default(false)
  
  // Seed data management (NEW)
  isSeeded          Boolean                   @default(false)
  seedVersion       String?                   // e.g., "1.0", "1.1"
  
  // Metadata (EXISTING)
  description       String?
  sku               String?                   @unique
  isActive          Boolean                   @default(true)
  lastReviewDate    DateTime?
  createdAt         DateTime                  @default(now())
  updatedAt         DateTime                  @updatedAt
  
  // Relationships (EXISTING)
  quoteItems        QuoteItem[]
  solutions         GlassTypeSolution[]
  characteristics   GlassTypeCharacteristic[]
  priceHistory      GlassTypePriceHistory[]
  
  // NEW: Per-tenant pricing relationship
  tenantPrices      TenantGlassTypePrice[]
  
  // REMOVED: Direct supplier relationship (moved to pricing table)
  // glassSupplierId   String?
  // glassSupplier     GlassSupplier?          @relation(fields: [glassSupplierId], references: [id], onDelete: SetNull)
  
  // Performance indexes
  @@index([code])              // Search by product code
  @@index([name])              // Search by name
  @@index([series])            // Filter by series
  @@index([manufacturer])      // Filter by manufacturer
  @@index([isSeeded])          // Filter seeded vs custom types
  @@index([isActive])          // Filter active types
  @@index([thicknessMm])       // Sort/filter by thickness
  @@index([createdAt(sort: Desc)])
  @@index([updatedAt(sort: Desc)])
}
```

**Migration Notes**:
- `code` populated from existing `name` or generated for legacy types
- `series` and `manufacturer` NULL for legacy types, populated for seeded types
- `isSeeded` = true for new seed data, false for existing tenant types
- `pricePerSqm` deprecated (replaced by `TenantGlassTypePrice`)

---

### GlassSolution (Modified)

**Changes**:
- Add `isSeeded`: Flag for seed-generated solutions
- Add `seedVersion`: Seed data version tracking
- No other changes (already tenant-agnostic)

```prisma
model GlassSolution {
  id          String              @id @default(cuid())
  key         String              @unique  // e.g., "solar_control", "energy_efficiency"
  name        String                       // Technical name (English)
  nameEs      String                       // Commercial name (Spanish)
  description String?
  icon        String?                      // Lucide icon name
  
  // Seed data management (NEW)
  isSeeded    Boolean             @default(false)
  seedVersion String?             // e.g., "1.0"
  
  // Existing fields
  sortOrder   Int                 @default(0)
  isActive    Boolean             @default(true)
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
  
  // Relationships
  glassTypes  GlassTypeSolution[]
  
  @@index([sortOrder])
  @@index([isActive])
  @@index([isSeeded]) // NEW: Filter seeded vs custom solutions
}
```

---

### TenantGlassTypePrice (NEW)

**Purpose**: Manage per-tenant, per-supplier pricing for static glass types

```prisma
model TenantGlassTypePrice {
  id            String        @id @default(cuid())
  
  // Foreign keys
  tenantId      String
  tenant        Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  glassTypeId   String
  glassType     GlassType     @relation(fields: [glassTypeId], references: [id], onDelete: Cascade)
  supplierId    String?       // Optional: price specific to supplier
  supplier      GlassSupplier? @relation(fields: [supplierId], references: [id], onDelete: SetNull)
  
  // Pricing data
  price         Decimal       @db.Decimal(12, 2) // Price per sqm
  effectiveDate DateTime      @default(now())
  expiryDate    DateTime?     // Optional: for promotional pricing
  notes         String?       // Admin notes (e.g., "Volume discount applied")
  
  // Metadata
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  // Constraints
  @@unique([tenantId, glassTypeId, supplierId, effectiveDate])
  @@index([tenantId, glassTypeId])        // Lookup current price
  @@index([effectiveDate])                // Price history queries
  @@index([supplierId])                   // Supplier-specific pricing
}
```

**Query Patterns**:

```typescript
// Get current price for tenant + glass type
const currentPrice = await db.tenantGlassTypePrice.findFirst({
  where: {
    tenantId: 'tenant_123',
    glassTypeId: 'glass_456',
    effectiveDate: { lte: new Date() },
    OR: [
      { expiryDate: { gte: new Date() } },
      { expiryDate: null }
    ]
  },
  orderBy: { effectiveDate: 'desc' }
});

// Get price history for glass type
const priceHistory = await db.tenantGlassTypePrice.findMany({
  where: { tenantId: 'tenant_123', glassTypeId: 'glass_456' },
  orderBy: { effectiveDate: 'desc' }
});
```

---

### GlassSupplier (Modified)

**Changes**:
- Add `tenantId` FK: Make suppliers tenant-specific
- Add unique constraint on `[tenantId, name]`
- Remove direct `glassTypes` relationship (moved to pricing table)

```prisma
model GlassSupplier {
  id           String                  @id @default(cuid())
  
  // NEW: Tenant isolation
  tenantId     String
  tenant       Tenant                  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Existing fields
  name         String
  code         String?
  country      String?
  website      String?
  contactEmail String?
  contactPhone String?
  isActive     Boolean                 @default(true)
  notes        String?
  createdAt    DateTime                @default(now())
  updatedAt    DateTime                @updatedAt
  
  // Relationships
  prices       TenantGlassTypePrice[]  // NEW: Pricing relationship
  
  // REMOVED: Direct glass type relationship
  // glassTypes   GlassType[]
  
  // Constraints
  @@unique([tenantId, name])  // NEW: Unique supplier name per tenant
  @@index([tenantId])
  @@index([isActive])
  @@index([code])
}
```

**Migration Notes**:
- Existing `GlassSupplier` records must be assigned to a tenant
- Migration script will assign to tenant based on `createdBy` user or manual mapping

---

### GlassTaxonomyMigrationCheckpoint (NEW)

**Purpose**: Track migration progress for resumability

```prisma
model GlassTaxonomyMigrationCheckpoint {
  id               String    @id @default(cuid())
  step             String    @unique  // e.g., 'seed_types', 'migrate_tenant_abc123'
  status           String    // 'pending', 'in_progress', 'completed', 'failed'
  startedAt        DateTime?
  completedAt      DateTime?
  error            String?   // Error message if failed
  recordsProcessed Int       @default(0)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  @@index([status])
  @@index([step])
}
```

---

## Seed Data Structure

### Glass Types (Tecnoglass Serie-N/Serie-R)

**Seed Data Format** (JSON):

```json
{
  "version": "1.0",
  "manufacturer": "Tecnoglass",
  "glassTypes": [
    {
      "code": "N44/28",
      "name": "Neutral Low-E, 44% visible transmission",
      "series": "Serie-N",
      "manufacturer": "Tecnoglass",
      "thicknessMm": 6,
      "uValue": 1.7,
      "solarFactor": 0.34,
      "lightTransmission": 0.44,
      "description": "Neutral low-emissivity coating with balanced visible light and solar control",
      "solutions": [
        { "key": "energy_efficiency", "performanceRating": "excellent", "isPrimary": true },
        { "key": "solar_control", "performanceRating": "very_good", "isPrimary": false }
      ]
    },
    {
      "code": "N55/40",
      "name": "Neutral Low-E, 55% visible transmission",
      "series": "Serie-N",
      "manufacturer": "Tecnoglass",
      "thicknessMm": 6,
      "uValue": 1.8,
      "solarFactor": 0.45,
      "lightTransmission": 0.55,
      "description": "Higher visible light transmission with moderate solar control",
      "solutions": [
        { "key": "energy_efficiency", "performanceRating": "very_good", "isPrimary": true },
        { "key": "solar_control", "performanceRating": "good", "isPrimary": false }
      ]
    },
    {
      "code": "N70/38",
      "name": "High Light Low-E, 70% visible transmission",
      "series": "Serie-N",
      "manufacturer": "Tecnoglass",
      "thicknessMm": 6,
      "uValue": 1.8,
      "solarFactor": 0.43,
      "lightTransmission": 0.70,
      "description": "Maximum daylight with energy efficiency",
      "solutions": [
        { "key": "energy_efficiency", "performanceRating": "very_good", "isPrimary": true },
        { "key": "solar_control", "performanceRating": "standard", "isPrimary": false }
      ]
    },
    {
      "code": "N75/52",
      "name": "High Light Low-E, 75% visible transmission",
      "series": "Serie-N",
      "manufacturer": "Tecnoglass",
      "thicknessMm": 6,
      "uValue": 1.9,
      "solarFactor": 0.55,
      "lightTransmission": 0.75,
      "description": "Ultra-high daylight, minimal tint",
      "solutions": [
        { "key": "energy_efficiency", "performanceRating": "good", "isPrimary": true }
      ]
    },
    {
      "code": "R12/20",
      "name": "Reflective Dark, 12% visible transmission",
      "series": "Serie-R",
      "manufacturer": "Tecnoglass",
      "thicknessMm": 6,
      "uValue": 1.6,
      "solarFactor": 0.27,
      "lightTransmission": 0.12,
      "description": "Maximum solar control with reflective finish",
      "solutions": [
        { "key": "solar_control", "performanceRating": "excellent", "isPrimary": true },
        { "key": "privacy", "performanceRating": "very_good", "isPrimary": false }
      ]
    }
    // ... 25 more types (30 total for MVP)
  ]
}
```

### Glass Solutions (Universal Taxonomy)

**Seed Data Format** (JSON):

```json
{
  "version": "1.0",
  "glassSolutions": [
    {
      "key": "solar_control",
      "name": "Solar Control",
      "nameEs": "Control Solar",
      "description": "Reduces solar heat gain and glare, improving comfort and reducing cooling costs. Compliance: ISO 9050, ASHRAE 90.1",
      "icon": "Sun",
      "sortOrder": 1
    },
    {
      "key": "energy_efficiency",
      "name": "Energy Efficiency",
      "nameEs": "Eficiencia Energética",
      "description": "Low-emissivity coatings reduce heat transfer, improving HVAC efficiency. Compliance: LEED v4, EDGE certification",
      "icon": "Leaf",
      "sortOrder": 2
    },
    {
      "key": "security",
      "name": "Security & Safety",
      "nameEs": "Seguridad",
      "description": "Laminated or tempered glass for impact resistance and security. Compliance: EN 356 (burglar resistance), EN 12600 (safety)",
      "icon": "Shield",
      "sortOrder": 3
    },
    {
      "key": "acoustic",
      "name": "Acoustic Insulation",
      "nameEs": "Aislamiento Acústico",
      "description": "Laminated glass with acoustic interlayers reduces noise transmission. Compliance: ISO 140-3, ASTM E90",
      "icon": "Volume2",
      "sortOrder": 4
    },
    {
      "key": "privacy",
      "name": "Privacy",
      "nameEs": "Privacidad",
      "description": "Reflective or tinted glass reduces visibility from exterior while maintaining interior views",
      "icon": "Eye",
      "sortOrder": 5
    },
    {
      "key": "hurricane_resistance",
      "name": "Hurricane Resistance",
      "nameEs": "Resistencia a Huracanes",
      "description": "Impact-resistant laminated glass for hurricane zones. Compliance: ASTM E1996, Miami-Dade NOA",
      "icon": "Wind",
      "sortOrder": 6
    }
  ]
}
```

---

## Migration Strategy

### Phase 1: Schema Migration

```sql
-- Add new columns to GlassType
ALTER TABLE "GlassType" ADD COLUMN "code" TEXT;
ALTER TABLE "GlassType" ADD COLUMN "series" TEXT;
ALTER TABLE "GlassType" ADD COLUMN "manufacturer" TEXT;
ALTER TABLE "GlassType" ADD COLUMN "isSeeded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "GlassType" ADD COLUMN "seedVersion" TEXT;

-- Add unique constraint on name (after deduplication)
ALTER TABLE "GlassType" ADD CONSTRAINT "GlassType_name_key" UNIQUE ("name");

-- Add new columns to GlassSolution
ALTER TABLE "GlassSolution" ADD COLUMN "isSeeded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "GlassSolution" ADD COLUMN "seedVersion" TEXT;

-- Add tenantId to GlassSupplier
ALTER TABLE "GlassSupplier" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "GlassSupplier" ADD CONSTRAINT "GlassSupplier_tenantId_fkey" 
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- Create TenantGlassTypePrice table
CREATE TABLE "TenantGlassTypePrice" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "glassTypeId" TEXT NOT NULL,
  "supplierId" TEXT,
  "price" DECIMAL(12,2) NOT NULL,
  "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiryDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "TenantGlassTypePrice_tenantId_fkey" 
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "TenantGlassTypePrice_glassTypeId_fkey" 
    FOREIGN KEY ("glassTypeId") REFERENCES "GlassType"("id") ON DELETE CASCADE,
  CONSTRAINT "TenantGlassTypePrice_supplierId_fkey" 
    FOREIGN KEY ("supplierId") REFERENCES "GlassSupplier"("id") ON DELETE SET NULL
);

-- Create indexes
CREATE UNIQUE INDEX "TenantGlassTypePrice_tenantId_glassTypeId_supplierId_effectiveDate_key" 
  ON "TenantGlassTypePrice"("tenantId", "glassTypeId", "supplierId", "effectiveDate");
CREATE INDEX "TenantGlassTypePrice_tenantId_glassTypeId_idx" 
  ON "TenantGlassTypePrice"("tenantId", "glassTypeId");
CREATE INDEX "TenantGlassTypePrice_effectiveDate_idx" 
  ON "TenantGlassTypePrice"("effectiveDate");
```

### Phase 2: Data Migration

```typescript
// Pseudo-code for migration script
async function migrateGlassTaxonomy() {
  // Step 1: Seed standard types
  await seedStandardGlassTypes();
  
  // Step 2: Migrate existing custom types
  const customTypes = await db.glassType.findMany({
    where: { isSeeded: false }
  });
  
  for (const customType of customTypes) {
    // Check if matches standard type
    const standardMatch = await findStandardMatch(customType);
    
    if (standardMatch && specsMatch(customType, standardMatch)) {
      // Migrate quotes to standard type
      await db.quoteItem.updateMany({
        where: { glassTypeId: customType.id },
        data: { glassTypeId: standardMatch.id }
      });
      
      // Migrate pricing
      await migratePricingToStandard(customType, standardMatch);
      
      // Delete custom type
      await db.glassType.delete({ where: { id: customType.id } });
    } else {
      // Preserve as legacy
      await db.glassType.update({
        where: { id: customType.id },
        data: {
          name: `Legacy - ${customType.name}`,
          isActive: false,
          description: `Custom glass type. No longer available for new quotes.`
        }
      });
    }
  }
  
  // Step 3: Migrate pricing
  await migratePricingData();
  
  // Step 4: Verify integrity
  await verifyQuoteReferences();
}
```

---

## Validation Rules

### GlassType Validation

```typescript
import { z } from 'zod';

export const glassTypeSeedSchema = z.object({
  code: z.string().min(3).max(20).regex(/^[A-Z0-9\/\-]+$/),
  name: z.string().min(5).max(200),
  series: z.string().min(2).max(50).optional(),
  manufacturer: z.string().min(2).max(100).optional(),
  thicknessMm: z.number().int().min(3).max(50),
  uValue: z.number().min(0.5).max(6.0).optional(),
  solarFactor: z.number().min(0).max(1).optional(),
  lightTransmission: z.number().min(0).max(1).optional(),
  description: z.string().max(1000).optional(),
  solutions: z.array(z.object({
    key: z.string(),
    performanceRating: z.enum(['basic', 'standard', 'good', 'very_good', 'excellent']),
    isPrimary: z.boolean().default(false)
  })).optional()
});

export const glassTypeCreateSchema = glassTypeSeedSchema.extend({
  isSeeded: z.literal(false), // Custom types not allowed
}).refine(() => false, {
  message: 'Glass types are now system-managed. Contact support to request new types.'
});
```

### TenantGlassTypePrice Validation

```typescript
export const tenantGlassPriceSchema = z.object({
  glassTypeId: z.string().cuid(),
  supplierId: z.string().cuid().optional(),
  price: z.number().positive().max(1000000),
  effectiveDate: z.date().default(() => new Date()),
  expiryDate: z.date().optional(),
  notes: z.string().max(500).optional()
}).refine(data => {
  if (data.expiryDate && data.effectiveDate >= data.expiryDate) {
    return false;
  }
  return true;
}, {
  message: 'Expiry date must be after effective date'
});
```

---

## Query Patterns

### Get Active Glass Types (Read-Only Catalog)

```typescript
// tRPC procedure: catalog.list-glass-types
export const listGlassTypes = publicProcedure
  .input(z.object({
    series: z.string().optional(),
    manufacturer: z.string().optional(),
    search: z.string().optional(),
    page: z.number().default(1),
    limit: z.number().default(20)
  }))
  .query(async ({ ctx, input }) => {
    const where: Prisma.GlassTypeWhereInput = {
      isActive: true,
      isSeeded: true, // Only show standardized types
      ...(input.series && { series: input.series }),
      ...(input.manufacturer && { manufacturer: input.manufacturer }),
      ...(input.search && {
        OR: [
          { name: { contains: input.search, mode: 'insensitive' } },
          { code: { contains: input.search, mode: 'insensitive' } }
        ]
      })
    };
    
    const [items, total] = await Promise.all([
      ctx.db.glassType.findMany({
        where,
        include: {
          solutions: {
            include: { solution: true },
            where: { solution: { isActive: true } }
          }
        },
        orderBy: { code: 'asc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit
      }),
      ctx.db.glassType.count({ where })
    ]);
    
    return {
      items,
      total,
      page: input.page,
      totalPages: Math.ceil(total / input.limit)
    };
  });
```

### Get Current Price for Tenant

```typescript
// tRPC procedure: tenant.glass-type.get-price
export const getGlassTypePrice = protectedProcedure
  .input(z.object({
    glassTypeId: z.string().cuid(),
    supplierId: z.string().cuid().optional()
  }))
  .query(async ({ ctx, input }) => {
    const tenantId = ctx.session.user.tenantId;
    
    // Try to find tenant-specific price
    const tenantPrice = await ctx.db.tenantGlassTypePrice.findFirst({
      where: {
        tenantId,
        glassTypeId: input.glassTypeId,
        supplierId: input.supplierId,
        effectiveDate: { lte: new Date() },
        OR: [
          { expiryDate: { gte: new Date() } },
          { expiryDate: null }
        ]
      },
      orderBy: { effectiveDate: 'desc' }
    });
    
    if (tenantPrice) {
      return { price: tenantPrice.price, source: 'tenant' };
    }
    
    // Fallback to global base price (from tenant config markup)
    const glassType = await ctx.db.glassType.findUnique({
      where: { id: input.glassTypeId },
      select: { pricePerSqm: true }
    });
    
    const tenantConfig = await ctx.db.tenantConfig.findUnique({
      where: { tenantId },
      select: { glassMarkupPercent: true }
    });
    
    const basePrice = glassType?.pricePerSqm || 0;
    const markup = tenantConfig?.glassMarkupPercent || 20;
    const finalPrice = basePrice * (1 + markup / 100);
    
    return { price: finalPrice, source: 'base' };
  });
```

---

## Next Steps

1. **Generate Contracts**: Create JSON schema files in `contracts/` directory
2. **Generate Quickstart**: Write runbook for migration execution
3. **Update Agent Context**: Run `.specify/scripts/bash/update-agent-context.sh copilot`
4. **Proceed to Phase 2**: Use `/speckit.tasks` command to generate implementation tasks
