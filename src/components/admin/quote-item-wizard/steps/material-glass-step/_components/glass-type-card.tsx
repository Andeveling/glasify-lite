"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatThickness } from "@/lib/format"

interface GlassTypeCardProps {
  formatContext: { locale: string }
  glassType: {
    description?: string | null
    id: string
    name: string
    pricePerSqm: number
    thicknessMm: number
  }
  isSelected: boolean
  onSelect: (glassTypeId: string) => void
}

function GlassTypeCard({ glassType, isSelected, onSelect, formatContext }: GlassTypeCardProps) {
  return (
    <Card
      key={glassType.id}
      className={`cursor-pointer border transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "ring-2 ring-primary border-primary bg-primary/5 shadow-md"
          : "border-border/50 hover:border-primary/30"
      }`}
      onClick={() => onSelect(glassType.id)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${glassType.name}, ${formatCurrency(glassType.pricePerSqm, { context: formatContext })}/m², ${formatThickness(glassType.thicknessMm, formatContext)}`}
    >
      <CardContent className="flex items-start justify-between p-4">
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-foreground">{glassType.name}</p>
          {glassType.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{glassType.description}</p>
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
}

export { GlassTypeCard }
