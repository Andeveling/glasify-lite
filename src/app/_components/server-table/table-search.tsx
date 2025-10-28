/**
 * TableSearch Component
 *
 * Uncontrolled search input with debounced form submission for server-optimized tables.
 * Follows Next.js 15 best practices: form-based state management with React 19 transitions.
 *
 * Features:
 * - Uncontrolled input (no re-renders on keystroke)
 * - Debounced form submission (300ms delay per PERF-003)
 * - URL-based search state (search param)
 * - React 19 useTransition for pending states
 * - Clear button with visual feedback
 * - Accessible (ARIA labels, form semantics)
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
 * @see https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
 */

"use client";

import { Search, X } from "lucide-react";
import { useRef, useTransition } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useServerParams } from "@/hooks/use-server-params";

export type TableSearchProps = {
  /** Placeholder text for search input */
  placeholder?: string;

  /** Default search value from URL */
  defaultValue?: string;

  /** Debounce delay in milliseconds (default: 300ms) */
  debounceMs?: number;
};

export function TableSearch({
  placeholder = "Buscar...",
  defaultValue = "",
  debounceMs = 300,
}: TableSearchProps) {
  const { updateParams } = useServerParams();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Debounced form submission handler
   */
  const debouncedSubmit = useDebouncedCallback((formData: FormData) => {
    const searchValue = formData.get("search") as string;

    startTransition(() => {
      updateParams({
        page: "1", // Reset to first page on search
        search: searchValue.trim() || undefined, // Remove param if empty
      });
    });
  }, debounceMs);

  /**
   * Handle input change (debounced submission)
   */
  const handleInput = () => {
    if (!formRef.current) {
      return;
    }
    const formData = new FormData(formRef.current);
    debouncedSubmit(formData);
  };

  /**
   * Clear search
   */
  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }

    // Clear form and trigger immediate update
    if (formRef.current) {
      formRef.current.reset();
    }

    startTransition(() => {
      updateParams({
        page: "1",
        search: undefined,
      });
    });
  };

  const showClearButton = defaultValue.length > 0 || inputRef.current?.value;

  return (
    <form onSubmit={(e) => e.preventDefault()} ref={formRef}>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Search />
        </InputGroupAddon>

        <InputGroupInput
          aria-label="Buscar en tabla"
          defaultValue={defaultValue}
          name="search"
          onInput={handleInput}
          placeholder={placeholder}
          ref={inputRef}
          type="text"
        />

        {showClearButton && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Limpiar búsqueda"
              onClick={handleClear}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        )}

        {isPending && (
          <InputGroupAddon align="inline-end">
            <span className="text-muted-foreground text-xs">Buscando...</span>
          </InputGroupAddon>
        )}
      </InputGroup>
    </form>
  );
}
