'use client';

import { useFormContext } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { FieldContent, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { glassOptions, priceLabels } from '../../../_utils/constants';

export function GlassTypeSelectorSection() {
  const { control } = useFormContext();

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
                                  {priceLabels[ option.priceIndicator ]}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <p className="text-muted-foreground text-sm">{option.description}</p>

                          <ul className="space-y-2">
                            {option.benefits.map((benefit) => (
                              <li className="flex items-start gap-2 text-sm" key={benefit}>
                                <span className="mt-0.5 text-primary">✓</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>

                          {option.technicalSpecs && (
                            <div className="mt-2 border-t pt-3">
                              <details className="group">
                                <summary className="cursor-pointer font-medium text-muted-foreground text-xs hover:text-foreground">
                                  Especificaciones técnicas
                                </summary>
                                <div className="mt-2 space-y-1 text-muted-foreground text-xs">
                                  <p>Grosor: {option.technicalSpecs.thickness}</p>
                                  <p>Características: {option.technicalSpecs.features.join(', ')}</p>
                                </div>
                              </details>
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
