/**
 * Step 4: Services Selector
 * Multi-select checkbox list for optional services
 */

"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { WizardFormData } from "../../../_utils/wizard-form.utils";

type Service = {
  id: string;
  name: string;
  type: "area" | "perimeter" | "fixed";
  unit: "unit" | "sqm" | "ml";
  rate: number;
};

type ServicesStepProps = {
  form: UseFormReturn<WizardFormData>;
  availableServices: Service[];
};

/**
 * Get service type label in Spanish
 */
function getServiceTypeLabel(type: Service["type"]): string {
  switch (type) {
    case "area":
      return "Por área";
    case "perimeter":
      return "Por perímetro";
    case "fixed":
      return "Fijo";
    default:
      return "Desconocido";
  }
}

/**
 * Get service unit label
 */
function getServiceUnitLabel(unit: Service["unit"]): string {
  switch (unit) {
    case "sqm":
      return "m²";
    case "ml":
      return "ml";
    case "unit":
      return "unidad";
    default:
      return "unidad";
  }
}

/**
 * ServicesStep Component
 * Step 4 of wizard - optional services selection
 */
export function ServicesStep({ form, availableServices }: ServicesStepProps) {
  const selectedServices = form.watch("selectedServices") ?? [];

  const handleServiceToggle = (serviceId: string, isChecked: boolean) => {
    const updatedServices = isChecked
      ? [...selectedServices, serviceId]
      : selectedServices.filter((id: string) => id !== serviceId);

    form.setValue("selectedServices", updatedServices, {
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-2">
        <h3 className="font-medium text-base md:text-lg">Servicios adicionales</h3>
        <p className="text-muted-foreground text-sm md:text-base">
          Selecciona servicios opcionales para complementar tu ventana (puedes
          elegir varios)
        </p>
      </div>

      {availableServices.length > 0 ? (
        <div className="space-y-4">
          {availableServices.map((service) => {
            const isSelected = selectedServices.includes(service.id);

            return (
              <Label
                className="cursor-pointer"
                htmlFor={`service-${service.id}`}
                key={service.id}
              >
                <Card
                  className={cn(
                    "transition-all hover:border-primary",
                    isSelected && "border-primary bg-primary/5"
                  )}
                >
                  <CardHeader className="space-y-3 p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-base md:text-lg">
                          {service.name}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm md:text-base">
                          Tipo: {getServiceTypeLabel(service.type)}
                        </CardDescription>
                      </div>
                      <Checkbox
                        checked={isSelected}
                        className="min-h-[44px] min-w-[44px]"
                        id={`service-${service.id}`}
                        onCheckedChange={(checked) =>
                          handleServiceToggle(service.id, checked === true)
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium text-muted-foreground text-sm">
                      ${service.rate.toFixed(2)} /{" "}
                      {getServiceUnitLabel(service.unit)}
                    </p>
                  </CardContent>
                </Card>
              </Label>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">
            No hay servicios adicionales disponibles para este modelo.
          </p>
        </div>
      )}

      {selectedServices.length > 0 && (
        <div className="rounded-md bg-muted p-3">
          <p className="text-muted-foreground text-sm">
            {selectedServices.length} servicio
            {selectedServices.length > 1 ? "s" : ""} seleccionado
            {selectedServices.length > 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
