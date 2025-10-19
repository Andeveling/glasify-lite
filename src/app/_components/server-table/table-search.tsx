/**
 * TableSearch Component
 *
 * Debounced search input molecule for server-optimized tables.
 * Updates URL search parameter with 300ms debounce to reduce server load.
 *
 * Features:
 * - Debounced input (300ms delay per PERF-003)
 * - URL-based search state (search param)
 * - Clear button with visual feedback
 * - Accessible (ARIA labels, keyboard shortcuts)
 * - Loading indicator during debounce
 *
 * Usage:
 * ```tsx
 * <TableSearch
 *   placeholder="Buscar modelos..."
 *   defaultValue={searchParams.search}
 * />
 * ```
 *
 * @see REQ-002: Debounced search with 300ms delay
 */

'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { useServerParams } from '@/hooks/use-server-params';

export interface TableSearchProps {
  /** Placeholder text for search input */
  placeholder?: string;

  /** Default search value from URL */
  defaultValue?: string;

  /** Debounce delay in milliseconds (default: 300ms) */
  debounceMs?: number;
}

export function TableSearch({ placeholder = 'Buscar...', defaultValue = '', debounceMs = 300 }: TableSearchProps) {
  const { updateParams, getParam } = useServerParams();
  const [searchValue, setSearchValue] = useState(defaultValue);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Sync with URL changes (e.g., browser back button)
  useEffect(() => {
    const urlSearch = getParam('search') ?? '';
    if (urlSearch !== searchValue) {
      setSearchValue(urlSearch);
    }
  }, [getParam, searchValue]);

  /**
   * Debounced URL update handler
   */
  const debouncedUpdate = useDebouncedCallback((value: string) => {
    updateParams({
      page: '1', // Reset to first page on search
      search: value || undefined, // Remove param if empty
    });
    setIsDebouncing(false);
  }, debounceMs);

  /**
   * Handle input change
   */
  const handleChange = (value: string) => {
    setSearchValue(value);
    setIsDebouncing(true);
    debouncedUpdate(value);
  };

  /**
   * Clear search
   */
  const handleClear = () => {
    setSearchValue('');
    setIsDebouncing(false);
    updateParams({
      page: '1',
      search: undefined,
    });
  };

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 size-4 text-muted-foreground" />

      <Input
        aria-label="Buscar en tabla"
        className="px-9"
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        type="search"
        value={searchValue}
      />

      {searchValue && (
        <Button
          aria-label="Limpiar búsqueda"
          className="absolute right-1 size-7"
          onClick={handleClear}
          size="icon"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      )}

      {isDebouncing && (
        <div aria-live="polite" className="absolute right-10 text-muted-foreground text-xs">
          Buscando...
        </div>
      )}
    </div>
  );
}
