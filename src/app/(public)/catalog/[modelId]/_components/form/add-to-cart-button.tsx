/**
 * Add to Cart Button Component
 *
 * Handles adding configured window model to cart with auto-generated name.
 * Integrates with useCart hook for client-side cart management.
 *
 * @module app/(public)/catalog/[modelId]/_components/form/add-to-cart-button
 */

'use client';

import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/app/(public)/cart/_hooks/use-cart';
import { Button } from '@/components/ui/button';
import logger from '@/lib/logger';
import type { CreateCartItemInput } from '@/types/cart.types';

// ============================================================================
// Constants
// ============================================================================

const SUCCESS_MESSAGE_DURATION_MS = 3000;

// ============================================================================
// Types
// ============================================================================

type AddToCartButtonProps = {
  /** Cart item data from form */
  item: CreateCartItemInput & { unitPrice: number };

  /** Whether the form is valid */
  isValid: boolean;

  /** Whether price is being calculated */
  isCalculating: boolean;

  /** Optional className */
  className?: string;

  /** Optional success callback */
  onSuccess?: () => void;
};

// ============================================================================
// Component
// ============================================================================

export function AddToCartButton({ item, isValid, isCalculating, className, onSuccess }: AddToCartButtonProps) {
  const { addItem, summary } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddToCart = () => {
    if (!isValid || isCalculating) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setIsAdding(true);
      setError(null);

      // Add item to cart (client-side)
      addItem(item);

      logger.info('Item added to cart from catalog', {
        itemCount: summary.itemCount + 1,
        modelId: item.modelId,
        modelName: item.modelName,
      });

      setSuccess(true);
      onSuccess?.();

      // Reset success message after specified duration
      setTimeout(() => setSuccess(false), SUCCESS_MESSAGE_DURATION_MS);
    } catch (err) {
      logger.error('Failed to add item to cart', { error: err, item });

      const errorMessage =
        err instanceof Error && err.message.includes('no puedes agregar más')
          ? 'Has alcanzado el límite de 20 items en el carrito'
          : 'No se pudo agregar el item al carrito';

      setError(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const isDisabled = !isValid || isCalculating || isAdding;

  return (
    <div className="space-y-2">
      <Button
        className={className}
        disabled={isDisabled}
        onClick={handleAddToCart}
        size="lg"
        type="button"
        variant="default"
      >
        <ShoppingCart className="mr-2 size-5" />
        {isAdding ? 'Agregando...' : 'Agregar al carrito'}
      </Button>

      {success && <p className="text-center text-green-600 text-sm">✓ {item.modelName} agregado al carrito</p>}

      {error && <p className="text-center text-destructive text-sm">{error}</p>}
    </div>
  );
}
