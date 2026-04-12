'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/trpc/react'
import type { WizardFormValues } from '../wizard-form-schema'

function MaterialGlassStep() {
  const form = useFormContext<WizardFormValues>()
  const modelId = useWatch({ control: form.control, name: 'modelId' })
  const selectedColorId = useWatch({ control: form.control, name: 'colorId' })
  const selectedGlassTypeId = useWatch({ control: form.control, name: 'glassTypeId' })

  const { data: colorsData, isLoading: isLoadingColors } = api.quote[
    'get-model-colors-for-quote'
  ].useQuery({ modelId }, { enabled: !!modelId })

  const { data: glassTypes, isLoading: isLoadingGlassTypes } = api.catalog[
    'get-available-glass-types'
  ].useQuery({ modelId }, { enabled: !!modelId })

  const handleColorSelect = (colorId: string) => {
    if (selectedColorId === colorId) {
      form.setValue('colorId', undefined)
    } else {
      form.setValue('colorId', colorId)
    }
  }

  const handleGlassTypeSelect = (glassTypeId: string) => {
    form.setValue('glassTypeId', glassTypeId, { shouldValidate: true })
  }

  if (!modelId) {
    return (
      <div className="py-8 text-center text-muted-foreground">Seleccioná un modelo primero.</div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="text-sm font-medium">Color (opcional)</h3>
        {isLoadingColors ? (
          <div className="flex gap-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
          </div>
        ) : colorsData && colorsData.colors.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {colorsData.colors.map((color) => {
              const isSelected = color.id === selectedColorId
              return (
                <button
                  key={color.id}
                  className={`flex flex-col items-center gap-1 ${
                    isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => handleColorSelect(color.id)}
                  type="button"
                >
                  <div
                    className={`size-10 rounded-full border-2 transition-all ${
                      isSelected ? 'ring-2 ring-primary border-primary' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.color.hexCode }}
                  />
                  <span className="text-xs">{color.color.name}</span>
                  {color.surchargePercentage > 0 && (
                    <Badge className="text-xs" variant="secondary">
                      +{color.surchargePercentage}%
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Este modelo no tiene colores disponibles.</p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Tipo de Vidrio</h3>
        {isLoadingGlassTypes ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : glassTypes && glassTypes.length > 0 ? (
          <div className="space-y-2">
            {glassTypes.map((glassType) => {
              const isSelected = glassType.id === selectedGlassTypeId
              return (
                <Card
                  key={glassType.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    isSelected ? 'ring-2 ring-primary border-primary' : ''
                  }`}
                  onClick={() => handleGlassTypeSelect(glassType.id)}
                >
                  <CardContent className="p-3 flex justify-between items-start">
                    <div>
                      <p className="font-medium">{glassType.name}</p>
                      {glassType.description && (
                        <p className="text-muted-foreground text-sm">{glassType.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${glassType.pricePerSqm.toLocaleString()}/m²
                      </p>
                      <p className="text-muted-foreground text-xs">{glassType.thicknessMm}mm</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No hay tipos de vidrio disponibles para este modelo.
          </p>
        )}
        <FormMessage />
      </section>
    </div>
  )
}

export { MaterialGlassStep }
