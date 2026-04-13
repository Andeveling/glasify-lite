"use client"

import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { DesignRenderer } from "@/components/design"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { DesignTemplateConfig, FrameConfig } from "@/domain/design"
import type { DesignTemplateUpdateInput } from "@/lib/validations/design-template"
import { useDesignTemplateForm } from "../_hooks/use-design-template-form"

type DesignTemplateFormProps = {
  mode: "create" | "edit"
  defaultValues?: DesignTemplateUpdateInput & { id: string }
}

const PRESET_PATTERNS = [
  { value: "X", label: "X — 1 hoja móvil" },
  { value: "O", label: "O — 1 hoja fija" },
  { value: "XX", label: "XX — 2 hojas móviles" },
  { value: "XO", label: "XO — Móvil + Fija" },
  { value: "OX", label: "OX — Fija + Móvil" },
  { value: "XXO", label: "XXO — 2 móviles + 1 fija" },
  { value: "OXX", label: "OXX — 1 fija + 2 móviles" },
  { value: "XOX", label: "XOX — Móvil + Fija + Móvil" },
]

export function DesignTemplateForm({ mode, defaultValues }: DesignTemplateFormProps) {
  const router = useRouter()
  const { form, onSubmit, isLoading } = useDesignTemplateForm({
    defaultValues,
    mode,
  })

  const pattern = form.watch("pattern") ?? "XX"
  const frameConfig = form.watch("frameConfig") as FrameConfig
  const showArrows = form.watch("showArrows")
  const showHandles = form.watch("showHandles")

  const templateConfig: DesignTemplateConfig = useMemo(
    () => ({
      id: defaultValues?.id ?? "preview",
      name: form.watch("name") ?? "Preview",
      pattern,
      frameConfig,
      showArrows,
      showHandles,
    }),
    [pattern, frameConfig, showArrows, showHandles, defaultValues?.id, form],
  )

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form fields */}
          <Card>
            <CardHeader>
              <CardTitle>
                {mode === "create" ? "Crear Plantilla de Diseño" : "Editar Plantilla"}
              </CardTitle>
              <CardDescription>
                Define el patrón de paneles y la configuración visual del marco
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Corredera 2 hojas" {...field} />
                    </FormControl>
                    <FormDescription>Nombre descriptivo de la plantilla</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patrón de paneles *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un patrón" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRESET_PATTERNS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>X = panel móvil, O = panel fijo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frameConfig.profileStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estilo del perfil</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="double">Doble</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frameConfig.thickness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grosor del marco (px)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={2}
                        max={12}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="showArrows"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Flechas de apertura</FormLabel>
                        <FormDescription>Mostrar flechas en paneles móviles</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="showHandles"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Manillas</FormLabel>
                        <FormDescription>Mostrar manillas en paneles móviles</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Live preview */}
          <Card>
            <CardHeader>
              <CardTitle>Vista previa</CardTitle>
              <CardDescription>Así se verá el diseño con la configuración actual</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <div className="w-full max-w-xs">
                <DesignRenderer template={templateConfig} size={{ width: 280, height: 210 }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            disabled={isLoading}
            onClick={() => router.back()}
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>
          <Button disabled={isLoading} type="submit">
            {isLoading ? "Guardando..." : mode === "create" ? "Crear Plantilla" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
