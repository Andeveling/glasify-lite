'use client'

import { useCallback } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTenantConfig } from '@/app/_hooks/use-tenant-config'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatPercent, formatThickness } from '@/lib/format'
import { api } from '@/trpc/react'
import type { WizardFormValues } from '../wizard-form-schema'

function MaterialGlassStep() {
  const form = useFormContext<WizardFormValues>()
  const modelId = useWatch({ control: form.control, name: 'modelId' })
  const selectedColorId = useWatch({ control: form.control, name: 'colorId' })
  const selectedGlassTypeId = useWatch({ control: form.control, name: 'glassTypeId' })
  const { formatContext } = useTenantConfig()

  const { data: colorsData, isLoading: isLoadingColors } = api.quote[
    'get-model-colors-for-quote'
  ].useQuery({ modelId }, { enabled: Boolean(modelId) })

  const { data: glassTypes, isLoading: isLoadingGlassTypes } = api.catalog[
    'get-available-glass-types'
  ].useQuery({ modelId }, { enabled: Boolean(modelId) })

  const handleColorSelect = useCallback(
    (colorId: string) => {
      form.setValue('colorId', selectedColorId === colorId ? undefined : colorId)
    },
    [form, selectedColorId],
  )

  const handleGlassTypeSelect = useCallback(
    (glassTypeId: string) => {
      form.setValue('glassTypeId', glassTypeId, { shouldValidate: true })
    },
    [form],
  )

  if (!modelId) {
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
          <div className="flex flex-wrap gap-5">
            {colorsData.colors.map((color) => {
              const isSelected = color.id === selectedColorId
              return (
                <button
                  key={color.id}
                  className={`flex flex-col items-center gap-2 transition-all ${
                    isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => handleColorSelect(color.id)}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${color.color.name}${color.surchargePercentage > 0 ? `, recargo ${formatPercent(color.surchargePercentage / 100, { context: formatContext })}` : ''}`}
                >
                  <div
                    className={`size-12 rounded-full border-2 transition-all ${
                      isSelected
                        ? 'ring-4 ring-primary/20 border-primary scale-110'
                        : 'border-border hover:border-primary/50'
                    }`}
                    style={{ backgroundColor: color.color.hexCode }}
                  />
                  <span className="text-xs font-medium">{color.color.name}</span>
                  {color.surchargePercentage > 0 && (
                    <Badge className="text-xs" variant="secondary">
                      +{formatPercent(color.surchargePercentage / 100, { context: formatContext })}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
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
            {glassTypes.map((glassType) => {
              const isSelected = glassType.id === selectedGlassTypeId
              return (
                <Card
                  key={glassType.id}
                  className={`cursor-pointer border transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-md'
                      : 'border-border/50 hover:border-primary/30'
                  }`}
                  onClick={() => handleGlassTypeSelect(glassType.id)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${glassType.name}, ${formatCurrency(glassType.pricePerSqm, { context: formatContext })}/m², ${formatThickness(glassType.thicknessMm, formatContext)}`}
                >
                  <CardContent className="flex items-start justify-between p-4">
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-foreground">{glassType.name}</p>
                      {glassType.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {glassType.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4 space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(glassType.pricePerSqm, { context: formatContext })}/m²
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatThickness(glassType.thicknessMm, formatContext)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
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
