/**
 * Glass Supplier Mutations Hook
 *
 * Manages create, update, and delete mutations for GlassSupplier entities.
 * Handles optimistic updates, cache invalidation, and server refresh.
 *
 * Responsibilities:
 * - Create mutation with toast notifications
 * - Update mutation with toast notifications
 * - Delete mutation with optimistic updates and rollback
 * - Cache invalidation (TanStack Query)
 * - Server data refresh (Next.js Router)
 *
 * Pattern: Custom Hook - Single Responsibility (Mutation Logic)
 */

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { FormValues } from "./use-glass-supplier-form";

type UseGlassSupplierMutationsProps = {
	onSuccess?: () => void;
};

/**
 * Use Glass Supplier Mutations Hook
 *
 * Handles all mutations for glass suppliers (create, update, delete).
 * Implements two-step cache invalidation for SSR pages (invalidate + router.refresh).
 *
 * @param onSuccess - Callback when mutation succeeds
 * @returns mutation objects and handlers
 */
export function useGlassSupplierMutations({
	onSuccess,
}: UseGlassSupplierMutationsProps = {}) {
	const utils = api.useUtils();
	const router = useRouter();

	/**
	 * Create mutation
	 *
	 * Flow:
	 * 1. onMutate: Show loading toast
	 * 2. onSuccess: Show success toast + callback
	 * 3. onError: Show error toast with message
	 * 4. onSettled: Invalidate cache + refresh server data (SSR pattern)
	 */
	const createMutation = api.admin["glass-supplier"].create.useMutation({
		onError: (err: { message: string }) => {
			toast.error("Error al crear proveedor", {
				description: err.message,
				duration: 5000, // 5 seconds
				id: "create-supplier",
			});
		},
		onMutate: () => {
			toast.loading("Creando proveedor...", { id: "create-supplier" });
		},
		onSettled: () => {
			// Two-step cache invalidation for SSR with force-dynamic
			// Step 1: Invalidate TanStack Query cache
			utils.admin["glass-supplier"].list.invalidate().catch(undefined);
			// Step 2: Refresh Next.js Server Component data
			router.refresh();
		},
		onSuccess: () => {
			toast.success("Proveedor creado correctamente", {
				id: "create-supplier",
			});
			onSuccess?.();
		},
	});

	/**
	 * Update mutation
	 *
	 * Flow: Same as create mutation but for updates
	 */
	const updateMutation = api.admin["glass-supplier"].update.useMutation({
		onError: (_err: { message: string }) => {
			toast.error("Error al actualizar proveedor");
		},
		onMutate: () => {
			toast.loading("Actualizando proveedor...", { id: "update-supplier" });
		},
		onSettled: () => {
			// Two-step cache invalidation for SSR with force-dynamic
			utils.admin["glass-supplier"].list.invalidate().catch(undefined);
			router.refresh();
		},
		onSuccess: () => {
			toast.success("Proveedor actualizado correctamente", {
				id: "update-supplier",
			});
			onSuccess?.();
		},
	});

	/**
	 * Delete mutation
	 *
	 * Flow: Same pattern as create/update
	 */
	const deleteMutation = api.admin["glass-supplier"].delete.useMutation({
		onError: (err: { message: string }) => {
			toast.error("Error al eliminar proveedor", {
				description: err.message,
				duration: 5000, // 5 seconds
				id: "delete-supplier",
			});
		},
		onMutate: () => {
			toast.loading("Eliminando proveedor...", { id: "delete-supplier" });
		},
		onSettled: () => {
			// Two-step cache invalidation for SSR with force-dynamic
			utils.admin["glass-supplier"].list.invalidate().catch(undefined);
			router.refresh();
		},
		onSuccess: () => {
			toast.success("Proveedor eliminado correctamente", {
				id: "delete-supplier",
			});
			onSuccess?.();
		},
	});

	/**
	 * Submit handlers for form
	 * Routes to create or update based on mode
	 * Cleans empty strings to undefined for optional fields
	 */
	const handleCreate = (data: FormValues) => {
		// Clean up optional fields (convert empty strings to undefined)
		const cleanedData = {
			code: data.code?.trim() || undefined,
			contactEmail: data.contactEmail?.trim() || undefined,
			contactPhone: data.contactPhone?.trim() || undefined,
			country: data.country?.trim() || undefined,
			isActive: data.isActive,
			name: data.name.trim(),
			notes: data.notes?.trim() || undefined,
			website: data.website?.trim() || undefined,
		};

		createMutation.mutate(cleanedData);
	};

	const handleUpdate = (id: string, data: FormValues) => {
		// Clean up optional fields (convert empty strings to undefined)
		const cleanedData = {
			code: data.code?.trim() || undefined,
			contactEmail: data.contactEmail?.trim() || undefined,
			contactPhone: data.contactPhone?.trim() || undefined,
			country: data.country?.trim() || undefined,
			isActive: data.isActive,
			name: data.name.trim(),
			notes: data.notes?.trim() || undefined,
			website: data.website?.trim() || undefined,
		};

		updateMutation.mutate({ data: cleanedData, id });
	};

	const handleDelete = (id: string) => {
		deleteMutation.mutate({ id });
	};

	const isPending =
		createMutation.isPending ||
		updateMutation.isPending ||
		deleteMutation.isPending;

	return {
		createMutation,
		deleteMutation,
		handleCreate,
		handleDelete,
		handleUpdate,
		isPending,
		updateMutation,
	};
}
