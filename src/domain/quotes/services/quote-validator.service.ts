/**
 * QuoteValidatorService
 *
 * Servicio de dominio que encapsula las reglas de validación para Quotes y QuoteItems.
 * NO depende de Prisma ni de ninguna implementación específica de persistencia.
 */

import type { Model, QuoteStatus } from "@prisma/generated/client"
import { parseCompatibleGlassTypeIds } from "@/lib/utils/compatible-glass-types"

export class ValidationError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = "ValidationError"
    this.code = code
  }
}

export function validateGlassTypeCompatibility(model: Model, glassTypeId: string): void {
  // Parse JSON string to array before checking compatibility
  const compatibleGlassTypeIds = parseCompatibleGlassTypeIds(model.compatibleGlassTypeIds)
  if (!compatibleGlassTypeIds.includes(glassTypeId)) {
    throw new ValidationError(
      `Tipo de vidrio no compatible con el modelo ${model.name}`,
      "INCOMPATIBLE_GLASS_TYPE",
    )
  }
}

export function validateDimensions(
  model: Model,
  dimensions: { widthMm: number; heightMm: number },
): void {
  const { widthMm, heightMm } = dimensions

  if (widthMm < model.minWidthMm || widthMm > model.maxWidthMm) {
    throw new ValidationError(
      `Ancho debe estar entre ${model.minWidthMm}mm y ${model.maxWidthMm}mm. Recibido: ${widthMm}mm`,
      "INVALID_WIDTH",
    )
  }

  if (heightMm < model.minHeightMm || heightMm > model.maxHeightMm) {
    throw new ValidationError(
      `Alto debe estar entre ${model.minHeightMm}mm y ${model.maxHeightMm}mm. Recibido: ${heightMm}mm`,
      "INVALID_HEIGHT",
    )
  }
}

export function validateQuoteStatus(status: QuoteStatus, operation: string): void {
  if (status !== "draft") {
    throw new ValidationError(
      `No se puede ${operation} en una cotización con estado "${status}". Solo se permiten modificaciones en estado "draft".`,
      "INVALID_QUOTE_STATUS",
    )
  }
}

export function validateModelAvailability(model: Model | null): asserts model is Model {
  if (!model) {
    throw new ValidationError("Modelo no encontrado", "MODEL_NOT_FOUND")
  }

  if (model.status !== "published") {
    throw new ValidationError(
      `Modelo "${model.name}" no está disponible (estado: ${model.status})`,
      "MODEL_NOT_AVAILABLE",
    )
  }
}

export function validateQuantity(quantity: number): void {
  if (quantity <= 0) {
    throw new ValidationError(
      `La cantidad debe ser mayor a 0. Recibido: ${quantity}`,
      "INVALID_QUANTITY",
    )
  }

  if (!Number.isInteger(quantity)) {
    throw new ValidationError(
      `La cantidad debe ser un número entero. Recibido: ${quantity}`,
      "INVALID_QUANTITY",
    )
  }
}

const MIN_COLOR_SURCHARGE = 0
const MAX_COLOR_SURCHARGE = 100

export function validateColorSurcharge(percentage: number | undefined): void {
  if (percentage === undefined) {
    return
  }

  if (percentage < MIN_COLOR_SURCHARGE || percentage > MAX_COLOR_SURCHARGE) {
    throw new ValidationError(
      `El recargo por color debe estar entre ${MIN_COLOR_SURCHARGE}% y ${MAX_COLOR_SURCHARGE}%. Recibido: ${percentage}%`,
      "INVALID_COLOR_SURCHARGE",
    )
  }
}
