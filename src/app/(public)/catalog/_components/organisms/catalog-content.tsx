import { CatalogEmpty } from '@views/catalog/_components/organisms/catalog-empty';
import { CatalogError } from '@views/catalog/_components/organisms/catalog-error';
import { CatalogGrid } from '@views/catalog/_components/organisms/catalog-grid';
import { CatalogPagination } from '@views/catalog/_components/organisms/catalog-pagination';
import { calculateTotalPages } from '@views/catalog/_utils/catalog.utils';
import { api } from '@/trpc/server-client';

type CatalogContentProps = {
  manufacturerId?: string;
  page: number;
  searchQuery?: string;
  sort?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
};

const ITEMS_PER_PAGE = 20;

/**
 * CatalogContent - Server Component
 * Issue: #002-ui-ux-requirements
 *
 * Fetches and renders catalog models server-side.
 *
 * Responsibilities (Single Responsibility Principle):
 * - Fetch data from API
 * - Handle loading/error states
 * - Compose presentation components
 * - Delegate pagination calculation to utility
 *
 * Benefits:
 * - Server-side rendering (better SEO)
 * - ISR caching (better performance)
 * - Clean separation of concerns
 * - Easy to test (mock API)
 */
export async function CatalogContent({ manufacturerId, page, searchQuery, sort = 'name-asc' }: CatalogContentProps) {
  try {
    // Fetch models on the server - this is cached and revalidated
    const data = await api.catalog[ 'list-models' ]({
      limit: ITEMS_PER_PAGE,
      manufacturerId,
      page,
      search: searchQuery,
      sort,
    });

    const hasActiveFilters = Boolean(searchQuery || manufacturerId);
    const { items: models, total } = data;
    const totalPages = calculateTotalPages(total, ITEMS_PER_PAGE);

    // Empty state
    if (models.length === 0) {
      return <CatalogEmpty hasActiveFilters={hasActiveFilters} />;
    }

    // Render models grid
    return (
      <main>
        <CatalogGrid models={models} />
        {totalPages > 1 && <CatalogPagination currentPage={page} totalPages={totalPages} />}
      </main>
    );
  } catch (_error) {
    // Error state
    return <CatalogError />;
  }
}
