/**
 * Model Cost Breakdown Component (US9 - T086)
 *
 * React Hook Form useFieldArray component for managing dynamic cost components
 * Shown in separate section on edit page
 *
 * Features:
 * - Add/remove cost breakdown items
 * - Component name, cost type, unit cost, notes fields
 * - Real-time validation
 * - Spanish UI text
 */

"use client";

import type { CostType } from "@/lib/types/prisma-types";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CostBreakdownItem = {
  component: string;
  costType: CostType;
  unitCost: number;
  notes?: string;
};

type ModelCostBreakdownProps = {
  modelId?: string;
  readOnly?: boolean;
};

/**
 * Cost type labels (Spanish)
 */
// Map CostType enum to localized labels
function getCostTypeLabel(type: CostType) {
  switch (type) {
    case "fixed":
      return "Fijo";
    case "per_mm_height":
      return "Por mm de alto";
    case "per_mm_width":
      return "Por mm de ancho";
    case "per_sqm":
      return "Por m²";
    default:
      return type;
  }
}

/**
 * Cost type descriptions
 */
function getCostTypeDescription(type: CostType) {
  switch (type) {
    case "fixed":
      return "Costo fijo independiente de las dimensiones";
    case "per_mm_height":
      return "Costo calculado por milímetro de altura";
    case "per_mm_width":
      return "Costo calculado por milímetro de ancho";
    case "per_sqm":
      return "Costo calculado por metro cuadrado";
    default:
      return "";
  }
}

export function ModelCostBreakdown({
  readOnly = false,
}: ModelCostBreakdownProps) {
  const form = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "costBreakdown",
  });

  const handleAddComponent = () => {
    append({
      component: "",
      costType: "fixed",
      notes: "",
      unitCost: 0,
    } satisfies CostBreakdownItem);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desglose de Costos</CardTitle>
        <CardDescription>
          Define los componentes de costo de este modelo (perfiles, herrajes,
          mano de obra, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No hay componentes de costo definidos.</p>
            {!readOnly && (
              <Button
                className="mt-4"
                onClick={handleAddComponent}
                type="button"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Componente
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {fields.map((entry, index) => (
              <Card className="border-muted" key={entry.id}>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    {/* Component Name */}
                    <FormField
                      control={form.control}
                      name={`costBreakdown.${index}.component`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Componente *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={readOnly}
                              placeholder="ej. perfil_vertical, herrajes, mano_obra"
                            />
                          </FormControl>
                          <FormDescription>
                            Identificador del componente de costo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Cost Type */}
                      <FormField
                        control={form.control}
                        name={`costBreakdown.${index}.costType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Costo *</FormLabel>
                            <Select
                              defaultValue={field.value}
                              disabled={readOnly}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona el tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(
                                  [
                                    "fixed",
                                    "per_mm_width",
                                    "per_mm_height",
                                    "per_sqm",
                                  ] as CostType[]
                                ).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {getCostTypeLabel(type)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {field.value &&
                                getCostTypeDescription(field.value as CostType)}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Unit Cost */}
                      <FormField
                        control={form.control}
                        name={`costBreakdown.${index}.unitCost`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Costo Unitario *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={readOnly}
                                min="0"
                                onChange={(e) =>
                                  field.onChange(
                                    Number.parseFloat(e.target.value)
                                  )
                                }
                                placeholder="0.00"
                                step="0.01"
                                type="number"
                              />
                            </FormControl>
                            <FormDescription>
                              Costo en la moneda del fabricante
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name={`costBreakdown.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              disabled={readOnly}
                              placeholder="Notas adicionales sobre este componente..."
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Remove Button */}
                    {!readOnly && (
                      <div className="flex justify-end">
                        <Button
                          onClick={() => remove(index)}
                          size="sm"
                          type="button"
                          variant="destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar Componente
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {!readOnly && (
              <Button
                className="w-full"
                onClick={handleAddComponent}
                type="button"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Componente
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
