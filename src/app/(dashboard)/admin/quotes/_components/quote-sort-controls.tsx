/**
 * Quote Sort Controls Component (US5 - T026)
 *
 * Client Component for sorting quotes
 * Uses URL search params for state management
 *
 * Features:
 * - Dropdown with SORT_OPTIONS
 * - Updates sortBy and sortOrder in URL
 * - Spanish labels
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "../_constants/quote-filters.constants";

type QuoteSortControlsProps = {
  currentSortBy?: string;
  currentSortOrder?: "asc" | "desc";
};

export function QuoteSortControls({
  currentSortBy = "createdAt",
  currentSortOrder = "desc",
}: QuoteSortControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const option = SORT_OPTIONS.find((opt) => opt.value === value);

    if (option) {
      params.set("sortBy", option.sortBy);
      params.set("sortOrder", option.sortOrder);
      params.delete("page"); // Reset to page 1
      router.push(`?${params.toString()}`);
    }
  };

  const currentValue = `${currentSortBy}-${currentSortOrder}`;

  return (
    <Select onValueChange={handleSortChange} value={currentValue}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Ordenar por..." />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
