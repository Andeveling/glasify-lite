/**
 * useColorMutations Hook
 *
 * Handles create/update mutations for colors with navigation and toasts
 *
 * @module admin/colors/_hooks/use-color-mutations
 */

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";

type UseColorMutationsOptions = {
  onSuccessCallback?: () => void;
};

/**
 * Manages create and update mutations for colors
 *
 * @param options - Configuration options (callbacks)
 * @returns Mutation objects and loading state
 */
export function useColorMutations({
  onSuccessCallback,
}: UseColorMutationsOptions = {}) {
  const router = useRouter();
  const utils = api.useUtils();

  const createMutation = api.admin.colors.create.useMutation({
    onError: (err) => {
      toast.error("Error al crear color", {
        description: err.message,
      });
    },
    onSettled: () => {
      void utils.admin.colors.list.invalidate();
      router.refresh();
    },
    onSuccess: () => {
      toast.success("Color creado correctamente");
      router.push("/admin/colors");
      onSuccessCallback?.();
    },
  });

  const updateMutation = api.admin.colors.update.useMutation({
    onError: (err) => {
      toast.error("Error al actualizar color", {
        description: err.message,
      });
    },
    onSettled: () => {
      void utils.admin.colors.list.invalidate();
      router.refresh();
    },
    onSuccess: () => {
      toast.success("Color actualizado correctamente");
      router.push("/admin/colors");
      onSuccessCallback?.();
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return {
    createMutation,
    isLoading,
    updateMutation,
  };
}
