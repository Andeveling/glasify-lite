/**
 * Cart Item Mapper
 * Pure utility for mapping form data to cart item structure
 */

import type {
  GlassTypeOutput,
  ModelDetailOutput,
} from "@/server/api/routers/catalog";
import type { CreateCartItemInput } from "@/types/cart.types";

export type CartItemInputWithPrice = CreateCartItemInput & {
  unitPrice: number;
};

type InferredSolution = {
  id: string;
  nameEs: string;
} | null;

type PrepareCartItemParams = {
  additionalServiceIds: string[];
  calculatedPrice: number | undefined;
  colorId: string | undefined;
  glassTypeId: string;
  heightMm: number;
  inferredSolution: InferredSolution;
  model: ModelDetailOutput;
  quantity: number;
  selectedGlassType: GlassTypeOutput | undefined;
  widthMm: number;
};

/**
 * Prepare cart item data from form values
 *
 * @param params - Form data and calculation results
 * @returns Cart item input ready for submission
 *
 * @example
 * prepareCartItemInput({
 *   model: { id: "m1", name: "Ventana", basePrice: 1000 },
 *   widthMm: 1000,
 *   heightMm: 2000,
 *   quantity: 2,
 *   glassTypeId: "gt1",
 *   selectedGlassType: { name: "Templado" },
 *   inferredSolution: { id: "s1", nameEs: "Estándar" },
 *   calculatedPrice: 1500,
 *   colorId: "c1",
 *   additionalServiceIds: ["svc1", "svc2"]
 * })
 */
export function prepareCartItemInput({
  additionalServiceIds,
  calculatedPrice,
  colorId,
  glassTypeId,
  heightMm,
  inferredSolution,
  model,
  quantity,
  selectedGlassType,
  widthMm,
}: PrepareCartItemParams): CartItemInputWithPrice {
  return {
    additionalServiceIds,
    colorId,
    glassTypeId,
    glassTypeName: selectedGlassType?.name ?? "",
    heightMm,
    modelId: model.id,
    modelName: model.name,
    quantity,
    solutionId: inferredSolution?.id || undefined,
    solutionName: inferredSolution?.nameEs || undefined,
    unitPrice: calculatedPrice ?? model.basePrice,
    widthMm,
  };
}
