import { api } from '@/trpc/server';
import { CatalogEmpty } from './catalog-empty';
import { CatalogError } from './catalog-error';
import { CatalogGrid } from './catalog-grid';
import { CatalogPagination } from './catalog-pagination';

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
 * Server Component that fetches and renders catalog models.
 * This component is cached and revalidated via ISR.
 *
 * Benefits:
 * - Pre-rendered HTML for better performance
 * - SEO-friendly (search engines see the content)
 * - No client-side JavaScript needed for rendering
 */
export async function CatalogContent({ manufacturerId, page, searchQuery, sort = 'name-asc' }: CatalogContentProps) {
  try {
    // Fetch models on the server - this is cached and revalidated
    const data = await api.catalog['list-models']({
      limit: ITEMS_PER_PAGE,
      manufacturerId,
      page,
      search: searchQuery,
      sort,
    });

    const hasActiveFilters = Boolean(searchQuery || manufacturerId);
    const { items: models, total } = data;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

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
