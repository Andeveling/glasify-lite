/**
 * Step 2: Dimensions Input
 * Width and height inputs with real-time price calculation
 */

"use client";

import { Ruler } from "lucide-react";
import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  DEBOUNCE_DELAY,
  MAX_DIMENSION,
  MIN_DIMENSION,
  MM_TO_SQM,
} from "../../../_constants/wizard-config.constants";
import type { WizardFormData } from "../../../_utils/wizard-form.utils";

type DimensionsStepProps = {
  form: UseFormReturn<WizardFormData>;
  onPriceCalculationAction?: (width: number, height: number) => void;
};

/**
 * DimensionsStep Component
 * Step 2 of wizard - width and height input with validation
 */
export function DimensionsStep({
  form,
  onPriceCalculationAction,
}: DimensionsStepProps) {
  const width = form.watch("width");
  const height = form.watch("height");
  const widthError = form.formState.errors.width;
  const heightError = form.formState.errors.height;

  // Debounce dimensions for price calculation (300ms)
  const [debouncedWidth] = useDebounce(width, DEBOUNCE_DELAY);
  const [debouncedHeight] = useDebounce(height, DEBOUNCE_DELAY);

  // Trigger price calculation when debounced dimensions change
  useEffect(() => {
    if (
      debouncedWidth &&
      debouncedHeight &&
      debouncedWidth >= MIN_DIMENSION &&
      debouncedWidth <= MAX_DIMENSION &&
      debouncedHeight >= MIN_DIMENSION &&
      debouncedHeight <= MAX_DIMENSION &&
      onPriceCalculationAction
    ) {
      onPriceCalculationAction(debouncedWidth, debouncedHeight);
    }
  }, [debouncedWidth, debouncedHeight, onPriceCalculationAction]);

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-2">
        <h3 className="font-medium text-base md:text-lg">
          Dimensiones del vidrio
        </h3>
        <p className="text-muted-foreground text-sm md:text-base">
          Ingresa el ancho y alto en milímetros (rango: {MIN_DIMENSION} -{" "}
          {MAX_DIMENSION} mm)
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Width Input */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2" htmlFor="width">
            <Ruler className="h-4 w-4" />
            Ancho (mm)
          </Label>
          <div className="relative">
            <Input
              id="width"
              inputMode="numeric"
              max={MAX_DIMENSION}
              min={MIN_DIMENSION}
              placeholder="Ej: 1000"
              step={1}
              type="number"
              {...form.register("width", { valueAsNumber: true })}
              aria-describedby={widthError ? "width-error" : undefined}
              aria-invalid={!!widthError}
              className={cn(
                "min-h-[44px] pr-12 text-base",
                widthError && "border-destructive"
              )}
            />
            <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground text-sm">
              mm
            </span>
          </div>
          {widthError && (
            <p
              className="text-destructive text-sm"
              id="width-error"
              role="alert"
            >
              {widthError.message}
            </p>
          )}
        </div>

        {/* Height Input */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2" htmlFor="height">
            <Ruler className="h-4 w-4 rotate-90" />
            Alto (mm)
          </Label>
          <div className="relative">
            <Input
              id="height"
              inputMode="numeric"
              max={MAX_DIMENSION}
              min={MIN_DIMENSION}
              placeholder="Ej: 1500"
              step={1}
              type="number"
              {...form.register("height", { valueAsNumber: true })}
              aria-describedby={heightError ? "height-error" : undefined}
              aria-invalid={!!heightError}
              className={cn(
                "min-h-[44px] pr-12 text-base",
                heightError && "border-destructive"
              )}
            />
            <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground text-sm">
              mm
            </span>
          </div>
          {heightError && (
            <p
              className="text-destructive text-sm"
              id="height-error"
              role="alert"
            >
              {heightError.message}
            </p>
          )}
        </div>
      </div>

      {/* Calculation Indicator */}
      {width && height && !widthError && !heightError && (
        <div className="rounded-md bg-muted p-3">
          <p className="text-muted-foreground text-sm">
            Área calculada:{" "}
            <span className="font-medium text-foreground">
              {((width * height) / MM_TO_SQM).toFixed(2)} m²
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
