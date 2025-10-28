"use client";

import { CheckCircle2, Wrench } from "lucide-react";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { formatCurrency } from "@/app/_utils/format-currency.util";
import { FormSection } from "@/components/form-section";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { ServiceOutput } from "@/server/api/routers/catalog";

type ServicesSelectorSectionProps = {
  services: ServiceOutput[];
};

const SERVICE_TYPE_LABELS = {
  area: "Superficie",
  fixed: "Fijo",
  perimeter: "Perímetro",
} as const;

const SERVICE_UNIT_LABELS = {
  ml: "metro lineal",
  sqm: "m²",
  unit: "unidad",
} as const;

// Constants for dimension conversions
const MM_TO_METERS = 1000;
const PERIMETER_MULTIPLIER = 2;

function getServiceTypeLabel(type: ServiceOutput["type"]): string {
  return SERVICE_TYPE_LABELS[type];
}

function getServiceUnitLabel(unit: ServiceOutput["unit"]): string {
  return SERVICE_UNIT_LABELS[unit];
}

type ServiceCardProps = {
  control: Control;
  service: ServiceOutput;
};

function ServiceCard({ control, service }: ServiceCardProps) {
  return (
    <FormField
      control={control}
      key={service.id}
      name="additionalServices"
      render={({ field }) => {
        const isChecked = field.value?.includes(service.id) ?? false;

        const cardClasses = cn(
          "group relative flex items-start gap-3 rounded-lg border-2 p-4 transition-all duration-200",
          "hover:border-primary/50 hover:shadow-md",
          isChecked
            ? "border-primary bg-primary/10 shadow-primary/20 shadow-sm ring-2 ring-primary/20"
            : "border-border bg-card hover:bg-accent/5"
        );

        const labelClasses = cn(
          "cursor-pointer font-medium text-base leading-tight transition-colors",
          isChecked ? "text-primary" : "text-foreground"
        );

        const priceClasses = cn(
          "font-bold text-lg transition-colors",
          isChecked ? "text-primary" : "text-foreground"
        );

        const indicatorClasses = cn(
          "-bottom-1 absolute right-0 left-0 h-1 rounded-b-lg transition-all duration-200",
          isChecked ? "bg-primary" : "bg-transparent group-hover:bg-primary/20"
        );

        return (
          <FormItem className={cardClasses}>
            <FormControl>
              <Checkbox
                checked={isChecked}
                className="mt-0.5 size-5 transition-all duration-200"
                id={`service-checkbox-${service.id}`}
                onCheckedChange={(checked) => {
                  const currentValue = field.value || [];
                  const newValue = checked
                    ? [...currentValue, service.id]
                    : currentValue.filter((id: string) => id !== service.id);
                  field.onChange(newValue);
                }}
              />
            </FormControl>
            <label
              className="flex-1 cursor-pointer space-y-2"
              htmlFor={`service-checkbox-${service.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={labelClasses}>{service.name}</span>
                {isChecked && (
                  <Badge
                    className="fade-in zoom-in shrink-0 animate-in"
                    variant="default"
                  >
                    Seleccionado
                  </Badge>
                )}
              </div>

              <Badge className="text-xs" variant="outline">
                {getServiceTypeLabel(service.type)}
              </Badge>

              <div className="flex items-baseline gap-2 pt-1">
                <span className={priceClasses}>
                  {formatCurrency(service.rate)}
                </span>
                <span className="text-muted-foreground text-xs">
                  por {getServiceUnitLabel(service.unit)}
                </span>
              </div>
            </label>

            {/* Visual indicator line */}
            <div className={indicatorClasses} />
          </FormItem>
        );
      }}
    />
  );
}

/**
 * ServicesSelectorSection - Enhanced UX
 *
 * ## Mejoras implementadas:
 * - **Cards interactivos completos**: Todo el card es clickeable
 * - **Feedback visual claro**: Hover, selección, transiciones suaves
 * - **Contador de selección**: Badge mostrando servicios seleccionados
 * - **Estimación de costo**: Suma total de servicios seleccionados
 * - **Affordance mejorada**: Estados hover evidentes con shadow
 * - **Animaciones sutiles**: Transiciones duration-200 consistentes
 * - **Accesibilidad**: Labels, keyboard navigation, focus indicators
 */
export function ServicesSelectorSection({
  services,
}: ServicesSelectorSectionProps) {
  const { control, watch } = useFormContext();
  const selectedServices = watch("additionalServices") || [];

  // Watch dimensions and quantity for accurate calculations
  const width = watch("width") ?? 0;
  const height = watch("height") ?? 0;
  const quantity = watch("quantity") ?? 1;

  // Calculate measurements
  const area = useMemo(() => {
    const hasValidDimensions = width > 0 && height > 0;
    if (!hasValidDimensions) {
      return 0;
    }
    return (width / MM_TO_METERS) * (height / MM_TO_METERS); // Convert mm to m²
  }, [width, height]);

  const perimeter = useMemo(() => {
    const hasValidDimensions = width > 0 && height > 0;
    if (!hasValidDimensions) {
      return 0;
    }
    return (
      PERIMETER_MULTIPLIER * (width / MM_TO_METERS + height / MM_TO_METERS)
    ); // Convert mm to meters
  }, [width, height]);

  // Calculate total estimated cost and total
  const { selectedCount, estimatedTotal } = useMemo(() => {
    const selectedServicesList = services.filter((s) =>
      selectedServices.includes(s.id)
    );

    const costPerUnit = selectedServicesList.reduce((sum, service) => {
      switch (service.unit) {
        case "sqm":
          return sum + service.rate * area;
        case "ml":
          return sum + service.rate * perimeter;
        case "unit":
          return sum + service.rate;
        default:
          return sum;
      }
    }, 0);

    return {
      estimatedTotal: costPerUnit * quantity,
      selectedCount: selectedServicesList.length,
    };
  }, [services, selectedServices, area, perimeter, quantity]);

  return (
    <FormSection
      description="Selecciona los servicios extra que desees agregar a tu cotización."
      icon={Wrench}
      legend="Servicios Adicionales"
    >
      <FormField
        control={control}
        name="additionalServices"
        render={() => (
          <FormItem>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {services.map((service) => (
                <ServiceCard
                  control={control}
                  key={service.id}
                  service={service}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Selection Summary */}
      {selectedCount > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <p className="text-primary text-sm">
              <strong>{selectedCount}</strong>{" "}
              {selectedCount === 1
                ? "servicio seleccionado"
                : "servicios seleccionados"}
            </p>
          </div>
          <p className="font-semibold text-primary text-sm">
            +{formatCurrency(estimatedTotal)}{" "}
            <span className="font-normal opacity-70">base</span>
          </p>
        </div>
      )}
    </FormSection>
  );
}
