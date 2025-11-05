/**
 * Quotes Search Component (US8 - T032)
 *
 * Client Component for searching quotes
 * Debounced input to reduce server load
 *
 * Features:
 * - Searches by project name OR user name
 * - 300ms debounce
 * - Updates URL search params
 * - Clear button
 * - Spanish placeholder
 */

"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type QuotesSearchProps = {
  currentSearch?: string;
};

const SEARCH_DEBOUNCE_MS = 300;

export function QuotesSearch({ currentSearch = "" }: QuotesSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(currentSearch);

  // Debounced URL update
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (searchValue) {
        params.set("search", searchValue);
      } else {
        params.delete("search");
      }

      // Reset to page 1 when search changes
      params.delete("page");

      router.push(`?${params.toString()}`);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchValue, router, searchParams]);

  const handleClear = () => {
    setSearchValue("");
  };

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
      <Input
        className="pr-8 pl-8"
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Buscar por proyecto o usuario..."
        type="search"
        value={searchValue}
      />
      {searchValue && (
        <Button
          className="absolute top-0 right-0 size-9"
          onClick={handleClear}
          size="icon"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
