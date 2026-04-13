'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency } from '@/lib/format'

interface ServiceCheckboxProps {
  formatContext: { locale: string }
  isSelected: boolean
  service: {
    id: string
    name: string
    rate: number
    type?: string | null
    unit: string
  }
  onToggle: (serviceId: string) => void
}

function ServiceCheckbox({ service, isSelected, onToggle, formatContext }: ServiceCheckboxProps) {
  return (
    <Card
      className={`cursor-pointer border transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md'
          : 'border-border/50 hover:border-primary/30'
      }`}
      onClick={() => onToggle(service.id)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Servicio: ${service.name}`}
    >
      <CardContent className="p-4 flex flex-row items-start gap-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(service.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Servicio: ${service.name}`}
          className="mt-1"
        />
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-foreground">{service.name}</p>
          {service.type && (
            <p className="text-muted-foreground text-sm">Tipo: {service.type}</p>
          )}
        </div>
        <div className="text-right ml-4 space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {formatCurrency(service.rate, { context: formatContext })}
          </p>
          <p className="text-muted-foreground text-xs">por {service.unit}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export { ServiceCheckbox }
