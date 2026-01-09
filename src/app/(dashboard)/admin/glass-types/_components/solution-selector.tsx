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
 * Performance Optimizations:
 * - Extracted each field to SolutionFieldItem (prevents unnecessary re-renders)
 * - Memoized callbacks with useCallback
 * - Memoized performance labels (constant object)
 *
 * Used in: glass-type-form.tsx (Create/Edit Glass Types)
 */

"use client";

import { Plus } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { CreateGlassTypeInput } from "@/lib/validations/admin/glass-type.schema";
import { api } from "@/trpc/react";
import { SolutionFieldItem } from "./solution-field-item";

// Define PerformanceRating enum locally to match Prisma schema
const PerformanceRating = {
  basic: "basic",
  excellent: "excellent",
  good: "good",
  standard: "standard",
  very_good: "very_good",
} as const;

/**
 * Performance rating display labels (memoized constant)
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

  // Memoize solutions array to prevent unnecessary re-renders
  const solutions = useMemo(
    () => solutionsData?.items ?? [],
    [solutionsData?.items]
  );

  /**
   * Handle adding new solution (memoized to prevent re-creation)
   */
  const handleAddSolution = useCallback(() => {
    append({
      isPrimary: false,
      notes: undefined,
      performanceRating: PerformanceRating.standard,
      solutionId: "",
    });
  }, [append]);

  /**
   * Handle setting primary solution (memoized to prevent re-creation)
   * Only one can be primary
   */
  const handleSetPrimary = useCallback(
    (index: number) => {
      const currentValues = form.getValues("solutions");
      const updatedValues = currentValues.map((solution, idx) => ({
        ...solution,
        isPrimary: idx === index,
      }));
      form.setValue("solutions", updatedValues);
    },
    [form]
  );

  /**
   * Handle removing solution (memoized to prevent re-creation)
   */
  const handleRemove = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove]
  );

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
        <SolutionFieldItem
          key={solutionField.id}
          fieldId={solutionField.id}
          index={index}
          solutions={solutions}
          performanceLabels={PERFORMANCE_LABELS}
          isLoading={isLoading}
          onRemove={handleRemove}
          onSetPrimary={handleSetPrimary}
        />
      ))}
    </div>
  );
}
