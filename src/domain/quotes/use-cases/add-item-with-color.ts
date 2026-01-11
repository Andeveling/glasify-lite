/**
 * Use Case: Add Item to Quote with Color Support
 *
 * Este use-case integra:
 * 1. Validación de modelo y compatibilidad
 * 2. Gestión de quote (crear o validar existente)
 * 3. Cálculo de precio base (reutiliza calculateItemPriceUseCase)
 * 4. Cálculo de surcharge por color
 * 5. Persistencia de quote item con color snapshot
 *
 * NOTA: Este archivo está en desarrollo activo (Phase D).
 * Requiere extender QuoteRepository con métodos para:
 * - findModelById, createQuote, findGlassTypeById
 * - findServicesByIds, createQuoteItem, createQuoteItemService
 * - findModelColorByIds, createAdjustment, updateQuoteTotal
 */

import type { QuoteRepository } from "../repositories/quote.repository";

export type AddItemWithColorInput = {
  quoteId?: string;
  modelId: string;
  glassTypeId: string;
  widthMm: number;
  heightMm: number;
  colorId?: string;
  roomLocation?: string;
  services: Array<{
    serviceId: string;
    quantity?: number;
  }>;
  adjustments: Array<{
    concept: string;
    unit: "unit" | "percentage" | "sqm" | "ml";
    value: number;
    sign: "positive" | "negative";
  }>;
};

export type AddItemWithColorDependencies = {
  quoteRepository: QuoteRepository;
};

export type AddItemWithColorResult = {
  itemId: string;
  quoteId: string;
  subtotal: number;
};

/**
 * Add item to quote (placeholder implementation)
 *
 * TODO Phase D:
 * - Implementar validaciones de modelo y dimensiones
 * - Integrar calculateItemPriceUseCase para cálculo base
 * - Manejar color snapshot y surcharge
 * - Persistir quote item con servicios y adjustments
 */
export function addItemWithColorUseCase(
  _input: AddItemWithColorInput,
  _deps: AddItemWithColorDependencies
): Promise<AddItemWithColorResult> {
  throw new Error(
    "addItemWithColorUseCase: En desarrollo (Phase D) - extender QuoteRepository primero"
  );
}
