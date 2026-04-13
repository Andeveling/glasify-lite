import { zodResolver } from "@hookform/resolvers/zod"
import type { UseFormReturn } from "react-hook-form"
import { useForm } from "react-hook-form"
import {
  type DesignTemplateCreateInput,
  type DesignTemplateUpdateInput,
  designTemplateCreateSchema,
} from "@/lib/validations/design-template"
import { useDesignTemplateMutations } from "./use-design-template-mutations"

type UseDesignTemplateFormOptions = {
  mode: "create" | "edit"
  defaultValues?: DesignTemplateUpdateInput & { id: string }
  onSuccessCallback?: () => void
}

type FormValues = DesignTemplateCreateInput

export function useDesignTemplateForm({
  mode,
  defaultValues,
  onSuccessCallback,
}: UseDesignTemplateFormOptions): {
  form: UseFormReturn<FormValues>
  onSubmit: (data: FormValues) => void
  isLoading: boolean
} {
  const { createMutation, updateMutation, isLoading } = useDesignTemplateMutations({
    onSuccessCallback,
  })

  const form = useForm<FormValues>({
    defaultValues: (defaultValues ?? {
      pattern: "XX",
      name: "",
      frameConfig: { thickness: 4, profileStyle: "simple" },
      showArrows: true,
      showHandles: true,
    }) as FormValues,
    mode: "onChange",
    resolver: zodResolver(designTemplateCreateSchema) as never,
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

  return { form, isLoading, onSubmit }
}
