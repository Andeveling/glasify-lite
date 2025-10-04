'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';

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

  // Utility to create query string following Next.js best practices
  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      return params.toString();
    },
    [searchParams]
  );

  // Debounced search - wait 300ms after user stops typing
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const queryString = createQueryString({
      page: null, // Reset to page 1 when searching
      q: value || null,
    });

    startTransition(() => {
      router.push(`${pathname}?${queryString}`);
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
    const queryString = createQueryString({
      page: null,
      q: null,
    });

    startTransition(() => {
      router.push(`${pathname}?${queryString}`);
    });
  }, [pathname, router, createQueryString]);

  return (
    <div className="mb-12">
      <div className="relative max-w-xl">
        <InputGroup>
          <InputGroupInput
            className="h-11 border-foreground/20 pr-9 pl-10 transition-colors focus-visible:border-foreground/40 focus-visible:ring-0"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar productos..."
            type="text"
            value={query}
          />
          <InputGroupAddon>
            <Search className="size-4 text-foreground/40" />
          </InputGroupAddon>
          {query && !isPending && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton className="size-8" onClick={handleClear} size="icon-sm" variant="ghost">
                <X className="size-4" />
                <span className="sr-only">Limpiar búsqueda</span>
              </InputGroupButton>
            </InputGroupAddon>
          )}
          {isPending && (
            <InputGroupAddon align="inline-end">
              <Spinner />
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>
    </div>
  );
}
