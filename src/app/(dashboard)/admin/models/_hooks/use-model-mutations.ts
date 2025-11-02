/**
 * Model mutations hook
 * Encapsulates create and update mutations with navigation and cache invalidation
 */

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";

const MODELS_ADMIN_PATH = "/admin/models";

export function useModelMutations() {
	const router = useRouter();
	const utils = api.useUtils();

	const createMutation = api.admin.model.create.useMutation({
		onError: (error) => {
			toast.error(`Error al crear modelo: ${error.message}`);
		},
		onSuccess: () => {
			toast.success("Modelo creado exitosamente");
			// SSR two-step pattern: invalidate cache + refresh server data
			utils.admin.model.list.invalidate().catch(undefined);
			router.refresh(); // Force re-fetch server data
			router.push(MODELS_ADMIN_PATH);
		},
	});

	const updateMutation = api.admin.model.update.useMutation({
		onError: (error) => {
			toast.error(`Error al actualizar modelo: ${error.message}`);
		},
		onSuccess: (data) => {
			toast.success("Modelo actualizado exitosamente");
			// SSR two-step pattern: invalidate cache + refresh server data
			utils.admin.model.list.invalidate().catch(undefined);
			utils.admin.model["get-by-id"]
				.invalidate({ id: data.id })
				.catch(undefined);
			router.refresh(); // Force re-fetch server data
			router.push(MODELS_ADMIN_PATH);
		},
	});

	return {
		createModel: createMutation.mutate,
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		updateModel: updateMutation.mutate,
	};
}
