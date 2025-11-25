/**
 * BasicInfoSection Component (Organism)
 *
 * Form section for basic glass type information
 *
 * Fields:
 * - Name (required)
 * - Thickness (required)
 * - Price per sqm (required)
 * - Purpose (required)
 * - SKU (optional)
 * - Description (optional)
 * - Is Active (switch)
 *
 * @module _components/sections/basic-info-section
 */

"use client";

import type { Control, FieldValues } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormCheckboxField } from "../form-fields/form-checkbox-field";
import { FormNumberField } from "../form-fields/form-number-field";
import { FormTextareaField } from "../form-fields/form-textarea-field";

type BasicInfoSectionProps = {
  control: Control<FieldValues>;
};



/**
 * Basic information section component
 */
export function BasicInfoSection({ control }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
        {/* Switch placed in the top-right cell */}
        <div
          style={{
            alignSelf: "start",
            gridColumnStart: 2,
            gridRowStart: 1,
            justifySelf: "end",
          }}
        >
          <FormCheckboxField
            control={control}
            description="El tipo de vidrio está disponible para selección"
            label="Activo"
            name="isActive"
          />
        </div>
        {/* Name */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Vidrio Templado 6mm" {...field} />
              </FormControl>
              <FormDescription>
                Nombre descriptivo del tipo de vidrio
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Code */}
        <FormField
          control={control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: VT-6MM" {...field} />
              </FormControl>
              <FormDescription>
                Código único del producto
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Thickness */}
        <FormNumberField
          control={control}
          description="1-50mm"
          label="Espesor (mm)"
          max={50}
          min={1}
          name="thicknessMm"
          required
        />

        {/* Price per sqm */}
        <FormNumberField
          control={control}
          description="Precio de referencia"
          label="Precio por m²"
          min={0}
          name="pricePerSqm"
          required
          step={0.01}
        />

        {/* Description */}
        <FormTextareaField
          className="md:col-span-2"
          control={control}
          description="Información adicional (opcional)"
          label="Descripción"
          name="description"
          placeholder="Descripción detallada del tipo de vidrio..."
          rows={6}
        />
      </CardContent>
    </Card>
  );
}
