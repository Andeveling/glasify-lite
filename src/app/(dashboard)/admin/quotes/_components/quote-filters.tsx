/**
 * QuoteFilters Component
 *
 * Client component that provides filtering UI for quote list by status.
 * Uses URL search params to maintain filter state across navigation.
 *
 * User Story 4: View Quote Submission History
 *
 * @module app/(dashboard)/quotes/_components/quote-filters
 */

"use client";

import { FileText, Search, Send, XCircle } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuoteStatus } from "@prisma/client";

type QuoteFiltersProps = {
  /** Current active status filter (from URL) */
  currentStatus?: QuoteStatus;
  /** Show user filter for admin */
  showUserFilter?: boolean;
};

type FilterOption = {
  value: QuoteStatus | "all";
  label: string;
  icon: typeof FileText;
};

/**
 * Available filter options with icons and labels
 */
const filterOptions: FilterOption[] = [
  {
    icon: FileText,
    label: "Todas",
    value: "all",
  },
  {
    icon: FileText,
    label: "Borradores",
    value: "draft",
  },
  {
    icon: Send,
    label: "Enviadas",
    value: "sent",
  },
  {
    icon: XCircle,
    label: "Canceladas",
    value: "canceled",
  },
];

/**
 * QuoteFilters - Status filter tabs and search for quote list
 *
 * Displays filter buttons for organizing quotes by status and search input.
 * Updates URL search params on filter selection to maintain state.
 *
 * @example
 * ```tsx
 * <QuoteFilters currentStatus={status} showUserFilter={isAdmin} />
 * ```
 */
export function QuoteFilters({
  currentStatus,
  showUserFilter = false,
}: QuoteFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? ""
  );

  /**
   * Update URL search params with new filter selection
   */
  const updateFilter = useCallback(
    (newStatus: QuoteStatus | "all") => {
      const params = new URLSearchParams(searchParams.toString());

      if (newStatus === "all") {
        params.delete("status");
      } else {
        params.set("status", newStatus);
      }

      // Reset to page 1 when changing filters
      params.delete("page");

      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      startTransition(() => {
        router.replace(newUrl);
      });
    },
    [searchParams, pathname, router]
  );

  /**
   * Handle search input submission
   */
  const handleSearch = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const params = new URLSearchParams(searchParams.toString());

      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      } else {
        params.delete("search");
      }

      // Reset to page 1 when searching
      params.delete("page");

      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      startTransition(() => {
        router.replace(newUrl);
      });
    },
    [searchValue, searchParams, pathname, router]
  );

  const activeFilter = currentStatus ?? "all";

  return (
    <div className="mb-6 space-y-4">
      {/* Search input for admins */}
      {showUserFilter && (
        <form className="flex gap-2" onSubmit={handleSearch}>
          <Input
            className="max-w-md"
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar por proyecto, usuario o items..."
            type="search"
            value={searchValue}
          />
          <Button disabled={isPending} size="sm" type="submit">
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </form>
      )}

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === activeFilter;

          return (
            <Button
              className="gap-2"
              disabled={isPending}
              key={option.value}
              onClick={() => updateFilter(option.value)}
              size="sm"
              variant={isActive ? "default" : "outline"}
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
