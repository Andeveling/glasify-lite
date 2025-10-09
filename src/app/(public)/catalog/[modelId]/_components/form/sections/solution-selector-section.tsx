'use client';

import { HelpCircle, Home, Info, Shield, Snowflake, Sparkles, Volume2, Zap } from 'lucide-react';
import type { ComponentType } from 'react';
import { memo, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormSection } from '@/components/form-section';
import { Badge } from '@/components/ui/badge';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { GlassSolutionOutput } from '@/server/api/routers/catalog';
import { useSolutionSelector } from '../../../_hooks/use-solution-selector';

/**
 * Maps solution icon names (stored in database) to Lucide React icon components
 *
 * @param iconName - Icon name string from database (e.g., 'Shield', 'Snowflake')
 * @returns Lucide icon component or HelpCircle as fallback
 *
 * @example
 * ```tsx
 * const Icon = getSolutionIcon('Shield'); // Returns Shield component
 * <Icon className="h-6 w-6" />
 * ```
 */
const getSolutionIcon = (iconName: string | null | undefined): ComponentType<{ className?: string }> => {
  switch (iconName) {
    case 'Home':
      return Home;
    case 'Shield':
      return Shield;
    case 'Snowflake':
      return Snowflake;
    case 'Sparkles':
      return Sparkles;
    case 'Volume2':
      return Volume2;
    case 'Zap':
      return Zap;
    default:
      return HelpCircle;
  }
};

type SolutionOption = {
  description: string;
  icon: ComponentType<{ className?: string }>;
  id: string;
  key: string;
  name: string;
};

type SolutionSelectorSectionProps = {
  solutions: GlassSolutionOutput[];
};

/**
 * Solution Selector Section Component (Organism)
 *
 * First step in the glass configuration form: allows users to select
 * a glass solution category (security, thermal, acoustic, etc.).
 *
 * ## Features
 * - **Visual card-based selection**: Large clickable cards with icons
 * - **Icon mapping**: Lucide React icons loaded from database strings
 * - **Accessibility**: Full keyboard navigation and ARIA labels
 * - **Responsive design**: Mobile-first with proper touch targets
 * - **Form integration**: React Hook Form with validation
 *
 * ## User Flow
 * 1. User sees available glass solutions as cards
 * 2. Clicks/taps a solution to select it
 * 3. Selection updates form state via React Hook Form
 * 4. Triggers glass type filter in next step
 *
 * ## Accessibility
 * - Keyboard navigation with Tab/Enter/Space
 * - Screen reader support with proper ARIA labels
 * - Focus indicators for keyboard users
 * - Touch-friendly 44x44px minimum hit areas
 *
 * @param props - Component props
 * @param props.solutions - Array of available glass solutions from tRPC
 *
 * @see {@link GlassTypeSelectorSection} - Next step after solution selection
 * @see {@link useSolutionSelector} - Custom hook for selection logic
 */
export const SolutionSelectorSection = memo<SolutionSelectorSectionProps>(({ solutions }) => {
  const { control } = useFormContext();
  const { handleSolutionChange, isSolutionSelected } = useSolutionSelector({ solutions });

  // Map solution data with icons
  const solutionOptions = useMemo<SolutionOption[]>(
    () =>
      solutions.map((solution) => {
        // Get icon component using the mapping function
        const IconComponent = getSolutionIcon(solution.icon);

        return {
          description: solution.description ?? '',
          icon: IconComponent,
          id: solution.id,
          key: solution.key,
          name: solution.nameEs,
        };
      }),
    [solutions]
  );

  return (
    <FormSection
      className="space-y-6"
      description="Selecciona la solución que mejor se adapte a tus necesidades. Mostramos solo las opciones compatibles con este modelo."
      descriptionClassName="text-base"
      icon={Sparkles}
      legend="¿Qué necesitas para tu ventana?"
      legendClassName="font-bold text-2xl tracking-tight"
    >
      <FormField
        control={control}
        name="solution"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RadioGroup
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                onValueChange={(value) => {
                  field.onChange(value);
                  handleSolutionChange(value);
                }}
                value={field.value}
              >
                {solutionOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = isSolutionSelected(option.id);

                  return (
                    <div className="group relative" key={option.id}>
                      <RadioGroupItem className="peer sr-only" id={option.id} value={option.id} />
                      <Label
                        className={cn(
                          'flex cursor-pointer flex-col gap-4 rounded-xl border-2 p-6 transition-all duration-200',
                          'hover:scale-105 hover:border-primary/50 hover:shadow-lg',
                          'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                          'group-hover:bg-accent/5',
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                            : 'border-border bg-card'
                        )}
                        htmlFor={option.id}
                      >
                        {/* Icon and Title */}
                        <div className="flex flex-col items-start justify-center gap-3">
                          <div
                            className={cn(
                              'mx-auto flex size-14 shrink-0 items-center justify-center rounded-xl transition-colors',
                              isSelected
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                            )}
                          >
                            <Icon className="mx-auto size-7" />
                          </div>

                          {isSelected && (
                            <Badge className="fade-in zoom-in shrink-0 animate-in" variant="default">
                              Seleccionado
                            </Badge>
                          )}
                        </div>

                        {/* Solution Name */}
                        <div className="space-y-1">
                          <h3
                            className={cn(
                              'font-semibold text-lg leading-tight',
                              isSelected ? 'text-primary' : 'text-foreground'
                            )}
                          >
                            {option.name}
                          </h3>

                          {/* Description */}
                          {option.description && (
                            <p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
                              {option.description}
                            </p>
                          )}
                        </div>

                        {/* Visual indicator line */}
                        <div
                          className={cn(
                            '-bottom-3 absolute right-0 left-0 h-2 rounded-2xl rounded-b-xl transition-all duration-200',
                            isSelected ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/20'
                          )}
                        />
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Help text */}
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="space-y-1">
            <p className="font-medium text-blue-900 text-sm dark:text-blue-100">
              ¿No estás seguro qué solución elegir?
            </p>
            <p className="text-blue-700 text-sm dark:text-blue-300">
              Cada opción muestra cristales específicamente diseñados para esa necesidad. Puedes cambiar tu selección en
              cualquier momento.
            </p>
          </div>
        </div>
      </div>
    </FormSection>
  );
});

SolutionSelectorSection.displayName = 'SolutionSelectorSection';
