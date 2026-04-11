/**
 * useClientMutations Hook
 *
 * Handles create/update/delete mutations for clients with navigation and toasts.
 *
 * @module admin/clients/_hooks/use-client-mutations
 */

'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/trpc/react'

type UseClientMutationsOptions = {
  onSuccessCallback?: () => void
}

/**
 * Manages create, update, and delete mutations for clients
 *
 * @param options - Configuration options (callbacks)
 * @returns Mutation objects and loading state
 */
export function useClientMutations({ onSuccessCallback }: UseClientMutationsOptions = {}) {
  const router = useRouter()
  const utils = api.useUtils()

  const createMutation = api.admin.clients.create.useMutation({
    onError: (err) => {
      toast.error('Error al crear cliente', {
        description: err.message,
      })
    },
    onSettled: () => {
      utils.admin.clients.list.invalidate().catch(undefined)
      router.refresh()
    },
    onSuccess: () => {
      toast.success('Cliente creado correctamente')
      router.push('/admin/clients')
      onSuccessCallback?.()
    },
  })

  const updateMutation = api.admin.clients.update.useMutation({
    onError: (err) => {
      toast.error('Error al actualizar cliente', {
        description: err.message,
      })
    },
    onSettled: () => {
      utils.admin.clients.list.invalidate().catch(undefined)
      router.refresh()
    },
    onSuccess: () => {
      toast.success('Cliente actualizado correctamente')
      router.push('/admin/clients')
      onSuccessCallback?.()
    },
  })

  const deleteMutation = api.admin.clients.delete.useMutation({
    onError: (err) => {
      toast.error('Error al eliminar cliente', {
        description: err.message,
      })
      // Invalidate list to refresh data after error
      utils.admin.clients.list.invalidate().catch(undefined)
    },
    onSettled: () => {
      router.refresh()
    },
    onSuccess: () => {
      toast.success('Cliente eliminado correctamente')
      utils.admin.clients.list.invalidate().catch(undefined)
      onSuccessCallback?.()
    },
  })

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return {
    createMutation,
    deleteMutation,
    isLoading,
    updateMutation,
  }
}
