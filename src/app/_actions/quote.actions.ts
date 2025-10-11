/**
 * Quote Server Actions
 *
 * Server Actions for quote generation with progressive enhancement.
 * Uses tRPC v11 experimental_caller for type-safe server actions.
 *
 * These actions require authentication and handle the complete quote
 * generation workflow from cart items.
 *
 * @module app/_actions/quote.actions
 */

'use server';

import { redirect } from 'next/navigation';
import logger from '@/lib/logger';
import { generateQuoteFromCart } from '@/server/api/routers/quote/quote.service';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import type { CartItem } from '@/types/cart.types';

// ============================================================================
// Types
// ============================================================================

/**
 * Quote generation form input (from React Hook Form)
 */
type QuoteGenerationFormInput = {
  projectName?: string;
  projectStreet: string;
  projectCity: string;
  projectState: string;
  projectPostalCode: string;
  contactPhone?: string;
};

/**
 * Quote generation result
 */
type QuoteGenerationResult = {
  success: boolean;
  quoteId?: string;
  error?: string;
};

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Generate Quote from Cart - Server Action
 *
 * Creates a formal quote from cart items with project address details.
 * This action:
 * 1. Validates user authentication
 * 2. Retrieves cart items from client (passed as parameter)
 * 3. Gets manufacturerId from first cart item's model
 * 4. Calls quote.service.ts to generate quote with transaction
 * 5. Returns result with quote ID or error
 *
 * Progressive Enhancement: Works via form submission or programmatic call
 *
 * @param formInput - Form data with project address
 * @param cartItems - Cart items from client-side state
 * @returns Quote generation result with success status and quote ID
 *
 * @example
 * ```tsx
 * // From React Hook Form
 * const result = await generateQuoteFromCartAction(formValues, cartItems);
 * if (result.success) {
 *   router.push(`/quotes/${result.quoteId}`);
 * }
 * ```
 */
export async function generateQuoteFromCartAction(
  formInput: QuoteGenerationFormInput,
  cartItems: CartItem[]
): Promise<QuoteGenerationResult> {
  const startTime = Date.now();
  const correlationId = `quote-action-${Date.now()}`;

  try {
    // 1. Authentication check
    const session = await auth();

    if (!session?.user?.id) {
      logger.warn('[QuoteAction] Unauthorized quote generation attempt', {
        correlationId,
      });

      return {
        error: 'Debes iniciar sesión para generar una cotización',
        success: false,
      };
    }

    const userId = session.user.id;

    logger.info('[QuoteAction] Starting quote generation', {
      correlationId,
      itemCount: cartItems.length,
      userId,
    });

    // 2. Validation: Cart must not be empty
    if (!cartItems || cartItems.length === 0) {
      logger.warn('[QuoteAction] Empty cart detected', {
        correlationId,
        userId,
      });

      return {
        error: 'El carrito está vacío. Agrega items antes de generar una cotización.',
        success: false,
      };
    }

    // 3. Get manufacturerId from first cart item's model
    const firstCartItem = cartItems[0];
    if (!firstCartItem) {
      logger.error('[QuoteAction] Cart is empty after validation', {
        correlationId,
      });

      return {
        error: 'El carrito está vacío. Por favor intenta nuevamente.',
        success: false,
      };
    }

    const firstModel = await db.model.findUnique({
      select: { manufacturerId: true },
      where: { id: firstCartItem.modelId },
    });

    if (!firstModel) {
      logger.error('[QuoteAction] Model not found for cart item', {
        correlationId,
        modelId: firstCartItem.modelId,
      });

      return {
        error: 'Modelo no encontrado. Por favor intenta nuevamente.',
        success: false,
      };
    }

    // REFACTOR: manufacturerId is now optional (deprecated field)
    // For backward compatibility, we pass it if available
    // In the future, this will be removed entirely
    const manufacturerId = firstModel.manufacturerId ?? '';

    // 4. Call quote service to generate quote
    const result = await generateQuoteFromCart(db, userId, {
      cartItems,
      contactPhone: formInput.contactPhone,
      manufacturerId, // May be empty string if model has no manufacturerId
      projectAddress: {
        projectCity: formInput.projectCity,
        projectName: formInput.projectName ?? 'Sin nombre',
        projectPostalCode: formInput.projectPostalCode,
        projectState: formInput.projectState,
        projectStreet: formInput.projectStreet,
      },
    });

    logger.info('[QuoteAction] Quote generation completed successfully', {
      correlationId,
      duration: `${Date.now() - startTime}ms`,
      manufacturerId: manufacturerId || 'none',
      quoteId: result.quoteId,
      userId,
    });

    return {
      quoteId: result.quoteId,
      success: true,
    };
  } catch (error) {
    logger.error('[QuoteAction] Quote generation failed', {
      correlationId,
      duration: `${Date.now() - startTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      error: error instanceof Error ? error.message : 'Error al generar la cotización. Por favor intenta nuevamente.',
      success: false,
    };
  }
}

/**
 * Redirect to quote generation page
 *
 * Server Action to redirect unauthenticated users to sign-in before quote generation.
 * Used by CartSummary component when "Generate Quote" is clicked.
 *
 * @example
 * ```tsx
 * // In CartSummary component
 * if (!session) {
 *   await redirectToQuoteGenerationAction();
 * }
 * ```
 */
export async function redirectToQuoteGenerationAction(): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    // Redirect to sign-in with callback to quote generation page
    redirect('/api/auth/signin?callbackUrl=/quote/new');
  }

  // User is authenticated, redirect to quote generation page
  redirect('/quote/new');
}
