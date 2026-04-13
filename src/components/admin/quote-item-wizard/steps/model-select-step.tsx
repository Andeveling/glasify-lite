'use client'

import { Check } from 'lucide-react'
import Image from 'next/image'
import { useFormContext } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatNumber } from '@/lib/format'
import { api } from '@/trpc/react'
import { WindowSvgPlaceholder } from '../window-svg-placeholder'
import type { WizardFormValues } from '../wizard-form-schema'

function formatRange(
  minWidth: number,
  maxWidth: number,
  minHeight: number,
  maxHeight: number,
): string {
  const fmt = (n: number) => formatNumber(n)
  return `Ancho: ${fmt(minWidth)}–${fmt(maxWidth)} mm / Alto: ${fmt(minHeight)}–${fmt(maxHeight)} mm`
}

function ModelSelectStep() {
  const form = useFormContext<WizardFormValues>()
  const widthMm = form.watch('widthMm')
  const heightMm = form.watch('heightMm')
  const selectedModelId = form.watch('modelId')

  const {
    data: models,
    isLoading,
    error,
    refetch,
  } = api.catalog['filter-models-by-dimensions'].useQuery(
    { heightMm: heightMm ?? 0, widthMm: widthMm ?? 0 },
    { enabled: !!widthMm && !!heightMm },
  )

  const handleSelectModel = (modelId: string) => {
    form.setValue('modelId', modelId, { shouldValidate: true })
    form.setValue('configuredWidthMm', widthMm ?? 0, { shouldValidate: true })
    form.setValue('configuredHeightMm', heightMm ?? 0, { shouldValidate: true })
  }

  if (!widthMm || !heightMm) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Ingresá las dimensiones en el paso anterior para ver los modelos disponibles.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
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
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 space-y-4 text-center">
        <p className="text-destructive">Error cargando modelos</p>
        <button className="text-primary underline" onClick={() => void refetch()} type="button">
          Reintentar
        </button>
      </div>
    )
  }

  if (!models || models.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No hay modelos para estas dimensiones. Ajustá las medidas.
      </div>
    )
  }

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {models.map((model) => {
        const isSelected = model.id === selectedModelId
        return (
          <Card
            key={model.id}
            className={`group relative cursor-pointer overflow-hidden transition-all hover:shadow-md ${
              isSelected
                ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-md'
                : 'hover:border-primary/40 hover:scale-[1.01]'
            }`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleSelectModel(model.id)
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleSelectModel(model.id)
              }
            }}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground shadow-sm">
                <Check className="h-3 w-3" />
                <span>Seleccionado</span>
              </div>
            )}
            <CardContent className="p-0">
              <div className="relative aspect-video w-full bg-muted/50 overflow-hidden">
                {model.imageUrl ? (
                  <Image alt={model.name} className="object-cover" fill src={model.imageUrl} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <WindowSvgPlaceholder className="w-16 h-16 opacity-40" />
                  </div>
                )}
              </div>
              <div className="p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm leading-tight line-clamp-2">{model.name}</h4>
                </div>
                <p className="text-primary font-bold text-lg leading-tight">
                  {formatCurrency(model.basePrice)}
                </p>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <span className="font-mono">
                    {formatRange(
                      model.minWidthMm,
                      model.maxWidthMm,
                      model.minHeightMm,
                      model.maxHeightMm,
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export { ModelSelectStep }
