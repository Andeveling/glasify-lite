/**
 * useFormDefaults Hook
 *
 * Transforms GetGlassTypeByIdOutput to form-compatible defaults
 * Handles null/undefined values and type conversions
 *
 * @module _hooks/use-form-defaults
 */

import type { GlassPurpose } from '@prisma/client';
import { useMemo } from 'react';
import type {
  CreateGlassTypeInput,
  GetGlassTypeByIdOutput,
  GlassTypeCharacteristicInput,
  GlassTypeSolutionInput,
} from '@/lib/validations/admin/glass-type.schema';

const DEFAULT_THICKNESS_MM = 6;

/**
 * Helper type for form defaults with proper optional handling
 */
type FormDefaults = Partial<CreateGlassTypeInput>;

/**
 * Transform characteristics array from backend to form format
 */
function transformCharacteristics(
  characteristics: GetGlassTypeByIdOutput['characteristics']
): GlassTypeCharacteristicInput[] {
  return characteristics.map((c) => ({
    certification: c.certification ?? undefined,
    characteristicId: c.characteristicId,
    notes: c.notes ?? undefined,
    value: c.value ?? undefined,
  }));
}

/**
 * Transform solutions array from backend to form format
 */
function transformSolutions(solutions: GetGlassTypeByIdOutput['solutions']): GlassTypeSolutionInput[] {
  return solutions.map((s) => ({
    isPrimary: s.isPrimary,
    notes: s.notes ?? undefined,
    performanceRating: s.performanceRating,
    solutionId: s.solutionId,
  }));
}

/**
 * Convert nullable number to optional number
 */
function toOptionalNumber(value: number | null | undefined): number | undefined {
  return value !== null && value !== undefined ? Number(value) : undefined;
}

/**
 * Default form values for create mode
 */
function getEmptyDefaults(): FormDefaults {
  return {
    characteristics: [],
    isActive: true,
    name: '',
    pricePerSqm: 0,
    purpose: 'general' as GlassPurpose,
    solutions: [],
    thicknessMm: DEFAULT_THICKNESS_MM,
  };
}

/**
 * Transform defaultValues to form-compatible defaults
 *
 * @param defaultValues - Optional glass type data from backend
 * @returns Form defaults with proper type conversions
 */
export function useFormDefaults(defaultValues?: GetGlassTypeByIdOutput): FormDefaults {
  return useMemo(() => {
    if (!defaultValues) {
      return getEmptyDefaults();
    }

    return {
      characteristics: transformCharacteristics(defaultValues.characteristics),
      description: defaultValues.description ?? undefined,
      glassSupplierId: defaultValues.glassSupplierId ?? undefined,
      isActive: defaultValues.isActive ?? true,
      lastReviewDate: defaultValues.lastReviewDate ?? undefined,
      lightTransmission: toOptionalNumber(defaultValues.lightTransmission),
      name: defaultValues.name ?? '',
      pricePerSqm: toOptionalNumber(defaultValues.pricePerSqm) ?? 0,
      purpose: (defaultValues.purpose as GlassPurpose) ?? 'general',
      sku: defaultValues.sku ?? undefined,
      solarFactor: toOptionalNumber(defaultValues.solarFactor),
      solutions: transformSolutions(defaultValues.solutions),
      thicknessMm: defaultValues.thicknessMm ?? DEFAULT_THICKNESS_MM,
      uValue: toOptionalNumber(defaultValues.uValue),
    };
  }, [defaultValues]);
}
