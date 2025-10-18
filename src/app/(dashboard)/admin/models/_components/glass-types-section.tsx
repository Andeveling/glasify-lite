/**
 * Glass Types Section
 *
 * Multi-select for compatible glass types
 */

'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { RouterOutputs } from '@/trpc/react';

type GlassType = RouterOutputs['admin']['glass-type']['list']['items'][number];

type GlassTypesSectionProps = {
  glassTypes: GlassType[];
};

export function GlassTypesSection({ glassTypes }: GlassTypesSectionProps) {
  const form = useFormContext();

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Tipos de Vidrio</CardTitle>
        <CardDescription>Selecciona los compatibles</CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="compatibleGlassTypeIds"
          render={() => (
            <FormItem>
              <div className="space-y-3">
                {glassTypes.map((glassType) => (
                  <FormField
                    control={form.control}
                    key={glassType.id}
                    name="compatibleGlassTypeIds"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 transition-colors hover:bg-muted/50">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(glassType.id)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value ?? [];
                              return checked
                                ? field.onChange([...currentValue, glassType.id])
                                : field.onChange(currentValue.filter((v: string) => v !== glassType.id));
                            }}
                          />
                        </FormControl>
                        <div className="flex-1 space-y-1 leading-none">
                          <FormLabel className="cursor-pointer font-normal">{glassType.name}</FormLabel>
                          <p className="text-muted-foreground text-xs">
                            {glassType.thicknessMm}mm
                            {glassType.glassSupplier && ` • ${glassType.glassSupplier.name}`}
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage className="mt-2" />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
