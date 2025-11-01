"use client";

import { Gem } from "lucide-react";
import { motion } from "motion/react";
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
 *
 * Animations:
 * - Tab transitions: Smooth fade & slide for content changes
 * - Card stagger: Cards appear in cascade on tab change
 * - Badge pulse: Subtle pulse to draw attention to counts
 * - Hover effects: Scale and glow on tab hover
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

/**
 * Framer Motion variants for animations
 */
const BADGE_PULSE_SCALE = 1.15;
const TAB_STAGGER_DELAY = 0.05;

const tabTriggerVariants = {
  initial: { opacity: 0.6, y: -2 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  hover: { scale: 1.05, transition: { duration: 0.15 } },
};

const badgePulseVariants = {
  animate: {
    scale: [1, BADGE_PULSE_SCALE, 1],
    transition: { duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 },
  },
};

const tabContentVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
};

const cardContainerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const cardItemVariants = {
  initial: { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35 },
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
      // description="Selecciona el tipo de cristal según la solución que necesites."
      icon={Gem}
      legend="Tipo de Cristal"
    >
      <Tabs defaultValue={defaultTab}>
        {/* Tabs navigation - Large, visually prominent */}
        <TabsList className="mb-2 flex h-20 w-full flex-wrap justify-start gap-2 py-1.5">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;

            return (
              <motion.div
                animate="animate"
                initial="initial"
                key={tab.key}
                transition={{ delay: index * TAB_STAGGER_DELAY }}
                variants={tabTriggerVariants}
                whileHover="hover"
              >
                <TabsTrigger
                  className="h-full gap-2 rounded-md border border-primary bg-primary/5 px-2 py-3 font-medium text-base"
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
                      <span className="sm:hidden">
                        {tab.label.split(" ")[0]}
                      </span>
                    </>
                  )}

                  {/* Badge with count (optional based on variant) */}
                  {config.showBadge && (
                    <motion.span
                      animate="animate"
                      className="inline-flex items-center justify-center rounded-full bg-primary/20 px-2 py-0.5 font-semibold text-muted-foreground text-xs"
                      variants={badgePulseVariants}
                    >
                      {tab.options.length}
                    </motion.span>
                  )}
                </TabsTrigger>
              </motion.div>
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
                      asChild
                      className="space-y-2"
                      key={tab.key}
                      value={tab.key}
                    >
                      <motion.div
                        animate="animate"
                        exit="exit"
                        initial="initial"
                        variants={tabContentVariants}
                      >
                        {/* Radio group with staggered cards */}
                        <RadioGroup
                          asChild
                          className="space-y-1"
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <motion.div
                            animate="animate"
                            className="space-y-1"
                            initial="initial"
                            variants={cardContainerVariants}
                          >
                            {tab.options.map((option) => (
                              <motion.div
                                animate="animate"
                                initial="initial"
                                key={option.id}
                                variants={cardItemVariants}
                              >
                                <GlassTypeCardSimple
                                  isSelected={field.value === option.id}
                                  option={option}
                                />
                              </motion.div>
                            ))}
                          </motion.div>
                        </RadioGroup>
                      </motion.div>
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
