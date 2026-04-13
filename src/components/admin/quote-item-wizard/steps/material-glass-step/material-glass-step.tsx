"use client"

import { useTenantConfig } from "@/app/_hooks/use-tenant-config"
import { FormMessage } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/trpc/react"

import { ColorSelector } from "./_components/color-selector"
import { GlassTypeCard } from "./_components/glass-type-card"
import { useMaterialSelection } from "./use-material-selection"

function MaterialGlassStep() {
  const { formatContext } = useTenantConfig()
  const {
    modelId,
    selectedColorId,
    selectedGlassTypeId,
    handleColorSelect,
    handleGlassTypeSelect,
    hasModel,
  } = useMaterialSelection()

  const { data: colorsData, isLoading: isLoadingColors } = api.quote[
    "get-model-colors-for-quote"
  ].useQuery({ modelId }, { enabled: hasModel })

  const { data: glassTypes, isLoading: isLoadingGlassTypes } = api.catalog[
    "get-available-glass-types"
  ].useQuery({ modelId }, { enabled: hasModel })

  if (!hasModel) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Seleccioná un modelo primero.</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 max-w-3xl">
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">Color (opcional)</h3>
          <p className="text-sm text-muted-foreground">Elegí un color para el marco de aluminio</p>
        </div>
        {isLoadingColors ? (
          <div className="flex gap-4">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="size-12 rounded-full" />
          </div>
        ) : colorsData && colorsData.colors.length > 0 ? (
          <ColorSelector
            colors={colorsData.colors}
            formatContext={formatContext}
            selectedColorId={selectedColorId}
            onToggle={handleColorSelect}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Este modelo no tiene colores disponibles.</p>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">Tipo de Vidrio</h3>
          <p className="text-sm text-muted-foreground">
            Seleccioná el tipo de vidrio para la ventana
          </p>
        </div>
        {isLoadingGlassTypes ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : glassTypes && glassTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {glassTypes.map((glassType) => (
              <GlassTypeCard
                key={glassType.id}
                formatContext={formatContext}
                glassType={glassType}
                isSelected={glassType.id === selectedGlassTypeId}
                onSelect={handleGlassTypeSelect}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay tipos de vidrio disponibles para este modelo.
          </p>
        )}
        <FormMessage />
      </section>
    </div>
  )
}

export { MaterialGlassStep }
