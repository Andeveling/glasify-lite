'use client';

import { Home, Shield, Snowflake, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { FieldContent, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { GlassTypeOutput } from '@/server/api/routers/catalog';

type GlassTypeSelectorSectionProps = {
  glassTypes: GlassTypeOutput[];
};

type PriceIndicator = 'budget' | 'standard' | 'premium';

const PRICE_THRESHOLD_STANDARD = 50;
const PRICE_THRESHOLD_PREMIUM = 100;

const purposeIcons = {
  decorative: Sparkles,
  general: Home,
  insulation: Snowflake,
  security: Shield,
} as const;

const purposeLabels = {
  decorative: 'Estilo y Privacidad',
  general: 'Solución Estándar',
  insulation: 'Ahorro de Energía',
  security: 'Protección y Seguridad',
} as const;

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

export function GlassTypeSelectorSection({ glassTypes }: GlassTypeSelectorSectionProps) {
  const { control } = useFormContext();

  const glassOptions = useMemo(
    () =>
      glassTypes.map((glassType) => {
        const icon = purposeIcons[glassType.purpose] ?? Home;
        const title = purposeLabels[glassType.purpose] ?? glassType.name;
        const features = buildGlassFeatures(glassType);
        const priceIndicator = getPriceIndicator(glassType.pricePerSqm);

        return {
          features,
          icon,
          id: glassType.id,
          name: glassType.name,
          priceIndicator,
          thicknessMm: glassType.thicknessMm,
          title,
        };
      }),
    [glassTypes]
  );

  return (
    <FieldSet>
      <FieldLegend>Tipo de Cristal</FieldLegend>
      <FieldDescription>Selecciona la solución de cristal que mejor se adapte a tus necesidades.</FieldDescription>
      <FieldContent>
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
                                <Badge className="mt-1 text-xs" variant={isSelected ? 'default' : 'secondary'}>
                                  {priceLabels[option.priceIndicator]}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <p className="text-muted-foreground text-sm">{option.name}</p>

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
      </FieldContent>
    </FieldSet>
  );
}
