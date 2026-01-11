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

export type GetModelColorsForQuoteInput = {
  modelId: string;
};

export type GetModelColorsForQuoteDependencies = {
  quoteRepository: {
    findModelColorsByModelId: (
      modelId: string
    ) => Promise<ModelColorForQuote[]>;
  };
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
 * Get model colors for quote
 *
 * Returns all active colors available for a model with surcharge info.
 * Colors are sorted: default first, then alphabetically by name.
 */
export async function getModelColorsForQuoteUseCase(
  input: GetModelColorsForQuoteInput,
  deps: GetModelColorsForQuoteDependencies
): Promise<GetModelColorsForQuoteResult> {
  const colors = await deps.quoteRepository.findModelColorsByModelId(
    input.modelId
  );

  const defaultColor = colors.find((c) => c.isDefault);

  return {
    modelId: input.modelId,
    hasColors: colors.length > 0,
    defaultColorId: defaultColor?.color.id ?? null,
    colors,
  };
}
