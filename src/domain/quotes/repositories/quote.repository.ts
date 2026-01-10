/**
 * QuoteRepository - Port (Interface)
 *
 * Define las operaciones de persistencia para Quote y QuoteItem.
 * Sigue el principio de Dependency Inversion (SOLID):
 * - El dominio NO depende de Prisma
 * - El dominio define QUÉ necesita (port)
 * - La infraestructura implementa CÓMO (adapter)
 */

import type { Quote, QuoteItem, QuoteStatus } from "@prisma/client";

/**
 * Filters para listar quotes
 */
export type QuoteListFilters = {
  userId?: string;
  status?: QuoteStatus;
  search?: string;
  tenantId?: string;
  cursor?: string;
  limit?: number;
};

/**
 * Resultado paginado
 */
export type PaginatedQuotes = {
  quotes: Quote[];
  totalCount: number;
  nextCursor?: string;
};

/**
 * Input para crear Quote
 */
export type CreateQuoteInput = {
  currency: string;
  status: QuoteStatus;
  validUntil: Date;
  userId?: string;
};

/**
 * Input para crear QuoteItem
 */
export type CreateQuoteItemInput = {
  quoteId: string;
  modelId: string;
  glassTypeId: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  unit: "unit" | "sqm" | "ml";
  subtotal: number;
  roomLocation?: string | null;
  imageUrl?: string | null;
  modelColorId?: string | null;
};

/**
 * QuoteRepository - Port (Interface)
 *
 * IMPORTANTE: Esta interface NO debe tener dependencias a Prisma.
 * Solo tipos primitivos y tipos de dominio.
 */
export type QuoteRepository = {
  /**
   * Encuentra una quote por ID
   */
  findById(id: string): Promise<Quote | null>;

  /**
   * Encuentra una quote por ID con sus items
   */
  findByIdWithItems(id: string): Promise<
    | (Quote & {
        items: QuoteItem[];
      })
    | null
  >;

  /**
   * Crea una nueva quote
   */
  create(input: CreateQuoteInput): Promise<Quote>;

  /**
   * Actualiza el total de una quote
   */
  updateTotal(id: string, total: number): Promise<Quote>;

  /**
   * Actualiza el status de una quote
   */
  updateStatus(id: string, status: QuoteStatus): Promise<Quote>;

  /**
   * Lista quotes con filtros
   */
  list(filters: QuoteListFilters): Promise<PaginatedQuotes>;

  /**
   * Cuenta quotes con filtros
   */
  count(filters: Omit<QuoteListFilters, "cursor" | "limit">): Promise<number>;

  /**
   * Crea un QuoteItem
   */
  createItem(input: CreateQuoteItemInput): Promise<QuoteItem>;

  /**
   * Lista items de una quote
   */
  listItems(quoteId: string): Promise<QuoteItem[]>;

  /**
   * Elimina un item de una quote
   */
  deleteItem(itemId: string): Promise<void>;
};
