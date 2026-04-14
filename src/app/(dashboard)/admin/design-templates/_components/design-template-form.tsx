"use client"

import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { useWatch } from "react-hook-form"
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

function DesignTemplatePreview({
  control,
  defaultValuesId,
}: {
  control: ReturnType<typeof useDesignTemplateForm>["form"]["control"]
  defaultValuesId?: string
}) {
  const name = useWatch({ control, name: "name" })
  const type = useWatch({ control, name: "type" })
  const pattern = useWatch({ control, name: "pattern" })
  const frameConfig = useWatch({ control, name: "frameConfig" }) as FrameConfig | undefined
  const showArrows = useWatch({ control, name: "showArrows" })
  const showHandles = useWatch({ control, name: "showHandles" })
  const openingType = useWatch({ control, name: "openingType" })
  const traverseCount = useWatch({ control, name: "traverseCount" })
  const traverseStyle = useWatch({ control, name: "traverseStyle" })
  const handleStyle = useWatch({ control, name: "handleStyle" })
  const showLock = useWatch({ control, name: "showLock" })
  const frameColor = useWatch({ control, name: "frameColor" })
  const glassColor = useWatch({ control, name: "glassColor" })

  const templateConfig: DesignTemplateConfig = useMemo(
    () => ({
      id: defaultValuesId ?? "preview",
      name: name ?? "Preview",
      pattern: pattern ?? "XX",
      frameConfig: frameConfig ?? { thickness: 4, profileStyle: "simple" },
      showArrows: showArrows ?? true,
      showHandles: showHandles ?? true,
    }),
    [name, pattern, frameConfig, showArrows, showHandles, defaultValuesId],
  )

  if (type === "window") {
    return (
      <div className="w-full max-w-xs">
        <DesignRenderer template={templateConfig} size={{ width: 280, height: 210 }} />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
      <div className="flex h-48 w-full max-w-xs flex-col items-center justify-center rounded-lg border bg-muted/50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-40"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <p className="mt-2 text-sm">Preview de puerta</p>
        <p className="text-xs">DoorRenderer en desarrollo</p>
      </div>
      <div className="w-full max-w-xs space-y-1 rounded-lg border bg-muted/30 p-3 text-left text-xs">
        <p>
          <strong>Apertura:</strong> {openingType ?? "—"}
        </p>
        <p>
          <strong>Traverses:</strong> {traverseCount ?? 0} × {traverseStyle ?? "—"}
        </p>
        <p>
          <strong>Manilla:</strong> {handleStyle ?? "—"}
        </p>
        <p>
          <strong>Cerradura:</strong> {showLock ? "Sí" : "No"}
        </p>
      </div>
    </div>
  )
}

export function DesignTemplateForm({ mode, defaultValues }: DesignTemplateFormProps) {
  const router = useRouter()
  const { form, onSubmit, isLoading } = useDesignTemplateForm({
    defaultValues,
    mode,
  })

  const type = form.watch("type")

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
              {/* ── SECCIÓN 1: Tipo de apertura ── */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de apertura *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="window">Ventana</SelectItem>
                        <SelectItem value="door">Puerta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ── Nombre (común a ambos tipos) ── */}
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

              {/* ── SECCIÓN 2A: Campos para ventana ── */}
              {type === "window" && (
                <>
                  <FormField
                    control={form.control}
                    name="pattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patrón de paneles *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                </>
              )}

              {/* ── SECCIÓN 2B: Campos para puerta ── */}
              {type === "door" && (
                <>
                  <FormField
                    control={form.control}
                    name="openingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de apertura *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="left_interior">Interior izquierda</SelectItem>
                            <SelectItem value="right_interior">Interior derecha</SelectItem>
                            <SelectItem value="left_exterior">Exterior izquierda</SelectItem>
                            <SelectItem value="right_exterior">Exterior derecha</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="traverseCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>N° traverses</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={4}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="traverseStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estilo traverse</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="horizontal">Horizontal</SelectItem>
                              <SelectItem value="vertical">Vertical</SelectItem>
                              <SelectItem value="grid">Cuadrícula</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="frameColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color del marco</FormLabel>
                          <FormControl>
                            <Input type="color" className="h-10 w-full" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="glassColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color del vidrio</FormLabel>
                          <FormControl>
                            <Input type="color" className="h-10 w-full" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="handleStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estilo de manilla</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lever">Palanca</SelectItem>
                            <SelectItem value="knob">Botón</SelectItem>
                            <SelectItem value="pull">Asa</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showLock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Cerradura</FormLabel>
                          <FormDescription>Mostrar cerradura en la puerta</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* ── FrameConfig: común a ambos tipos ── */}
              <FormField
                control={form.control}
                name="frameConfig.profileStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estilo del perfil</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
            </CardContent>
          </Card>

          {/* Live preview */}
          <Card>
            <CardHeader>
              <CardTitle>Vista previa</CardTitle>
              <CardDescription>
                {type === "window"
                  ? "Así se verá el diseño con la configuración actual"
                  : "Vista previa de puerta (en desarrollo)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <DesignTemplatePreview control={form.control} defaultValuesId={defaultValues?.id} />
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
