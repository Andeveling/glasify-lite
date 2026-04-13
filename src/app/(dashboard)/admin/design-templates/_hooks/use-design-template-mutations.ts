"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type {
  DesignTemplateCreateInput,
  DesignTemplateUpdateInput,
} from "@/lib/validations/design-template"
import { api } from "@/trpc/react"

type UseDesignTemplateMutationsOptions = {
  onSuccessCallback?: () => void
}

export function useDesignTemplateMutations({
  onSuccessCallback,
}: UseDesignTemplateMutationsOptions = {}) {
  const router = useRouter()
  const utils = api.useUtils()

  const invalidate = () => {
    void utils.admin["design-template"].list.invalidate()
    void utils.admin["design-template"].listAll.invalidate()
  }

  const createMutation = api.admin["design-template"].create.useMutation({
    onError: (err) => {
      toast.error("Error al crear la plantilla", {
        description: err.message,
      })
    },
    onSettled: () => {
      invalidate()
      router.refresh()
    },
    onSuccess: () => {
      toast.success("Plantilla de diseño creada")
      router.push("/admin/design-templates")
      onSuccessCallback?.()
    },
  })

  const updateMutation = api.admin["design-template"].update.useMutation({
    onError: (err) => {
      toast.error("Error al actualizar la plantilla", {
        description: err.message,
      })
    },
    onSettled: () => {
      invalidate()
      router.refresh()
    },
    onSuccess: () => {
      toast.success("Plantilla de diseño actualizada")
      router.push("/admin/design-templates")
      onSuccessCallback?.()
    },
  })

  const deleteMutation = api.admin["design-template"].delete.useMutation({
    onError: (err) => {
      toast.error("Error al eliminar la plantilla", {
        description: err.message,
      })
    },
    onSettled: () => {
      invalidate()
      router.refresh()
    },
    onSuccess: () => {
      toast.success("Plantilla eliminada")
    },
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  }
}
