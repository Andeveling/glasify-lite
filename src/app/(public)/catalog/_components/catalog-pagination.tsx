'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

type CatalogPaginationProps = {
  currentPage: number;
  totalPages: number;
};

/**
 * CatalogPagination - Client Component
 * Issue: #002-ui-ux-requirements
 *
 * Handles pagination navigation.
 * Uses Link for better SEO and navigation.
 */
export function CatalogPagination({ currentPage, totalPages }: CatalogPaginationProps) {
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label="Paginación del catálogo" className="mt-8 flex items-center justify-center gap-2">
      {/* Previous button */}
      <Button asChild disabled={!hasPrevious} size="sm" variant="outline">
        <Link aria-label="Página anterior" href={createPageUrl(currentPage - 1)} scroll={false}>
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1">Anterior</span>
        </Link>
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => {
            // Show first page, last page, current page, and 1 page on each side
            return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
          })
          .map((page, index, array) => {
            const prevPage = array[index - 1];
            const showEllipsis = index > 0 && prevPage !== undefined && page - prevPage > 1;

            return (
              <div className="flex items-center" key={page}>
                {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
                <Button
                  aria-current={page === currentPage ? 'page' : undefined}
                  asChild
                  size="sm"
                  variant={page === currentPage ? 'default' : 'outline'}
                >
                  <Link aria-label={`Ir a página ${page}`} href={createPageUrl(page)} scroll={false}>
                    {page}
                  </Link>
                </Button>
              </div>
            );
          })}
      </div>

      {/* Next button */}
      <Button asChild disabled={!hasNext} size="sm" variant="outline">
        <Link aria-label="Página siguiente" href={createPageUrl(currentPage + 1)} scroll={false}>
          <span className="mr-1">Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}
