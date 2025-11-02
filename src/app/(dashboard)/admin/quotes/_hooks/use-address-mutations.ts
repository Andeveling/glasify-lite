/**
 * Address Mutations Hook
 *
 * Feature: 001-delivery-address
 * Created: 2025-11-01
 *
 * Purpose:
 * Manage ProjectAddress CRUD mutations with optimistic updates and cache invalidation
 *
 * Usage:
 * const { createAddress, updateAddress, deleteAddress } = useAddressMutations();
 */

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ProjectAddressInput } from "@/app/(dashboard)/admin/quotes/_schemas/project-address.schema";
import { api } from "@/trpc/react";

/**
 * Hook for managing address mutations (create, update, delete)
 *
 * Implements SSR cache invalidation pattern:
 * 1. Call mutation
 * 2. Invalidate TanStack Query cache
 * 3. Call router.refresh() to re-fetch server data
 *
 * @param options - Configuration options
 * @returns Mutation functions and loading states
 *
 * @example
 * function AddressForm() {
 *   const { createAddress, isCreating } = useAddressMutations({
 *     onSuccess: () => console.log('Address saved!'),
 *   });
 *
 *   const handleSubmit = (data) => {
 *     createAddress(data);
 *   };
 * }
 */
export function useAddressMutations(options?: {
	onSuccess?: () => void;
	onError?: (error: unknown) => void;
}) {
	const router = useRouter();
	const utils = api.useUtils();

	/**
	 * Create new address mutation
	 */
	const createMutation = api.address.create.useMutation({
		onSuccess: () => {
			// Step 1: Invalidate query cache
			utils.address.invalidate().catch(() => {
				// Ignore cache invalidation errors
			});
			utils.quote.invalidate().catch(() => {
				// Ignore cache invalidation errors
			});

			// Step 2: Re-fetch server data (SSR pattern)
			router.refresh();

			// Step 3: User feedback
			toast.success("Dirección de entrega guardada correctamente");

			// Step 4: Custom callback
			options?.onSuccess?.();
		},
		onError: (error) => {
			toast.error(error.message || "Error al guardar la dirección de entrega");
			options?.onError?.(error);
		},
	});

	/**
	 * Update existing address mutation
	 */
	const updateMutation = api.address.update.useMutation({
		onSuccess: () => {
			// Step 1: Invalidate query cache
			utils.address.invalidate().catch(() => {
				// Ignore cache invalidation errors
			});
			utils.quote.invalidate().catch(() => {
				// Ignore cache invalidation errors
			});

			// Step 2: Re-fetch server data (SSR pattern)
			router.refresh();

			// Step 3: User feedback
			toast.success("Dirección de entrega actualizada correctamente");

			// Step 4: Custom callback
			options?.onSuccess?.();
		},
		onError: (error) => {
			toast.error(
				error.message || "Error al actualizar la dirección de entrega",
			);
			options?.onError?.(error);
		},
	});

	/**
	 * Delete address mutation
	 */
	const deleteMutation = api.address.delete.useMutation({
		onSuccess: () => {
			// Step 1: Invalidate query cache
			utils.address.invalidate().catch(() => {
				// Ignore cache invalidation errors
			});
			utils.quote.invalidate().catch(() => {
				// Ignore cache invalidation errors
			});

			// Step 2: Re-fetch server data (SSR pattern)
			router.refresh();

			// Step 3: User feedback
			toast.success("Dirección de entrega eliminada correctamente");

			// Step 4: Custom callback
			options?.onSuccess?.();
		},
		onError: (error) => {
			toast.error(error.message || "Error al eliminar la dirección de entrega");
			options?.onError?.(error);
		},
	});

	return {
		// Create
		createAddress: (data: ProjectAddressInput) => createMutation.mutate(data),
		createAddressAsync: (data: ProjectAddressInput) =>
			createMutation.mutateAsync(data),
		isCreating: createMutation.isPending,
		createError: createMutation.error,

		// Update
		updateAddress: (id: string, data: Partial<ProjectAddressInput>) =>
			updateMutation.mutate({ id, data }),
		updateAddressAsync: (id: string, data: Partial<ProjectAddressInput>) =>
			updateMutation.mutateAsync({ id, data }),
		isUpdating: updateMutation.isPending,
		updateError: updateMutation.error,

		// Delete
		deleteAddress: (id: string) => deleteMutation.mutate({ id }),
		deleteAddressAsync: (id: string) => deleteMutation.mutateAsync({ id }),
		isDeleting: deleteMutation.isPending,
		deleteError: deleteMutation.error,

		// Combined states
		isMutating:
			createMutation.isPending ||
			updateMutation.isPending ||
			deleteMutation.isPending,
		hasError:
			Boolean(createMutation.error) ||
			Boolean(updateMutation.error) ||
			Boolean(deleteMutation.error),
	};
}

/**
 * Hook for fetching address data (queries)
 *
 * @returns Query functions and loading states
 *
 * @example
 * function AddressViewer({ addressId }) {
 *   const { address, isLoading } = useAddressQueries({ addressId });
 *
 *   if (isLoading) return <Spinner />;
 *   return <div>{address?.city}</div>;
 * }
 */
export function useAddressQueries(params?: {
	addressId?: string;
	quoteId?: string;
}) {
	// Get address by ID
	const addressQuery = api.address.getById.useQuery(
		{ id: params?.addressId ?? "" },
		{
			enabled: Boolean(params?.addressId),
			staleTime: 60_000, // 1 minute
		},
	);

	// List addresses by quote
	const addressListQuery = api.address.listByQuote.useQuery(
		{ quoteId: params?.quoteId ?? "" },
		{
			enabled: Boolean(params?.quoteId),
			staleTime: 60_000, // 1 minute
		},
	);

	return {
		// Single address
		address: addressQuery.data,
		isLoadingAddress: addressQuery.isLoading,
		addressError: addressQuery.error,
		refetchAddress: addressQuery.refetch,

		// Address list
		addresses: addressListQuery.data ?? [],
		isLoadingAddresses: addressListQuery.isLoading,
		addressesError: addressListQuery.error,
		refetchAddresses: addressListQuery.refetch,

		// Combined states
		isLoading: addressQuery.isLoading || addressListQuery.isLoading,
		hasError: Boolean(addressQuery.error) || Boolean(addressListQuery.error),
	};
}
