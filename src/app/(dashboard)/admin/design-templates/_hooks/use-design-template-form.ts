import { zodResolver } from "@hookform/resolvers/zod"
import type { UseFormReturn } from "react-hook-form"
import { useForm } from "react-hook-form"
import { useEffect } from "react"
import {
  type DesignTemplateCreateInput,
  type DesignTemplateUpdateInput,
  designTemplateCreateSchema,
  windowSchema,
  doorSchema,
} from "@/lib/validations/design-template"
import { useDesignTemplateMutations } from "./use-design-template-mutations"

type UseDesignTemplateFormOptions = {
  mode: "create" | "edit"
  defaultValues?: DesignTemplateUpdateInput & { id: string }
  onSuccessCallback?: () => void
}

type FormValues = DesignTemplateCreateInput

const defaultWindowValues: z.infer<typeof windowSchema> = {
  type: "window",
  name: "",
  pattern: "XX",
  frameConfig: { thickness: 4, profileStyle: "simple" },
  showArrows: true,
  showHandles: true,
}

const defaultDoorValues: z.infer<typeof doorSchema> = {
  type: "door",
  name: "",
  openingType: "right_interior",
  traverseCount: 2,
  traverseStyle: "horizontal",
  frameConfig: { thickness: 4, profileStyle: "simple" },
  frameColor: "#ffffff",
  glassColor: "#1a1a1a",
  handleStyle: "lever",
  showLock: true,
}

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
    defaultValues: (() => {
      if (!defaultValues) return defaultWindowValues
      if (mode === "edit" && defaultValues.type === "door") {
        return {
          type: "door" as const,
          name: defaultValues.name ?? "",
          openingType: defaultValues.openingType ?? "right_interior",
          traverseCount: defaultValues.traverseCount ?? 2,
          traverseStyle: defaultValues.traverseStyle ?? "horizontal",
          frameConfig: defaultValues.frameConfig ?? { thickness: 4, profileStyle: "simple" },
          frameColor: defaultValues.frameColor ?? "#ffffff",
          glassColor: defaultValues.glassColor ?? "#1a1a1a",
          handleStyle: defaultValues.handleStyle ?? "lever",
          showLock: defaultValues.showLock ?? true,
        }
      }
      return {
        type: "window" as const,
        name: defaultValues.name ?? "",
        pattern: defaultValues.pattern ?? "XX",
        frameConfig: defaultValues.frameConfig ?? { thickness: 4, profileStyle: "simple" },
        showArrows: defaultValues.showArrows ?? true,
        showHandles: defaultValues.showHandles ?? true,
      }
    })(),
    mode: "onSubmit",
    reValidateMode: "onBlur",
    resolver: zodResolver(designTemplateCreateSchema) as never,
  })

  // Reset form to correct defaults when type changes
  useEffect(() => {
    const subscription = form.watch((values) => {
      const currentType = values.type
      if (!currentType) return

      // Only reset if the fields for the other type are empty to avoid overwriting user input
      if (currentType === "window") {
        form.setValue("pattern", "XX", { shouldValidate: false })
        form.setValue("showArrows", true, { shouldValidate: false })
        form.setValue("showHandles", true, { shouldValidate: false })
        // Clear door fields
        form.setValue("openingType", "right_interior" as const, { shouldValidate: false, shouldDirty: false })
        form.setValue("traverseCount", 2, { shouldValidate: false, shouldDirty: false })
        form.setValue("traverseStyle", "horizontal" as const, { shouldValidate: false, shouldDirty: false })
        form.setValue("handleStyle", "lever" as const, { shouldValidate: false, shouldDirty: false })
        form.setValue("showLock", true, { shouldValidate: false, shouldDirty: false })
        form.setValue("frameColor", "#ffffff", { shouldValidate: false, shouldDirty: false })
        form.setValue("glassColor", "#1a1a1a", { shouldValidate: false, shouldDirty: false })
      } else if (currentType === "door") {
        // Clear window fields
        form.setValue("pattern", "XX", { shouldValidate: false, shouldDirty: false })
        form.setValue("showArrows", true, { shouldValidate: false, shouldDirty: false })
        form.setValue("showHandles", true, { shouldValidate: false, shouldDirty: false })
        form.setValue("openingType", "right_interior", { shouldValidate: false })
        form.setValue("traverseCount", 2, { shouldValidate: false })
        form.setValue("traverseStyle", "horizontal", { shouldValidate: false })
        form.setValue("handleStyle", "lever", { shouldValidate: false })
        form.setValue("showLock", true, { shouldValidate: false })
        form.setValue("frameColor", "#ffffff", { shouldValidate: false })
        form.setValue("glassColor", "#1a1a1a", { shouldValidate: false })
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

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
