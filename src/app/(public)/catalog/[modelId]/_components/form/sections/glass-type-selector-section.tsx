"use client";

import { Gem } from "lucide-react";
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { formatCurrency } from "@/app/_utils/format-currency.util";
import { FormSection } from "@/components/form-section";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { GlassTypeOutput } from "@/server/api/routers/catalog";
import { GlassTypeCardSimple } from "./_components/glass-type-card-simple";
import { useGlassTypesByTab } from "./_hooks/use-glass-types-by-tab";

/**
 * Glass Type Selector Section Component (Template)
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only renders UI, delegates logic to hook
 * - Open/Closed: Extensible through props, closed to modification
 * - Liskov Substitution: Can swap card components
 * - Interface Segregation: Minimal props, only what's needed
 * - Dependency Inversion: Depends on abstractions (hook, components)
 *
 * Don't Make Me Think:
 * - Tabs group options by solution (clear mental model)
 * - Simplified cards (less cognitive load)
 * - No confusing filters or auto-hiding options
 * - Fast decision making
 */

type GlassTypeSelectorSectionProps = {
  basePrice?: number; // Model base price for comparison
  glassArea?: number; // Calculated glass area in m² (from parent form)
  glassTypes: GlassTypeOutput[];
  selectedSolutionId?: string; // Used to set default tab
};

export function GlassTypeSelectorSection({
  basePrice,
  glassArea,
  glassTypes,
  selectedSolutionId,
}: GlassTypeSelectorSectionProps) {
  const { control, watch } = useFormContext();

  // Hook handles grouping by solution
  const tabs = useGlassTypesByTab(glassTypes, basePrice);

  // Watch selected glass type
  const selectedGlassTypeId = watch("glassType");

  // Track active tab for visual feedback
  const [activeTab, setActiveTab] = useState<string>();

  // Find selected glass type details
  const selectedGlassType = useMemo(() => {
    if (!selectedGlassTypeId) return null;

    for (const tab of tabs) {
      const found = tab.options.find((opt) => opt.id === selectedGlassTypeId);
      if (found) return found;
    }
    return null;
  }, [selectedGlassTypeId, tabs]);

  // Find default tab (selected solution or first tab)
  const defaultTab = selectedSolutionId
    ? (tabs.find((tab) =>
        tab.options.some((opt) =>
          glassTypes
            .find((gt) => gt.id === opt.id)
            ?.solutions?.some((s) => s.solution.id === selectedSolutionId)
        )
      )?.key ?? tabs[0]?.key)
    : tabs[0]?.key;

  if (tabs.length === 0) {
    return null;
  }

  return (
    <FormSection
      description="Selecciona el tipo de cristal según la solución que necesites."
      icon={Gem}
      legend="Tipo de Cristal"
    >
      <Tabs defaultValue={defaultTab} onValueChange={setActiveTab}>
        {/* Selection Indicator - Always visible at top */}
        {selectedGlassType && (
          <div className="mb-6 rounded-lg border-2 border-primary bg-primary/10 p-4 dark:bg-purple-950/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Gem className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-muted-foreground text-sm">
                  Vidrio seleccionado
                </p>
                <p className="font-semibold text-foreground text-lg">
                  {selectedGlassType.name}
                </p>
                {glassArea && glassArea > 0 && (
                  <p className="text-muted-foreground text-xs">
                    {glassArea.toFixed(2)} m² ×{" "}
                    {formatCurrency(selectedGlassType.pricePerSqm)}/m²
                  </p>
                )}
              </div>
              <div className="text-right">
                {glassArea && glassArea > 0 ? (
                  <>
                    <p className="font-bold text-2xl text-purple-600 dark:text-purple-400">
                      {formatCurrency(
                        selectedGlassType.pricePerSqm * glassArea
                      )}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      total vidrio
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-2xl text-purple-600 dark:text-purple-400">
                      {formatCurrency(selectedGlassType.pricePerSqm)}
                    </p>
                    <p className="text-muted-foreground text-xs">por m²</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs navigation - VERSIÓN MEJORADA */}
        <TabsList className="w-full justify-start">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = (activeTab ?? defaultTab) === tab.key;

            return (
              <TabsTrigger
                className={cn(
                  "gap-2",
                  isActive && "border-2 border-primary/20"
                )}
                key={tab.key}
                value={tab.key}
              >
                <Icon className={cn("size-4", isActive && "text-primary")} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>

                {/* Badge con conteo de opciones */}
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-2 py-0.5 font-semibold text-xs",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  {tab.options.length}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tabs content */}
        <FormField
          control={control}
          name="glassType"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div>
                  {tabs.map((tab) => (
                    <TabsContent
                      className="space-y-3"
                      key={tab.key}
                      value={tab.key}
                    >
                      {/* Info text */}
                      <p className="text-muted-foreground text-sm">
                        {tab.options.length}{" "}
                        {tab.options.length === 1 ? "opción" : "opciones"}{" "}
                        disponible
                        {tab.options.length === 1 ? "" : "s"}
                      </p>

                      {/* Radio group */}
                      <RadioGroup
                        className="space-y-2"
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        {tab.options.map((option) => (
                          <GlassTypeCardSimple
                            isSelected={field.value === option.id}
                            key={option.id}
                            option={option}
                          />
                        ))}
                      </RadioGroup>
                    </TabsContent>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Tabs>
    </FormSection>
  );
}
