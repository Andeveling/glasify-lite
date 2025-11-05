"use client";

import { usePagination } from "@views/catalog/_hooks/use-catalog";
import { shouldShowEllipsis } from "@views/catalog/_utils/catalog.utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type CatalogPaginationProps = {
  currentPage: number;
  totalPages: number;
};

/**
 * CatalogPagination - Presentational Component
 * Issue: #002-ui-ux-requirements
 *
 * Clean pagination UI with SEO-friendly links.
 *
 * Responsibilities (Single Responsibility Principle):
 * - Render pagination UI
 * - Delegate URL generation to usePagination hook
 * - Delegate ellipsis logic to utility function
 *
 * Benefits:
 * - Pure presentation logic
 * - Easy to test
 * - Business logic separated to hook
 */
export function CatalogPagination({
  currentPage,
  totalPages,
}: CatalogPaginationProps) {
  const { createPageUrl, getVisiblePages, hasPrevious, hasNext } =
    usePagination(currentPage, totalPages);
  const visiblePages = getVisiblePages();

  return (
    <nav
      aria-label="Paginación del catálogo"
      className="mt-8 flex items-center justify-center gap-2"
    >
      {/* Previous button */}
      <Button asChild disabled={!hasPrevious} size="sm" variant="outline">
        <Link
          aria-label="Página anterior"
          href={createPageUrl(currentPage - 1)}
          scroll={false}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1">Anterior</span>
        </Link>
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index, array) => {
          const prevPage = array[index - 1];
          const showEllipsis = shouldShowEllipsis(page, prevPage);

          return (
            <div className="flex items-center" key={page}>
              {showEllipsis && (
                <span className="px-2 text-muted-foreground">...</span>
              )}
              <Button
                aria-current={page === currentPage ? "page" : undefined}
                asChild
                size="sm"
                variant={page === currentPage ? "default" : "outline"}
              >
                <Link
                  aria-label={`Ir a página ${page}`}
                  href={createPageUrl(page)}
                  scroll={false}
                >
                  {page}
                </Link>
              </Button>
            </div>
          );
        })}
      </div>

      {/* Next button */}
      <Button asChild disabled={!hasNext} size="sm" variant="outline">
        <Link
          aria-label="Página siguiente"
          href={createPageUrl(currentPage + 1)}
          scroll={false}
        >
          <span className="mr-1">Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}
