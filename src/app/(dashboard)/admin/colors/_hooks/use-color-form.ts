/**
 * useColorForm Hook
 *
 * Main form orchestration hook - combines form state, validation, and mutations
 *
 * @module admin/colors/_hooks/use-color-form
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  type ColorCreateInput,
  type ColorUpdateInput,
  colorCreateSchema,
} from "@/lib/validations/color";
import { useColorMutations } from "./use-color-mutations";

type UseColorFormOptions = {
  mode: "create" | "edit";
  defaultValues?: ColorUpdateInput & { id: string };
  onSuccessCallback?: () => void;
};

/**
 * Main form hook - orchestrates form state, validation and mutations
 *
 * @param options - Form configuration (mode, defaultValues, callbacks)
 * @returns Form instance, submit handler, and loading state
 */
export function useColorForm({
  mode,
  defaultValues,
  onSuccessCallback,
}: UseColorFormOptions) {
  const { createMutation, updateMutation, isLoading } = useColorMutations({
    onSuccessCallback,
  });

  const form = useForm<ColorCreateInput>({
    defaultValues: defaultValues ?? {
      hexCode: "#000000",
      isActive: true,
      name: "",
      ralCode: null,
    },
    mode: "onChange",
    resolver: zodResolver(colorCreateSchema) as any,
  });

  const onSubmit = (data: ColorCreateInput) => {
    if (mode === "create") {
      createMutation.mutate(data);
    } else if (defaultValues) {
      updateMutation.mutate({
        id: defaultValues.id,
        ...data,
      });
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
  };
}
