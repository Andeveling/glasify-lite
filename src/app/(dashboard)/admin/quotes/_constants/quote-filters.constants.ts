import type { QuoteStatus } from "@/lib/types/prisma-types";

/**
 * Filter options for quote status
 */
export const FILTER_OPTIONS: Array<{
  value: QuoteStatus | "all";
  label: string;
}> = [
  { value: "all", label: "Todos los Estados" },
  { value: "draft", label: "Borradores" },
  { value: "sent", label: "Enviadas" },
  { value: "canceled", label: "Canceladas" },
];

/**
 * Default pagination limit
 */
export const DEFAULT_PAGE_LIMIT = 10;

/**
 * Maximum pagination limit
 */
export const MAX_PAGE_LIMIT = 100;

/**
 * Sort options for quotes list
 */
export const SORT_OPTIONS = [
  {
    value: "createdAt-desc",
    label: "Más Recientes",
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
  },
  {
    value: "createdAt-asc",
    label: "Más Antiguas",
    sortBy: "createdAt" as const,
    sortOrder: "asc" as const,
  },
  {
    value: "total-desc",
    label: "Mayor Monto",
    sortBy: "total" as const,
    sortOrder: "desc" as const,
  },
  {
    value: "total-asc",
    label: "Menor Monto",
    sortBy: "total" as const,
    sortOrder: "asc" as const,
  },
  {
    value: "validUntil-asc",
    label: "Próximas a Vencer",
    sortBy: "validUntil" as const,
    sortOrder: "asc" as const,
  },
  {
    value: "validUntil-desc",
    label: "Lejanas a Vencer",
    sortBy: "validUntil" as const,
    sortOrder: "desc" as const,
  },
] as const;
