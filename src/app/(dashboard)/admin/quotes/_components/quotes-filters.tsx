/**
 * Quotes Filters Component (US3 - T020)
 *
 * Client Component for filtering quotes by status
 * Uses URL search params for state management
 *
 * Features:
 * - Filter buttons from FILTER_OPTIONS
 * - Highlights active filter
 * - Updates URL on change
 * - Spanish labels
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FILTER_OPTIONS } from "../_constants/quote-filters.constants";

type QuotesFiltersProps = {
  currentStatus?: string;
};

export function QuotesFilters({ currentStatus = "all" }: QuotesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }

    // Reset to page 1 when filter changes
    params.delete("page");

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_OPTIONS.map((option) => (
        <Button
          key={option.value}
          onClick={() => handleFilterChange(option.value)}
          size="sm"
          variant={currentStatus === option.value ? "default" : "outline"}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
