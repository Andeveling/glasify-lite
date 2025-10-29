/**
 * Step 5: Summary View
 * Read-only summary of all wizard selections before submission
 */

"use client";

import type { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MM_TO_SQM } from "../../../_constants/wizard-config.constants";
import type { WizardFormData } from "../../../_utils/wizard-form.utils";

type GlassSolution = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  name: string;
};

type SummaryStepProps = {
  form: UseFormReturn<WizardFormData>;
  glassSolution?: GlassSolution;
  selectedServices?: Service[];
  calculatedPrice?: number;
};

/**
 * SummaryStep Component
 * Step 5 of wizard - summary before adding to budget
 */
export function SummaryStep({
  form,
  glassSolution,
  selectedServices = [],
  calculatedPrice,
}: SummaryStepProps) {
  const formData = form.watch();
  const area =
    formData.width && formData.height
      ? ((formData.width * formData.height) / MM_TO_SQM).toFixed(2)
      : "0.00";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-medium text-base">Resumen de tu selección</h3>
        <p className="text-muted-foreground text-sm">
          Verifica los detalles antes de agregar al presupuesto
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalles del vidrio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          {formData.roomLocation && (
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Ubicación:</span>
              <span className="font-medium text-sm">
                {formData.roomLocation}
              </span>
            </div>
          )}

          {/* Dimensions */}
          {formData.width && formData.height && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Dimensiones:
                </span>
                <span className="font-medium text-sm">
                  {formData.width} mm × {formData.height} mm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Área:</span>
                <span className="font-medium text-sm">{area} m²</span>
              </div>
            </>
          )}

          <Separator />

          {/* Glass Solution */}
          {glassSolution && (
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">
                Tipo de vidrio:
              </span>
              <span className="font-medium text-sm">{glassSolution.name}</span>
            </div>
          )}

          {/* Selected Services */}
          {selectedServices.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Servicios adicionales:
                </p>
                <ul className="space-y-1">
                  {selectedServices.map((service) => (
                    <li className="font-medium text-sm" key={service.id}>
                      • {service.name}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Calculated Price */}
          {calculatedPrice !== undefined && calculatedPrice > 0 && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground text-sm">
                  Precio estimado:
                </span>
                <span className="font-bold text-lg text-primary">
                  ${calculatedPrice.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="rounded-md bg-muted p-4">
        <p className="text-muted-foreground text-sm">
          Al agregar al presupuesto, podrás continuar cotizando más ventanas o
          solicitar una cotización formal.
        </p>
      </div>
    </div>
  );
}
