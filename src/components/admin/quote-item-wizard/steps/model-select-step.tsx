"use client"

import { Check } from "lucide-react"
import Image from "next/image"
import { useCallback } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { useTenantConfig } from "@/app/_hooks/use-tenant-config"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatNumber } from "@/lib/format"
import { api } from "@/trpc/react"
import { WindowSvgPlaceholder } from "../window-svg-placeholder"
import type { WizardFormValues } from "../wizard-form-schema"

function formatRange(
  minWidth: number,
  maxWidth: number,
  minHeight: number,
  maxHeight: number,
  context?: { locale: string },
): string {
  const fmt = (n: number) => formatNumber(n, context ? { context } : undefined)
  return `Ancho: ${fmt(minWidth)}–${fmt(maxWidth)} mm / Alto: ${fmt(minHeight)}–${fmt(maxHeight)} mm`
}

function ModelCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Skeleton className="aspect-video w-full rounded-t-lg" />
        <div className="p-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

function ModelSelectStep() {
  const form = useFormContext<WizardFormValues>()
  const { formatContext } = useTenantConfig()

  const widthMm = useWatch({ control: form.control, name: "widthMm" })
  const heightMm = useWatch({ control: form.control, name: "heightMm" })
  const selectedModelId = useWatch({ control: form.control, name: "modelId" })

  const {
    data: models,
    isLoading,
    error,
    refetch,
  } = api.catalog["filter-models-by-dimensions"].useQuery(
    { heightMm: heightMm ?? 0, widthMm: widthMm ?? 0 },
    { enabled: Boolean(widthMm && heightMm) },
  )

  const handleSelectModel = useCallback(
    (modelId: string) => {
      form.setValue("modelId", modelId, { shouldValidate: true })
      form.setValue("configuredWidthMm", widthMm ?? 0, { shouldValidate: true })
      form.setValue("configuredHeightMm", heightMm ?? 0, { shouldValidate: true })
    },
    [form, widthMm, heightMm],
  )

  const handleCardClick = useCallback(
    (modelId: string) => (e: React.MouseEvent) => {
      e.preventDefault()
      handleSelectModel(modelId)
    },
    [handleSelectModel],
  )

  if (!widthMm || !heightMm) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">
          Ingresá las dimensiones en el paso anterior para ver los modelos disponibles.
        </p>
      </div>
    )
  }

  if (isLoading) {
    const skeletonKeys = ["skeleton-1", "skeleton-2", "skeleton-3"] as const
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Seleccioná un modelo</h2>
          <p className="text-sm text-muted-foreground">Cargando modelos disponibles...</p>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {skeletonKeys.map((key) => (
            <ModelCardSkeleton key={key} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-destructive">Error cargando modelos</p>
        <button className="text-primary underline" onClick={() => void refetch()} type="button">
          Reintentar
        </button>
      </div>
    )
  }

  if (!models || models.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">
          No hay modelos para estas dimensiones. Ajustá las medidas.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Seleccioná un modelo</h2>
        <p className="text-sm text-muted-foreground">
          {models.length} {models.length === 1 ? "modelo disponible" : "modelos disponibles"} para
          estas dimensiones
        </p>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {models.map((model) => {
          const isSelected = model.id === selectedModelId
          return (
            <Card
              key={model.id}
              className={`group relative cursor-pointer overflow-hidden border transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? "ring-2 ring-primary border-primary bg-primary/5 shadow-lg"
                  : "border-border/50 hover:border-primary/30 hover:scale-[1.01]"
              }`}
              onClick={handleCardClick(model.id)}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${model.name} - ${formatCurrency(model.basePrice, { context: formatContext })}`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md">
                  <Check className="h-3.5 w-3.5" />
                  <span>Seleccionado</span>
                </div>
              )}
              <CardContent className="p-0">
                <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
                  {model.imageUrl ? (
                    <Image
                      alt={`Modelo ${model.name}`}
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                      fill
                      src={model.imageUrl}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <WindowSvgPlaceholder className="h-20 w-20 opacity-30" />
                    </div>
                  )}
                </div>
                <div className="space-y-2.5 p-4">
                  <h4 className="line-clamp-2 text-base font-semibold leading-tight">
                    {model.name}
                  </h4>
                  <p className="text-xl font-bold leading-tight text-primary">
                    {formatCurrency(model.basePrice, { context: formatContext })}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-mono">
                      {formatRange(
                        model.minWidthMm,
                        model.maxWidthMm,
                        model.minHeightMm,
                        model.maxHeightMm,
                        { locale: formatContext.locale },
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export { ModelSelectStep }
