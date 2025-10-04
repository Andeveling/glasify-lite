'use client';

import { ListFilter } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type CatalogFiltersProps = {
  manufacturers?: Array<{
    id: string;
    name: string;
  }>;
};

/**
 * Catalog Filters Component
 * Issue: #002-ui-ux-requirements
 *
 * Client component for filtering and sorting catalog items
 * - Manufacturer filter
 * - Sort by name or price
 * - URL-based state management with query params
 * - Type-safe navigation with Next.js hooks
 */
export function CatalogFilters({ manufacturers = [] }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentManufacturer = searchParams.get('manufacturer') ?? '';
  const currentSort = searchParams.get('sort') ?? 'name-asc';

  // Utility to create query string following Next.js best practices
  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      return params.toString();
    },
    [searchParams]
  );

  const handleManufacturerChange = useCallback(
    (value: string) => {
      const queryString = createQueryString({
        manufacturer: value || null,
        page: null, // Reset to page 1 when filtering
      });

      router.push(`${pathname}?${queryString}`);
    },
    [pathname, router, createQueryString]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      const queryString = createQueryString({
        page: null, // Reset to page 1 when sorting
        sort: value,
      });

      router.push(`${pathname}?${queryString}`);
    },
    [pathname, router, createQueryString]
  );

  const handleClearFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  const hasActiveFilters = currentManufacturer || currentSort !== 'name-asc';

  return (
    <div className="mb-8 flex flex-wrap items-center gap-4">
      {/* Filter indicator */}
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <ListFilter className="size-4" />
        <span>Filtros</span>
      </div>

      {/* Manufacturer filter */}
      {manufacturers.length > 0 && (
        <Select onValueChange={handleManufacturerChange} value={currentManufacturer}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos los fabricantes" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fabricante</SelectLabel>
              <SelectItem value="">Todos</SelectItem>
              {manufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer.id} value={manufacturer.id}>
                  {manufacturer.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {/* Sort filter */}
      <Select onValueChange={handleSortChange} value={currentSort}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Ordenar por</SelectLabel>
            <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
            <SelectItem value="price-asc">Precio (menor)</SelectItem>
            <SelectItem value="price-desc">Precio (mayor)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Clear filters button */}
      {hasActiveFilters && (
        <Button onClick={handleClearFilters} size="sm" variant="ghost">
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
