/**
 * Solution Selector Component
 *
 * Dynamic form component for managing glass type solutions using React Hook Form useFieldArray
 *
 * Features:
 * - Add/remove solutions dynamically
 * - Select solution from dropdown (populated via tRPC)
 * - Set performance rating (basic, standard, good, very_good, excellent)
 * - Mark one solution as primary (radio button behavior)
 * - Add optional notes for each solution
 *
 * Used in: glass-type-form.tsx (Create/Edit Glass Types)
 */

"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";

// Define PerformanceRating enum locally to match Prisma schema
const PerformanceRating = {
  basic: "basic",
  standard: "standard",
  good: "good",
  very_good: "very_good",
  excellent: "excellent",
} as const;

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CreateGlassTypeInput } from "@/lib/validations/admin/glass-type.schema";
import { api } from "@/trpc/react";

/**
 * Performance rating display labels
 */
const PERFORMANCE_LABELS: Record<string, string> = {
  basic: "Básico",
  excellent: "Excelente",
  good: "Bueno",
  standard: "Estándar",
  very_good: "Muy Bueno",
};

/**
 * Solution Selector Component
 */
export function SolutionSelector() {
  const form = useFormContext<CreateGlassTypeInput>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "solutions",
  });

  // Fetch active solutions via tRPC
  const { data: solutionsData, isLoading } = api.admin[
    "glass-solution"
  ].list.useQuery({
    isActive: "active",
    limit: 100,
    page: 1,
    sortBy: "sortOrder",
    sortOrder: "asc",
  });

  const solutions = solutionsData?.items ?? [];

  /**
   * Handle adding new solution
   */
  const handleAddSolution = () => {
    append({
      isPrimary: false,
      notes: undefined,
      performanceRating: PerformanceRating.standard,
      solutionId: "",
    });
  };

  /**
   * Handle setting primary solution (only one can be primary)
   */
  const handleSetPrimary = (index: number) => {
    const currentValues = form.getValues("solutions");
    const updatedValues = currentValues.map((solution, idx) => ({
      ...solution,
      isPrimary: idx === index,
    }));
    form.setValue("solutions", updatedValues);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg">Soluciones de Vidrio</h3>
          <p className="text-muted-foreground text-sm">
            Asigna soluciones (aislamiento, seguridad, etc.) con calificación de
            rendimiento
          </p>
        </div>
        <Button
          onClick={handleAddSolution}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Solución
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No hay soluciones asignadas. Haz clic en "Agregar Solución" para
            comenzar.
          </p>
        </div>
      )}

      {fields.map((solutionField, index) => (
        <div className="space-y-4 rounded-lg border p-4" key={solutionField.id}>
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Solución #{index + 1}</h4>
            <Button
              onClick={() => remove(index)}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Solution Selector */}
            <FormField
              control={form.control}
              name={`solutions.${index}.solutionId`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solución</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una solución" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {solutions.map(
                        (solution: { id: string; nameEs: string }) => (
                          <SelectItem key={solution.id} value={solution.id}>
                            {solution.nameEs}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Performance Rating Selector */}
            <FormField
              control={form.control}
              name={`solutions.${index}.performanceRating`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calificación de Rendimiento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona calificación" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PERFORMANCE_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Primary Solution Radio */}
          <FormField
            control={form.control}
            name={`solutions.${index}.isPrimary`}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      if (value === "true") {
                        handleSetPrimary(index);
                      }
                    }}
                    value={field.value ? "true" : "false"}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id={`primary-${index}`} value="true" />
                      <FormLabel
                        className="font-normal"
                        htmlFor={`primary-${index}`}
                      >
                        Solución principal
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormDescription className="mt-0">
                  Solo una solución puede ser marcada como principal
                </FormDescription>
              </FormItem>
            )}
          />

          {/* Notes Textarea */}
          <FormField
            control={form.control}
            name={`solutions.${index}.notes`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas (opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    className="resize-none"
                    placeholder="Notas adicionales sobre esta solución..."
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
}
