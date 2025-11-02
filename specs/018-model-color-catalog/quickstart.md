# Quickstart: Sistema de Catálogo de Colores para Modelos

**Feature**: 001-model-color-catalog  
**Date**: 2025-10-28  
**For**: Developers onboarding to this feature

---

## Overview

This feature adds a color catalog system to Glasify Lite with three main user flows:

1. **Admin** configures master color catalog (10 standard colors pre-seeded)
2. **Admin** assigns colors to models with model-specific surcharge percentages
3. **Client** selects color when quoting, sees instant price update with surcharge applied

**Key Technologies**: Next.js 15 SSR, tRPC, Prisma, PostgreSQL, React Hook Form, Zod validation

---

## Quick Setup (5 minutes)

### Step 1: Database Migration

```bash
# Run Prisma migration to create Color, ModelColor tables and extend QuoteItem
pnpm prisma migrate dev --name add_color_catalog

# Seed 10 standard colors
pnpm prisma db seed
```

**Expected Output**:
```
✅ Migration 20251028_add_color_catalog applied
✅ Seeded 10 standard colors: Blanco, Gris Antracita, Negro Mate, ...
```

### Step 2: Verify Database

```bash
# Check colors were seeded
pnpm prisma studio

# Navigate to Color table
# Should see 10 rows with names like "Blanco", "Gris Antracita", etc.
```

### Step 3: Start Development Server

```bash
pnpm dev
```

**Test Routes**:
- Admin: `http://localhost:3000/admin/colors` (color catalog management)
- Admin: `http://localhost:3000/admin/models/[modelId]/colors` (assign colors to model)
- Public: `http://localhost:3000/catalog/[modelId]` (color selector in quote form)

---

## Key Concepts

### 1. Color Catalog (Global)

```typescript
// Master catalog shared across all tenants
const color = {
  id: "clx123",
  name: "Blanco",           // Display name
  ralCode: "RAL 9010",      // Industry standard (optional)
  hexCode: "#F3F3E9",       // For UI rendering (required)
  isActive: true,           // Soft delete flag
};
```

**Important**: Colors are global. Same "Blanco" used by all tenants.

### 2. Model-Color Assignment (Tenant-Specific)

```typescript
// Junction table with surcharge data
const modelColor = {
  id: "clxMC001",
  modelId: "clxModel123",       // Which window/door model
  colorId: "clxColor001",       // Which color from catalog
  surchargePercentage: 15.5,    // % added to model basePrice
  isDefault: true,              // Auto-selected in UI
};
```

**Important**: Same color can have different surcharges per model.

### 3. Quote Item Snapshot (Immutable)

```typescript
// Historical record - never changes after creation
const quoteItem = {
  id: "clxQI001",
  colorId: "clxColor005",               // Reference to color
  colorName: "Madera Roble Oscuro",     // SNAPSHOT
  colorHexCode: "#794D35",              // SNAPSHOT
  colorSurchargePercentage: 22,         // SNAPSHOT
  subtotal: 670.50,                     // Calculated with snapshot
};
```

**Important**: Even if admin changes color surcharge to 30%, this quote still shows 22%.

---

## Data Flow Diagram

```
┌─────────────┐
│   ADMIN     │
│ Creates     │
│ Color       │
└──────┬──────┘
       │
       ▼
┌─────────────────┐         ┌─────────────┐
│  Color Catalog  │◄────────│   SEEDER    │
│  (10 standard)  │         │ (idempotent)│
└─────────┬───────┘         └─────────────┘
          │
          │ Admin assigns
          │ with surcharge %
          ▼
   ┌──────────────┐
   │ ModelColor   │
   │ (Model + %)  │
   └──────┬───────┘
          │
          │ Client selects
          │ in quote form
          ▼
    ┌────────────┐
    │ QuoteItem  │
    │ (Snapshot) │
    └────────────┘
```

---

## Common Tasks

### Task 1: Add New Color to Catalog (Admin)

**Route**: `/admin/colors/new`

**Steps**:
1. Fill form: Name, RAL Code (optional), Hex Code (required)
2. Click "Crear Color"
3. Color appears in catalog list

**Code**:
```typescript
// API call (auto-generated tRPC hook)
const createColor = api.colors.create.useMutation({
  onSettled: () => {
    void utils.colors.list.invalidate();
    router.refresh(); // SSR two-step pattern
  },
});

createColor.mutate({
  name: "Verde Musgo",
  ralCode: "RAL 6025",
  hexCode: "#6B8E23",
});
```

---

### Task 2: Assign Colors to Model (Admin)

**Route**: `/admin/models/[modelId]/colors`

**Steps**:
1. Select model from dropdown
2. Choose colors from catalog
3. Set surcharge % for each (0-100)
4. Mark one as default
5. Save

**Code**:
```typescript
// Bulk assign
const bulkAssign = api.modelColors.bulkAssign.useMutation();

bulkAssign.mutate({
  modelId: "clxModel123",
  colors: [
    { colorId: "clxColor001", surchargePercentage: 0, isDefault: true },
    { colorId: "clxColor002", surchargePercentage: 10 },
    { colorId: "clxColor005", surchargePercentage: 22 },
  ],
});
```

---

### Task 3: Select Color in Quote (Client)

**Route**: `/catalog/[modelId]` (quote form)

**Steps**:
1. User sees color chips (only if model has colors)
2. Click desired color chip
3. Price updates instantly (<200ms)
4. Submit quote

**Code**:
```typescript
// Client Component
'use client';

export function ColorSelector({ modelColors, basePrice }: Props) {
  const [selectedColorId, setSelectedColorId] = useState(defaultColorId);
  
  // Client-side calculation (instant UX)
  const selectedColor = modelColors.find(mc => mc.colorId === selectedColorId);
  const surcharge = selectedColor 
    ? basePrice * (selectedColor.surchargePercentage / 100) 
    : 0;
  const total = basePrice + surcharge;
  
  return (
    <div>
      {modelColors.map(mc => (
        <ColorChip
          key={mc.colorId}
          hexCode={mc.color.hexCode}
          name={mc.color.name}
          surchargePercentage={mc.surchargePercentage}
          isSelected={mc.colorId === selectedColorId}
          onClick={() => setSelectedColorId(mc.colorId)}
        />
      ))}
      <PriceDisplay base={basePrice} surcharge={surcharge} total={total} />
    </div>
  );
}
```

---

## Testing

### Unit Tests

```bash
# Pricing calculation with color surcharge
pnpm test tests/unit/pricing/color-surcharge.test.ts
```

**What it tests**:
- Price calculation formula: `(basePrice * (1 + surcharge%/100)) * quantity`
- Edge cases: 0% surcharge, 100% surcharge, decimal percentages

### Integration Tests

```bash
# Seeder idempotency
pnpm test tests/integration/seeders/colors.seeder.test.ts
```

**What it tests**:
- Running seeder twice creates 10 colors (not 20)
- Upsert updates existing colors without duplicates

### E2E Tests (Playwright)

```bash
# Full user flows
pnpm test:e2e e2e/admin/colors/
```

**What it tests**:
1. **create-color.spec.ts**: Admin creates new color → appears in catalog
2. **assign-color-to-model.spec.ts**: Admin assigns 3 colors → model shows them in catalog
3. **client-selects-color.spec.ts**: Client selects color → price updates → PDF shows color

---

## Troubleshooting

### Issue: Colors not showing in catalog

**Symptoms**: Client sees no color selector in quote form

**Diagnosis**:
```typescript
// Check if model has colors assigned
const modelColors = await db.modelColor.findMany({
  where: { modelId },
  include: { color: true },
});
console.log('Model colors:', modelColors.length);
```

**Solution**: Admin must assign colors to model first (Task 2)

---

### Issue: Price not updating when selecting color

**Symptoms**: Color changes but price stays the same

**Diagnosis**:
- Check browser console for JavaScript errors
- Verify `modelColors` prop has `surchargePercentage` field

**Solution**:
```typescript
// Ensure data structure is correct
console.log('ModelColors prop:', modelColors);
// Should include: { colorId, color: { hexCode, name }, surchargePercentage }
```

---

### Issue: Historical quote shows wrong color price

**Symptoms**: Admin changed surcharge from 10% to 20%, old quote now shows 20%

**Diagnosis**: Snapshot fields not populated correctly

**Solution**: Verify `QuoteItem` has snapshot fields:
```sql
SELECT 
  id, 
  colorId, 
  colorName,               -- Should NOT be null
  colorHexCode,            -- Should NOT be null
  colorSurchargePercentage -- Should NOT be null
FROM "QuoteItem" 
WHERE colorId IS NOT NULL;
```

If null, bug in quote creation mutation (not capturing snapshot).

---

### Issue: "Color already assigned" error

**Symptoms**: Cannot assign color that seems available

**Diagnosis**: Unique constraint on `[modelId, colorId]`

**Solution**:
```sql
-- Check existing assignments
SELECT * FROM "ModelColor" 
WHERE modelId = 'clxModel123' AND colorId = 'clxColor005';

-- If exists, update instead of create
```

Use `updateSurcharge` mutation instead of `assign` mutation.

---

## Performance Notes

### Optimizations

1. **Model Colors Query** (cached 5 min):
```typescript
// ISR caching for catalog page
export const revalidate = 300; // 5 minutes
```

2. **Client-Side Price Calculation**:
```typescript
// No API call needed - data already loaded
const surcharge = basePrice * (percentage / 100); // <1ms
```

3. **Database Indexes**:
```sql
CREATE INDEX "ModelColor_modelId_isDefault_idx" ON "ModelColor"("modelId", "isDefault");
CREATE INDEX "Color_isActive_idx" ON "Color"("isActive");
```

### Expected Performance

| Operation                    | Target | Typical        |
| ---------------------------- | ------ | -------------- |
| List 100 colors (admin)      | <100ms | ~40ms          |
| Get model with 10 colors     | <50ms  | ~25ms          |
| Create quote item with color | <150ms | ~80ms          |
| Client price recalculation   | <200ms | <1ms (instant) |

---

## Architecture Decisions

### Why Snapshot Pattern?

**Problem**: Admin changes color surcharge from 15% to 20%. What happens to existing quotes?

**Solution**: Store surcharge% in `QuoteItem` at creation time (immutable snapshot).

**Trade-off**:
- ✅ Historical quotes never change price (auditable)
- ✅ PDF generation doesn't need Color lookup (faster)
- ❌ 3 extra fields per QuoteItem (storage cost)
- ❌ Denormalization (data duplicated)

**Verdict**: Correctness > Storage efficiency

---

### Why Explicit Junction Table (ModelColor)?

**Problem**: Need to store surcharge% and isDefault flag on relationship.

**Solution**: Explicit `ModelColor` table instead of Prisma implicit many-to-many.

**Alternatives Rejected**:
- ❌ Implicit `Model.colors Color[]`: Can't store extra data on relationship
- ❌ JSON field on Model: Loses type safety and foreign key constraints
- ❌ Store surcharge on Color: Violates single responsibility (color shouldn't know pricing)

---

### Why Three-Tier Deletion Strategy?

**Problem**: What if admin tries to delete a color used in 50 quotes?

**Solution**:
1. **Tier 1 (Prevent)**: If used in quotes → throw error
2. **Tier 2 (Soft Delete)**: If used in models → set `isActive = false`
3. **Tier 3 (Hard Delete)**: If no references → delete permanently

**Rationale**: Balance between data integrity and cleanup flexibility.

---

## Next Steps

After understanding this feature:

1. **Explore Admin UI**: `/admin/colors` - See how CRUD operations work
2. **Test Client Flow**: `/catalog/[modelId]` - Experience color selection UX
3. **Review Contracts**: `specs/001-model-color-catalog/contracts/*.json` - API definitions
4. **Read Data Model**: `specs/001-model-color-catalog/data-model.md` - Entity relationships
5. **Run E2E Tests**: `pnpm test:e2e e2e/admin/colors/` - See full flows in action

---

## Questions?

- **Data Model**: See `data-model.md` for entity details
- **API Contracts**: See `contracts/*.json` for tRPC procedures
- **Implementation Plan**: See `plan.md` for full technical context
- **Research Decisions**: See `research.md` for architectural choices

**Ready to implement?** Run `/speckit.tasks` to generate atomic development tasks.
