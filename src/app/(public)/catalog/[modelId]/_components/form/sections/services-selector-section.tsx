'use client';

import { Wrench } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldContent, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn, formatCurrency } from '@/lib/utils';
import type { ServiceOutput } from '@/server/api/routers/catalog';

type ServicesSelectorSectionProps = {
  services: ServiceOutput[];
};

const SERVICE_TYPE_LABELS = {
  area: 'Superficie',
  fixed: 'Fijo',
  perimeter: 'Perímetro',
} as const;

const SERVICE_UNIT_LABELS = {
  ml: 'metro lineal',
  sqm: 'm²',
  unit: 'unidad',
} as const;

function getServiceTypeLabel(type: ServiceOutput['type']): string {
  return SERVICE_TYPE_LABELS[type];
}

function getServiceUnitLabel(unit: ServiceOutput['unit']): string {
  return SERVICE_UNIT_LABELS[unit];
}

export function ServicesSelectorSection({ services }: ServicesSelectorSectionProps) {
  const { control } = useFormContext();
  return (
    <FieldSet>
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-primary" />
        <FieldLegend>Servicios Adicionales</FieldLegend>
      </div>
      <FieldDescription>Selecciona los servicios extra que desees agregar a tu compra.</FieldDescription>
      <FieldContent>
        <FormField
          control={control}
          name="additionalServices"
          render={() => (
            <FormItem>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {services.map((service) => (
                  <FormField
                    control={control}
                    key={service.id}
                    name="additionalServices"
                    render={({ field }) => {
                      const isChecked = field.value?.includes(service.id) ?? false;

                      return (
                        <FormItem
                          className={cn(
                            'flex items-start gap-3 rounded-lg border p-4 transition-colors',
                            isChecked && 'border-primary bg-primary/5'
                          )}
                        >
                          <FormControl>
                            <Checkbox
                              checked={isChecked}
                              className="size-6"
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                const newValue = checked
                                  ? [...currentValue, service.id]
                                  : currentValue.filter((id: string) => id !== service.id);
                                field.onChange(newValue);
                              }}
                            />
                          </FormControl>
                          <div className="flex-1 space-y-2">
                            <FormLabel className="flex cursor-pointer items-center gap-2 font-medium text-sm leading-none">
                              {service.name}
                              <Badge className="text-xs" variant="outline">
                                {getServiceTypeLabel(service.type)}
                              </Badge>
                            </FormLabel>
                            <div className="flex items-baseline gap-2 text-muted-foreground text-xs">
                              <span className="font-semibold text-foreground text-sm">
                                {formatCurrency(service.rate)}
                              </span>
                              <span>por {getServiceUnitLabel(service.unit)}</span>
                            </div>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </FieldContent>
    </FieldSet>
  );
}
