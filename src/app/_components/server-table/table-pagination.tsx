/**
 * TablePagination Component
 *
 * Pagination controls molecule for server-optimized tables.
 * Manages page state via URL parameters for deep linking support.
 *
 * Features:
 * - Next/Previous navigation with disabled states
 * - Page number display with total pages
 * - Jump to first/last page (optional)
 * - URL-based page state (page param)
 * - Accessible (ARIA labels, keyboard navigation)
 * - Responsive design
 *
 * Usage:
 * ```tsx
 * <TablePagination
 *   currentPage={1}
 *   totalPages={10}
 *   totalItems={200}
 * />
 * ```
 *
 * @see REQ-001: Server-side pagination via URL params
 */

"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServerParams } from "@/hooks/use-server-params";

export interface TablePaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number;

  /** Total number of pages */
  totalPages: number;

  /** Total number of items (for display) */
  totalItems: number;

  /** Show first/last page buttons */
  showFirstLast?: boolean;

  /** Show item count */
  showItemCount?: boolean;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  showFirstLast = true,
  showItemCount = true,
}: TablePaginationProps) {
  const { updateParam } = useServerParams();

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  /**
   * Navigate to specific page
   */
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    updateParam("page", page);
  };

  return (
    <div className="flex w-full items-center justify-between">
      {/* Item count */}
      {showItemCount && (
        <div className="text-muted-foreground text-sm">
          Total:{" "}
          <span className="font-medium text-foreground">{totalItems}</span> item
          {totalItems !== 1 ? "s" : ""}
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page button */}
        {showFirstLast && (
          <Button
            aria-label="Primera página"
            disabled={!hasPrevious}
            onClick={() => goToPage(1)}
            size="sm"
            variant="outline"
          >
            <ChevronsLeft className="size-4" />
          </Button>
        )}

        {/* Previous page button */}
        <Button
          aria-label="Página anterior"
          disabled={!hasPrevious}
          onClick={() => goToPage(currentPage - 1)}
          size="sm"
          variant="outline"
        >
          <ChevronLeft className="mr-1 size-4" />
          Anterior
        </Button>

        {/* Page indicator */}
        <div className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">Página</span>
          <span className="font-medium">
            {currentPage} de {totalPages}
          </span>
        </div>

        {/* Next page button */}
        <Button
          aria-label="Página siguiente"
          disabled={!hasNext}
          onClick={() => goToPage(currentPage + 1)}
          size="sm"
          variant="outline"
        >
          Siguiente
          <ChevronRight className="ml-1 size-4" />
        </Button>

        {/* Last page button */}
        {showFirstLast && (
          <Button
            aria-label="Última página"
            disabled={!hasNext}
            onClick={() => goToPage(totalPages)}
            size="sm"
            variant="outline"
          >
            <ChevronsRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
