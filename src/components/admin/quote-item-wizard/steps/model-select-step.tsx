'use client'

import Image from 'next/image'
import { useFormContext } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/trpc/react'
import { WindowSvgPlaceholder } from '../window-svg-placeholder'
import type { WizardFormValues } from '../wizard-form-schema'

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
            className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
              isSelected
                ? 'ring-2 ring-primary border-primary shadow-lg scale-[1.02]'
                : 'hover:border-primary/40'
            }`}
            onClick={() => handleSelectModel(model.id)}
          >
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
              <div className="p-3 space-y-1.5">
                <h4 className="font-semibold text-sm leading-tight line-clamp-2">{model.name}</h4>
                <p className="font-bold text-primary text-base">
                  ${model.basePrice.toLocaleString()}
                </p>
                <p className="text-muted-foreground text-xs leading-tight">
                  {model.minWidthMm}–{model.maxWidthMm} × {model.minHeightMm}–{model.maxHeightMm} mm
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export { ModelSelectStep }
