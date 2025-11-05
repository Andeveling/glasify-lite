/**
 * Service Actions Hook
 *
 * Centralized hook for service CRUD operations with optimistic UI
 * Follows Single Responsibility Principle (SRP):
 * - Manages all service mutations (delete, toggle active)
 * - Handles optimistic updates
 * - Provides consistent error handling
 * - Manages toast notifications
 *
 * @module app/(dashboard)/admin/services/_hooks/use-service-actions
 */

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";

type UseServiceActionsParams = {
	/** Current search parameters for cache invalidation */
	searchParams: {
		isActive?: string;
		page?: string;
		search?: string;
		sortBy?: string;
		sortOrder?: "asc" | "desc";
		type?: string;
	};
	/** Current pagination limit for cache invalidation */
	limit: number;
	/** Callback when an action completes successfully */
	onSuccessAction?: () => void;
};

/**
 * Hook for service CRUD operations with optimistic UI
 *
 * Provides mutations for:
 * - Delete service
 * - Toggle service active status
 *
 * Features:
 * - Optimistic updates with rollback on error
 * - Automatic cache invalidation
 * - Server data refresh after mutations
 * - Toast notifications with loading states
 *
 * @example
 * ```tsx
 * const { deleteService, toggleActive } = useServiceActions({
 *   searchParams,
 *   limit: 10,
 *   onSuccess: () => console.log('Action completed')
 * });
 *
 * // Delete a service
 * deleteService.mutate({ id: 'service-123' });
 *
 * // Toggle active status
 * toggleActive.mutate({ id: 'service-123', isActive: false });
 * ```
 */
export function useServiceActions({
	searchParams,
	limit,
	onSuccessAction,
}: UseServiceActionsParams) {
	const utils = api.useUtils();
	const router = useRouter();

	// Helper to build query input for cache operations
	const buildQueryInput = () => ({
		isActive: searchParams.isActive as
			| "all"
			| "active"
			| "inactive"
			| undefined,
		limit,
		page: Number(searchParams.page) || 1,
		search: searchParams.search,
		sortBy: (searchParams.sortBy || "name") as
			| "name"
			| "createdAt"
			| "updatedAt"
			| "rate",
		sortOrder: (searchParams.sortOrder || "asc") as "asc" | "desc",
		type: (searchParams.type !== "all" ? searchParams.type : undefined) as
			| "all"
			| "area"
			| "perimeter"
			| "fixed"
			| undefined,
	});

	/**
	 * Delete service mutation with optimistic UI
	 */
	const deleteService = api.admin.service.delete.useMutation({
		onMutate: async (variables) => {
			// Cancel outgoing refetches
			await utils.admin.service.list.cancel();

			// Snapshot previous value
			const previousData = utils.admin.service.list.getData();

			// Optimistically remove item from cache
			if (previousData) {
				utils.admin.service.list.setData(buildQueryInput(), (old) => {
					if (!old) return old;
					return {
						...old,
						items: old.items.filter((item) => item.id !== variables.id),
						total: old.total - 1,
					};
				});
			}

			// Show immediate feedback
			toast.loading("Eliminando servicio...", { id: "delete-service" });

			return { previousData };
		},
		onError: (error, _variables, context) => {
			// Rollback on error
			if (context?.previousData) {
				utils.admin.service.list.setData(
					buildQueryInput(),
					context.previousData,
				);
			}

			toast.error("Error al eliminar servicio", {
				description: error.message,
				id: "delete-service",
			});
		},
		onSuccess: () => {
			toast.success("Servicio eliminado correctamente", {
				id: "delete-service",
			});
			onSuccessAction?.();
		},
		onSettled: async () => {
			// Invalidate cache and refresh server data
			await utils.admin.service.list.invalidate();
			router.refresh();
		},
	});

	/**
	 * Toggle service active status mutation with optimistic UI
	 */
	const toggleActive = api.admin.service.toggleActive.useMutation({
		onMutate: async (variables) => {
			// Cancel outgoing refetches
			await utils.admin.service.list.cancel();

			// Snapshot previous value
			const previousData = utils.admin.service.list.getData();

			// Optimistically update item in cache
			if (previousData) {
				utils.admin.service.list.setData(buildQueryInput(), (old) => {
					if (!old) return old;
					return {
						...old,
						items: old.items.map((item) =>
							item.id === variables.id
								? { ...item, isActive: variables.isActive }
								: item,
						),
					};
				});
			}

			// Show immediate feedback
			const action = variables.isActive ? "Activando" : "Desactivando";
			toast.loading(`${action} servicio...`, { id: "toggle-service" });

			return { previousData };
		},
		onError: (error, _variables, context) => {
			// Rollback on error
			if (context?.previousData) {
				utils.admin.service.list.setData(
					buildQueryInput(),
					context.previousData,
				);
			}

			toast.error("Error al cambiar estado del servicio", {
				description: error.message,
				id: "toggle-service",
			});
		},
		onSuccess: (_data, variables) => {
			const action = variables.isActive ? "activado" : "desactivado";
			toast.success(`Servicio ${action} correctamente`, {
				id: "toggle-service",
			});
			onSuccessAction?.();
		},
		onSettled: async () => {
			// Invalidate cache and refresh server data
			await utils.admin.service.list.invalidate();
			router.refresh();
		},
	});

	return {
		deleteService,
		toggleActive,
	};
}
