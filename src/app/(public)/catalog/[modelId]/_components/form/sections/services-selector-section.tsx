'use client';

import { Checkbox } from '@radix-ui/react-checkbox';
import { Wrench } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { FieldContent, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { getServiceTypeLabel, MOCK_SERVICES } from '../../../_utils/constants';

export function ServicesSelectorSection() {
  const { control } = useFormContext();

  return (
    <FieldSet>
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-primary" />
        <FieldLegend>Servicios Adicionales</FieldLegend>
      </div>
      <FieldDescription>Agrega servicios extra para personalizar tu ventana.</FieldDescription>
      <FieldContent>
        <FormField
          control={control}
          name="additionalServices"
          render={({ field }) => (
            <FormItem>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {MOCK_SERVICES.map((service) => {
                  const isSelected = (field.value as string[]).includes(service.id);

                  return (
                    <Card
                      className={`relative cursor-pointer p-4 transition-all hover:border-primary/50 ${isSelected ? 'border-primary bg-primary/5' : ''
                        }`}
                      key={service.id}
                      onClick={() => {
                        const currentValue = field.value as string[];
                        const updatedValue = isSelected
                          ? currentValue.filter((id) => id !== service.id)
                          : [ ...currentValue, service.id ];
                        field.onChange(updatedValue);
                      }}
                    >
                      <Checkbox checked={isSelected} className="pointer-events-none absolute top-3 right-3" />
                      <div className="space-y-2 pr-8">
                        <div className="font-medium text-sm">{service.name}</div>
                        <div className="text-muted-foreground text-xs leading-relaxed">{service.description}</div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-semibold text-sm">${service.price.toFixed(2)}</span>
                          <span className="text-muted-foreground text-xs">{getServiceTypeLabel(service.type)}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </FieldContent>
    </FieldSet>
  );
}
