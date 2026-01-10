/**
 * AddItemToQuote Use Case
 *
 * Orquesta el proceso de agregar un ítem a una cotización:
 * 1. Validar modelo y dimensiones
 * 2. Obtener o crear quote
 * 3. Calcular precio del ítem
 * 4. Crear QuoteItem
 * 5. Actualizar total de Quote
 *
 * Este use-case NO depende de Prisma directamente.
 * Usa repositories (ports) para acceso a datos.
 */

import type {
  Model,
  GlassType,
  Service,
  Quote,
  QuoteItem,
} from "@prisma/client";
import {
  validateDimensions,
  validateGlassTypeCompatibility,
  validateModelAvailability,
  validateQuoteStatus,
} from "../services/quote-validator.service";

/**
 * Input para agregar un ítem a una quote
 */
export type AddItemToQuoteInput = {
  quoteId?: string;
  modelId: string;
  glassTypeId: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  roomLocation?: string;
  services: Array<{
    serviceId: string;
    quantity?: number;
  }>;
  adjustments: Array<{
    concept: string;
    sign: "positive" | "negative";
    unit: "unit" | "sqm" | "ml";
    value: number;
  }>;
  colorSurchargePercentage?: number;
};

/**
 * Output del use-case
 */
export type AddItemToQuoteOutput = {
  quote: Quote;
  item: QuoteItem;
  calculation: {
    subtotal: number;
    profilePrice: number;
    glassPrice: number;
    accPrice: number;
    servicesTotal: number;
  };
};

/**
 * Dependencies (ports) que necesita el use-case
 */
export type AddItemToQuoteDeps = {
  // Repositories
  findModel: (id: string) => Promise<Model | null>;
  findGlassType: (id: string) => Promise<GlassType | null>;
  findServices: (ids: string[]) => Promise<Service[]>;
  findQuote: (id: string) => Promise<Quote | null>;
  createQuote: (input: {
    currency: string;
    validUntil: Date;
  }) => Promise<Quote>;
  createQuoteItem: (input: {
    quoteId: string;
    modelId: string;
    glassTypeId: string;
    widthMm: number;
    heightMm: number;
    quantity: number;
    subtotal: number;
    roomLocation?: string;
  }) => Promise<QuoteItem>;
  updateQuoteTotal: (quoteId: string, total: number) => Promise<Quote>;
  listQuoteItems: (quoteId: string) => Promise<QuoteItem[]>;

  // Config
  getTenantCurrency: () => Promise<string>;
  getQuoteValidityDays: () => Promise<number>;

  // Domain services
  calculatePrice: (input: {
    widthMm: number;
    heightMm: number;
    model: Model;
    glassType: GlassType;
    services: Service[];
    adjustments: AddItemToQuoteInput["adjustments"];
    colorSurchargePercentage?: number;
  }) => {
    subtotal: number;
    profilePrice: number;
    glassPrice: number;
    accPrice: number;
    servicesTotal: number;
  };
};

/**
 * AddItemToQuote Use Case
 *
 * Esta función NO tiene efectos secundarios directos.
 * Todas las operaciones de I/O se pasan como dependencies.
 * Esto la hace 100% testeable sin mocks complejos.
 */
export async function addItemToQuote(
  input: AddItemToQuoteInput,
  deps: AddItemToQuoteDeps
): Promise<AddItemToQuoteOutput> {
  // 1. Fetch y validar modelo
  const model = await deps.findModel(input.modelId);
  validateModelAvailability(model);
  validateGlassTypeCompatibility(model, input.glassTypeId);
  validateDimensions(model, {
    widthMm: input.widthMm,
    heightMm: input.heightMm,
  });

  // 2. Fetch glass type
  const glassType = await deps.findGlassType(input.glassTypeId);
  if (!glassType) {
    throw new Error("Tipo de vidrio no encontrado");
  }

  // 3. Get or create quote
  let quote: Quote;
  if (input.quoteId) {
    const existingQuote = await deps.findQuote(input.quoteId);
    if (!existingQuote) {
      throw new Error("Cotización no encontrada");
    }
    validateQuoteStatus(existingQuote.status, "agregar ítems");
    quote = existingQuote;
  } else {
    const currency = await deps.getTenantCurrency();
    const validityDays = await deps.getQuoteValidityDays();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    quote = await deps.createQuote({ currency, validUntil });
  }

  // 4. Fetch services (si hay)
  const services =
    input.services.length > 0
      ? await deps.findServices(input.services.map((s) => s.serviceId))
      : [];

  // 5. Calcular precio
  const calculation = deps.calculatePrice({
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    model,
    glassType,
    services,
    adjustments: input.adjustments,
    colorSurchargePercentage: input.colorSurchargePercentage,
  });

  // 6. Crear QuoteItem
  const quoteItem = await deps.createQuoteItem({
    quoteId: quote.id,
    modelId: input.modelId,
    glassTypeId: input.glassTypeId,
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    quantity: input.quantity,
    subtotal: calculation.subtotal,
    roomLocation: input.roomLocation,
  });

  // 7. Actualizar total de quote
  const quoteItems = await deps.listQuoteItems(quote.id);
  const newTotal = quoteItems.reduce(
    (acc, item) => acc + Number(item.subtotal),
    0
  );
  const updatedQuote = await deps.updateQuoteTotal(quote.id, newTotal);

  return {
    quote: updatedQuote,
    item: quoteItem,
    calculation,
  };
}
