"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useRunningSummaryData } from "../hooks/use-running-summary-data"
import { calculatePriceBreakdown } from "../utils/price-calculations"
import { SummaryRow } from "./summary-row"

export function SummaryCard() {
  const { watchedFields, modelData, colorData, glassTypeData, selectedServices, formatContext } =
    useRunningSummaryData()

  const { widthMm, heightMm, quantity, roomLocation } = watchedFields

  const { areaM2, subtotalPerUnit, total } = calculatePriceBreakdown(
    watchedFields,
    modelData,
    glassTypeData,
    colorData,
    selectedServices,
  )

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
                  : "—"
              }
            />
            <SummaryRow
              label="Área"
              value={
                areaM2 > 0
                  ? `${formatNumber(areaM2, { context: formatContext, decimals: 2 })} m²`
                  : "—"
              }
            />
            <SummaryRow
              label="Cantidad"
              value={quantity ? formatNumber(quantity, { context: formatContext }) : "—"}
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
