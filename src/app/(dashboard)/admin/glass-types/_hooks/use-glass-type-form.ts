/**
 * useGlassTypeForm Hook
 *
 * Main form orchestration hook - combines form state, validation, and mutations
 *
 * @module _hooks/use-glass-type-form
 */

import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  type CreateGlassTypeInput,
  createGlassTypeSchema,
  type GetGlassTypeByIdOutput,
} from "@/lib/validations/admin/glass-type.schema";
import { useFormDefaults } from "./use-form-defaults";
import { useGlassTypeMutations } from "./use-glass-type-mutations";

type UseGlassTypeFormOptions = {
  mode: "create" | "edit";
  defaultValues?: GetGlassTypeByIdOutput;
  onSuccessCallback?: () => void;
};

/**
 * Form data type - uses z.output to get the type with defaults applied
 * This resolves the conflict between Zod's .default() and React Hook Form's strict typing
 */
type FormData = z.output<typeof createGlassTypeSchema>;

/**
 * Main form hook - orchestrates form state, validation and mutations
 *
 * @param options - Form configuration (mode, defaultValues, callbacks)
 * @returns Form instance, submit handler, and loading state
 */
export function useGlassTypeForm({
  mode,
  defaultValues,
  onSuccessCallback,
}: UseGlassTypeFormOptions) {
  const formDefaults = useFormDefaults(defaultValues);
  const { createMutation, updateMutation, isLoading } = useGlassTypeMutations({
    onSuccessCallback,
  });

  // Form uses output type (after Zod applies defaults)
  // Note: Explicit resolver typing avoids Zod/RHF type conflicts with .default()
  const form = useForm<FormData>({
    defaultValues: formDefaults as FormData,
    mode: "onChange",
    resolver: zodResolver(createGlassTypeSchema) as Resolver<FormData>,
  });

  const handleSubmit = (data: FormData) => {
    // Cast to input type for API (type is compatible after validation)
    const inputData = data as unknown as CreateGlassTypeInput;

    if (mode === "create") {
      createMutation.mutate(inputData);
    } else if (defaultValues) {
      updateMutation.mutate({
        data: inputData,
        id: defaultValues.id,
      });
    }
  };

  return {
    form,
    handleSubmit,
    isLoading,
  };
}
