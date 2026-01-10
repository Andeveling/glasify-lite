/**
 * Use Case: Get Model Colors for Quote
 *
 * Returns all active colors available for a specific model,
 * including surcharge information and default color flag.
 *
 * Business Rules:
 * - Only active colors are returned
 * - Colors are sorted: default first, then alphabetically
 * - Returns surcharge percentage for each color
 * - Identifies default color for the model
 */

import type { QuoteRepository } from "../repositories/quote.repository";

export type GetModelColorsForQuoteInput = {
  modelId: string;
};

export type GetModelColorsForQuoteDependencies = {
  quoteRepository: QuoteRepository;
};

export type ModelColorForQuote = {
  id: string;
  isDefault: boolean;
  surchargePercentage: number;
  color: {
    id: string;
    name: string;
    hexCode: string;
    ralCode: string | null;
  };
};

export type GetModelColorsForQuoteResult = {
  modelId: string;
  hasColors: boolean;
  defaultColorId: string | null;
  colors: ModelColorForQuote[];
};

/**
 * Get model colors for quote (placeholder implementation)
 *
 * TODO Phase D:
 * - Extend QuoteRepository with findModelColorsByModelId method
 * - Implement color filtering and sorting logic
 * - Return properly formatted color data
 */
export function getModelColorsForQuoteUseCase(
  _input: GetModelColorsForQuoteInput,
  _deps: GetModelColorsForQuoteDependencies
): Promise<GetModelColorsForQuoteResult> {
  throw new Error(
    "getModelColorsForQuoteUseCase: En desarrollo (Phase D) - extender QuoteRepository primero"
  );
}
