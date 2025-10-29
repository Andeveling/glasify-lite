/**
 * T047: ColorSelector Component
 *
 * Visual color chip selector for quote configuration
 * - Displays available colors for model with surcharge badges
 * - Keyboard navigation (Arrow keys, Enter, Space)
 * - Accessible with ARIA labels in Spanish
 * - Calls onColorChange with colorId and surchargePercentage
 * - Auto-selects default color on mount
 *
 * Architecture:
 * - Client Component for interactivity
 * - Fetches colors via tRPC (cached 5min server-side)
 * - Horizontal scroll for >6 colors, grid for ≤6
 */

"use client";

import { useEffect, useState } from "react";
import { ColorChip } from "@/app/(dashboard)/admin/colors/_components/color-chip";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";

type ColorSelectorProps = {
  modelId: string;
  /**
   * ⚠️ NEXT.JS WARNING (FALSE POSITIVE):
   * Next.js 15 shows warning about callback not being Server Action.
   * This is a KNOWN ISSUE - callbacks are valid in Client-to-Client components.
   *
   * Context:
   * - This component (color-selector.tsx) is a Client Component ("use client")
   * - Parent component (model-form.tsx) is also a Client Component
   * - Callback is NOT crossing Server/Client boundary
   *
   * References:
   * - https://github.com/vercel/next.js/issues/54282
   * - This warning can be safely ignored for Client-to-Client callbacks
   */
  onColorChange: (
    colorId: string | undefined,
    surchargePercentage: number
  ) => void;
};

/**
 * ColorSelector Component
 * Returns null if model has no colors assigned
 */
export function ColorSelector({ modelId, onColorChange }: ColorSelectorProps) {
  const [selectedColorId, setSelectedColorId] = useState<string | undefined>();

  // Fetch model colors
  const { data, isLoading } = api.quote["get-model-colors-for-quote"].useQuery(
    { modelId },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes (matches server cache)
    }
  );

  // Auto-select default color on mount
  useEffect(() => {
    if (data?.defaultColorId && !selectedColorId) {
      setSelectedColorId(data.defaultColorId);
      const defaultColor = data.colors.find(
        (c) => c.color.id === data.defaultColorId
      );
      if (defaultColor) {
        onColorChange(data.defaultColorId, defaultColor.surchargePercentage);
      }
    }
  }, [data, selectedColorId, onColorChange]);

  // Handle color selection
  const handleColorSelect = (colorId: string, surchargePercentage: number) => {
    setSelectedColorId(colorId);
    onColorChange(colorId, surchargePercentage);
  };

  // Handle keyboard navigation
  const handleKeyDown = (
    event: React.KeyboardEvent,
    colorId: string,
    surchargePercentage: number,
    index: number
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleColorSelect(colorId, surchargePercentage);
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (index + 1) % (data?.colors.length ?? 0);
      const nextButton = document.querySelector(
        `[data-color-index="${nextIndex}"]`
      ) as HTMLButtonElement;
      nextButton?.focus();
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prevIndex =
        (index - 1 + (data?.colors.length ?? 0)) % (data?.colors.length ?? 0);
      const prevButton = document.querySelector(
        `[data-color-index="${prevIndex}"]`
      ) as HTMLButtonElement;
      prevButton?.focus();
    }
  };

  // Don't render if loading or no colors
  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="font-medium text-sm">Cargando colores...</p>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              className="h-16 w-16 animate-pulse rounded-lg bg-muted"
              key={i}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.hasColors) {
    return null; // No color selector if model has no colors
  }

  const useGrid = data.colors.length <= 6;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-medium text-sm" htmlFor="color-selector">
          Seleccione un Color
        </label>
        <Badge variant="secondary">
          {data.colors.length}{" "}
          {data.colors.length === 1 ? "opción" : "opciones"}
        </Badge>
      </div>

      <div
        aria-label="Selector de color"
        className={
          useGrid
            ? "grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6"
            : "flex gap-3 overflow-x-auto pb-2"
        }
        id="color-selector"
        role="radiogroup"
      >
        {data.colors.map((modelColor, index) => {
          const isSelected = selectedColorId === modelColor.color.id;
          const surcharge = modelColor.surchargePercentage;

          return (
            <button
              aria-checked={isSelected}
              aria-label={`${modelColor.color.name}${surcharge > 0 ? `, +${surcharge}%` : ""}`}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
              } ${useGrid ? "" : "min-w-[100px]"}`}
              data-color-index={index}
              key={modelColor.id}
              onClick={() => handleColorSelect(modelColor.color.id, surcharge)}
              onKeyDown={(e) =>
                handleKeyDown(e, modelColor.color.id, surcharge, index)
              }
              role="radio"
              tabIndex={isSelected ? 0 : -1}
              type="button"
            >
              <ColorChip hexCode={modelColor.color.hexCode} size="lg" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-center font-medium text-xs">
                  {modelColor.color.name}
                </span>
                {modelColor.color.ralCode && (
                  <span className="text-muted-foreground text-xs">
                    {modelColor.color.ralCode}
                  </span>
                )}
                {surcharge > 0 ? (
                  <Badge className="text-xs" variant="secondary">
                    +{surcharge}%
                  </Badge>
                ) : (
                  <Badge className="text-xs" variant="outline">
                    Incluido
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
