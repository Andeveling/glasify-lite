'use client'

import { useDimensionsForm } from './use-dimensions-form'
import { DimensionField } from './_components/dimension-field'

function DimensionsStep() {
  const { control } = useDimensionsForm()

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Dimensiones</h2>
        <p className="text-sm text-muted-foreground">
          Ingresá el ancho y alto de la ventana en milímetros
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DimensionField control={control} label="Ancho (mm)" name="widthMm" placeholder="1000" />
        <DimensionField control={control} label="Alto (mm)" name="heightMm" placeholder="1500" />
      </div>

      <DimensionField control={control} label="Cantidad" name="quantity" />

      <DimensionField
        control={control}
        label="Ambiente / Ubicación (opcional)"
        name="roomLocation"
        placeholder="Ej: Sala, Habitación principal"
      />
    </div>
  )
}

export { DimensionsStep }
