/**
 * Cart Service - Business Logic Layer
 *
 * Orchestrates cart operations:
 * - Item management (add, update, remove)
 * - Cart operations (fetch, clear)
 * - Price calculations
 * - Validation
 *
 * @module server/api/routers/cart/cart.service
 */

import { TRPCError } from "@trpc/server";
import type { db } from "@/server/db/drizzle";
import {
  calculateItemSubtotal,
  serializeCartItemWithRelations,
} from "./cart.utils";
import {
  createCartItem,
  deleteAllCartItems,
  deleteCartItem,
  findColorById,
  findDraftCart,
  findGlassTypeById,
  findModelById,
  findOrCreateCart,
  listCartItems,
  updateCartItem,
} from "./repositories/cart-repository";
import {
  logCartClearError,
  logCartClearStart,
  logCartClearSuccess,
  logCartCreated,
  logCartFetchError,
  logCartFetchStart,
  logCartFetchSuccess,
  logColorNotFound,
  logGlassTypeNotFound,
  logItemAddError,
  logItemAddStart,
  logItemAddSuccess,
  logItemRemoveError,
  logItemRemoveStart,
  logItemRemoveSuccess,
  logItemUpdateError,
  logItemUpdateStart,
  logItemUpdateSuccess,
  logModelNotFound,
  logPriceCalculation,
} from "./utils/cart-logger";

// Type inference from Drizzle db instance
type DbClient = typeof db;

// ============================================================================
// ADD ITEM TO CART
// ============================================================================

/**
 * Add an item to the user's cart
 *
 * Creates a new cart if one doesn't exist.
 * Validates model, glass type, and color existence.
 * Calculates item price based on dimensions.
 *
 * @param db - Drizzle client instance
 * @param userId - User ID
 * @param data - Item data
 * @returns Created cart item with relations
 * @throws TRPCError if validation fails
 */
export async function addItemToCart(
  client: DbClient,
  userId: string,
  data: {
    modelId: string;
    glassTypeId: string;
    heightMm: number;
    widthMm: number;
    quantity: number;
    name: string;
    colorId?: string | null;
  }
) {
  try {
    logItemAddStart(userId, data.modelId);

    // 1. Find or create cart
    const cart = await findOrCreateCart(client, userId);
    if (!cart) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No se pudo crear o encontrar el carrito del usuario.",
      });
    }

    if (cart.userId !== userId) {
      logCartCreated(userId, cart.id);
    }

    // 2. Validate model exists and is published
    const model = await findModelById(client, data.modelId);
    if (!model) {
      logModelNotFound(data.modelId);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "El modelo seleccionado no existe.",
      });
    }

    if (model.status !== "published") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "El modelo seleccionado no está disponible.",
      });
    }

    // 3. Validate glass type exists
    const glassType = await findGlassTypeById(client, data.glassTypeId);
    if (!glassType) {
      logGlassTypeNotFound(data.glassTypeId);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "El tipo de vidrio seleccionado no existe.",
      });
    }

    // 4. Validate color if provided
    if (data.colorId) {
      const color = await findColorById(client, data.colorId);
      if (!color) {
        logColorNotFound(data.colorId);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "El color seleccionado no existe.",
        });
      }
    }

    // 5. Calculate price
    const subtotal = calculateItemSubtotal({
      basePrice: model.basePrice,
      costPerMmHeight: model.costPerMmHeight,
      costPerMmWidth: model.costPerMmWidth,
      heightMm: data.heightMm,
      widthMm: data.widthMm,
      quantity: data.quantity,
    });

    logPriceCalculation({
      modelId: data.modelId,
      basePrice: Number.parseFloat(model.basePrice),
      heightMm: data.heightMm,
      widthMm: data.widthMm,
      quantity: data.quantity,
      subtotal,
    });

    // 6. Create cart item
    const newItem = await createCartItem(client, {
      quoteId: cart.id,
      modelId: data.modelId,
      glassTypeId: data.glassTypeId,
      heightMm: data.heightMm,
      widthMm: data.widthMm,
      quantity: data.quantity,
      name: data.name,
      colorId: data.colorId ?? null,
      subtotal: subtotal.toString(),
    });

    if (!newItem) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No se pudo agregar el artículo al carrito.",
      });
    }

    logItemAddSuccess(userId, newItem.id, model.name);

    // 7. Return formatted item with proper type conversions
    const unitPrice = subtotal / data.quantity;

    return {
      id: newItem.id,
      quoteId: newItem.quoteId,
      modelId: newItem.modelId,
      glassTypeId: newItem.glassTypeId,
      name: newItem.name,
      quantity: newItem.quantity,
      roomLocation: newItem.roomLocation,
      widthMm: newItem.widthMm,
      heightMm: newItem.heightMm,
      accessoryApplied: newItem.accessoryApplied,
      subtotal,
      colorId: newItem.colorId,
      colorSurchargePercentage: newItem.colorSurchargePercentage
        ? Number.parseFloat(newItem.colorSurchargePercentage)
        : null,
      colorHexCode: newItem.colorHexCode,
      colorName: newItem.colorName,
      createdAt: newItem.createdAt,
      updatedAt: newItem.updatedAt,
      unitPrice,
      modelName: model.name,
      glassTypeName: glassType.name,
      solutionName: undefined,
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logItemAddError(userId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Ocurrió un error inesperado al agregar el artículo.",
    });
  }
}

// ============================================================================
// UPDATE CART ITEM
// ============================================================================

/**
 * Update a cart item
 *
 * Currently supports updating name and quantity.
 * Recalculates price if quantity changes.
 *
 * @param db - Drizzle client instance
 * @param itemId - Cart item ID
 * @param data - Update data
 * @returns Updated cart item with relations
 * @throws TRPCError if item not found
 */
export async function updateCartItemById(
  client: DbClient,
  itemId: string,
  data: {
    name?: string;
    quantity?: number;
  }
) {
  try {
    logItemUpdateStart(itemId);

    // Note: If updating dimensions (heightMm, widthMm), price recalculation needed
    // Current implementation only supports name and quantity updates
    const updatedItem = await updateCartItem(client, itemId, data);

    if (!updatedItem) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "El artículo del carrito no fue encontrado.",
      });
    }

    // Fetch related data for response
    const model = await findModelById(client, updatedItem.modelId);
    const glassType = await findGlassTypeById(client, updatedItem.glassTypeId);

    logItemUpdateSuccess(itemId);

    const subtotalNum = Number.parseFloat(updatedItem.subtotal);
    const unitPrice = subtotalNum / updatedItem.quantity;

    return {
      id: updatedItem.id,
      quoteId: updatedItem.quoteId,
      modelId: updatedItem.modelId,
      glassTypeId: updatedItem.glassTypeId,
      name: updatedItem.name,
      quantity: updatedItem.quantity,
      roomLocation: updatedItem.roomLocation,
      widthMm: updatedItem.widthMm,
      heightMm: updatedItem.heightMm,
      accessoryApplied: updatedItem.accessoryApplied,
      subtotal: subtotalNum,
      colorId: updatedItem.colorId,
      colorSurchargePercentage: updatedItem.colorSurchargePercentage
        ? Number.parseFloat(updatedItem.colorSurchargePercentage)
        : null,
      colorHexCode: updatedItem.colorHexCode,
      colorName: updatedItem.colorName,
      createdAt: updatedItem.createdAt,
      updatedAt: updatedItem.updatedAt,
      unitPrice,
      modelName: model?.name ?? "Unknown Model",
      glassTypeName: glassType?.name ?? "Unknown Glass Type",
      solutionName: undefined,
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logItemUpdateError(itemId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Ocurrió un error inesperado al actualizar el artículo.",
    });
  }
}

// ============================================================================
// REMOVE ITEM FROM CART
// ============================================================================

/**
 * Remove an item from the cart
 *
 * @param db - Drizzle client instance
 * @param itemId - Cart item ID
 * @returns void on success
 * @throws TRPCError if deletion fails
 */
export async function removeItemFromCart(
  client: DbClient,
  itemId: string
): Promise<void> {
  try {
    logItemRemoveStart(itemId);

    const deletedItem = await deleteCartItem(client, itemId);

    if (!deletedItem) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "El artículo del carrito no fue encontrado.",
      });
    }

    logItemRemoveSuccess(itemId);
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logItemRemoveError(itemId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Ocurrió un error inesperado al eliminar el artículo.",
    });
  }
}

// ============================================================================
// CLEAR CART
// ============================================================================

/**
 * Clear all items from the user's cart
 *
 * @param db - Drizzle client instance
 * @param userId - User ID
 * @returns Number of deleted items
 * @throws TRPCError if operation fails
 */
export async function clearUserCart(
  client: DbClient,
  userId: string
): Promise<number> {
  try {
    logCartClearStart(userId);

    const cart = await findDraftCart(client, userId);

    if (!cart) {
      // No cart exists, nothing to clear
      logCartClearSuccess(userId, 0);
      return 0;
    }

    const deletedCount = await deleteAllCartItems(client, cart.id);

    logCartClearSuccess(userId, deletedCount);

    return deletedCount;
  } catch (error) {
    logCartClearError(userId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Ocurrió un error inesperado al limpiar el carrito.",
    });
  }
}

// ============================================================================
// GET CART ITEMS
// ============================================================================

/**
 * Get all items in the user's cart
 *
 * @param db - Drizzle client instance
 * @param userId - User ID (optional for public access)
 * @returns List of cart items with relations
 */
export async function getUserCartItems(
  client: DbClient,
  userId: string | undefined
) {
  if (!userId) {
    return [];
  }

  try {
    logCartFetchStart(userId);

    const cart = await findDraftCart(client, userId);

    if (!cart) {
      logCartFetchSuccess(userId, 0);
      return [];
    }

    const items = await listCartItems(client, cart.id);

    const serializedItems = items.map(serializeCartItemWithRelations);

    logCartFetchSuccess(userId, serializedItems.length);

    return serializedItems;
  } catch (error) {
    logCartFetchError(userId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Ocurrió un error inesperado al obtener el carrito.",
    });
  }
}
