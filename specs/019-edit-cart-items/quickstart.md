# Quick Start: Edición de Items del Carrito

**Feature**: 019-edit-cart-items  
**Date**: 2025-11-03  
**Audience**: Developers implementing this feature

## Overview

This guide provides step-by-step instructions for implementing the cart item editing feature. Follow these steps in order for a smooth implementation.

---

## Prerequisites

✅ **Before you start**:
- [ ] Next.js 16.0.1+ installed
- [ ] PostgreSQL database running
- [ ] Prisma schema migrated (no new migrations needed for this feature)
- [ ] Shadcn/ui components installed (`dialog`, `button`, `input`, `select`)
- [ ] Winston logger configured (server-side only)
- [ ] Understanding of tRPC procedures and TanStack Query

---

## Implementation Steps

### Step 1: Create File Structure (5 min)

Create the required files following SOLID architecture:

```bash
# From project root
mkdir -p src/app/\(public\)/cart/_components
mkdir -p src/app/\(public\)/cart/_hooks
mkdir -p src/app/\(public\)/cart/_schemas
mkdir -p src/app/\(public\)/cart/_utils
mkdir -p src/app/\(public\)/cart/_constants

# Create files
touch src/app/\(public\)/cart/_components/cart-item.tsx
touch src/app/\(public\)/cart/_components/cart-item-edit-modal.tsx
touch src/app/\(public\)/cart/_components/cart-item-image.tsx
touch src/app/\(public\)/cart/_hooks/use-cart-item-mutations.ts
touch src/app/\(public\)/cart/_hooks/use-cart-data.ts
touch src/app/\(public\)/cart/_schemas/cart-item-edit.schema.ts
touch src/app/\(public\)/cart/_utils/cart-item-edit.utils.ts
touch src/app/\(public\)/cart/_utils/cart-price-calculator.ts
touch src/app/\(public\)/cart/_constants/cart-item.constants.ts
```

---

### Step 2: Define Constants (10 min)

**File**: `src/app/(public)/cart/_constants/cart-item.constants.ts`

```typescript
/**
 * Cart item display and validation constants
 */

// Image dimensions
export const CART_ITEM_IMAGE_SIZE = 80; // px (width and height)

// Image fallbacks
export const DEFAULT_MODEL_PLACEHOLDER = '/assets/placeholder-model.png';

// Dimension limits (generic - server validates against model-specific limits)
export const MIN_DIMENSION = 100; // mm
export const MAX_DIMENSION = 3000; // mm

// Default quantity
export const DEFAULT_QUANTITY = 1;

// UI text (Spanish)
export const EDIT_BUTTON_TEXT = 'Editar';
export const SAVE_BUTTON_TEXT = 'Guardar cambios';
export const CANCEL_BUTTON_TEXT = 'Cancelar';
export const PRICE_RECALC_MESSAGE = 'El precio se recalculará al confirmar';
```

---

### Step 3: Create Zod Schema (15 min)

**File**: `src/app/(public)/cart/_schemas/cart-item-edit.schema.ts`

```typescript
import { z } from 'zod';
import { MIN_DIMENSION, MAX_DIMENSION, DEFAULT_QUANTITY } from '../_constants/cart-item.constants';

/**
 * Client-side validation schema for cart item editing
 * Server performs additional model-specific validation
 */
export const cartItemEditSchema = z.object({
  widthMm: z
    .number({ required_error: 'El ancho es requerido' })
    .int('El ancho debe ser un número entero')
    .min(MIN_DIMENSION, `Ancho mínimo: ${MIN_DIMENSION}mm`)
    .max(MAX_DIMENSION, `Ancho máximo: ${MAX_DIMENSION}mm`),

  heightMm: z
    .number({ required_error: 'El alto es requerido' })
    .int('El alto debe ser un número entero')
    .min(MIN_DIMENSION, `Alto mínimo: ${MIN_DIMENSION}mm`)
    .max(MAX_DIMENSION, `Alto máximo: ${MAX_DIMENSION}mm`),

  glassTypeId: z
    .string({ required_error: 'El tipo de vidrio es requerido' })
    .uuid('ID de vidrio inválido'),

  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'Máximo 50 caracteres')
    .optional(),

  roomLocation: z
    .string()
    .max(100, 'Máximo 100 caracteres')
    .optional(),

  quantity: z
    .number()
    .int('La cantidad debe ser un número entero')
    .min(1, 'Cantidad mínima: 1')
    .default(DEFAULT_QUANTITY),
});

export type CartItemEditInput = z.infer<typeof cartItemEditSchema>;
```

---

### Step 4: Create Utility Functions (20 min)

**File**: `src/app/(public)/cart/_utils/cart-item-edit.utils.ts`

```typescript
import type { QuoteItem, Model, GlassType } from '@prisma/client';
import type { CartItemEditInput } from '../_schemas/cart-item-edit.schema';

/**
 * Type for cart item with relations (from tRPC query)
 */
export type CartItemWithRelations = QuoteItem & {
  model: Model;
  glassType: GlassType;
};

/**
 * Get default form values from existing cart item
 */
export function getDefaultCartItemValues(
  item: CartItemWithRelations
): CartItemEditInput {
  return {
    widthMm: item.widthMm,
    heightMm: item.heightMm,
    glassTypeId: item.glassTypeId,
    name: item.name,
    roomLocation: item.roomLocation ?? undefined,
    quantity: item.quantity,
  };
}

/**
 * Transform form values for tRPC mutation
 */
export function transformEditData(
  itemId: string,
  formData: CartItemEditInput
) {
  return {
    itemId,
    ...formData,
  };
}
```

**File**: `src/app/(public)/cart/_utils/cart-price-calculator.ts`

```typescript
import { Decimal } from '@prisma/client/runtime/library';

export interface PriceCalculationParams {
  widthMm: number;
  heightMm: number;
  pricePerM2: Decimal;
  quantity: number;
  colorSurchargePercentage?: number; // Percentage (e.g., 10 = 10%)
}

/**
 * Calculate item subtotal based on dimensions, glass type, and quantity
 * 
 * Formula: (width * height / 1,000,000) * pricePerM2 * quantity + color surcharge
 */
export function calculateItemPrice(params: PriceCalculationParams): Decimal {
  // Convert mm to m²
  const widthM = params.widthMm / 1000;
  const heightM = params.heightMm / 1000;
  const area = widthM * heightM;

  // Base price
  let price = area * params.pricePerM2.toNumber() * params.quantity;

  // Apply color surcharge if present
  if (params.colorSurchargePercentage) {
    price += price * (params.colorSurchargePercentage / 100);
  }

  return new Decimal(price);
}
```

---

### Step 5: Create tRPC Mutations Hook (30 min)

**File**: `src/app/(public)/cart/_hooks/use-cart-item-mutations.ts`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import type { CartItemEditInput } from '../_schemas/cart-item-edit.schema';

/**
 * Cart item mutations with cache invalidation and SSR refresh
 * 
 * CRITICAL: Uses two-step invalidation for SSR pages:
 * 1. invalidate() - Clear TanStack Query cache
 * 2. router.refresh() - Re-fetch server data
 */
export function useCartItemMutations() {
  const router = useRouter();
  const utils = api.useUtils();

  const updateItem = api.cart.updateItem.useMutation({
    onSettled: () => {
      // Step 1: Clear cache
      void utils.cart.get.invalidate();
      
      // Step 2: Re-fetch server data (REQUIRED for SSR pages)
      router.refresh();
    },
  });

  const deleteItem = api.cart.deleteItem.useMutation({
    onSettled: () => {
      void utils.cart.get.invalidate();
      router.refresh();
    },
  });

  return {
    updateItem,
    deleteItem,
  };
}

/**
 * Helper to edit cart item with type safety
 */
export function useEditCartItem() {
  const { updateItem } = useCartItemMutations();

  const editItem = (itemId: string, data: CartItemEditInput) => {
    return updateItem.mutateAsync({
      itemId,
      ...data,
    });
  };

  return {
    editItem,
    isLoading: updateItem.isPending,
    error: updateItem.error,
  };
}
```

---

### Step 6: Create Image Component (15 min)

**File**: `src/app/(public)/cart/_components/cart-item-image.tsx`

```typescript
'use client';

import Image from 'next/image';
import { CART_ITEM_IMAGE_SIZE, DEFAULT_MODEL_PLACEHOLDER } from '../_constants/cart-item.constants';

interface CartItemImageProps {
  imageUrl: string | null;
  modelName: string;
}

/**
 * Model image with fallback placeholder
 * Uses Next.js Image for optimization
 */
export function CartItemImage({ imageUrl, modelName }: CartItemImageProps) {
  const src = imageUrl ?? DEFAULT_MODEL_PLACEHOLDER;

  return (
    <div className="relative flex-shrink-0">
      <Image
        src={src}
        alt={modelName}
        width={CART_ITEM_IMAGE_SIZE}
        height={CART_ITEM_IMAGE_SIZE}
        className="rounded object-cover border border-border"
        loading="lazy"
        onError={(e) => {
          // Fallback to placeholder on error
          e.currentTarget.src = DEFAULT_MODEL_PLACEHOLDER;
        }}
      />
    </div>
  );
}
```

---

### Step 7: Create Edit Modal (45 min)

**File**: `src/app/(public)/cart/_components/cart-item-edit-modal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cartItemEditSchema, type CartItemEditInput } from '../_schemas/cart-item-edit.schema';
import { getDefaultCartItemValues, type CartItemWithRelations } from '../_utils/cart-item-edit.utils';
import { useEditCartItem } from '../_hooks/use-cart-item-mutations';
import { api } from '@/trpc/react';
import {
  SAVE_BUTTON_TEXT,
  CANCEL_BUTTON_TEXT,
  PRICE_RECALC_MESSAGE,
} from '../_constants/cart-item.constants';

interface CartItemEditModalProps {
  item: CartItemWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal for editing cart item dimensions and glass type
 * Recalculates price on confirm (not in real-time)
 */
export function CartItemEditModal({
  item,
  open,
  onOpenChange,
}: CartItemEditModalProps) {
  const { editItem, isLoading } = useEditCartItem();

  // Fetch available glass types for this model
  const { data: glassTypes } = api.model.getAvailableGlassTypes.useQuery(
    { modelId: item.modelId },
    { enabled: open } // Only fetch when modal opens
  );

  const form = useForm<CartItemEditInput>({
    resolver: zodResolver(cartItemEditSchema),
    defaultValues: getDefaultCartItemValues(item),
  });

  const onSubmit = async (data: CartItemEditInput) => {
    try {
      await editItem(item.id, data);
      onOpenChange(false); // Close modal on success
      form.reset(); // Reset form
    } catch (error) {
      // Error handling - form errors will be displayed automatically
      console.error('Error editing cart item:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Item</DialogTitle>
          <DialogDescription>
            Modifica las dimensiones y el tipo de vidrio. {PRICE_RECALC_MESSAGE}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Width Input */}
          <div className="space-y-2">
            <Label htmlFor="widthMm">Ancho (mm)</Label>
            <Input
              id="widthMm"
              type="number"
              {...form.register('widthMm', { valueAsNumber: true })}
              disabled={isLoading}
            />
            {form.formState.errors.widthMm && (
              <p className="text-sm text-destructive">
                {form.formState.errors.widthMm.message}
              </p>
            )}
          </div>

          {/* Height Input */}
          <div className="space-y-2">
            <Label htmlFor="heightMm">Alto (mm)</Label>
            <Input
              id="heightMm"
              type="number"
              {...form.register('heightMm', { valueAsNumber: true })}
              disabled={isLoading}
            />
            {form.formState.errors.heightMm && (
              <p className="text-sm text-destructive">
                {form.formState.errors.heightMm.message}
              </p>
            )}
          </div>

          {/* Glass Type Select */}
          <div className="space-y-2">
            <Label htmlFor="glassTypeId">Tipo de Vidrio</Label>
            <Select
              value={form.watch('glassTypeId')}
              onValueChange={(value) => form.setValue('glassTypeId', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="glassTypeId">
                <SelectValue placeholder="Selecciona un vidrio" />
              </SelectTrigger>
              <SelectContent>
                {glassTypes?.map((glass) => (
                  <SelectItem key={glass.id} value={glass.id}>
                    {glass.name} - ${glass.pricePerM2}/m²
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.glassTypeId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.glassTypeId.message}
              </p>
            )}
          </div>

          {/* Current Price Display */}
          <div className="rounded-lg border border-border bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              Precio actual: <span className="font-semibold">${item.subtotal.toString()}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {PRICE_RECALC_MESSAGE}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {CANCEL_BUTTON_TEXT}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : SAVE_BUTTON_TEXT}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Step 8: Update Cart Item Display (20 min)

**File**: `src/app/(public)/cart/_components/cart-item.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItemImage } from './cart-item-image';
import { CartItemEditModal } from './cart-item-edit-modal';
import { EDIT_BUTTON_TEXT } from '../_constants/cart-item.constants';
import type { CartItemWithRelations } from '../_utils/cart-item-edit.utils';

interface CartItemProps {
  item: CartItemWithRelations;
}

/**
 * Cart item display with image and edit button
 * Opens edit modal when "Editar" is clicked
 */
export function CartItem({ item }: CartItemProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
        {/* Model Image */}
        <CartItemImage
          imageUrl={item.model.imageUrl}
          modelName={item.model.name}
        />

        {/* Item Details */}
        <div className="flex-1">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.model.name}</p>
          <p className="text-sm">
            {item.widthMm}mm x {item.heightMm}mm - {item.glassType.name}
          </p>
          {item.roomLocation && (
            <p className="text-xs text-muted-foreground">{item.roomLocation}</p>
          )}
        </div>

        {/* Price */}
        <div className="text-right">
          <p className="font-semibold">${item.subtotal.toString()}</p>
          <p className="text-xs text-muted-foreground">
            Cantidad: {item.quantity}
          </p>
        </div>

        {/* Edit Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setEditModalOpen(true)}
          title={EDIT_BUTTON_TEXT}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      {/* Edit Modal */}
      <CartItemEditModal
        item={item}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </>
  );
}
```

---

### Step 9: Extend tRPC Router (40 min)

**File**: `src/server/api/routers/cart.ts` (extend existing router)

```typescript
// Add to existing cart router

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { calculateItemPrice } from '@/app/(public)/cart/_utils/cart-price-calculator';

export const cartRouter = createTRPCRouter({
  // ... existing procedures ...

  updateItem: publicProcedure
    .input(
      z.object({
        itemId: z.string().cuid(),
        widthMm: z.number().int().min(100).max(3000),
        heightMm: z.number().int().min(100).max(3000),
        glassTypeId: z.string().uuid(),
        name: z.string().min(1).max(50).optional(),
        roomLocation: z.string().max(100).optional(),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Get item with relations
      const item = await ctx.db.quoteItem.findUnique({
        where: { id: input.itemId },
        include: {
          quote: true,
          model: true,
          glassType: true,
        },
      });

      if (!item) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Item de carrito no encontrado',
        });
      }

      // 2. Verify quote is in draft status
      if (item.quote.status !== 'draft') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No se puede editar un item de una cotización ya enviada',
        });
      }

      // 3. Verify ownership (if authenticated)
      if (ctx.session?.user && item.quote.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'No tienes permiso para editar este item',
        });
      }

      // 4. Validate dimensions against model constraints
      if (
        input.widthMm < item.model.minWidth ||
        input.widthMm > item.model.maxWidth ||
        input.heightMm < item.model.minHeight ||
        input.heightMm > item.model.maxHeight
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Las dimensiones exceden los límites permitidos por el modelo',
        });
      }

      // 5. Validate glass compatibility
      const isCompatible = await ctx.db.modelGlassType.findFirst({
        where: {
          modelId: item.modelId,
          glassTypeId: input.glassTypeId,
        },
      });

      if (!isCompatible) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'El vidrio seleccionado no es compatible con este modelo',
        });
      }

      // 6. Get new glass type for price calculation
      const newGlassType = await ctx.db.glassType.findUnique({
        where: { id: input.glassTypeId },
      });

      if (!newGlassType) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tipo de vidrio no encontrado',
        });
      }

      // 7. Calculate new price
      const newSubtotal = calculateItemPrice({
        widthMm: input.widthMm,
        heightMm: input.heightMm,
        pricePerM2: newGlassType.pricePerM2,
        quantity: input.quantity,
        colorSurchargePercentage: item.colorSurchargePercentage?.toNumber(),
      });

      // 8. Update item and recalculate quote total in transaction
      const updatedItem = await ctx.db.$transaction(async (tx) => {
        // Update item
        const updated = await tx.quoteItem.update({
          where: { id: input.itemId },
          data: {
            widthMm: input.widthMm,
            heightMm: input.heightMm,
            glassTypeId: input.glassTypeId,
            name: input.name ?? item.name,
            roomLocation: input.roomLocation ?? item.roomLocation,
            quantity: input.quantity,
            subtotal: newSubtotal,
          },
          include: {
            model: true,
            glassType: true,
          },
        });

        // Recalculate quote total
        const allItems = await tx.quoteItem.findMany({
          where: { quoteId: item.quoteId },
        });

        const total = allItems.reduce(
          (sum, item) => sum.add(item.subtotal),
          new Decimal(0)
        );

        await tx.quote.update({
          where: { id: item.quoteId },
          data: { total },
        });

        return updated;
      });

      // 9. Log edit event (Winston - server-side only)
      ctx.logger.info('Cart item edited', {
        itemId: input.itemId,
        quoteId: item.quoteId,
        userId: ctx.session?.user?.id,
        changes: {
          dimensions: `${input.widthMm}x${input.heightMm}`,
          glassTypeId: input.glassTypeId,
        },
      });

      return {
        success: true,
        item: updatedItem,
        quoteTotal: newSubtotal.toString(),
      };
    }),
});
```

---

### Step 10: Update Cart Page (15 min)

**File**: `src/app/(public)/cart/page.tsx` (existing page - add to it)

```typescript
// Ensure page uses SSR
export const dynamic = 'force-dynamic';

// Add CartItem component to cart display
import { CartItem } from './_components/cart-item';

// In the page component:
{cart?.items.map((item) => (
  <CartItem key={item.id} item={item} />
))}
```

---

## Testing Checklist

### Unit Tests

- [ ] `cart-price-calculator.test.ts` - Price calculation logic
- [ ] `cart-item-edit.utils.test.ts` - Transform and default value functions

### Integration Tests

- [ ] `cart.updateItem.test.ts` - tRPC procedure with database

### E2E Tests

- [ ] `cart-item-edit.spec.ts` - Full edit flow (open modal → edit → confirm → verify)

---

## Common Issues & Solutions

### Issue: UI doesn't update after edit

**Cause**: Missing `router.refresh()` after mutation

**Solution**: Ensure `use-cart-item-mutations.ts` calls both `invalidate()` and `router.refresh()`

---

### Issue: "Glass type not compatible" error

**Cause**: ModelGlassType junction doesn't have the relationship

**Solution**: Verify in database that `ModelGlassType` table has the (modelId, glassTypeId) pair

---

### Issue: Price calculation incorrect

**Cause**: Formula error or Decimal precision issue

**Solution**: Check `cart-price-calculator.ts` - ensure conversion from mm to m²

---

## Next Steps

After implementation:

1. ✅ Run tests (`pnpm test`)
2. ✅ Manual testing in dev environment
3. ✅ Code review focusing on SOLID compliance
4. ✅ Update CHANGELOG.md with new feature
5. ✅ Create PR with description and screenshots

---

## Additional Resources

- **Spec**: `specs/019-edit-cart-items/spec.md`
- **Research**: `specs/019-edit-cart-items/research.md`
- **Data Model**: `specs/019-edit-cart-items/data-model.md`
- **Contracts**: `specs/019-edit-cart-items/contracts/`
- **Constitution**: `.specify/memory/constitution.md`
- **Next.js Docs**: [App Router](https://nextjs.org/docs/app)
- **tRPC Docs**: [Mutations](https://trpc.io/docs/server/mutations)
