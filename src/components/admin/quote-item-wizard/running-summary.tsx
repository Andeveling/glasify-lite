'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WizardFormValues } from './wizard-form-schema'

function RunningSummary() {
  const form = useFormContext<WizardFormValues>()
  const widthMm = useWatch({ control: form.control, name: 'widthMm' })
  const heightMm = useWatch({ control: form.control, name: 'heightMm' })
  const quantity = useWatch({ control: form.control, name: 'quantity' })
  const roomLocation = useWatch({ control: form.control, name: 'roomLocation' })
  const modelId = useWatch({ control: form.control, name: 'modelId' })
  const colorId = useWatch({ control: form.control, name: 'colorId' })
  const glassTypeId = useWatch({ control: form.control, name: 'glassTypeId' })
  const serviceIds = useWatch({ control: form.control, name: 'serviceIds' })

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Resumen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {widthMm && heightMm && (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Dimensiones</p>
            <p className="font-medium">
              {widthMm} × {heightMm} mm
            </p>
          </div>
        )}

        {quantity > 1 && (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Cantidad</p>
            <p className="font-medium">{quantity}</p>
          </div>
        )}

        {roomLocation && (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Ambiente</p>
            <p className="font-medium">{roomLocation}</p>
          </div>
        )}

        {modelId && (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Modelo</p>
            <Badge variant="outline">Modelo seleccionado</Badge>
          </div>
        )}

        {colorId ? (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Color</p>
            <Badge variant="outline">Color seleccionado</Badge>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Color</p>
            <p className="text-muted-foreground text-xs">Sin color</p>
          </div>
        )}

        {glassTypeId && (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Vidrio</p>
            <Badge variant="outline">Vidrio seleccionado</Badge>
          </div>
        )}

        {serviceIds.length > 0 ? (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Servicios</p>
            <Badge variant="secondary">
              {serviceIds.length} servicio{serviceIds.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Servicios</p>
            <p className="text-muted-foreground text-xs">Sin servicios</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { RunningSummary }
