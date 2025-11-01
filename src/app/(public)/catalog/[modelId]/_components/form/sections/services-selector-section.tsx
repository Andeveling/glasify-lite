"use client";

import { CheckCircle2, Maximize2, Package, Ruler, Wrench } from "lucide-react";
import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { formatCurrency } from "@/app/_utils/format-currency.util";
import { FormSection } from "@/components/form-section";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

// Icon mapping based on ServiceUnit from schema
function getServiceIcon(unit: ServiceOutput["unit"]) {
  const iconClass = "size-10 shrink-0";
  switch (unit) {
    case "sqm": // Surface area
      return <Maximize2 className={iconClass} />;
    case "ml": // Perimeter/linear meters
      return <Ruler className={iconClass} />;
    case "unit": // Fixed unit
      return <Package className={iconClass} />;
    default:
      return <Wrench className={iconClass} />;
  }
}

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

/**
 * ServiceCard - Horizontal layout with toggle switch
 * Matches the design with icon based on unit type
 */
function ServiceCard({ control, service }: ServiceCardProps) {
  return (
    <FormField
      control={control}
      key={service.id}
      name="additionalServices"
      render={({ field }) => {
        const isChecked = field.value?.includes(service.id) ?? false;

        return (
          <FormItem>
            <Label
              className={cn(
                "flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-card p-4 transition-all duration-200",
                "hover:border-primary/50 hover:bg-accent/5",
                isChecked && "border-primary/30 bg-primary/5"
              )}
              htmlFor={`service-${service.id}`}
            >
              {/* Left: Icon + Content */}
              <div className="flex flex-1 items-center gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-md p-2 transition-colors",
                    isChecked ? "bg-primary/10 text-primary" : "bg-muted"
                  )}
                >
                  {getServiceIcon(service.unit)}
                </div>

                <div className="flex-1 space-y-0.5">
                  <h4 className="font-medium text-base leading-tight">
                    {service.name}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {getServiceTypeLabel(service.type)} —{" "}
                    {formatCurrency(service.rate)} por{" "}
                    {getServiceUnitLabel(service.unit)}
                  </p>
                </div>
              </div>

              {/* Right: Toggle Switch */}
              <FormControl className="mr-4">
                <Switch
                  checked={isChecked}
                  className="scale-150"
                  id={`service-${service.id}`}
                  onCheckedChange={(checked) => {
                    const currentValue = field.value || [];
                    const newValue = checked
                      ? [...currentValue, service.id]
                      : currentValue.filter((id: string) => id !== service.id);
                    field.onChange(newValue);
                  }}
                />
              </FormControl>
            </Label>
          </FormItem>
        );
      }}
    />
  );
}

/**
 * ServicesSelectorSection - Horizontal layout with toggle switches
 *
 * ## Características del diseño:
 * - **Layout vertical**: Cards apilados en una columna
 * - **Toggle switches**: Switch component a la derecha
 * - **Iconos dinámicos**: Basados en ServiceUnit (sqm → Maximize2, ml → Ruler, unit → Package)
 * - **Feedback visual sutil**: Hover y estados de selección discretos
 * - **Texto descriptivo**: Tipo de servicio + precio por unidad en subtitle
 * - **Contador de selección**: Badge mostrando servicios seleccionados
 * - **Estimación de costo**: Suma total de servicios seleccionados
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

  // Calculate total estimated cost and count
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

  const selectedCount = selectedServicesList.length;
  const estimatedTotal = costPerUnit * quantity;

  return (
    <FormSection
      // description="Añade los extras que necesites para completar tu pedido."
      icon={Wrench}
      legend="Servicios Adicionales"
    >
      <FormField
        control={control}
        name="additionalServices"
        render={() => (
          <FormItem>
            <div className="space-y-3">
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
        <div className="mt-4 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" />
            <p className="text-primary text-sm">
              <strong className="font-semibold">{selectedCount}</strong>{" "}
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
