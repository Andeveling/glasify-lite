'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import { useTenantConfig } from '@/app/_hooks/use-tenant-config'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatNumber } from '@/lib/format'
import { api } from '@/trpc/react'
import type { WizardFormValues } from './wizard-form-schema'

function RunningSummary() {
  const form = useFormContext<WizardFormValues>()
  const { formatContext } = useTenantConfig()

  const widthMm = useWatch({ control: form.control, name: 'widthMm' })
  const heightMm = useWatch({ control: form.control, name: 'heightMm' })
  const quantity = useWatch({ control: form.control, name: 'quantity' })
  const modelId = useWatch({ control: form.control, name: 'modelId' })
  const colorId = useWatch({ control: form.control, name: 'colorId' })
  const glassTypeId = useWatch({ control: form.control, name: 'glassTypeId' })
  const serviceIds = useWatch({ control: form.control, name: 'serviceIds' })
  const roomLocation = useWatch({ control: form.control, name: 'roomLocation' })

  const { data: modelData } = api.catalog['get-model-by-id'].useQuery(
    { modelId },
    { enabled: !!modelId && modelId.length > 0 },
  )

  const { data: colorData } = api.catalog['get-color-by-id'].useQuery(
    { colorId: colorId ?? '' },
    { enabled: !!colorId && colorId.length > 0 },
  )

  const { data: glassTypeData } = api.catalog['get-glass-type-by-id'].useQuery(
    { glassTypeId },
    { enabled: !!glassTypeId && glassTypeId.length > 0 },
  )

  const { data: servicesData } = api.catalog['list-services'].useQuery({})

  const selectedServices = servicesData?.filter((s) => serviceIds?.includes(s.id)) ?? []

  const areaM2 = widthMm && heightMm ? (widthMm * heightMm) / 1_000_000 : 0

  const basePrice = modelData?.basePrice ?? 0
  const glassPrice = glassTypeData ? glassTypeData.pricePerSqm * areaM2 : 0
  const colorSurcharge =
    colorData && modelData ? (modelData.basePrice * colorData.surchargePercentage) / 100 : 0
  const servicesTotal = selectedServices.reduce((sum, s) => sum + s.rate, 0)

  const subtotalPerUnit = basePrice + glassPrice + colorSurcharge + servicesTotal
  const total = subtotalPerUnit * (quantity ?? 1)

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 tracking-wide uppercase">
            Resumen
          </h3>
          <div className="space-y-2.5">
            <SummaryRow
              label="Dimensiones"
              value={
                widthMm && heightMm
                  ? `${formatNumber(widthMm, { context: formatContext })} × ${formatNumber(heightMm, { context: formatContext })} mm`
                  : '—'
              }
            />
            <SummaryRow
              label="Área"
              value={
                areaM2 > 0
                  ? `${formatNumber(areaM2, { context: formatContext, decimals: 2 })} m²`
                  : '—'
              }
            />
            <SummaryRow
              label="Cantidad"
              value={quantity ? formatNumber(quantity, { context: formatContext }) : '—'}
            />
            {roomLocation && <SummaryRow label="Ubicación" value={roomLocation} />}
          </div>
        </div>

        {modelData && (
          <>
            <Separator className="bg-border/50" />
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Modelo</h4>
              <p className="text-sm font-medium text-foreground">{modelData.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatCurrency(modelData.basePrice, { context: formatContext })}
              </p>
            </div>
          </>
        )}

        {colorData && (
          <>
            <Separator className="bg-border/50" />
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Color</h4>
              <div className="flex items-center gap-2">
                <div
                  className="h-5 w-5 rounded-full border border-border/50"
                  style={{ backgroundColor: colorData.hexCode }}
                />
                <p className="text-sm font-medium text-foreground">{colorData.name}</p>
              </div>
              {colorData.surchargePercentage > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  +{colorData.surchargePercentage}% recargo
                </p>
              )}
            </div>
          </>
        )}

        {glassTypeData && (
          <>
            <Separator className="bg-border/50" />
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Vidrio</h4>
              <p className="text-sm font-medium text-foreground">{glassTypeData.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatCurrency(glassTypeData.pricePerSqm, { context: formatContext })}/m²
              </p>
            </div>
          </>
        )}

        {selectedServices.length > 0 && (
          <>
            <Separator className="bg-border/50" />
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Servicios</h4>
              <div className="space-y-1.5">
                {selectedServices.map((service) => (
                  <div key={service.id} className="flex items-start justify-between gap-2">
                    <p className="text-sm text-foreground">{service.name}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatCurrency(service.rate, { context: formatContext })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {total > 0 && (
          <>
            <Separator className="bg-border/50" />
            <div className="pt-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Total Estimado</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(total, { context: formatContext })}
                </span>
              </div>
              {quantity && quantity > 1 && subtotalPerUnit > 0 && (
                <p className="text-xs text-muted-foreground mt-1.5 text-right">
                  {formatCurrency(subtotalPerUnit, { context: formatContext })} × {quantity}
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

export { RunningSummary }
