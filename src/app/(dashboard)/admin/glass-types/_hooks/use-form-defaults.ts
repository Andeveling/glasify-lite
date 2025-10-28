/**
 * useFormDefaults Hook
 *
 * Transforms GetGlassTypeByIdOutput to form-compatible defaults
 * Handles null/undefined values and type conversions
 *
 * @module _hooks/use-form-defaults
 */

import { useMemo } from "react";
import type {
  CreateGlassTypeInput,
  GetGlassTypeByIdOutput,
  GlassTypeCharacteristicInput,
} from "@/lib/validations/admin/glass-type.schema";

const DEFAULT_THICKNESS_MM = 6;

/**
 * Helper type for form defaults with proper optional handling
 */
type FormDefaults = Partial<CreateGlassTypeInput>;

/**
 * Transform characteristics array from backend to form format
 */
function transformCharacteristics(
  characteristics: GetGlassTypeByIdOutput["characteristics"]
): GlassTypeCharacteristicInput[] {
  return characteristics.map((c) => ({
    certification: c.certification ?? undefined,
    characteristicId: c.characteristicId,
    notes: c.notes ?? undefined,
    value: c.value ?? undefined,
  }));
}

/**
 * Convert nullable number to optional number
 */
function toOptionalNumber(
  value: number | null | undefined
): number | undefined {
  return value !== null && value !== undefined ? Number(value) : undefined;
}

/**
 * Default form values for create mode
 */
function getEmptyDefaults(): FormDefaults {
  return {
    characteristics: [],
    code: "",
    isActive: true,
    name: "",
    thicknessMm: DEFAULT_THICKNESS_MM,
  };
}

/**
 * Transform defaultValues to form-compatible defaults
 *
 * @param defaultValues - Optional glass type data from backend
 * @returns Form defaults with proper type conversions
 */
export function useFormDefaults(
  defaultValues?: GetGlassTypeByIdOutput
): FormDefaults {
  return useMemo(() => {
    if (!defaultValues) {
      return getEmptyDefaults();
    }

    return {
      characteristics: transformCharacteristics(defaultValues.characteristics),
      code: defaultValues.code ?? "",
      description: defaultValues.description ?? undefined,
      isActive: defaultValues.isActive ?? true,
      lightTransmission: toOptionalNumber(defaultValues.lightTransmission),
      manufacturer: defaultValues.manufacturer ?? undefined,
      name: defaultValues.name ?? "",
      series: defaultValues.series ?? undefined,
      solarFactor: toOptionalNumber(defaultValues.solarFactor),
      thicknessMm: defaultValues.thicknessMm ?? DEFAULT_THICKNESS_MM,
      uValue: toOptionalNumber(defaultValues.uValue),
    };
  }, [defaultValues]);
}
