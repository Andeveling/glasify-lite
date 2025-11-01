/**
 * Add to budget mutation hook
 * Handles adding wizard item to quote with cache invalidation
 */

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { WizardFormData } from "../_utils/wizard-form.utils";
import { transformWizardToQuoteItem } from "../_utils/wizard-form.utils";
import { useWizardPersistence } from "./use-wizard-persistence";

type UseAddToBudgetProps = {
  modelId: string; // Required for localStorage clearing
  successAction?: () => void; // Callback after successful addition (not a Server Action, just naming convention)
};

/**
 * Custom hook for adding wizard item to budget
 * Handles mutation, cache invalidation, SSR refresh, localStorage clearing, and user feedback
 *
 * @param modelId - Model ID for localStorage key scoping
 * @param successAction - Optional callback after successful addition
 * @returns Mutation methods and state
 */
export function useAddToBudget({
  modelId,
  successAction,
}: UseAddToBudgetProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const { clear } = useWizardPersistence(modelId);

  const mutation = api.quote["add-item"].useMutation({
    onSuccess: () => {
      // Step 1: Invalidate budget cache
      utils.quote.invalidate().catch(() => {
        // Ignore invalidation errors
      });

      // Step 2: Refresh router for SSR pages with force-dynamic
      router.refresh();

      // Step 3: Clear localStorage (wizard auto-save data)
      clear();

      // User feedback
      toast.success("Agregado al presupuesto", {
        description: "El ítem se agregó correctamente a tu cotización",
      });

      // Execute callback
      successAction?.();
    },
    onError: (error) => {
      toast.error("Error al agregar", {
        description:
          error.message || "No se pudo agregar el ítem al presupuesto",
      });
    },
  });

  /**
   * Add wizard item to budget
   * @param formData - Complete wizard form data
   * @param glassTypeId - Selected glass type ID (from glass solution)
   */
  const addItem = (formData: WizardFormData, glassTypeId: string) => {
    const payload = transformWizardToQuoteItem(formData, glassTypeId);
    mutation.mutate(payload);
  };

  return {
    addItem,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}
