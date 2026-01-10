/**
 * ListUserQuotesUseCase - Use Case
 *
 * Orquesta el listado de cotizaciones de usuario:
 * 1. Aplicar filtros de rol (admin ve todo, usuario ve propias)
 * 2. Aplicar paginación y ordenamiento
 * 3. Transformar a formato de presentación
 *
 * Este use-case NO depende de Prisma directamente.
 * Usa repositories (ports) para acceso a datos.
 */

import type { QuoteStatus } from "@prisma/client";

/**
 * Input para listar quotes de usuario
 */
export type ListUserQuotesInput = {
  userId: string;
  userRole: "admin" | "seller" | "user";
  page: number;
  limit: number;
  sortBy: "createdAt" | "sentAt" | "validUntil" | "total";
  sortOrder: "asc" | "desc";
  status?: QuoteStatus;
  search?: string;
  includeExpired: boolean;
};

/**
 * Quote item en la lista
 */
export type QuoteListItem = {
  id: string;
  status: QuoteStatus;
  currency: string;
  total: number;
  createdAt: Date;
  sentAt: Date | null;
  validUntil: Date | null;
  isExpired: boolean;
  projectName: string;
  itemCount: number;
};

/**
 * Output del use-case (paginado)
 */
export type ListUserQuotesOutput = {
  quotes: QuoteListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

/**
 * Filtros internos para el repositorio
 */
export type QuoteListFilters = {
  userId?: string;
  status?: QuoteStatus;
  search?: string;
  includeExpired: boolean;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

/**
 * Quote del repositorio
 */
type QuoteFromRepo = {
  id: string;
  status: QuoteStatus;
  currency: string;
  total: number;
  createdAt: Date;
  sentAt: Date | null;
  validUntil: Date | null;
  projectName: string | null;
  itemCount: number;
};

/**
 * Dependencies (ports) que necesita el use-case
 */
export type ListUserQuotesDeps = {
  // Repository
  listQuotes: (
    filters: QuoteListFilters
  ) => Promise<{ quotes: QuoteFromRepo[]; total: number }>;
};

/**
 * ListUserQuotesUseCase
 *
 * Esta función NO tiene efectos secundarios directos.
 * Todas las operaciones de I/O se pasan como dependencies.
 */
export async function listUserQuotesUseCase(
  input: ListUserQuotesInput,
  deps: ListUserQuotesDeps
): Promise<ListUserQuotesOutput> {
  // 1. Aplicar filtro de rol (admin ve todo, otros ven solo propias)
  const userIdFilter = input.userRole === "admin" ? undefined : input.userId;

  // 2. Construir filtros para repositorio
  const filters: QuoteListFilters = {
    userId: userIdFilter,
    status: input.status,
    search: input.search,
    includeExpired: input.includeExpired,
    page: input.page,
    limit: input.limit,
    sortBy: input.sortBy,
    sortOrder: input.sortOrder,
  };

  // 3. Ejecutar query
  const { quotes, total } = await deps.listQuotes(filters);

  // 4. Calcular paginación
  const totalPages = Math.ceil(total / input.limit);
  const hasNextPage = input.page < totalPages;
  const hasPreviousPage = input.page > 1;

  // 5. Transformar quotes
  const transformedQuotes: QuoteListItem[] = quotes.map((quote) => ({
    id: quote.id,
    status: quote.status,
    currency: quote.currency,
    total: quote.total,
    createdAt: quote.createdAt,
    sentAt: quote.sentAt,
    validUntil: quote.validUntil,
    isExpired: quote.validUntil ? quote.validUntil < new Date() : false,
    projectName: quote.projectName ?? "Sin nombre",
    itemCount: quote.itemCount,
  }));

  return {
    quotes: transformedQuotes,
    total,
    page: input.page,
    limit: input.limit,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}
