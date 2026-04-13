'use client'

import { useTenantConfig } from '@/app/_hooks/use-tenant-config'
import { api } from '@/trpc/react'

import { ModelCard } from './_components/model-card'
import { ModelCardSkeleton } from './_components/model-card-skeleton'
import { useModelSelection } from './use-model-selection'

function ModelSelectStep() {
  const { formatContext } = useTenantConfig()
  const { widthMm, heightMm, selectedModelId, handleSelectModel, hasDimensions } =
    useModelSelection()

  const {
    data: models,
    isLoading,
    error,
    refetch,
  } = api.catalog['filter-models-by-dimensions'].useQuery(
    { heightMm: heightMm ?? 0, widthMm: widthMm ?? 0 },
    { enabled: hasDimensions },
  )

  if (!hasDimensions) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">
          Ingresá las dimensiones en el paso anterior para ver los modelos disponibles.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Seleccioná un modelo</h2>
          <p className="text-sm text-muted-foreground">Cargando modelos disponibles...</p>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {['skeleton-1', 'skeleton-2', 'skeleton-3'].map((key) => (
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
          {models.length} {models.length === 1 ? 'modelo disponible' : 'modelos disponibles'} para
          estas dimensiones
        </p>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            configuredHeightMm={heightMm ?? 0}
            configuredWidthMm={widthMm ?? 0}
            formatContext={formatContext}
            isSelected={model.id === selectedModelId}
            model={model}
            onSelect={handleSelectModel}
          />
        ))}
      </div>
    </div>
  )
}

export { ModelSelectStep }
