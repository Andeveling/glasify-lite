/**
 * Step 1: Room Location Selector
 * Allows user to select predefined location or enter custom text
 */

"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  CUSTOM_LOCATION_OPTION,
  ROOM_LOCATIONS,
} from "../../../_constants/room-locations.constants";
import type { WizardFormData } from "../../../_utils/wizard-form.utils";

type LocationStepProps = {
  form: UseFormReturn<WizardFormData>;
};

/**
 * LocationStep Component
 * Step 1 of wizard - room location selection
 */
export function LocationStep({ form }: LocationStepProps) {
  const [open, setOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  const selectedValue = form.watch("roomLocation");
  const error = form.formState.errors.roomLocation;

  const handleSelect = (value: string) => {
    if (value === CUSTOM_LOCATION_OPTION) {
      setIsCustom(true);
      form.setValue("roomLocation", "", { shouldValidate: true });
    } else {
      setIsCustom(false);
      form.setValue("roomLocation", value, { shouldValidate: true });
      setOpen(false);
    }
  };

  const handleCustomInput = (value: string) => {
    form.setValue("roomLocation", value, { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="font-medium text-base" htmlFor="room-location">
          ¿Dónde irá la ventana?
        </Label>
        <p className="text-muted-foreground text-sm">
          Selecciona la ubicación de la ventana en tu hogar u oficina
        </p>
      </div>

      {isCustom ? (
        <div className="space-y-2">
          <Input
            aria-describedby={error ? "location-error" : undefined}
            aria-invalid={!!error}
            className={cn("min-h-[44px]", error && "border-destructive")}
            id="custom-location"
            maxLength={100}
            onChange={(e) => handleCustomInput(e.target.value)}
            placeholder="Ej: Sala de estar, Cuarto de servicio..."
            type="text"
            value={selectedValue}
          />
          <Button
            className="h-auto py-1"
            onClick={() => {
              setIsCustom(false);
              form.setValue("roomLocation", "", { shouldValidate: true });
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            ← Volver a lista predefinida
          </Button>
        </div>
      ) : (
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={open}
              aria-label="Seleccionar ubicación"
              className={cn(
                "min-h-[44px] w-full justify-between",
                error && "border-destructive"
              )}
              role="combobox"
              variant="outline"
            >
              {selectedValue || "Selecciona una ubicación..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar ubicación..." />
              <CommandList>
                <CommandEmpty>No se encontraron ubicaciones.</CommandEmpty>
                <CommandGroup>
                  {ROOM_LOCATIONS.map((location) => (
                    <CommandItem
                      className="min-h-[44px]"
                      key={location}
                      onSelect={() => handleSelect(location)}
                      value={location}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedValue === location
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {location}
                    </CommandItem>
                  ))}
                  <CommandItem
                    className="min-h-[44px]"
                    onSelect={() => handleSelect(CUSTOM_LOCATION_OPTION)}
                    value={CUSTOM_LOCATION_OPTION}
                  >
                    <Check className="mr-2 h-4 w-4 opacity-0" />
                    {CUSTOM_LOCATION_OPTION} (Ingresar manualmente)
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {error && (
        <p
          className="text-destructive text-sm"
          id="location-error"
          role="alert"
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
