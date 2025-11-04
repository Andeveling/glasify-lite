# Research: Edición de Items del Carrito

**Feature**: 019-edit-cart-items  
**Date**: 2025-11-03  
**Phase**: 0 - Research & Investigation

## Overview

This document captures research findings for implementing inline cart item editing functionality. The research focuses on UI/UX patterns, technical approaches, and best practices for cart management in e-commerce systems.

---

## Research Tasks

### 1. UI/UX Patterns for Cart Item Editing

**Research Question**: What are the best practices for editing cart items in e-commerce applications?

**Findings**:

**Approach A: Inline Editing (Low Friction)**
- Edit fields appear directly in cart row
- Changes apply immediately or with "Update" button
- **Pros**: Minimal clicks, fast edits
- **Cons**: Can clutter cart view, harder to validate complex rules

**Approach B: Modal/Dialog Editing (Recommended)**
- Click "Edit" button opens dedicated modal
- Modal contains full form with all editable fields
- Single "Confirm" action applies all changes
- **Pros**: Clean separation, easier validation, better mobile UX
- **Cons**: Extra click required

**Approach C: Navigate to Product Page**
- "Edit" redirects to product configuration page
- User reconfigures from scratch
- **Pros**: Reuses existing configuration UI
- **Cons**: Loses context, highest friction

**Decision**: **Approach B (Modal)** - Based on Just Value Doors reference
- **Rationale**: 
  - Matches proven pattern from industry leader (Just Value Doors)
  - Supports complex validation (dimensions, glass compatibility)
  - Single recalculation point (better performance)
  - Mobile-friendly (fullscreen modal on small screens)
  - Clear edit context (user knows they're editing, not creating new)

**Alternatives Considered**:
- Inline editing rejected due to complex validation requirements
- Product page redirect rejected due to UX friction and context loss

---

### 2. Model Image Display in Cart

**Research Question**: How should product images be displayed in cart items?

**Findings**:

**Image Specifications**:
- **Size**: 80x80px thumbnail (based on Just Value Doors pattern)
- **Format**: WebP with JPEG fallback (Next.js Image optimization)
- **Loading**: Lazy loading for off-screen images
- **Placeholder**: Generic product icon when image unavailable

**Implementation Approach**:
```typescript
// Using Next.js Image component for optimization
<Image
  src={model.imageUrl ?? DEFAULT_PLACEHOLDER}
  alt={model.name}
  width={CART_ITEM_IMAGE_SIZE}
  height={CART_ITEM_IMAGE_SIZE}
  className="rounded object-cover"
  loading="lazy"
/>
```

**Decision**: Use Next.js `<Image>` component with:
- 80x80px dimensions
- Placeholder fallback for missing images
- Lazy loading (cart can have many items)
- Object-cover fit to handle various aspect ratios

**Rationale**: Next.js Image provides automatic optimization, responsive images, and lazy loading out of the box.

---

### 3. Price Recalculation Strategy

**Research Question**: When and how should item price be recalculated during editing?

**Findings**:

**Option A: Real-time Recalculation**
- Recalculate on every field change (onBlur, onChange)
- **Pros**: Immediate feedback
- **Cons**: Multiple server calls, UX distraction, performance concerns

**Option B: Single Recalculation on Confirm (Recommended)**
- Calculate only when user clicks "Guardar cambios"
- Show current price during editing, update after confirmation
- **Pros**: Single server call, clear user intention, better performance
- **Cons**: No preview of new price during editing

**Option C: Debounced Recalculation**
- Recalculate after 500ms of no changes
- **Pros**: Balance between feedback and performance
- **Cons**: Still multiple calls, complex state management

**Decision**: **Option B (Single Recalculation)**
- **Rationale**:
  - Matches Just Value Doors pattern (confirmed in UI screenshots)
  - Spec explicitly requires "no en tiempo real"
  - Better server performance (1 calculation vs many)
  - Clearer user interaction model (edit → confirm → see new price)
  - Simpler state management (no debouncing logic)

**Implementation Notes**:
- Display current price in modal (read-only)
- Show "El precio se recalculará al confirmar" message
- After confirmation: server calculates → updates database → invalidates cache → refreshes page

---

### 4. Dimension and Glass Type Validation

**Research Question**: How to validate dimension changes and glass type compatibility?

**Findings**:

**Validation Layers**:

1. **Client-Side (Zod Schema)**:
   ```typescript
   const cartItemEditSchema = z.object({
     width: z.number()
       .min(MIN_DIMENSION, "Ancho mínimo: 100mm")
       .max(MAX_DIMENSION, "Ancho máximo: 3000mm"),
     height: z.number()
       .min(MIN_DIMENSION, "Alto mínimo: 100mm")
       .max(MAX_DIMENSION, "Alto máximo: 3000mm"),
     glassTypeId: z.string().uuid("ID de vidrio inválido"),
   });
   ```

2. **Server-Side (tRPC Procedure)**:
   ```typescript
   // Validate against model constraints
   if (width < model.minWidth || width > model.maxWidth) {
     throw new TRPCError({
       code: "BAD_REQUEST",
       message: "Dimensiones fuera del rango permitido por el modelo",
     });
   }
   
   // Validate glass compatibility
   const isCompatible = await db.model.hasGlassType(modelId, glassTypeId);
   if (!isCompatible) {
     throw new TRPCError({
       code: "BAD_REQUEST",
       message: "El vidrio seleccionado no es compatible con este modelo",
     });
   }
   ```

**Decision**: Dual validation (client + server)
- **Client**: Immediate feedback, generic limits
- **Server**: Model-specific limits, compatibility checks, security
- **Rationale**: Defense in depth, better UX (client) + security (server)

---

### 5. Cart State Management with SSR

**Research Question**: How to handle cart mutations in SSR context with `dynamic = 'force-dynamic'`?

**Findings**:

**Challenge**: Cart page uses SSR (`force-dynamic`) to always show fresh data. After mutations, we need to:
1. Clear TanStack Query cache
2. Re-fetch server data for page

**Solution Pattern** (from AGENTS.md):
```typescript
const editMutation = api.cart.updateItem.useMutation({
  onSettled: () => {
    // Step 1: Clear client cache
    void utils.cart.get.invalidate();
    
    // Step 2: Force server re-fetch
    router.refresh();
  },
});
```

**Why Both Steps**:
- `invalidate()`: Clears stale data from TanStack Query cache
- `router.refresh()`: Forces Next.js to re-run Server Component data fetching
- Without `router.refresh()`, page shows stale `initialData` from props

**Decision**: Use two-step invalidation for all cart mutations
- **Rationale**: Required pattern for SSR pages in Next.js 16 App Router
- **Alternative Considered**: Client-side only updates rejected (doesn't work with SSR)

---

### 6. Concurrent Edit Prevention

**Research Question**: How to prevent users from editing the same item simultaneously?

**Findings**:

**Approach A: Optimistic Locking (Version Number)**
- Add `version` column to CartItem
- Check version on update, fail if changed
- **Pros**: Detects conflicts, simple to implement
- **Cons**: Poor UX (user loses work)

**Approach B: UI-Level Prevention (Recommended for V1)**
- Disable edit button while mutation is in progress
- Show loading state during edit
- **Pros**: Simple, prevents most cases
- **Cons**: Doesn't handle multi-device scenarios

**Approach C: Real-time Locking (Complex)**
- WebSocket-based "editing" status
- Lock item when user opens edit modal
- **Pros**: Handles all scenarios
- **Cons**: Complex infrastructure, overkill for MVP

**Decision**: **Approach B (UI Prevention)** for V1
- **Rationale**:
  - Sufficient for single-device usage (99% of cases)
  - Simple implementation (loading states)
  - Can add optimistic locking in V2 if needed
- **Future Enhancement**: Add version column in Phase 2 if multi-device becomes issue

---

### 7. Form Reusability from Catalog

**Research Question**: Can we reuse form components from the catalog configuration flow?

**Findings**:

**Catalog Form Structure** (hypothetical, needs verification):
```
catalog/
├── _components/
│   └── product-config-form.tsx    # Full product configuration
├── _schemas/
│   └── product-config.schema.ts   # Dimensions + glass + model selection
```

**Cart Edit Requirements**:
- Dimensions input (✅ reusable)
- Glass type selection (✅ reusable)
- Model selection (❌ NOT needed - can't change model)
- Additional cart-specific: quantity (maybe future)

**Reusability Analysis**:
- **Option A**: Extract shared input components (DimensionsInput, GlassTypeSelect)
- **Option B**: Create new cart-specific form (simpler, no coupling)

**Decision**: **Option B (New Form)**
- **Rationale**:
  - Cart edit has different requirements (no model selection)
  - Simpler to maintain separate concerns
  - Avoids coupling cart to catalog
  - Can extract shared components later if patterns emerge
- **Alternative**: Extract after implementing, not before (YAGNI principle)

---

## Summary of Decisions

| Aspect              | Decision                   | Rationale                                                             |
| ------------------- | -------------------------- | --------------------------------------------------------------------- |
| Edit UI Pattern     | Modal/Dialog               | Industry best practice (Just Value Doors), complex validation support |
| Image Display       | 80x80px with Next.js Image | Matches reference, automatic optimization                             |
| Price Recalculation | Single on confirm          | Spec requirement, better performance, clearer UX                      |
| Validation          | Dual (client + server)     | Best UX (client) + security (server)                                  |
| SSR Mutations       | Two-step invalidation      | Required for Next.js 16 SSR pages                                     |
| Concurrent Edits    | UI-level prevention (V1)   | Simple, sufficient for most cases                                     |
| Form Reuse          | New cart-specific form     | Avoid coupling, simpler maintenance                                   |

---

## Open Questions (Resolved)

❌ No open questions remaining. All technical decisions made and documented.

---

## Next Steps

- ✅ Research complete
- ➡️ Proceed to Phase 1: Data Model and Contracts
