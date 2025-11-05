"use client";

import { Maximize2, Package, Ruler, Wrench } from "lucide-react";
import type { Control } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { FormSection } from "@/components/form-section";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/format";
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
  const { control } = useFormContext();

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
    </FormSection>
  );
}
