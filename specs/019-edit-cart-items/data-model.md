# Data Model: Edición de Items del Carrito

**Feature**: 019-edit-cart-items  
**Date**: 2025-11-03  
**Phase**: 1 - Design & Contracts

## Overview

This document defines the data entities, relationships, and validation rules for the cart item editing feature. 

**Important**: In Glasify Lite, the "cart" is represented by a `Quote` in `draft` status, and cart items are `QuoteItem` records.

---

## Existing Entities (No Schema Changes Required)

### QuoteItem (Cart Item)

**Location**: `prisma/schema.prisma` (lines 442-475)

**Purpose**: Represents a single item in the customer's cart (draft quote)

**Key Fields**:

| Field                      | Type     | Constraints    | Editable | Notes                                |
| -------------------------- | -------- | -------------- | -------- | ------------------------------------ |
| `id`                       | String   | PK, CUID       | ❌        | Immutable identifier                 |
| `quoteId`                  | String   | FK → Quote     | ❌        | Parent quote reference               |
| `modelId`                  | String   | FK → Model     | ❌        | Cannot change model in edit          |
| `glassTypeId`              | String   | FK → GlassType | ✅        | **Editable** - user can change glass |
| `name`                     | String   | Max 50 chars   | ✅        | User-defined item name               |
| `quantity`                 | Int      | Min 1          | ✅        | Item quantity (future feature)       |
| `roomLocation`             | String?  | Max 100 chars  | ✅        | Optional location descriptor         |
| `widthMm`                  | Int      | Model-specific | ✅        | **Editable** - width in mm           |
| `heightMm`                 | Int      | Model-specific | ✅        | **Editable** - height in mm          |
| `accessoryApplied`         | Boolean  | Default false  | ❌        | Calculated field                     |
| `subtotal`                 | Decimal  | 12,4 precision | ❌        | **Recalculated** on edit             |
| `colorId`                  | String?  | FK → Color     | ✅        | Optional color selection             |
| `colorSurchargePercentage` | Decimal? | 5,2 precision  | ❌        | Snapshot, recalculated               |
| `createdAt`                | DateTime | Auto           | ❌        | Creation timestamp                   |
| `updatedAt`                | DateTime | Auto-update    | ❌        | Last edit timestamp                  |

**Relationships**:
- `quote`: Quote (parent cart)
- `model`: Model (product configuration)
- `glassType`: GlassType (selected glass)
- `color`: Color? (optional color selection)
- `services`: QuoteItemService[] (related services)
- `adjustments`: Adjustment[] (discounts/surcharges)

**Indexes** (existing):
- `@@index([quoteId])` - Find all items in cart
- `@@index([colorId])` - Color lookups

**Validation Rules**:
1. `widthMm` must be between `model.minWidth` and `model.maxWidth`
2. `heightMm` must be between `model.minHeight` and `model.maxHeight`
3. `glassTypeId` must be compatible with `modelId` (via `ModelGlassType` junction)
4. `quantity` must be >= 1
5. `subtotal` recalculated as: `(widthMm / 1000) * (heightMm / 1000) * glassType.pricePerM2 * quantity + surcharges`

---

### Model

**Location**: `prisma/schema.prisma`

**Purpose**: Product configuration template (window/door type)

**Relevant Fields for Editing**:

| Field       | Type    | Purpose                               |
| ----------- | ------- | ------------------------------------- |
| `id`        | String  | PK                                    |
| `name`      | String  | Display name                          |
| `imageUrl`  | String? | **Display in cart** - thumbnail image |
| `minWidth`  | Int     | Minimum allowed width (mm)            |
| `maxWidth`  | Int     | Maximum allowed width (mm)            |
| `minHeight` | Int     | Minimum allowed height (mm)           |
| `maxHeight` | Int     | Maximum allowed height (mm)           |

**Relationships**:
- `glassTypes`: ModelGlassType[] - Compatible glass types via junction table

---

### GlassType

**Location**: `prisma/schema.prisma`

**Purpose**: Glass product configuration

**Relevant Fields**:

| Field        | Type    | Purpose                                    |
| ------------ | ------- | ------------------------------------------ |
| `id`         | String  | PK                                         |
| `name`       | String  | Display name (e.g., "Vidrio Templado 6mm") |
| `pricePerM2` | Decimal | Base price per square meter                |
| `thickness`  | Int?    | Glass thickness in mm                      |

**Relationships**:
- `models`: ModelGlassType[] - Compatible models via junction table

---

### ModelGlassType (Junction Table)

**Purpose**: Defines glass-model compatibility

**Fields**:
- `modelId`: String (FK → Model)
- `glassTypeId`: String (FK → GlassType)

**Validation**: Edit must verify glass type is compatible via this junction

---

### Quote (Cart)

**Purpose**: Container for cart items (when `status = 'draft'`)

**Relevant Fields**:

| Field      | Type        | Notes                              |
| ---------- | ----------- | ---------------------------------- |
| `id`       | String      | PK                                 |
| `userId`   | String?     | Owner (null for anonymous)         |
| `status`   | QuoteStatus | Must be 'draft' for cart           |
| `total`    | Decimal     | **Recalculated** when items change |
| `currency` | String      | Currency code (e.g., "USD")        |

**Relationships**:
- `items`: QuoteItem[] - Cart items

---

## State Transitions

### QuoteItem Edit Flow

```
[Cart Display] 
    ↓ User clicks "Editar"
[Edit Modal Opens]
    ↓ Load current values
[Edit Form Populated]
    ↓ User modifies widthMm, heightMm, glassTypeId
[Client Validation]
    ↓ Basic range checks (Zod schema)
[User Confirms]
    ↓ Submit to server
[Server Validation]
    ↓ Check model constraints, glass compatibility
[Price Recalculation]
    ↓ Calculate new subtotal
[Database Update]
    ↓ Update QuoteItem (widthMm, heightMm, glassTypeId, subtotal, updatedAt)
[Quote Total Update]
    ↓ Recalculate Quote.total (sum of all item subtotals)
[Cache Invalidation]
    ↓ invalidate() + router.refresh()
[UI Refresh]
    ↓ Display updated item with new price
```

---

## Validation Rules (Detailed)

### Client-Side (Zod Schema)

```typescript
// src/app/(public)/cart/_schemas/cart-item-edit.schema.ts

export const cartItemEditSchema = z.object({
  widthMm: z.number()
    .int("El ancho debe ser un número entero")
    .min(100, "Ancho mínimo: 100mm")
    .max(3000, "Ancho máximo: 3000mm"),
    
  heightMm: z.number()
    .int("El alto debe ser un número entero")
    .min(100, "Alto mínimo: 100mm")
    .max(3000, "Alto máximo: 3000mm"),
    
  glassTypeId: z.string()
    .uuid("ID de vidrio inválido"),
    
  name: z.string()
    .min(1, "El nombre es requerido")
    .max(50, "Máximo 50 caracteres"),
    
  roomLocation: z.string()
    .max(100, "Máximo 100 caracteres")
    .optional(),
    
  quantity: z.number()
    .int("La cantidad debe ser un número entero")
    .min(1, "Cantidad mínima: 1")
    .default(1),
});

export type CartItemEditInput = z.infer<typeof cartItemEditSchema>;
```

### Server-Side (tRPC Procedure)

```typescript
// Validation steps in cart.updateItem procedure:

1. Verify quote exists and is in draft status
2. Verify user owns the quote (userId match or anonymous session)
3. Load model to get constraints (minWidth, maxWidth, minHeight, maxHeight)
4. Validate dimensions against model constraints
5. Verify glass type compatibility via ModelGlassType junction
6. Calculate new price using pricing engine
7. Update QuoteItem in transaction
8. Recalculate Quote.total
9. Log edit event (Winston server-side)
```

---

## Pricing Calculation

### Formula

```typescript
// src/app/(public)/cart/_utils/cart-price-calculator.ts

export function calculateItemPrice(params: {
  widthMm: number;
  heightMm: number;
  glassType: { pricePerM2: Decimal };
  quantity: number;
  colorSurcharge?: number; // Percentage (e.g., 10 = 10%)
}): Decimal {
  // Convert mm to m²
  const widthM = params.widthMm / 1000;
  const heightM = params.heightMm / 1000;
  const area = widthM * heightM;
  
  // Base price
  let price = area * params.glassType.pricePerM2.toNumber() * params.quantity;
  
  // Apply color surcharge if present
  if (params.colorSurcharge) {
    price += price * (params.colorSurcharge / 100);
  }
  
  return new Decimal(price);
}
```

### Recalculation Triggers

- ✅ Width changes
- ✅ Height changes
- ✅ Glass type changes
- ✅ Quantity changes (future feature)
- ✅ Color changes (if color selection enabled)

---

## Data Integrity Constraints

### Database Constraints (Existing)

1. **Foreign Key Cascade**: `onDelete: Cascade` for QuoteItem → Quote
   - Deleting quote deletes all items
   
2. **Foreign Key Restrict**: `onDelete: Restrict` for QuoteItem → Model/GlassType
   - Cannot delete model/glass if used in active quotes
   
3. **Decimal Precision**: `@db.Decimal(12, 4)` for prices
   - Supports up to 99,999,999.9999 (sufficient for any cart total)

### Application-Level Constraints (Enforced)

1. **Dimension Validation**:
   - Must respect model min/max constraints
   - Must be positive integers
   
2. **Glass Compatibility**:
   - Must exist in ModelGlassType junction
   - Enforced via server-side query
   
3. **Quote Status**:
   - Can only edit items in `draft` status quotes
   - Prevents editing sent/approved quotes

---

## Image Storage

### Model Images

**Storage Location**: `public/models/{modelId}.{ext}` or external CDN

**Format**: JPEG, PNG, WebP

**Size**: Original high-res (optimized by Next.js Image component)

**Fallback**: `public/assets/placeholder-model.png` (80x80px icon)

**Access Pattern**:
```typescript
const imageUrl = model.imageUrl ?? '/assets/placeholder-model.png';
```

**Optimization**:
- Next.js Image component handles:
  - Format conversion (WebP with fallback)
  - Responsive sizing
  - Lazy loading
  - Caching

---

## No Schema Migrations Required

✅ **Conclusion**: All required fields already exist in current Prisma schema.

**Existing Fields Support**:
- ✅ Dimensions editing: `widthMm`, `heightMm` (Int)
- ✅ Glass type editing: `glassTypeId` (String FK)
- ✅ Price recalculation: `subtotal` (Decimal)
- ✅ Image display: `model.imageUrl` (String?)
- ✅ Validation: Model constraints via `minWidth`, `maxWidth`, etc.

**No Migrations Needed**:
- No new tables
- No new columns
- No index changes
- No data backfills

**Implementation**: Pure application logic changes only.

---

## Related Documentation

- **Spec**: `specs/019-edit-cart-items/spec.md`
- **Research**: `specs/019-edit-cart-items/research.md`
- **Contracts**: `specs/019-edit-cart-items/contracts/` (see next Phase)
- **Prisma Schema**: `prisma/schema.prisma`
