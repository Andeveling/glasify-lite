/**
 * Cart Utilities
 *
 * Helper functions for cart operations:
 * - Price calculation
 * - Decimal serialization
 * - Data transformation
 *
 * @module server/api/routers/cart/cart.utils
 */

/**
 * Calculate the subtotal for a cart item
 *
 * Formula: (basePrice + (costPerMmHeight * height) + (costPerMmWidth * width)) * quantity
 *
 * @param params - Calculation parameters
 * @returns Subtotal as number
 */
export function calculateItemSubtotal(params: {
  basePrice: string;
  costPerMmHeight: string;
  costPerMmWidth: string;
  heightMm: number;
  widthMm: number;
  quantity: number;
}): number {
  const {
    basePrice,
    costPerMmHeight,
    costPerMmWidth,
    heightMm,
    widthMm,
    quantity,
  } = params;

  const base = Number.parseFloat(basePrice);
  const heightCost = Number.parseFloat(costPerMmHeight) * heightMm;
  const widthCost = Number.parseFloat(costPerMmWidth) * widthMm;

  const unitPrice = base + heightCost + widthCost;
  const subtotal = unitPrice * quantity;

  return subtotal;
}

/**
 * Calculate unit price from subtotal
 *
 * @param subtotal - Subtotal as string or number
 * @param quantity - Quantity
 * @returns Unit price as number
 */
export function calculateUnitPrice(
  subtotal: string | number,
  quantity: number
): number {
  const total =
    typeof subtotal === "string" ? Number.parseFloat(subtotal) : subtotal;
  return total / quantity;
}

/**
 * Serialize cart item decimal fields
 *
 * Converts Drizzle string-based decimals to numbers for JSON transmission
 *
 * @param item - Cart item with string decimals
 * @returns Cart item with number decimals
 */
export function serializeCartItem<
  T extends { subtotal: string; quantity: number },
>(item: T) {
  const subtotalNum = Number.parseFloat(item.subtotal);
  const unitPrice = calculateUnitPrice(subtotalNum, item.quantity);

  return {
    ...item,
    subtotal: subtotalNum,
    unitPrice,
  };
}

/**
 * Serialize cart item with related data
 *
 * @param item - Cart item from repository (with joins)
 * @returns Formatted cart item for API response
 */
export function serializeCartItemWithRelations(item: {
  id: string;
  quoteId: string;
  modelId: string;
  glassTypeId: string;
  colorId: string | null;
  heightMm: number;
  widthMm: number;
  quantity: number;
  name: string;
  roomLocation: string | null;
  accessoryApplied: boolean;
  subtotal: string;
  colorSurchargePercentage: string | null;
  colorHexCode: string | null;
  colorName: string | null;
  createdAt: Date;
  updatedAt: Date;
  modelName: string | null;
  modelImageUrl: string | null;
  glassTypeName: string | null;
  glassTypeCode: string | null;
}) {
  const subtotalNum = Number.parseFloat(item.subtotal);
  const unitPrice = calculateUnitPrice(subtotalNum, item.quantity);

  return {
    id: item.id,
    quoteId: item.quoteId,
    modelId: item.modelId,
    glassTypeId: item.glassTypeId,
    name: item.name,
    quantity: item.quantity,
    roomLocation: item.roomLocation,
    widthMm: item.widthMm,
    heightMm: item.heightMm,
    accessoryApplied: item.accessoryApplied,
    subtotal: subtotalNum,
    colorId: item.colorId,
    colorSurchargePercentage: item.colorSurchargePercentage
      ? Number.parseFloat(item.colorSurchargePercentage)
      : null,
    colorHexCode: item.colorHexCode,
    colorName: item.colorName,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    unitPrice,
    modelName: item.modelName ?? "Unknown Model",
    glassTypeName: item.glassTypeName ?? "Unknown Glass Type",
    solutionName: undefined, // Legacy field, not used
  };
}
