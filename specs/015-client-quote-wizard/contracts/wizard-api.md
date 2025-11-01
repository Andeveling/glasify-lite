# API Contracts: Client Quote Wizard

**Feature**: Client Quote Wizard  
**Branch**: `015-client-quote-wizard`  
**Date**: 2025-10-28  
**Phase**: 1 - Design & Contracts

---

## Overview

This document defines the tRPC API contracts for the Client Quote Wizard feature. Most functionality leverages **existing tRPC procedures** with minimal or no changes required.

---

## Existing Procedures (Reused)

### 1. catalog.get-model-by-id

**Purpose**: Fetch model details including available colors and glass solutions

**Procedure**: `src/server/api/routers/catalog.ts`

**Input**:
```typescript
{
  modelId: string; // CUID
}
```

**Output**:
```typescript
{
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: Decimal;
  colors: Array<{
    id: string;
    name: string;
    hexCode: string;
    priceModifier: Decimal; // Percentage (e.g., 15 for +15%)
  }>;
  glassSolutions: Array<{
    id: string;
    name: string;
    description: string | null;
    category: string; // 'thermal' | 'acoustic' | 'solar' | 'security'
    priceModifier: Decimal;
  }>;
  // ... other fields
}
```

**Status**: ✅ **Exists** - Already used in catalog page Server Component

**Changes Required**: ❌ None

---

### 2. quote.calculate-item-price

**Purpose**: Calculate real-time price for current wizard selections

**Procedure**: `src/server/api/routers/quote.ts` (or similar)

**Input**:
```typescript
{
  modelId: string;
  width: number;  // millimeters
  height: number; // millimeters
  colorId?: string | null;
  glassSolutionId?: string | null;
  serviceIds?: string[]; // Array of service IDs
}
```

**Output**:
```typescript
{
  basePrice: number;
  dimensionPrice: number; // Based on area
  colorModifier: number;
  glassSolutionModifier: number;
  servicesTotal: number;
  subtotal: number; // Before services
  total: number;    // Final price
  currency: string; // e.g., 'USD'
}
```

**Status**: 🔍 **Needs Verification** - Likely exists, may need serviceIds parameter added

**Changes Required**:
- ✅ **If exists**: Verify accepts all wizard parameters
- ⚠️ **If missing serviceIds**: Add optional serviceIds parameter to calculation logic

---

### 3. budget.add-item

**Purpose**: Add configured item to user's budget cart

**Procedure**: `src/server/api/routers/budget.ts`

**Input**:
```typescript
{
  modelId: string;
  roomLocation?: string | null; // NEW - from US-008
  width: number;
  height: number;
  colorId?: string | null;
  glassSolutionId?: string | null;
  serviceIds?: string[];
  quantity: number; // Always 1 for wizard
}
```

**Output**:
```typescript
{
  id: string; // Created QuoteItem ID
  success: boolean;
  message: string; // Spanish message for toast
}
```

**Status**: 🔍 **Needs Verification** - Likely exists, may need roomLocation parameter

**Changes Required**:
- ⚠️ **If missing roomLocation**: Add optional roomLocation parameter (from US-008)
- ✅ **If complete**: No changes needed

---

## New Procedures (Potentially Required)

### 4. catalog.get-services

**Purpose**: Fetch optional services for Step 4

**Procedure**: `src/server/api/routers/catalog.ts` (new or extend existing)

**Input**:
```typescript
{
  isOptional?: boolean; // Filter for optional services only
}
```

**Output**:
```typescript
{
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    price: Decimal;
    isOptional: boolean;
  }>;
}
```

**Status**: ❓ **Unknown** - May already exist in catalog router

**Changes Required**:
- ✅ **If exists**: Verify returns services
- ⚠️ **If missing**: Create new procedure to fetch services

---

## tRPC Procedure Specifications

### Input Validation (Zod Schemas)

All procedures use Zod for input validation. Example for wizard-related inputs:

```typescript
// Dimension validation
const dimensionSchema = z.number()
  .int('Debe ser un número entero')
  .min(500, 'Dimensión mínima: 500mm')
  .max(3000, 'Dimensión máxima: 3000mm');

// Calculate price input
export const calculatePriceInputSchema = z.object({
  modelId: z.string().cuid(),
  width: dimensionSchema,
  height: dimensionSchema,
  colorId: z.string().cuid().nullable().optional(),
  glassSolutionId: z.string().cuid().nullable().optional(),
  serviceIds: z.array(z.string().cuid()).optional().default([])
});

// Add to budget input
export const addToBudgetInputSchema = z.object({
  modelId: z.string().cuid(),
  roomLocation: z.string().max(100).nullable().optional(),
  width: dimensionSchema,
  height: dimensionSchema,
  colorId: z.string().cuid().nullable().optional(),
  glassSolutionId: z.string().cuid().nullable().optional(),
  serviceIds: z.array(z.string().cuid()).optional().default([]),
  quantity: z.number().int().min(1).default(1)
});
```

---

## Error Handling

All procedures follow consistent error handling pattern:

### Client-Side (TanStack Query)
```typescript
const mutation = api.budget['add-item'].useMutation({
  onSuccess: (data) => {
    toast.success(data.message); // Spanish message from server
  },
  onError: (error) => {
    const message = error.message || 'Error al agregar ítem al presupuesto';
    toast.error(message); // Spanish error message
    console.error('Add to budget failed:', error); // English log
  },
  onSettled: () => {
    void utils.budget.invalidate(); // Clear cache
    router.refresh();                // Re-fetch server data
  }
});
```

### Server-Side (tRPC Procedure)
```typescript
addItem: protectedProcedure
  .input(addToBudgetInputSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const quoteItem = await ctx.db.quoteItem.create({
        data: {
          userId: ctx.session.user.id,
          ...input
        }
      });
      
      return {
        id: quoteItem.id,
        success: true,
        message: 'Ítem agregado al presupuesto correctamente'
      };
    } catch (error) {
      logger.error('Failed to add item to budget', { error, input });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No se pudo agregar el ítem. Intenta de nuevo.'
      });
    }
  })
```

---

## Rate Limiting & Performance

### Price Calculation Debouncing

**Client-Side**:
- Debounce dimension inputs: 300ms
- Cancel in-flight requests on new input (AbortController)
- Cache results by unique key: `${modelId}-${width}-${height}-${colorId}-${glassSolutionId}`

**Server-Side**:
- No rate limiting needed (authenticated users only)
- Calculation is fast (<50ms for simple math)
- Database queries are cached (Prisma query engine)

### Budget Mutation

**Client-Side**:
- Prevent double-submit with disabled state
- Show loading spinner during mutation
- Optimistic update not recommended (SSR requires router.refresh)

**Server-Side**:
- Transaction to ensure atomicity (budget + quote item creation)
- Idempotency: Check for duplicate within 5-second window

---

## Authentication & Authorization

All wizard-related procedures require authentication:

```typescript
// Protected procedure (requires session)
export const protectedProcedure = t.procedure.use(
  async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({ ctx: { ...ctx, session: ctx.session } });
  }
);
```

**Wizard Access**:
- Public catalog browsing (Server Component)
- Add to budget requires authentication (tRPC mutation)
- Redirect to login if unauthenticated when clicking "Agregar al Presupuesto"

---

## Caching Strategy

### TanStack Query Configuration

```typescript
// Client-side cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Glass solutions & services: rarely change
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      
      // Model data: already fetched server-side
      // (wizard receives as prop from Server Component)
      
      // Price calculations: short cache (dimensions change frequently)
      // Override per-query: staleTime: 30 * 1000 (30 seconds)
    }
  }
});
```

### Invalidation Pattern

After adding item to budget:
```typescript
onSettled: () => {
  void utils.budget.invalidate();     // Clear budget cache
  void utils.quote.invalidate();      // Clear quote cache if applicable
  router.refresh();                   // Re-fetch Server Component data
}
```

---

## Migration Checklist

Before implementing wizard, verify:

- [ ] `quote.calculate-item-price` accepts `serviceIds` parameter
- [ ] `budget.add-item` accepts `roomLocation` parameter (US-008)
- [ ] `catalog.get-services` exists or create new procedure
- [ ] All procedures use Spanish error messages for user-facing errors
- [ ] Winston logging on server-side (never in Client Components)
- [ ] Two-step invalidation pattern (`invalidate()` + `router.refresh()`)

---

## Summary

**Existing Procedures** (No Changes):
- ✅ `catalog.get-model-by-id` - Fetch model with colors and glass solutions

**Existing Procedures** (Minor Changes):
- ⚠️ `quote.calculate-item-price` - Add `serviceIds` parameter if missing
- ⚠️ `budget.add-item` - Add `roomLocation` parameter if missing (US-008)

**New Procedures** (If Missing):
- ❓ `catalog.get-services` - Fetch optional services for Step 4

**Performance**:
- Client-side debouncing: 300ms for dimensions
- TanStack Query caching: 5 minutes for glass/services, 30 seconds for prices

**Error Handling**:
- Spanish messages for users
- English logs for debugging
- Consistent toast notifications

**Next**: Generate quickstart.md with implementation guide
