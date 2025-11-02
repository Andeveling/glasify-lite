/**
 * Service Mutations Hook
 *
 * Manages create and update mutations for Service entities.
 * Handles optimistic updates, cache invalidation, and server refresh.
 *
 * Responsibilities:
 * - Create mutation with toast notifications
 * - Update mutation with toast notifications
 * - Cache invalidation (TanStack Query)
 * - Server data refresh (Next.js Router)
 *
 * Pattern: Custom Hook - Single Responsibility (Mutation Logic)
 */
/** biome-ignore-all assist/source/useSortedKeys: <explanation> */

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { FormValues } from "./use-service-form";

type UseServiceMutationsProps = {
	onSuccess?: () => void;
};

export function useServiceMutations({
	onSuccess,
}: UseServiceMutationsProps = {}) {
	const utils = api.useUtils();
	const router = useRouter();

	/**
	 * Create mutation
	 *
	 * Flow:
	 * 1. onMutate: Show loading toast
	 * 2. onError: Show error toast with message
	 * 3. onSuccess: Show success toast + callback
	 * 4. onSettled: Invalidate cache + refresh server data (SSR pattern)
	 */
	const createMutation = api.admin.service.create.useMutation({
		onMutate: () => {
			toast.loading("Creando servicio...", { id: "create-service" });
		},
		onError: (err) => {
			toast.error("Error al crear servicio", {
				description: err.message,
				id: "create-service",
			});
		},
		onSuccess: () => {
			toast.success("Servicio creado correctamente", { id: "create-service" });
			onSuccess?.();
		},
		onSettled: () => {
			// Two-step cache invalidation for SSR with force-dynamic
			// Step 1: Invalidate TanStack Query cache
			utils.admin.service.list.invalidate();
			// Step 2: Refresh Next.js Server Component data
			router.refresh();
		},
	});

	/**
	 * Update mutation
	 *
	 * Flow: Same as create mutation but for updates
	 */
	const updateMutation = api.admin.service.update.useMutation({
		onMutate: () => {
			toast.loading("Actualizando servicio...", { id: "update-service" });
		},
		onError: (err) => {
			toast.error("Error al actualizar servicio", {
				description: err.message,
				id: "update-service",
			});
		},
		onSuccess: () => {
			toast.success("Servicio actualizado correctamente", {
				id: "update-service",
			});
			onSuccess?.();
		},
		onSettled: () => {
			// Two-step cache invalidation for SSR with force-dynamic
			utils.admin.service.list.invalidate();
			router.refresh();
		},
	});

	/**
	 * Submit handler for form
	 * Routes to create or update based on mode
	 */
	const handleCreate = (data: FormValues) => {
		createMutation.mutate(data);
	};

	const handleUpdate = (id: string, data: FormValues) => {
		updateMutation.mutate({ id, data });
	};

	const isPending = createMutation.isPending || updateMutation.isPending;

	return {
		createMutation,
		updateMutation,
		handleCreate,
		handleUpdate,
		isPending,
	};
}
