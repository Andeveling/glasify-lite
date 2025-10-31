"use client";

import { Gem } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormSection } from "@/components/form-section";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GlassTypeOutput } from "@/server/api/routers/catalog";
import { GlassTypeCardSimple } from "./_components/glass-type-card-simple";
import type { GlassTab } from "./_hooks/use-glass-types-by-tab";
import { useGlassTypesByTab } from "./_hooks/use-glass-types-by-tab";

/**
 * Glass Type Selector Section - Organizes glass types by solution tabs
 * Reduces cognitive load through clear categorization and minimal UI elements
 */

type TabsVariant = "full" | "simple" | "minimal";

type TabsVariantConfig = {
  showBadge: boolean;
  showIcon: boolean;
  showFullLabel: boolean; // Full label on mobile vs abbreviated
};

const TABS_VARIANT_CONFIGS: Record<TabsVariant, TabsVariantConfig> = {
  // Full: Icons + badges + full labels (default for retrocompatibility)
  full: {
    showBadge: true,
    showIcon: true,
    showFullLabel: false, // Abbreviated on mobile
  },
  // Simple: Icons + labels, no badges (recommended - less visual noise)
  simple: {
    showBadge: false,
    showIcon: true,
    showFullLabel: true,
  },
  // Minimal: Only text labels (maximum simplicity)
  minimal: {
    showBadge: false,
    showIcon: false,
    showFullLabel: true,
  },
};

type GlassTypeSelectorSectionProps = {
  basePrice?: number;
  glassTypes: GlassTypeOutput[];
  selectedSolutionId?: string;
  /** Variante de tabs (default: "full" para retrocompatibilidad) */
  variant?: TabsVariant;
  /** Configuración personalizada (sobrescribe la variante) */
  customConfig?: Partial<TabsVariantConfig>;
};

/**
 * Helper: Find default tab based on selected solution
 */
function findDefaultTab(
  tabs: GlassTab[],
  selectedSolutionId: string | undefined,
  glassTypes: GlassTypeOutput[]
): string | undefined {
  if (!selectedSolutionId || tabs.length === 0) {
    return tabs[0]?.key;
  }

  const matchingTab = tabs.find((tab) =>
    tab.options.some((opt) =>
      glassTypes
        .find((gt) => gt.id === opt.id)
        ?.solutions?.some((s) => s.solution.id === selectedSolutionId)
    )
  );

  return matchingTab?.key ?? tabs[0]?.key;
}

export function GlassTypeSelectorSection({
  basePrice,
  glassTypes,
  selectedSolutionId,
  variant = "full",
  customConfig,
}: GlassTypeSelectorSectionProps) {
  const { control } = useFormContext();

  // Resolver configuración: custom > variant > default
  const config: TabsVariantConfig = {
    ...TABS_VARIANT_CONFIGS[variant],
    ...customConfig,
  };

  // Hook handles grouping by solution
  const tabs = useGlassTypesByTab(glassTypes, basePrice);

  // Find default tab (extracted to helper for clarity)
  const defaultTab = findDefaultTab(tabs, selectedSolutionId, glassTypes);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <FormSection
      description="Selecciona el tipo de cristal según la solución que necesites."
      icon={Gem}
      legend="Tipo de Cristal"
    >
      <Tabs defaultValue={defaultTab}>
        {/* Tabs navigation - Large, visually prominent */}
        <TabsList className="w-full justify-start p-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <TabsTrigger
                className="gap-2 px-2 py-3 font-medium text-base"
                key={tab.key}
                value={tab.key}
              >
                {/* Icon (optional based on variant) */}
                {config.showIcon && <Icon className="size-5" />}

                {/* Label - responsive or full based on variant */}
                {config.showFullLabel ? (
                  <span>{tab.label}</span>
                ) : (
                  <>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  </>
                )}

                {/* Badge with count (optional based on variant) */}
                {config.showBadge && (
                  <span className="inline-flex items-center justify-center rounded-full bg-muted-foreground/20 px-2 py-0.5 font-semibold text-muted-foreground text-xs">
                    {tab.options.length}
                  </span>
                )}
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
                      className="space-y-2"
                      key={tab.key}
                      value={tab.key}
                    >
                      {/* Radio group - no redundant text */}
                      <RadioGroup
                        className="space-y-1"
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
