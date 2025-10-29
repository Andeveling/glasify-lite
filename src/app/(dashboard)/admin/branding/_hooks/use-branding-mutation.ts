/**
 * Branding mutations hook
 * Encapsulates branding update mutation with cache invalidation
 */

import { toast } from "sonner";
import { api } from "@/trpc/react";

export function useBrandingMutation() {
  const utils = api.useUtils();

  const updateBranding = api.tenantConfig.updateBranding.useMutation({
    onError: (error) => {
      toast.error("Error al actualizar", {
        description: error.message,
      });
    },
    onSuccess: () => {
      utils.tenantConfig.getBranding.invalidate().catch(undefined);
      toast.success("Branding actualizado", {
        description: "Los cambios se reflejarán inmediatamente.",
      });
    },
  });

  return {
    isPending: updateBranding.isPending,
    updateBranding: updateBranding.mutateAsync,
  };
}
