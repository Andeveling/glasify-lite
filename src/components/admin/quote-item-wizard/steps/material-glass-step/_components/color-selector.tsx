'use client'

import { Badge } from '@/components/ui/badge'
import { formatPercent } from '@/lib/format'

interface ColorSelectorProps {
  colors: Array<{
    color: { hexCode: string; id: string; name: string }
    id: string
    surchargePercentage: number
  }>
  formatContext: { locale: string }
  selectedColorId?: string
  onToggle: (colorId: string) => void
}

function ColorSelector({ colors, selectedColorId, onToggle, formatContext }: ColorSelectorProps) {
  return (
    <div className="flex flex-wrap gap-5">
      {colors.map((color) => {
        const isSelected = color.id === selectedColorId
        return (
          <button
            key={color.id}
            className={`flex flex-col items-center gap-2 transition-all ${
              isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100'
            }`}
            onClick={() => onToggle(color.id)}
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
  )
}

export { ColorSelector }
