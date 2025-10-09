'use client';

import type { LucideIcon } from 'lucide-react';
import { Gem, Home, Shield, Snowflake, Sparkles, Volume2, Zap } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormSection } from '@/components/form-section';
import { Badge } from '@/components/ui/badge';
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

  // Filter glass types by selected solution
  const filteredGlassTypes = useMemo(() => {
    if (!selectedSolutionId) return glassTypes;

    return glassTypes.filter((glassType) => glassType.solutions?.some((sol) => sol.solution.id === selectedSolutionId));
  }, [glassTypes, selectedSolutionId]);

  const glassOptions = useMemo(
    () =>
      filteredGlassTypes.map((glassType) => {
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

        // Get all solutions this glass belongs to
        const allSolutions = glassType.solutions?.map((s) => ({
          icon: s.solution.icon,
          isPrimary: s.isPrimary,
          name: s.solution.nameEs,
          rating: s.performanceRating,
        }));

        return {
          allSolutions,
          features,
          icon,
          id: glassType.id,
          name: glassType.name,
          performanceRating,
          priceIndicator,
          thicknessMm: glassType.thicknessMm,
          title,
        };
      }),
    [filteredGlassTypes, selectedSolutionId]
  );

  return (
    <FormSection
      description="Selecciona la solución de cristal que mejor se adapte a tus necesidades."
      icon={Gem}
      legend="Tipo de Cristal"
    >
      <FormField
        control={control}
        name="glassType"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RadioGroup className="grid gap-4 md:grid-cols-2" onValueChange={field.onChange} value={field.value}>
                {glassOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = field.value === option.id;

                  return (
                    <div className="relative" key={option.id}>
                      <RadioGroupItem className="peer sr-only" id={option.id} value={option.id} />
                      <Label
                        className={cn(
                          'flex cursor-pointer flex-col gap-4 rounded-lg border-2 p-6 transition-all hover:border-primary/50',
                          'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                          isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'
                        )}
                        htmlFor={option.id}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-lg',
                                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                              )}
                            >
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{option.title}</h4>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge className="text-xs" variant={isSelected ? 'default' : 'secondary'}>
                                  {priceLabels[option.priceIndicator]}
                                </Badge>
                                {option.performanceRating && (
                                  <PerformanceRatingBadge rating={option.performanceRating as PerformanceRating} />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm">{option.name}</p>

                        {/* Show all solutions this glass belongs to (if not filtered by solution) */}
                        {!selectedSolutionId && option.allSolutions && option.allSolutions.length > 1 && (
                          <div className="mt-2 border-t pt-3">
                            <p className="font-medium text-muted-foreground text-xs">Soluciones disponibles</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {option.allSolutions.map((sol, idx) => (
                                <Badge className="text-xs" key={idx} variant={sol.isPrimary ? 'default' : 'secondary'}>
                                  {sol.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {option.features.length > 0 && (
                          <div className="mt-2 border-t pt-3">
                            <p className="font-medium text-muted-foreground text-xs">Especificaciones técnicas</p>
                            <div className="mt-2 space-y-1 text-muted-foreground text-xs">
                              <p>Grosor: {option.thicknessMm}mm</p>
                              <p>Características: {option.features.join(', ')}</p>
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
