/**
 * Delivery Address Picker Component
 *
 * Feature: 001-delivery-address
 * Created: 2025-11-01
 *
 * Purpose:
 * Autocomplete address input with geocoding suggestions
 *
 * Usage:
 * <DeliveryAddressPicker
 *   value={address}
 *   onChange={(address) => handleAddressChange(address)}
 * />
 */

"use client";

import { Check, ChevronsUpDown, Loader2, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { COORDINATE_DISPLAY_DECIMAL_PLACES } from "@/app/(dashboard)/admin/quotes/_constants/geocoding.constants";
import { useAddressAutocompleteWithSelection } from "@/app/(dashboard)/admin/quotes/_hooks/use-address-autocomplete";
import type { ProjectAddressInput } from "@/app/(dashboard)/admin/quotes/_types/address.types";
import { formatAddress } from "@/app/(dashboard)/admin/quotes/_utils/address-formatter";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DeliveryAddressPickerProps = {
  /**
   * Current selected address value
   */
  value?: Partial<ProjectAddressInput> | null;

  /**
   * Callback when address is selected
   */
  onChangeAction?: (address: Partial<ProjectAddressInput>) => void;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Error state
   */
  error?: string;
};

/**
 * Address picker with autocomplete search
 *
 * Features:
 * - Debounced search (300ms)
 * - Geocoding suggestions from Nominatim
 * - Display formatted addresses
 * - Loading states
 * - Empty states
 * - Error handling
 */
export function DeliveryAddressPicker({
  value,
  onChangeAction,
  disabled = false,
  placeholder = "Buscar dirección...",
  error,
}: DeliveryAddressPickerProps) {
  const [open, setOpen] = useState(false);

  // Use autocomplete hook with selection
  const {
    query,
    setQuery,
    results,
    isLoading,
    isSearching,
    isEmpty,
    isIdle,
    hasError,
    error: searchError,
    selectResult,
  } = useAddressAutocompleteWithSelection({
    onSelect: (result) => {
      // Transform geocoding result to ProjectAddressInput format
      const address: Partial<ProjectAddressInput> = {
        city: result.address.city,
        country: result.address.country,
        latitude: result.latitude,
        longitude: result.longitude,
        postalCode: result.address.postcode,
        region: result.address.state,
      };

      // Call parent onChange
      onChangeAction?.(address);

      // Close popover
      setOpen(false);

      // Clear search query
      setQuery("");
    },
  });

  // Display value in trigger button
  const displayValue = value ? formatAddress(value) : placeholder;
  const hasValue = Boolean(value?.city || value?.street || value?.reference);

  return (
    <div className="w-full space-y-2">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !hasValue && "text-muted-foreground",
              error && "border-destructive"
            )}
            disabled={disabled}
            role="combobox"
            variant="outline"
          >
            <span className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{displayValue}</span>
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[400px] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              disabled={disabled}
              onValueChange={setQuery}
              placeholder="Buscar ciudad, dirección..."
              value={query}
            />
            <CommandList>
              {/* Loading state */}
              {isSearching && (
                <CommandEmpty>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="ml-2 text-muted-foreground text-sm">
                    Buscando direcciones...
                  </span>
                </CommandEmpty>
              )}

              {/* Idle state (no search yet) */}
              {isIdle && (
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                      Escribe al menos 3 caracteres para buscar
                    </p>
                  </div>
                </CommandEmpty>
              )}

              {/* Empty state (no results found) */}
              {isEmpty && (
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 py-4">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                    <p className="font-medium text-sm">
                      No se encontraron direcciones
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Intenta con otra búsqueda
                    </p>
                  </div>
                </CommandEmpty>
              )}

              {/* Error state */}
              {hasError && (
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 py-4">
                    <p className="font-medium text-destructive text-sm">
                      Error al buscar direcciones
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {typeof searchError === "string"
                        ? searchError
                        : "Intenta nuevamente"}
                    </p>
                  </div>
                </CommandEmpty>
              )}

              {/* Results list */}
              {results.length > 0 && !isLoading && (
                <CommandGroup heading="Resultados">
                  {results.map((result) => (
                    <CommandItem
                      className="cursor-pointer"
                      key={result.placeId}
                      onSelect={() => selectResult(result)}
                      value={result.placeId}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          "opacity-0" // Always hidden, using for spacing
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {result.displayName}
                        </span>
                        {result.address.state && (
                          <span className="text-muted-foreground text-xs">
                            {result.address.state}
                            {result.address.country &&
                              `, ${result.address.country}`}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Error message */}
      {error && <p className="text-destructive text-sm">{error}</p>}

      {/* Show coordinates if available */}
      {value?.latitude && value?.longitude && (
        <p className="text-muted-foreground text-xs">
          Coordenadas:{" "}
          {value.latitude.toFixed(COORDINATE_DISPLAY_DECIMAL_PLACES)},{" "}
          {value.longitude.toFixed(COORDINATE_DISPLAY_DECIMAL_PLACES)}
        </p>
      )}
    </div>
  );
}
