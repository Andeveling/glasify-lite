/**
 * useGlassTypeMutations Hook
 *
 * Handles create/update mutations for glass types with navigation and toasts
 *
 * @module _hooks/use-glass-type-mutations
 */

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";

type UseMutationsOptions = {
  onSuccessCallback?: () => void;
};

/**
 * Manages create and update mutations for glass types
 *
 * @param options - Configuration options (callbacks)
 * @returns Mutation objects and loading state
 */
export function useGlassTypeMutations({
  onSuccessCallback,
}: UseMutationsOptions) {
  const router = useRouter();

  const createMutation = api.admin["glass-type"].create.useMutation({
    onError: (err) => {
      toast.error("Error al crear tipo de vidrio", {
        description: err.message,
      });
    },
    onSuccess: () => {
      toast.success("Tipo de vidrio creado correctamente");
      router.push("/admin/glass-types");
      router.refresh();
      onSuccessCallback?.();
    },
  });

  const updateMutation = api.admin["glass-type"].update.useMutation({
    onError: (err) => {
      toast.error("Error al actualizar tipo de vidrio", {
        description: err.message,
      });
    },
    onSuccess: () => {
      toast.success("Tipo de vidrio actualizado correctamente");
      router.push("/admin/glass-types");
      router.refresh();
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
