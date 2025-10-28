# Research: Sistema de Catálogo de Colores para Modelos

**Date**: 2025-10-28  
**Feature**: 001-model-color-catalog  
**Purpose**: Resolve technical unknowns and establish best practices for implementation

---

## Research Tasks

### 1. Color Storage and Validation Patterns

**Question**: What's the best practice for storing and validating color codes (RAL + Hexadecimal) in PostgreSQL with Prisma?

**Decision**: Use separate optional fields for RAL code (String) and mandatory hexadecimal (String with regex validation)

**Rationale**:
- Not all colors have RAL codes (e.g., custom wood finishes like "Madera Roble Oscuro")
- Hexadecimal is universal and sufficient for UI rendering
- RAL codes are industry-standard for professional communication (valuable metadata)
- Validation at multiple layers: Zod schema (runtime), Prisma schema (type safety), database constraint (data integrity)

**Validation Strategy**:
```typescript
// Zod schema
hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Formato hexadecimal inválido")
ralCode: z.string().regex(/^RAL \d{4}$/).optional()

// Prisma unique constraint
@@unique([name, hexCode]) // Prevent duplicates
```

**Alternatives Considered**:
- ❌ Enum for colors: Inflexible, requires code changes for new colors
- ❌ Single combined field "RAL 9010 (#F3F3E9)": Complex parsing, inconsistent format
- ❌ Separate Color table per tenant: Over-normalized, complicates seeding

---

### 2. Many-to-Many Relationship with Additional Data

**Question**: How to model the relationship between Model and Color when we need to store model-specific surcharge percentage and default flag?

**Decision**: Use explicit junction table `ModelColor` with relationship fields (not implicit Prisma many-to-many)

**Rationale**:
- Surcharge percentage varies per model (same color = different surcharge on different models)
- Only one color can be default per model (requires validation logic)
- Need timestamps for audit trail (createdAt/updatedAt on relationship)
- Explicit junction table gives full control over relationship data and constraints

**Schema Design**:
```prisma
model ModelColor {
  id                    String   @id @default(cuid())
  modelId               String
  model                 Model    @relation(fields: [modelId], references: [id], onDelete: Cascade)
  colorId               String
  color                 Color    @relation(fields: [colorId], references: [id], onDelete: Restrict)
  surchargePercentage   Decimal  @db.Decimal(5, 2) // 0.00 to 100.00
  isDefault             Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@unique([modelId, colorId]) // Prevent duplicate assignments
  @@index([modelId, isDefault]) // Optimize default color lookup
}
```

**Alternatives Considered**:
- ❌ Implicit Prisma many-to-many: Can't store surcharge percentage on relationship
- ❌ Store surcharge on Color model: Breaks single responsibility (color shouldn't know about pricing)
- ❌ JSON field on Model with color IDs + surcharges: Loses type safety, can't use foreign keys

---

### 3. Quote Immutability Strategy

**Question**: How to ensure historical quote prices don't change when color surcharges are updated?

**Decision**: Denormalize color data in QuoteItem (snapshot pattern) with three fields: colorId (reference), colorSurchargePercentage (snapshot), colorHexCode (snapshot for PDF)

**Rationale**:
- Business requirement: "Las cotizaciones ya generadas deben mantener su precio original"
- Color configuration changes frequently (admin adjusts surcharges based on material costs)
- PDF regeneration must show exact color used at quote creation time
- Foreign key to Color allows admin to see which color was used (audit trail)
- Snapshot fields ensure recalculation always returns same price

**Implementation**:
```prisma
model QuoteItem {
  // ... existing fields ...
  
  // Color selection (optional - can be null if model has no colors or uses default)
  colorId                   String?
  color                     Color?   @relation(fields: [colorId], references: [id], onDelete: SetNull)
  
  // Snapshot fields for immutability
  colorSurchargePercentage  Decimal? @db.Decimal(5, 2) // Captured at quote creation
  colorHexCode              String?  // For PDF generation even if color is deleted/modified
  colorName                 String?  // For PDF display
}
```

**Alternatives Considered**:
- ❌ Recalculate price from current ModelColor: Violates immutability requirement
- ❌ Full JSON snapshot of entire color object: Overkill, only need 3 fields
- ❌ No foreign key, only snapshot: Loses audit trail (can't track which color was actually selected)

---

### 4. Seeder Idempotency Pattern

**Question**: How to seed 10 standard colors safely without duplicates on repeated runs?

**Decision**: Use upsert pattern with composite unique key (name + hexCode) in Prisma seeder

**Rationale**:
- Development/staging environments run seeders multiple times
- Production deployments should be safe to re-run
- Composite key (name + hexCode) prevents duplicates even if RAL codes differ
- Upsert updates existing colors if data changed (e.g., fix typo in name)

**Implementation**:
```typescript
// prisma/seeders/colors.seeder.ts
export async function seedColors(db: PrismaClient) {
  const colors = [
    { name: 'Blanco', ralCode: 'RAL 9010', hexCode: '#F3F3E9' },
    { name: 'Gris Antracita', ralCode: 'RAL 7016', hexCode: '#384043' },
    // ... 8 more colors
  ];
  
  for (const color of colors) {
    await db.color.upsert({
      where: { name_hexCode: { name: color.name, hexCode: color.hexCode } },
      update: { ralCode: color.ralCode, isActive: true },
      create: { ...color, isActive: true },
    });
  }
  
  logger.info(`Seeded ${colors.length} standard colors`);
}
```

**Testing Strategy**:
- Integration test: Run seeder twice, assert count remains 10
- Integration test: Modify one color, run seeder, assert update occurred
- E2E test: Fresh DB → seed → assert all 10 colors exist with correct hex codes

**Alternatives Considered**:
- ❌ Check if exists first, then create: Race condition risk, more queries
- ❌ Delete all + insert: Breaks existing ModelColor foreign keys
- ❌ Insert with ON CONFLICT DO NOTHING: Doesn't update if data changes

---

### 5. Client-Side Price Recalculation Performance

**Question**: How to achieve <200ms price recalculation without server round-trip when color changes?

**Decision**: Client-side calculation using data already loaded with the model (no API call needed)

**Rationale**:
- Color surcharge data is loaded with model in initial server request
- Calculation is simple: `basePrice * (1 + surchargePercentage / 100)`
- No security risk: final price is validated server-side when quote is created
- Meets performance requirement: calculation is instant (<1ms in JavaScript)

**Implementation**:
```typescript
// Client Component: color-selector.tsx
'use client';

export function ColorSelector({ modelColors, basePrice }: Props) {
  const [selectedColorId, setSelectedColorId] = useState(defaultColorId);
  
  // Client-side calculation (instant)
  const selectedColor = modelColors.find(mc => mc.colorId === selectedColorId);
  const surcharge = selectedColor ? basePrice * (selectedColor.surchargePercentage / 100) : 0;
  const totalPrice = basePrice + surcharge;
  
  return (
    <div>
      {modelColors.map(mc => (
        <ColorChip 
          key={mc.colorId}
          onClick={() => setSelectedColorId(mc.colorId)}
          // ...
        />
      ))}
      <PriceDisplay base={basePrice} surcharge={surcharge} total={totalPrice} />
    </div>
  );
}
```

**Server-Side Validation**:
```typescript
// server/api/routers/quotes.ts - createQuoteItem procedure
const modelColor = await db.modelColor.findUnique({
  where: { modelId_colorId: { modelId, colorId } }
});

// Recalculate server-side to prevent client tampering
const surcharge = basePrice * (modelColor.surchargePercentage / 100);
const expectedTotal = basePrice + surcharge;

if (Math.abs(expectedTotal - clientProvidedTotal) > 0.01) {
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'Price mismatch' });
}
```

**Alternatives Considered**:
- ❌ API call on every color change: Adds latency, violates <200ms requirement
- ❌ Optimistic update with mutation: Overkill for simple calculation
- ❌ Trust client price without validation: Security risk (client could modify code)

---

### 6. Color Deletion Strategy

**Question**: How to handle color deletion when it's assigned to models or used in quotes?

**Decision**: Three-tier soft delete strategy based on usage context

**Rationale**:
- Colors in active quotes must be preserved (foreign key with SetNull would lose audit trail)
- Colors assigned to models should prevent deletion (business data integrity)
- Unused colors can be soft-deleted (isActive flag) for cleanup without data loss

**Strategy**:

**Tier 1 - Color in Quotes**: Prevent deletion entirely
```typescript
// Before delete, check quote usage
const quoteCount = await db.quoteItem.count({ where: { colorId } });
if (quoteCount > 0) {
  throw new TRPCError({ 
    code: 'CONFLICT', 
    message: `No se puede eliminar. Color usado en ${quoteCount} cotizaciones` 
  });
}
```

**Tier 2 - Color in Models**: Allow soft delete only (deactivate)
```typescript
const modelCount = await db.modelColor.count({ where: { colorId } });
if (modelCount > 0) {
  // Soft delete only
  await db.color.update({ 
    where: { id: colorId }, 
    data: { isActive: false } 
  });
  return { message: `Color desactivado (usado en ${modelCount} modelos)` };
}
```

**Tier 3 - Unused Color**: Allow hard delete
```typescript
await db.color.delete({ where: { id: colorId } });
```

**UI Feedback**:
- Show warning badge on colors with model/quote usage
- Disable "Eliminar" button if used in quotes
- Change button text to "Desactivar" if used only in models

**Alternatives Considered**:
- ❌ Always allow delete with CASCADE: Loses historical data in quotes
- ❌ Always soft delete: Database grows indefinitely with unused colors
- ❌ No usage checking: Risk of breaking referential integrity

---

### 7. Server-Side Rendering + Cache Invalidation Pattern

**Question**: Admin color management uses SSR with force-dynamic. How to refresh UI after mutations?

**Decision**: Two-step invalidation pattern: TanStack Query invalidate + Next.js router.refresh()

**Rationale**:
- Admin routes use `export const dynamic = 'force-dynamic'` (no ISR caching)
- Server Components pass `initialData` to Client Components
- TanStack Query cache invalidation clears client cache
- `router.refresh()` triggers Server Component re-fetch
- Both steps required for UI to update with SSR data

**Implementation**:
```typescript
// Client Component: color-form.tsx
'use client';

const router = useRouter();
const utils = api.useUtils();

const createColor = api.colors.create.useMutation({
  onSettled: () => {
    void utils.colors.list.invalidate();  // Step 1: Clear TanStack Query cache
    router.refresh();                      // Step 2: Re-fetch Server Component data
  },
});
```

**Why Both Steps**:
1. **Without `invalidate()`**: Client cache still has old data
2. **Without `router.refresh()`**: Server Component doesn't re-run, `initialData` unchanged
3. **With both**: Client cache cleared + fresh server data fetched = UI updates correctly

**Alternatives Considered**:
- ❌ Only `invalidate()`: Works with client-fetched data, fails with SSR initialData
- ❌ Only `router.refresh()`: Client cache not cleared, possible stale data flash
- ❌ Use ISR instead of force-dynamic: Admin data should always be fresh (no 30-60s delay)

---

### 8. Multi-Color Selector UX Pattern

**Question**: Best UI pattern for displaying 5-10 colors with names, hex codes, and surcharges?

**Decision**: Horizontal scrollable chips (mobile) / Grid layout (desktop) with visual hierarchy

**Rationale**:
- Colors are primarily visual (chip with hex background is essential)
- Surcharge percentage is critical decision factor (must be prominent)
- Color name provides context (e.g., "Madera Roble" = wood finish)
- 5-10 colors = comfortable for both layouts (no pagination needed)

**Component Design**:
```tsx
// ColorChip component (reusable atom)
<div className={cn(
  "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer",
  "hover:border-primary transition-all",
  isSelected && "border-primary bg-primary/10"
)}>
  {/* Visual color swatch */}
  <div 
    className="w-12 h-12 rounded-full border-2 border-gray-300"
    style={{ backgroundColor: hexCode }}
  />
  
  {/* Color name */}
  <span className="text-sm font-medium text-center">{name}</span>
  
  {/* Surcharge badge (if > 0) */}
  {surchargePercentage > 0 && (
    <Badge variant="secondary">+{surchargePercentage}%</Badge>
  )}
  
  {/* Selected indicator */}
  {isSelected && <Check className="w-4 h-4 text-primary" />}
</div>
```

**Responsive Strategy**:
- Mobile: Horizontal scroll with snap-to-item (`scroll-snap-type: x mandatory`)
- Tablet/Desktop: Grid 4 columns with gap-4
- Accessibility: Keyboard navigation (arrow keys), ARIA labels

**Alternatives Considered**:
- ❌ Dropdown select: Hides visual aspect of colors (defeats purpose)
- ❌ Radio buttons with small swatches: Harder to see color differences
- ❌ Vertical list: Wastes space, requires more scrolling

---

## Summary of Decisions

| Topic | Decision | Key Benefit |
|-------|----------|-------------|
| Color Storage | RAL (optional) + Hex (required) separate fields | Flexibility + validation |
| Model-Color Relation | Explicit ModelColor junction table | Store surcharge + default flag |
| Quote Immutability | Snapshot colorSurchargePercentage in QuoteItem | Historical prices never change |
| Seeder Pattern | Upsert with composite unique key | Idempotent, safe to re-run |
| Price Recalculation | Client-side calculation from pre-loaded data | <200ms performance goal met |
| Color Deletion | Three-tier: prevent/soft-delete/hard-delete | Data integrity + cleanup |
| SSR Cache Invalidation | invalidate() + router.refresh() both required | Correct UI updates with SSR |
| Color Selector UX | Scrollable chips (mobile) / Grid (desktop) | Visual clarity + accessibility |

---

## Open Questions (None)

All technical unknowns have been resolved. Ready to proceed to Phase 1: Data Model & Contracts design.
