/**
 * Service Form Hook
 *
 * Manages form state and validation for Service entities.
 * Handles auto-assignment of unit based on service type.
 *
 * Responsibilities:
 * - Form initialization with default values
 * - Form validation with Zod schema
 * - Auto-assign unit when service type changes
 * - Form reset logic
 *
 * Pattern: Custom Hook - Single Responsibility (Form State Management)
 */

import { zodResolver } from "@hookform/resolvers/zod";
import type { Service, ServiceType, ServiceUnit } from "@/lib/types/prisma-types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createServiceSchema } from "@/lib/validations/admin/service.schema";

type FormValues = {
  name: string;
  type: ServiceType;
  unit: ServiceUnit;
  rate: number;
  minimumBillingUnit?: number | null;
};

type UseServiceFormProps = {
  mode: "create" | "edit";
  open: boolean;
  defaultValues?: Service;
};

/**
 * Map service type to unit
 * Fixed services are charged per unit, area per sqm, perimeter per ml
 */
const TYPE_TO_UNIT_MAP: Record<ServiceType, ServiceUnit> = {
  area: "sqm",
  fixed: "unit",
  perimeter: "ml",
};

export function useServiceForm({
  mode,
  open,
  defaultValues,
}: UseServiceFormProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      minimumBillingUnit: defaultValues?.minimumBillingUnit?.toNumber() ?? null,
      name: defaultValues?.name ?? "",
      rate: defaultValues?.rate?.toNumber() ?? 0,
      type: defaultValues?.type ?? "fixed",
      unit: defaultValues?.unit ?? "unit",
    },
    resolver: zodResolver(createServiceSchema),
  });

  // Watch type to show/hide minimumBillingUnit field
  const watchedType = form.watch("type");

  /**
   * Auto-assign unit based on service type
   * This ensures consistency between type and unit
   */
  const handleTypeChange = (type: ServiceType) => {
    form.setValue("type", type);
    form.setValue("unit", TYPE_TO_UNIT_MAP[type]);

    // Clear minimum when switching to fixed
    if (type === "fixed") {
      form.setValue("minimumBillingUnit", null);
    }
  };

  /**
   * Reset form when dialog state changes
   * - Opening with existing data: reset to that data
   * - Opening in create mode: reset to empty state
   */
  useEffect(() => {
    if (open && defaultValues) {
      form.reset({
        minimumBillingUnit:
          defaultValues.minimumBillingUnit?.toNumber() ?? null,
        name: defaultValues.name,
        rate: defaultValues.rate.toNumber(),
        type: defaultValues.type,
        unit: defaultValues.unit,
      });
    } else if (open && mode === "create") {
      form.reset({
        minimumBillingUnit: null,
        name: "",
        rate: 0,
        type: "fixed",
        unit: "unit",
      });
    }
  }, [open, defaultValues, mode, form]);

  return {
    form,
    handleTypeChange,
    watchedType,
  };
}

export type { FormValues };
