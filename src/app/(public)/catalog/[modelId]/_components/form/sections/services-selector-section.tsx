'use client';

import { Wrench } from 'lucide-react';
import { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldContent, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { ServiceOutput } from '@/server/api/routers/catalog';

type ServicesSelectorSectionProps = {
  services: ServiceOutput[];
};

type ServiceType = 'area' | 'perimeter' | 'fixed';
type ServiceUnit = 'unit' | 'sqm' | 'ml';

const serviceTypeLabels: Record<ServiceType, string> = {
  area: 'por superficie',
  fixed: 'costo fijo',
  perimeter: 'por perímetro',
};

const serviceUnitLabels: Record<ServiceUnit, string> = {
  ml: 'por metro lineal',
  sqm: 'por m²',
  unit: 'por unidad',
};

function getServiceLabel(type: ServiceType, unit: ServiceUnit): string {
  return type === 'fixed' ? serviceTypeLabels[type] : serviceUnitLabels[unit];
}

// Memoized Service Card Component
type ServiceCardProps = {
  service: ServiceOutput;
  isSelected: boolean;
  onToggle: (checked: boolean) => void;
  serviceLabel: string;
};

const ServiceCard = memo<ServiceCardProps>(
  ({ service, isSelected, onToggle, serviceLabel }) => (
    <Card
      className={cn(
        'relative cursor-pointer p-4 transition-all hover:border-primary/50',
        isSelected && 'border-primary bg-primary/5'
      )}
      onClick={() => onToggle(!isSelected)}
    >
      <div className="absolute top-3 right-3">
        <Checkbox checked={isSelected} onCheckedChange={onToggle} />
      </div>
      <div className="space-y-2 pr-8">
        <div className="font-medium text-sm">{service.name}</div>
        <div className="text-muted-foreground text-xs leading-relaxed">Servicio de {serviceLabel}</div>
        <div className="flex items-baseline gap-1">
          <span className="font-semibold text-sm">${service.rate.toFixed(2)}</span>
          <span className="text-muted-foreground text-xs">{serviceLabel}</span>
        </div>
      </div>
    </Card>
  ),
  // Custom comparison: only re-render if isSelected or service changes
  (prevProps, nextProps) =>
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.service.id === nextProps.service.id &&
    prevProps.serviceLabel === nextProps.serviceLabel
);

ServiceCard.displayName = 'ServiceCard';

export function ServicesSelectorSection({ services }: ServicesSelectorSectionProps) {
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
          render={({ field }) => {
            // ✅ Optimization: Convert array to Set for O(1) lookup instead of O(n)
            const selectedSet = new Set(field.value as string[]);

            return (
              <FormItem>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => {
                    // ✅ Optimization: Pre-calculate service label outside render
                    const serviceLabel = getServiceLabel(service.type, service.unit);
                    const isSelected = selectedSet.has(service.id);

                    // ✅ Handler created per service to avoid passing field.onChange deeply
                    const handleToggle = (checked: boolean) => {
                      const updatedValue = checked
                        ? [...(field.value as string[]), service.id]
                        : (field.value as string[]).filter((id) => id !== service.id);
                      field.onChange(updatedValue);
                    };

                    return (
                      <ServiceCard
                        isSelected={isSelected}
                        key={service.id}
                        onToggle={handleToggle}
                        service={service}
                        serviceLabel={serviceLabel}
                      />
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </FieldContent>
    </FieldSet>
  );
}
