# Data Model: Sistema de Catálogo de Colores para Modelos

**Date**: 2025-10-28  
**Feature**: 001-model-color-catalog  
**Purpose**: Define database schema and entity relationships for color catalog system

---

## Entity Overview

This feature introduces **2 new entities** and extends **2 existing entities**:

**New Entities**:
1. **Color** - Master catalog of available colors (global, shared across tenants)
2. **ModelColor** - Many-to-Many junction with model-specific surcharge data

**Extended Entities**:
3. **Model** - Add colors relationship (implicit via ModelColor)
4. **QuoteItem** - Add optional color selection with snapshot fields

---

## Entity Specifications

### 1. Color (NEW)

**Purpose**: Master catalog of industry-standard and custom colors available in the platform

**Attributes**:

| Field       | Type       | Constraints                          | Description                                             |
| ----------- | ---------- | ------------------------------------ | ------------------------------------------------------- |
| `id`        | String     | PK, CUID                             | Unique identifier                                       |
| `name`      | String(50) | NOT NULL                             | Commercial color name (e.g., "Blanco", "Nogal Europeo") |
| `ralCode`   | String(10) | NULLABLE, Regex: `^RAL \d{4}$`       | Industry standard RAL code (e.g., "RAL 9010")           |
| `hexCode`   | String(7)  | NOT NULL, Regex: `^#[0-9A-Fa-f]{6}$` | Hexadecimal color code for UI rendering                 |
| `isActive`  | Boolean    | NOT NULL, Default: true              | Soft delete flag (false = hidden in new assignments)    |
| `createdAt` | DateTime   | NOT NULL, Auto                       | Creation timestamp                                      |
| `updatedAt` | DateTime   | NOT NULL, Auto                       | Last modification timestamp                             |

**Relationships**:
- `modelColors` → ModelColor[] (one-to-many) - Models using this color
- `quoteItems` → QuoteItem[] (one-to-many) - Quotes with this color selected

**Constraints**:
- `@@unique([name, hexCode])` - Prevent duplicate colors (same name + hex = duplicate)
- `@@index([isActive])` - Optimize filtering active colors
- `@@index([name])` - Optimize search by name

**Validation Rules** (Zod schema):
```typescript
name: z.string().min(1).max(50)
ralCode: z.string().regex(/^RAL \d{4}$/).optional()
hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Formato hexadecimal inválido (#RRGGBB)")
isActive: z.boolean().default(true)
```

**Business Rules**:
- Cannot delete if used in any QuoteItem (hard constraint)
- Can only soft-delete (isActive = false) if used in ModelColor
- Hard delete allowed only if no references exist
- Seeder creates 10 standard colors (idempotent upsert)

**Sample Data** (from seeder):
```typescript
{ name: 'Blanco', ralCode: 'RAL 9010', hexCode: '#F3F3E9' },
{ name: 'Gris Antracita', ralCode: 'RAL 7016', hexCode: '#384043' },
{ name: 'Negro Mate', ralCode: 'RAL 9005', hexCode: '#101010' },
// ... 7 more colors (see spec.md FR-001)
```

---

### 2. ModelColor (NEW)

**Purpose**: Junction table linking Model to Color with model-specific pricing data

**Attributes**:

| Field                 | Type         | Constraints                  | Description                          |
| --------------------- | ------------ | ---------------------------- | ------------------------------------ |
| `id`                  | String       | PK, CUID                     | Unique identifier                    |
| `modelId`             | String       | FK → Model.id, NOT NULL      | Reference to window/door model       |
| `colorId`             | String       | FK → Color.id, NOT NULL      | Reference to color catalog           |
| `surchargePercentage` | Decimal(5,2) | NOT NULL, Range: 0.00-100.00 | Percentage added to model base price |
| `isDefault`           | Boolean      | NOT NULL, Default: false     | One color per model must be default  |
| `createdAt`           | DateTime     | NOT NULL, Auto               | Assignment timestamp                 |
| `updatedAt`           | DateTime     | NOT NULL, Auto               | Last modification timestamp          |

**Relationships**:
- `model` → Model (many-to-one) - The window/door model
- `color` → Color (many-to-one) - The assigned color

**Constraints**:
- `@@unique([modelId, colorId])` - Prevent duplicate color assignments per model
- `@@index([modelId, isDefault])` - Optimize default color lookup
- `@@index([colorId])` - Optimize reverse lookup (colors assigned to which models)

**Foreign Key Actions**:
- `model`: onDelete: CASCADE (if model deleted, remove all color assignments)
- `color`: onDelete: RESTRICT (prevent color deletion if assigned to models)

**Validation Rules** (Zod schema):
```typescript
modelId: z.string().cuid()
colorId: z.string().cuid()
surchargePercentage: z.number().min(0).max(100).multipleOf(0.01)
isDefault: z.boolean()
```

**Business Rules**:
- Only ONE color per model can have `isDefault = true`
- When marking a color as default, auto-set previous default to false (transaction)
- Surcharge applies only to model basePrice (not glass, not services)
- If model has no colors assigned, it's sold without color selection UI

**State Transitions**:
```
[No colors] → Admin assigns first color → Auto-set as default
[Has default] → Admin assigns new default → Previous default.isDefault = false
[Has colors] → Admin removes all → Model becomes [No colors] again
```

---

### 3. Model (EXTENDED)

**Purpose**: Extend existing Model entity with color relationship

**New Relationships**:
- `colors` → ModelColor[] (one-to-many) - Available colors for this model

**No New Fields**: All color data stored in junction table

**Query Patterns**:
```typescript
// Get model with available colors
const model = await db.model.findUnique({
  where: { id },
  include: {
    colors: {
      include: { color: true }, // Eager load color details
      where: { color: { isActive: true } }, // Only active colors
      orderBy: { isDefault: 'desc' }, // Default first
    },
  },
});

// Get default color for model
const defaultColor = await db.modelColor.findFirst({
  where: { modelId, isDefault: true },
  include: { color: true },
});
```

---

### 4. QuoteItem (EXTENDED)

**Purpose**: Extend existing QuoteItem to store selected color with immutable snapshot

**New Fields**:

| Field                      | Type         | Constraints             | Description                                               |
| -------------------------- | ------------ | ----------------------- | --------------------------------------------------------- |
| `colorId`                  | String       | FK → Color.id, NULLABLE | Reference to selected color (null = default or no colors) |
| `colorSurchargePercentage` | Decimal(5,2) | NULLABLE                | **SNAPSHOT** - Surcharge % at quote creation time         |
| `colorHexCode`             | String(7)    | NULLABLE                | **SNAPSHOT** - Hex code for PDF generation                |
| `colorName`                | String(50)   | NULLABLE                | **SNAPSHOT** - Color name for PDF display                 |

**New Relationships**:
- `color` → Color (many-to-one, optional) - Selected color reference

**Foreign Key Actions**:
- `color`: onDelete: SET_NULL (preserve quote even if color deleted, snapshot fields remain)

**Validation Rules** (Zod schema):
```typescript
colorId: z.string().cuid().optional()
colorSurchargePercentage: z.number().min(0).max(100).multipleOf(0.01).optional()
colorHexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
colorName: z.string().max(50).optional()
```

**Business Rules**:
- If `colorId` is set, all snapshot fields must be populated (atomic operation)
- Snapshot fields are immutable after quote creation (never updated)
- Price calculation: `itemPrice = (basePrice * qty) * (1 + colorSurchargePercentage/100) + glassPrice + servicesPrice`
- If model has no colors or client doesn't select, all color fields remain NULL

**Snapshot Strategy** (Denormalization Justification):
- **Why denormalize**: Historical quotes must show exact color used at creation time
- **Trade-off**: 3 extra fields per QuoteItem vs. data integrity + auditability
- **Consistency**: Snapshot captured in transaction when quote item created
- **Validation**: Server recalculates price from snapshot to prevent client tampering

**Migration Impact**:
- Existing QuoteItems: All color fields default to NULL (backward compatible)
- No data migration required (quotes created before feature have no colors)

---

## Prisma Schema Changes

```prisma
// NEW MODEL
model Color {
  id          String      @id @default(cuid())
  name        String      @db.VarChar(50)
  ralCode     String?     @db.VarChar(10)
  hexCode     String      @db.VarChar(7)
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relationships
  modelColors ModelColor[]
  quoteItems  QuoteItem[]
  
  // Constraints
  @@unique([name, hexCode])
  @@index([isActive])
  @@index([name])
}

// NEW JUNCTION MODEL
model ModelColor {
  id                    String   @id @default(cuid())
  modelId               String
  model                 Model    @relation(fields: [modelId], references: [id], onDelete: Cascade)
  colorId               String
  color                 Color    @relation(fields: [colorId], references: [id], onDelete: Restrict)
  surchargePercentage   Decimal  @db.Decimal(5, 2)
  isDefault             Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@unique([modelId, colorId])
  @@index([modelId, isDefault])
  @@index([colorId])
}

// EXTEND EXISTING MODEL
model Model {
  // ... existing fields ...
  colors ModelColor[] // NEW RELATIONSHIP
}

// EXTEND EXISTING MODEL
model QuoteItem {
  // ... existing fields ...
  
  // NEW: Color selection with snapshot
  colorId                   String?  
  color                     Color?   @relation(fields: [colorId], references: [id], onDelete: SetNull)
  colorSurchargePercentage  Decimal? @db.Decimal(5, 2)
  colorHexCode              String?  @db.VarChar(7)
  colorName                 String?  @db.VarChar(50)
}
```

---

## Entity Relationship Diagram

```
┌─────────────┐
│   Color     │ (Master Catalog)
│─────────────│
│ id          │
│ name        │
│ ralCode     │
│ hexCode     │
│ isActive    │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────┐
│ ModelColor  │ (Junction with Surcharge)
│─────────────│
│ id          │
│ modelId     │──┐
│ colorId     │  │
│ surcharge%  │  │
│ isDefault   │  │
└─────────────┘  │
                 │ N:1
          ┌──────▼──────┐
          │    Model    │ (Window/Door)
          │─────────────│
          │ id          │
          │ name        │
          │ basePrice   │
          │ ...         │
          └─────────────┘

┌─────────────┐
│ QuoteItem   │ (Quote Line)
│─────────────│
│ id          │
│ modelId     │
│ colorId     │ (FK → Color, optional)
│ color%      │ (SNAPSHOT)
│ colorHex    │ (SNAPSHOT)
│ colorName   │ (SNAPSHOT)
│ subtotal    │
└─────────────┘
```

**Key Design Decisions**:
1. **Color is global**: Not tenant-specific (shared catalog simplifies seeding)
2. **ModelColor is tenant-specific**: Same color, different surcharges per tenant's models
3. **QuoteItem snapshots**: Immutable historical record independent of current config
4. **Cascade on Model delete**: If model removed, its color assignments are meaningless
5. **Restrict on Color delete**: Prevent accidental data loss (soft delete via isActive)

---

## Migration Strategy

### Step 1: Create New Tables

```sql
-- Auto-generated by Prisma
CREATE TABLE "Color" (
  "id" TEXT PRIMARY KEY,
  "name" VARCHAR(50) NOT NULL,
  "ralCode" VARCHAR(10),
  "hexCode" VARCHAR(7) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX "Color_name_hexCode_key" ON "Color"("name", "hexCode");
CREATE INDEX "Color_isActive_idx" ON "Color"("isActive");
CREATE INDEX "Color_name_idx" ON "Color"("name");

CREATE TABLE "ModelColor" (
  "id" TEXT PRIMARY KEY,
  "modelId" TEXT NOT NULL,
  "colorId" TEXT NOT NULL,
  "surchargePercentage" DECIMAL(5,2) NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE,
  FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT
);

CREATE UNIQUE INDEX "ModelColor_modelId_colorId_key" ON "ModelColor"("modelId", "colorId");
CREATE INDEX "ModelColor_modelId_isDefault_idx" ON "ModelColor"("modelId", "isDefault");
CREATE INDEX "ModelColor_colorId_idx" ON "ModelColor"("colorId");
```

### Step 2: Extend QuoteItem Table

```sql
ALTER TABLE "QuoteItem" ADD COLUMN "colorId" TEXT;
ALTER TABLE "QuoteItem" ADD COLUMN "colorSurchargePercentage" DECIMAL(5,2);
ALTER TABLE "QuoteItem" ADD COLUMN "colorHexCode" VARCHAR(7);
ALTER TABLE "QuoteItem" ADD COLUMN "colorName" VARCHAR(50);

ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_colorId_fkey" 
  FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL;
```

### Step 3: Run Seeder

```bash
pnpm prisma db seed
# Executes prisma/seeders/colors.seeder.ts
# Creates 10 standard colors via upsert (idempotent)
```

**Rollback Plan** (if needed):
```sql
ALTER TABLE "QuoteItem" DROP CONSTRAINT "QuoteItem_colorId_fkey";
ALTER TABLE "QuoteItem" DROP COLUMN "colorId";
ALTER TABLE "QuoteItem" DROP COLUMN "colorSurchargePercentage";
ALTER TABLE "QuoteItem" DROP COLUMN "colorHexCode";
ALTER TABLE "QuoteItem" DROP COLUMN "colorName";
DROP TABLE "ModelColor";
DROP TABLE "Color";
```

---

## Validation & Testing

### Data Integrity Tests

**Test 1: Unique Color Constraint**
```typescript
// Attempt to create duplicate color
await expect(db.color.create({
  data: { name: 'Blanco', hexCode: '#F3F3E9' }
})).rejects.toThrow('Unique constraint violation');
```

**Test 2: Single Default Color per Model**
```typescript
// Assign color A as default
await db.modelColor.create({ modelId, colorId: colorA, isDefault: true });

// Assign color B as default (should auto-set A to false)
await db.modelColor.create({ modelId, colorId: colorB, isDefault: true });

const colors = await db.modelColor.findMany({ where: { modelId } });
expect(colors.filter(c => c.isDefault)).toHaveLength(1);
```

**Test 3: Quote Snapshot Immutability**
```typescript
// Create quote with color surcharge 10%
const quote = await db.quoteItem.create({
  data: { colorId, colorSurchargePercentage: 10, /* ... */ }
});

// Admin changes surcharge to 20%
await db.modelColor.update({
  where: { modelId_colorId: { modelId, colorId } },
  data: { surchargePercentage: 20 }
});

// Quote still shows 10%
const quoteAfter = await db.quoteItem.findUnique({ where: { id: quote.id } });
expect(quoteAfter.colorSurchargePercentage).toBe(10);
```

**Test 4: Prevent Color Deletion if in Use**
```typescript
// Assign color to model
await db.modelColor.create({ modelId, colorId });

// Attempt to delete color
await expect(db.color.delete({ where: { id: colorId } }))
  .rejects.toThrow('Foreign key constraint');
```

---

## Performance Considerations

**Query Optimization**:
- `@@index([modelId, isDefault])` on ModelColor → Fast default color lookup
- `@@index([isActive])` on Color → Efficient active color filtering
- Eager loading with `include` → Minimize N+1 queries

**Expected Query Patterns**:
```typescript
// Pattern 1: Get model with colors (catalog page)
// Queries: 1 (with include)
const model = await db.model.findUnique({
  where: { id },
  include: { colors: { include: { color: true } } }
});

// Pattern 2: List all active colors (admin page)
// Queries: 1
const colors = await db.color.findMany({
  where: { isActive: true },
  orderBy: { name: 'asc' }
});

// Pattern 3: Create quote item with color (transaction)
// Queries: 2 (lookup modelColor, create quoteItem with snapshot)
const modelColor = await db.modelColor.findUnique({ /* ... */ });
const quoteItem = await db.quoteItem.create({
  data: {
    colorId: modelColor.colorId,
    colorSurchargePercentage: modelColor.surchargePercentage,
    colorHexCode: modelColor.color.hexCode,
    colorName: modelColor.color.name,
    // ...
  }
});
```

**Benchmarks** (expected):
- List 100 colors: <50ms
- Get model with 10 colors: <30ms (1 query with join)
- Create quote item with color: <100ms (2 queries in transaction)

---

## Summary

✅ **2 new entities** (Color, ModelColor)  
✅ **2 extended entities** (Model, QuoteItem)  
✅ **Snapshot pattern** for quote immutability  
✅ **Soft delete** strategy for data preservation  
✅ **Performance indexes** for common queries  
✅ **Seeder ready** for 10 standard colors  

**Ready for Phase 1: Contracts generation**
