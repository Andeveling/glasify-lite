/**
 * SendQuoteToVendorUseCase - Use Case
 *
 * Orquesta el envío de una cotización al vendedor:
 * 1. Validar que la quote existe y pertenece al usuario
 * 2. Validar que está en estado 'draft'
 * 3. Validar que tiene al menos un ítem
 * 4. Cambiar estado a 'sent' y registrar timestamp
 *
 * Este use-case NO depende de Prisma directamente.
 * Usa repositories (ports) para acceso a datos.
 */

import type { Quote, QuoteStatus } from "@prisma/client";
import { validateQuoteStatus } from "../services/quote-validator.service";

/**
 * Input para enviar quote al vendedor
 */
export type SendQuoteToVendorInput = {
  quoteId: string;
  userId: string;
  contactPhone: string;
  contactEmail?: string;
};

/**
 * Output del use-case
 */
export type SendQuoteToVendorOutput = {
  id: string;
  status: "sent";
  sentAt: Date;
  contactPhone: string;
  contactEmail?: string;
  total: number;
  currency: string;
};

/**
 * Quote con item count (del repositorio)
 */
type QuoteWithItemCount = Quote & {
  itemCount: number;
};

/**
 * Dependencies (ports) que necesita el use-case
 */
export type SendQuoteToVendorDeps = {
  // Repository
  findQuoteWithItemCount: (id: string) => Promise<QuoteWithItemCount | null>;
  updateQuoteToSent: (
    id: string,
    contactPhone: string,
    sentAt: Date
  ) => Promise<{
    id: string;
    status: QuoteStatus;
    sentAt: Date | null;
    contactPhone: string | null;
    total: number;
    currency: string;
  }>;
};

/**
 * Errores de negocio
 */
export class QuoteNotFoundError extends Error {
  code = "NOT_FOUND" as const;

  constructor() {
    super("Cotización no encontrada.");
    this.name = "QuoteNotFoundError";
  }
}

export class QuoteUnauthorizedError extends Error {
  code = "FORBIDDEN" as const;

  constructor() {
    super("No tienes permiso para enviar esta cotización.");
    this.name = "QuoteUnauthorizedError";
  }
}

export class QuoteAlreadySentError extends Error {
  code = "BAD_REQUEST" as const;
  sentAt: Date | null;

  constructor(sentAt: Date | null) {
    const dateStr = sentAt?.toLocaleDateString("es-CO") ?? "anteriormente";
    super(`Esta cotización ya fue enviada el ${dateStr}.`);
    this.name = "QuoteAlreadySentError";
    this.sentAt = sentAt;
  }
}

export class QuoteEmptyError extends Error {
  code = "BAD_REQUEST" as const;

  constructor() {
    super("No puedes enviar una cotización vacía. Agrega al menos un producto.");
    this.name = "QuoteEmptyError";
  }
}

/**
 * SendQuoteToVendorUseCase
 *
 * Esta función NO tiene efectos secundarios directos.
 * Todas las operaciones de I/O se pasan como dependencies.
 */
export async function sendQuoteToVendorUseCase(
  input: SendQuoteToVendorInput,
  deps: SendQuoteToVendorDeps
): Promise<SendQuoteToVendorOutput> {
  // 1. Fetch quote con item count
  const quote = await deps.findQuoteWithItemCount(input.quoteId);

  // 2. Validar que existe
  if (!quote) {
    throw new QuoteNotFoundError();
  }

  // 3. Validar ownership
  if (quote.userId !== input.userId) {
    throw new QuoteUnauthorizedError();
  }

  // 4. Validar estado (debe ser 'draft')
  try {
    validateQuoteStatus(quote.status, "enviar");
  } catch {
    throw new QuoteAlreadySentError(quote.sentAt);
  }

  // 5. Validar que tiene items
  if (quote.itemCount === 0) {
    throw new QuoteEmptyError();
  }

  // 6. Ejecutar update
  const now = new Date();
  const updatedQuote = await deps.updateQuoteToSent(
    input.quoteId,
    input.contactPhone,
    now
  );

  return {
    id: updatedQuote.id,
    status: "sent",
    sentAt: updatedQuote.sentAt ?? now,
    contactPhone: updatedQuote.contactPhone ?? input.contactPhone,
    contactEmail: input.contactEmail,
    total: updatedQuote.total,
    currency: updatedQuote.currency,
  };
}

