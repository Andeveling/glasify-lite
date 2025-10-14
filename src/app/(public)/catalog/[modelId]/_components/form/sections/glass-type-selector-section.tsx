'use client';

import { Gem } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { FormSection } from '@/components/form-section';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { RadioGroup } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GlassTypeOutput } from '@/server/api/routers/catalog';
import { GlassTypeCardSimple } from './_components/glass-type-card-simple';
import { useGlassTypesByTab } from './_hooks/use-glass-types-by-tab';

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
  glassTypes: GlassTypeOutput[];
  selectedSolutionId?: string; // Used to set default tab
};

export function GlassTypeSelectorSection({ basePrice, glassTypes, selectedSolutionId }: GlassTypeSelectorSectionProps) {
  const { control } = useFormContext();

  // Hook handles grouping by solution
  const tabs = useGlassTypesByTab(glassTypes, basePrice);

  // Find default tab (selected solution or first tab)
  const defaultTab = selectedSolutionId
    ? tabs.find((tab) => tab.options.some((opt) => 
        glassTypes.find((gt) => gt.id === opt.id)?.solutions?.some((s) => s.solution.id === selectedSolutionId)
      ))?.key ?? tabs[0]?.key
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
      <Tabs defaultValue={defaultTab}>
        {/* Tabs navigation */}
        <TabsList className="w-full justify-start overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger className="gap-2" key={tab.key} value={tab.key}>
                <Icon className="size-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
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
                <>
                  {tabs.map((tab) => (
                    <TabsContent className="space-y-3" key={tab.key} value={tab.key}>
                      {/* Info text */}
                      <p className="text-muted-foreground text-sm">
                        {tab.options.length} {tab.options.length === 1 ? 'opción' : 'opciones'} disponible
                        {tab.options.length === 1 ? '' : 's'}
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
                </>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Tabs>
    </FormSection>
  );
}
