/**
 * useClientForm Hook
 *
 * Main form hook for creating/editing clients with React Hook Form + Zod validation.
 *
 * @module admin/clients/_hooks/use-client-form
 */

import { zodResolver } from "@hookform/resolvers/zod"
import type { UseFormReturn } from "react-hook-form"
import { useForm } from "react-hook-form"
import type { ClientCreateInput, ClientUpdateInput } from "../_schemas/client-form.schema"
import { clientCreateSchema } from "../_schemas/client-form.schema"
import { useClientMutations } from "./use-client-mutations"

type UseClientFormOptions = {
  mode: "create" | "edit"
  defaultValues?: ClientUpdateInput & { id: string }
  onSuccessCallback?: () => void
}

type FormValues = ClientCreateInput

/**
 * Main form hook - orchestrates form state, validation and mutations
 *
 * @param options - Form configuration (mode, defaultValues, callbacks)
 * @returns Form instance, submit handler, and loading state
 */
export function useClientForm({ mode, defaultValues, onSuccessCallback }: UseClientFormOptions): {
  form: UseFormReturn<FormValues>
  onSubmit: (data: FormValues) => void
  isLoading: boolean
} {
  const { createMutation, updateMutation, isLoading } = useClientMutations({
    onSuccessCallback,
  })

  const form = useForm<FormValues>({
    defaultValues: (defaultValues ?? {
      name: "",
      email: null,
      phone: null,
      company: null,
      notes: null,
    }) as FormValues,
    mode: "onChange",
    resolver: zodResolver(clientCreateSchema) as never,
  })

  const onSubmit = (data: FormValues) => {
    if (mode === "create") {
      createMutation.mutate(data)
    } else if (defaultValues) {
      updateMutation.mutate({
        ...data,
        id: defaultValues.id,
      })
    }
  }

  return {
    form,
    isLoading,
    onSubmit,
  }
}
