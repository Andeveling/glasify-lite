'use client'

import { Check } from 'lucide-react'
import Image from 'next/image'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatNumber } from '@/lib/format'

import { WindowSvgPlaceholder } from '../../../window-svg-placeholder'

interface ModelCardProps {
  configuredHeightMm: number
  configuredWidthMm: number
  formatContext: { locale: string }
  isSelected: boolean
  model: {
    basePrice: number
    description?: string | null
    id: string
    imageUrl?: string | null
    maxHeightMm: number
    maxWidthMm: number
    minHeightMm: number
    minWidthMm: number
    name: string
  }
  onSelect: (modelId: string) => void
}

function formatRange(
  minWidth: number,
  maxWidth: number,
  minHeight: number,
  maxHeight: number,
  context?: { locale: string },
): string {
  const fmt = (n: number) => formatNumber(n, context ? { context } : undefined)
  return `Ancho: ${fmt(minWidth)}–${fmt(maxWidth)} mm / Alto: ${fmt(minHeight)}–${fmt(maxHeight)} mm`
}

function ModelCard({ model, isSelected, onSelect, formatContext, configuredWidthMm, configuredHeightMm }: ModelCardProps) {
  return (
    <Card
      className={`group relative cursor-pointer overflow-hidden border transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-lg'
          : 'border-border/50 hover:border-primary/30 hover:scale-[1.01]'
      }`}
      onClick={() => onSelect(model.id)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${model.name} - ${formatCurrency(model.basePrice, { context: formatContext })}`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md">
          <Check className="h-3.5 w-3.5" />
          <span>Seleccionado</span>
        </div>
      )}
      <CardContent className="p-0">
        <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
          {model.imageUrl ? (
            <Image
              alt={`Modelo ${model.name}`}
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              fill
              src={model.imageUrl}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <WindowSvgPlaceholder className="h-20 w-20 opacity-30" />
            </div>
          )}
        </div>
        <div className="space-y-2.5 p-4">
          <h4 className="line-clamp-2 text-base font-semibold leading-tight">
            {model.name}
          </h4>
          <p className="text-xl font-bold leading-tight text-primary">
            {formatCurrency(model.basePrice, { context: formatContext })}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono">
              {formatRange(
                model.minWidthMm,
                model.maxWidthMm,
                model.minHeightMm,
                model.maxHeightMm,
                { locale: formatContext.locale },
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { ModelCard, formatRange }
