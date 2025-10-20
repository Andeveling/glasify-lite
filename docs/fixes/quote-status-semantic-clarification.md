# Fix: Quote Status Semantic Clarification

**Date**: 2025-10-13  
**Issue**: Confusing "En edición" label for draft quotes that are not actually editable  
**Status**: ✅ **RESOLVED**

---

## Problem Statement

### User Confusion

The quote status "En edición" (In edit) created confusion because:

1. **Label suggests editability**: "En edición" implies the quote can be modified
2. **Reality**: Quotes are **read-only** after creation from cart
3. **No edit functionality**: There's no "Edit quote" button or flow to modify items
4. **Misleading CTA**: Config showed "Continuar editando" (Continue editing) as CTA

### User Flow

```
Usuario → Catálogo → Configurar modelo → Agregar al carrito
↓
Carrito → "Generar cotización"
↓
Quote creada con status: 'draft'
↓
Carrito se vacía (items transferidos a Quote)
↓
Usuario ve cotización en /my-quotes/[id]
↓
Badge muestra: "En edición" 🤔
↓
Usuario intenta editar... pero NO PUEDE ❌
```

### Why No Edit After Creation?

**Architectural Decision**: Quotes are **immutable snapshots** for the following reasons:

1. **Quote validity period** (`quoteValidityDays` from TenantConfig):
   - Quotes expire after X days (default: 15 days)
   - Allowing edits would invalidate the expiration date
   - Example: User creates quote on Day 1, edits on Day 14 → confusing validity

2. **Price consistency**:
   - Prices are locked at quote generation time (`subtotal` in QuoteItem)
   - Models may have price changes later (tracked in `ModelPriceHistory`)
   - Editing would require recalculating with new prices → changes the quote entirely

3. **Audit trail**:
   - Immutable quotes provide clear history of what was quoted
   - If client needs changes → create new quote (duplicate feature)

4. **Business logic**:
   - Quote represents a formal proposal to client
   - Once generated, it should remain as-is for reference
   - Changes = new quote version

---

## Solution Implemented

### 1. Changed Label and Icon

**Before**:
```typescript
draft: {
  label: 'En edición',
  icon: Edit3,
  iconName: 'edit',
  tooltip: 'Esta cotización está en edición. Puedes continuar modificándola.',
  cta: {
    action: 'edit',
    label: 'Continuar editando',
  },
}
```

**After**:
```typescript
draft: {
  label: 'Pendiente',
  icon: FileText,
  iconName: 'file-text',
  tooltip: 'Esta cotización fue generada desde el carrito y está lista para enviar. Revisa los detalles antes de enviarla.',
  cta: {
    action: 'view',
    label: 'Ver detalles',
  },
}
```

**Changes**:
- ✅ Label: "En edición" → "Pendiente" (Pending)
- ✅ Icon: `Edit3` → `FileText` (document icon, not edit pencil)
- ✅ Tooltip: Now explains it's ready to send, not editable
- ✅ CTA: "Continuar editando" → "Ver detalles" (view, not edit)

---

### 2. Updated Prisma Schema Documentation

**Added JSDoc**:
```prisma
/// Quote lifecycle status
/// - draft: Generated from cart, pending review/send (read-only, not editable)
/// - sent: Sent to vendor/client, awaiting response
/// - canceled: Canceled and no longer active
enum QuoteStatus {
  draft
  sent
  canceled
}
```

**Clarifies**:
- `draft` = Read-only snapshot, pending action (not editable)
- Future developers will understand the intent

---

### 3. Updated Service Comment

**In `quote.service.ts`**:
```typescript
status: 'draft', // Initial status: pending review/send (read-only, not editable after creation)
```

**Clarifies**:
- Comment explicitly states "not editable after creation"
- Prevents future confusion when maintaining code

---

## Status Meaning After Fix

### Draft (Pendiente)

**What it means**:
- Quote generated from cart
- Cart items transferred to Quote (cart now empty)
- Prices locked at generation time
- **Ready to send** to vendor/client
- **Not editable** - immutable snapshot

**User Actions**:
- ✅ View quote details
- ✅ Export to PDF/Excel
- ✅ (Future) Send to vendor/client
- ✅ Cancel quote
- ✅ Duplicate quote (create new version)
- ❌ Edit items (not possible by design)

**Badge Color**: Amber/Yellow (secondary) - indicates pending action

---

### Sent (Enviada)

**What it means**:
- Quote was sent to vendor/client
- Awaiting response
- Still valid until `validUntil` date

**User Actions**:
- ✅ View quote details
- ✅ Export to PDF/Excel
- ✅ (Future) Resend quote
- ✅ Cancel quote
- ❌ Edit items (not possible)

**Badge Color**: Blue (default) - informational state

---

### Canceled (Cancelada)

**What it means**:
- Quote was canceled by user
- No longer active
- Kept for historical reference

**User Actions**:
- ✅ View quote details (read-only)
- ✅ Export to PDF/Excel
- ✅ Duplicate quote (create new version)
- ❌ Send (cannot send canceled quote)
- ❌ Edit items (not possible)

**Badge Color**: Red (destructive) - negative state

---

## Future Enhancements (Not Implemented Yet)

### Send Quote Feature

**User Story**: As a user, I want to send my draft quote to a vendor/client

**Implementation**:
1. Add "Enviar cotización" button in detail page (only for `status: 'draft'`)
2. Show modal/form to confirm recipient (email, phone, etc.)
3. Update status: `draft` → `sent`
4. (Optional) Send email notification

**Why not included in MVP**:
- Requires email/notification infrastructure
- Out of scope for current UX redesign
- Status semantic fix was priority

---

### Duplicate Quote Feature

**User Story**: As a user, I want to create a new quote based on an existing one

**Implementation**:
1. Add "Duplicar" button for all quotes (especially `canceled`)
2. Copy quote items to cart
3. User can modify in cart before generating new quote
4. Generate new quote with fresh validity period and current prices

**Why important**:
- Solves the "edit quote" need properly
- Respects immutability and validity period
- Allows price updates naturally (new quote = new prices)

**Status**: Not implemented yet (future task)

---

## Testing Recommendations

### Manual Test Cases

1. **Generate Quote from Cart**:
   ```
   1. Add products to cart
   2. Click "Generar cotización"
   3. Fill project address
   4. Verify quote created with status "Pendiente" (not "En edición")
   5. Verify amber badge displayed
   6. Verify tooltip says "lista para enviar" (not "puedes modificar")
   ```

2. **View Quote Detail**:
   ```
   1. Navigate to /my-quotes/[id] for draft quote
   2. Verify badge shows "Pendiente"
   3. Verify NO edit button present
   4. Verify export buttons work (PDF/Excel)
   5. Verify quote is read-only (cannot modify items)
   ```

3. **Filter by Status**:
   ```
   1. Navigate to /my-quotes
   2. Filter by "Pendiente" status
   3. Verify only draft quotes shown
   4. Verify badge consistency across list and detail
   ```

---

## Impact Analysis

### User Experience

**Before**: 😕 Confusion - "En edición" but cannot edit

**After**: ✅ Clarity - "Pendiente" clearly indicates waiting state

### Code Changes

- ✅ `status-config.ts`: Updated draft status config
- ✅ `schema.prisma`: Added JSDoc for QuoteStatus enum
- ✅ `quote.service.ts`: Updated comment for status assignment

**Lines Changed**: ~15 lines total

**Risk**: ⚠️ **Low** - Only UI labels and documentation, no logic changes

---

## Acceptance Criteria

- [x] Draft status label changed from "En edición" to "Pendiente"
- [x] Icon changed from Edit3 to FileText
- [x] Tooltip clarifies quote is read-only
- [x] CTA changed from "Continuar editando" to "Ver detalles"
- [x] Prisma schema documented with JSDoc
- [x] Service comment clarifies immutability
- [x] No breaking changes to database or API
- [x] Documentation created explaining decision

---

## Conclusion

This fix resolves the semantic confusion between label and functionality by:

1. **Honest UI**: Label matches reality (pending, not editable)
2. **Clear communication**: Tooltip explains next steps
3. **Documented intent**: Future developers understand immutability decision
4. **Prepared for future**: "Send quote" feature will make sense with "Pendiente" label

**Status Semantic After Fix**:
- `draft` = "Pendiente" = Ready to send, not editable ✅
- `sent` = "Enviada" = Sent to vendor/client ✅
- `canceled` = "Cancelada" = Canceled and inactive ✅

**Follow WCAG "Don't Make Me Think" Principle**: Users immediately understand what they can do without trying to click non-existent edit buttons.
