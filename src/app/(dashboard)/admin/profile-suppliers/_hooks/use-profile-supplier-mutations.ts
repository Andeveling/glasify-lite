/**
 * Profile Supplier Mutations Hook
 *
 * Manages create, update, and delete mutations for ProfileSupplier entities.
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
import type { FormValues } from "./use-profile-supplier-form";

type UseProfileSupplierMutationsProps = {
  onSuccess?: () => void;
};

export function useProfileSupplierMutations({
  onSuccess,
}: UseProfileSupplierMutationsProps = {}) {
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
  const createMutation = api.admin["profile-supplier"].create.useMutation({
    onError: (err) => {
      toast.error("Error al crear proveedor de perfiles", {
        description: err.message,
        id: "create-profile-supplier",
      });
    },
    onMutate: () => {
      toast.loading("Creando proveedor de perfiles...", {
        id: "create-profile-supplier",
      });
    },
    onSettled: () => {
      // Two-step cache invalidation for SSR with force-dynamic
      // Step 1: Invalidate TanStack Query cache
      utils.admin["profile-supplier"].list.invalidate();
      // Step 2: Refresh Next.js Server Component data
      router.refresh();
    },
    onSuccess: () => {
      toast.success("Proveedor de perfiles creado correctamente", {
        id: "create-profile-supplier",
      });
      onSuccess?.();
    },
  });

  /**
   * Update mutation
   *
   * Flow: Same as create mutation but for updates
   */
  const updateMutation = api.admin["profile-supplier"].update.useMutation({
    onError: (err) => {
      toast.error("Error al actualizar proveedor de perfiles", {
        description: err.message,
        id: "update-profile-supplier",
      });
    },
    onMutate: () => {
      toast.loading("Actualizando proveedor de perfiles...", {
        id: "update-profile-supplier",
      });
    },
    onSettled: () => {
      // Two-step cache invalidation for SSR with force-dynamic
      utils.admin["profile-supplier"].list.invalidate();
      router.refresh();
    },
    onSuccess: () => {
      toast.success("Proveedor de perfiles actualizado correctamente", {
        id: "update-profile-supplier",
      });
      onSuccess?.();
    },
  });

  /**
   * Delete mutation with optimistic updates
   *
   * Flow:
   * 1. onMutate: Cancel queries, snapshot cache, optimistically remove item
   * 2. onError: Rollback to snapshot, show error toast
   * 3. onSuccess: Show success toast + callback
   * 4. onSettled: Invalidate cache + refresh server data
   */
  const deleteMutation = api.admin["profile-supplier"].delete.useMutation({
    onError: (err) => {
      toast.error("Error al eliminar proveedor de perfiles", {
        description: err.message,
        id: "delete-profile-supplier",
      });
    },
    onMutate: async () => {
      // Cancel outgoing queries
      await utils.admin["profile-supplier"].list.cancel();

      // Snapshot current data for rollback
      const previousData = utils.admin["profile-supplier"].list.getData();

      toast.loading("Eliminando proveedor de perfiles...", {
        id: "delete-profile-supplier",
      });

      return { previousData };
    },
    onSettled: () => {
      // Two-step cache invalidation for SSR with force-dynamic
      utils.admin["profile-supplier"].list.invalidate();
      router.refresh();
    },
    onSuccess: () => {
      toast.success("Proveedor de perfiles eliminado correctamente", {
        id: "delete-profile-supplier",
      });
      onSuccess?.();
    },
  });

  /**
   * Submit handlers
   */
  const handleCreate = (data: FormValues) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (id: string, data: FormValues) => {
    updateMutation.mutate({ data, id });
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
