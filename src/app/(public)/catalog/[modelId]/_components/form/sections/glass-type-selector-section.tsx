'use client';

import type { LucideIcon } from 'lucide-react';
import { Check, ChevronDown, Gem, Home, Shield, Snowflake, Sparkles, Volume2, Zap } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { formatCurrency } from '@/app/_utils/format-currency.util';
import { FormSection } from '@/components/form-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { PerformanceRatingBadge } from '@/components/ui/performance-rating-badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { GlassTypeOutput, PerformanceRating } from '@/server/api/routers/catalog';

type GlassTypeSelectorSectionProps = {
  glassTypes: GlassTypeOutput[];
  selectedSolutionId?: string;
};

type PriceIndicator = 'budget' | 'standard' | 'premium';

const PRICE_THRESHOLD_STANDARD = 50;
const PRICE_THRESHOLD_PREMIUM = 100;
const MAX_VISIBLE_OPTIONS = 3;
const PERFORMANCE_RATING_WEIGHTS: Record<string, number> = {
  basic: 1,
  excellent: 5,
  good: 3,
  standard: 2,
  veryGood: 4,
};

/**
 * Sort glass types by performance rating (best first)
 * Uses performance rating from the selected solution
 */
function sortByPerformance(
  glassTypes: GlassTypeOutput[],
  selectedSolutionId?: string
): Array<GlassTypeOutput & { isRecommended: boolean }> {
  const sorted = [...glassTypes].sort((a, b) => {
    const ratingA = selectedSolutionId
      ? a.solutions?.find((s) => s.solution.id === selectedSolutionId)?.performanceRating
      : a.solutions?.find((s) => s.isPrimary)?.performanceRating;

    const ratingB = selectedSolutionId
      ? b.solutions?.find((s) => s.solution.id === selectedSolutionId)?.performanceRating
      : b.solutions?.find((s) => s.isPrimary)?.performanceRating;

    const weightA = ratingA ? (PERFORMANCE_RATING_WEIGHTS[ratingA] ?? 0) : 0;
    const weightB = ratingB ? (PERFORMANCE_RATING_WEIGHTS[ratingB] ?? 0) : 0;

    // Sort by performance rating (highest first)
    if (weightB !== weightA) {
      return weightB - weightA;
    }

    // If same rating, sort by price (lowest first)
    return a.pricePerSqm - b.pricePerSqm;
  });

  // Mark top option as recommended
  return sorted.map((glass, index) => ({
    ...glass,
    isRecommended: index === 0 && sorted.length > 1,
  }));
}

// Icon mapping for solutions - Maps Lucide component names (from DB) to icon components
const getSolutionIcon = (iconName: string | null | undefined): LucideIcon => {
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
      return Home;
  }
};

const priceLabels: Record<PriceIndicator, string> = {
  budget: 'Económico',
  premium: 'Premium',
  standard: 'Estándar',
};

function getPriceIndicator(pricePerSqm: number): PriceIndicator {
  if (pricePerSqm > PRICE_THRESHOLD_PREMIUM) return 'premium';
  if (pricePerSqm > PRICE_THRESHOLD_STANDARD) return 'standard';
  return 'budget';
}

function buildGlassFeatures(glassType: GlassTypeOutput): string[] {
  const features: string[] = [];
  if (glassType.isTempered) features.push('Templado');
  if (glassType.isLaminated) features.push('Laminado');
  if (glassType.isLowE) features.push('Bajo emisivo (Low-E)');
  if (glassType.isTripleGlazed) features.push('Triple acristalamiento');
  return features;
}

export const GlassTypeSelectorSection = memo<GlassTypeSelectorSectionProps>(({ glassTypes, selectedSolutionId }) => {
  const { control } = useFormContext();
  const [showAllDetails, setShowAllDetails] = useState(false);

  // Filter glass types by selected solution
  const filteredGlassTypes = useMemo(() => {
    if (!selectedSolutionId) return glassTypes;

    return glassTypes.filter((glassType) => glassType.solutions?.some((sol) => sol.solution.id === selectedSolutionId));
  }, [glassTypes, selectedSolutionId]);

  // Sort by performance and mark recommended
  const sortedGlassTypes = useMemo(
    () => sortByPerformance(filteredGlassTypes, selectedSolutionId),
    [filteredGlassTypes, selectedSolutionId]
  );

  // Limit to top 3 options to reduce cognitive load
  const displayedGlassTypes = useMemo(() => sortedGlassTypes.slice(0, MAX_VISIBLE_OPTIONS), [sortedGlassTypes]);

  const glassOptions = useMemo(
    () =>
      displayedGlassTypes.map((glassType) => {
        // Get primary solution or first solution
        const primarySolution = glassType.solutions?.find((s) => s.isPrimary);
        const selectedSolutionData = selectedSolutionId
          ? glassType.solutions?.find((s) => s.solution.id === selectedSolutionId)
          : null;

        // Use selected solution if available, otherwise fallback to primary solution
        const solutionData =
          selectedSolutionData?.solution ?? primarySolution?.solution ?? glassType.solutions?.[0]?.solution;

        // Get icon component using the mapping function
        const icon = getSolutionIcon(solutionData?.icon);

        const title = solutionData?.nameEs ?? glassType.name;
        const features = buildGlassFeatures(glassType);
        const priceIndicator = getPriceIndicator(glassType.pricePerSqm);

        // Get performance rating for selected solution
        const performanceRating = selectedSolutionId
          ? glassType.solutions?.find((s) => s.solution.id === selectedSolutionId)?.performanceRating
          : primarySolution?.performanceRating;

        return {
          features,
          icon,
          id: glassType.id,
          isRecommended: glassType.isRecommended,
          name: glassType.name,
          performanceRating,
          priceIndicator,
          pricePerSqm: glassType.pricePerSqm,
          thicknessMm: glassType.thicknessMm,
          title,
        };
      }),
    [displayedGlassTypes, selectedSolutionId]
  );

  return (
    <FormSection
      description="Selecciona el tipo de cristal. Las opciones están ordenadas por mejor rendimiento para la solución que elegiste."
      icon={Gem}
      legend="Tipo de Cristal"
    >
      {/* Toggle for showing/hiding details */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Mostrando {glassOptions.length} {glassOptions.length === 1 ? 'opción' : 'opciones'}
        </p>
        <Button
          className="flex items-center gap-2"
          onClick={() => setShowAllDetails(!showAllDetails)}
          size="sm"
          type="button"
          variant="link"
        >
          {showAllDetails ? 'Ocultar' : 'Mostrar'} especificaciones
          <ChevronDown className={cn('size-4 transition-transform', showAllDetails && 'rotate-180')} />
        </Button>
      </div>

      <FormField
        control={control}
        name="glassType"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RadioGroup
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                onValueChange={field.onChange}
                value={field.value}
              >
                {glassOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = field.value === option.id;

                  return (
                    <div className="group relative" key={option.id}>
                      {/* Recommended badge */}
                      {option.isRecommended && (
                        <div className="-top-3 -right-2 absolute z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 font-bold text-white text-xs shadow-lg">
                          <Sparkles className="size-3" />
                          Recomendado
                        </div>
                      )}

                      <RadioGroupItem className="peer sr-only" id={option.id} value={option.id} />
                      <Label
                        className={cn(
                          'relative flex cursor-pointer flex-col gap-3 rounded-xl border-2 p-4 transition-all duration-200',
                          'hover:scale-[1.02] hover:border-primary/50 hover:shadow-md',
                          'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                          isSelected ? 'border-primary bg-primary/5 shadow-lg' : 'border-border bg-card'
                        )}
                        htmlFor={option.id}
                      >
                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-primary">
                            <Check className="size-4 text-primary-foreground" />
                          </div>
                        )}

                        {/* Header: Icon + Title */}
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground group-hover:bg-primary/10'
                            )}
                          >
                            <Icon className="size-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <h4 className={cn('font-semibold text-sm leading-tight', isSelected && 'text-primary')}>
                              {option.title}
                            </h4>
                            <p className="line-clamp-1 text-muted-foreground text-xs">{option.name}</p>
                          </div>
                        </div>

                        {/* Price and badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1">
                            <Badge className="text-xs" variant={isSelected ? 'default' : 'secondary'}>
                              {priceLabels[option.priceIndicator]}
                            </Badge>
                            {option.performanceRating && (
                              <PerformanceRatingBadge rating={option.performanceRating as PerformanceRating} />
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary text-sm">{formatCurrency(option.pricePerSqm)}</div>
                            <div className="text-muted-foreground text-xs">por m²</div>
                          </div>
                        </div>

                        {/* Progressive disclosure: Technical specs (only if showAllDetails or isSelected) */}
                        {(showAllDetails || isSelected) && option.features.length > 0 && (
                          <div className="fade-in slide-in-from-top-2 animate-in space-y-1 border-t pt-3">
                            <p className="font-medium text-muted-foreground text-xs">Características</p>
                            <div className="flex flex-wrap gap-1">
                              {option.features.map((feature, idx) => (
                                <Badge className="text-xs" key={idx} variant="outline">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
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
    </FormSection>
  );
});

GlassTypeSelectorSection.displayName = 'GlassTypeSelectorSection';
