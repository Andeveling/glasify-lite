'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type CatalogSearchProps = {
  initialValue?: string;
};

const TRANSITION_TIMEOUT = 300;

/**
 * Catalog Search Component
 * Issue: #002-ui-ux-requirements
 *
 * Minimalist search bar inspired by Saleor Storefront
 * - Clean design, no visual clutter
 * - Debounced input for performance
 * - SEO-friendly URLs with Next.js navigation
 */
export function CatalogSearch({ initialValue = '' }: CatalogSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  // Debounced search - wait 300ms after user stops typing
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams?.toString());

    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }

    // Reset to page 1 when searching
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, TRANSITION_TIMEOUT);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    const params = new URLSearchParams(searchParams?.toString());
    params.delete('q');
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [pathname, router, searchParams]);

  return (
    <div className="mb-12">
      <div className="relative max-w-xl">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-foreground/40" />
        <Input
          className="h-11 border-foreground/20 pr-9 pl-10 transition-colors focus-visible:border-foreground/40 focus-visible:ring-0"
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar productos..."
          type="search"
          value={query}
        />
        {query && (
          <Button
            className="-translate-y-1/2 absolute top-1/2 right-1 size-8"
            onClick={handleClear}
            size="icon"
            variant="ghost"
          >
            <X className="size-4" />
            <span className="sr-only">Limpiar búsqueda</span>
          </Button>
        )}
        {isPending && (
          <div className="-translate-y-1/2 absolute top-1/2 right-10">
            <div className="size-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
