'use client'

import { useFormContext } from 'react-hook-form'
import { useTenantConfig } from '@/app/_hooks/use-tenant-config'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/format'
import { api } from '@/trpc/react'
import type { WizardFormValues } from '../wizard-form-schema'

function ServicesStep() {
  const form = useFormContext<WizardFormValues>()
  const selectedServiceIds = form.watch('serviceIds')
  const { formatContext } = useTenantConfig()

  const { data: services, isLoading } = api.catalog['list-services'].useQuery({})

  const handleToggleService = (serviceId: string) => {
    const current = selectedServiceIds ?? []
    if (current.includes(serviceId)) {
      form.setValue(
        'serviceIds',
        current.filter((id) => id !== serviceId),
      )
    } else {
      form.setValue('serviceIds', [...current, serviceId])
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (!services || services.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">No hay servicios disponibles.</div>
    )
  }

  return (
    <div className="space-y-3">
      {services.length === 0 && selectedServiceIds.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">Sin servicios seleccionados</p>
      ) : (
        services.map((service) => {
          const isSelected = selectedServiceIds?.includes(service.id) ?? false
          return (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                isSelected ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => handleToggleService(service.id)}
            >
              <CardContent className="p-3 flex justify-between items-start">
                <div>
                  <p className="font-medium">{service.name}</p>
                  {service.type && (
                    <p className="text-muted-foreground text-sm">Tipo: {service.type}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(service.rate, { context: formatContext })}
                  </p>
                  <p className="text-muted-foreground text-xs">por {service.unit}</p>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}

export { ServicesStep }
