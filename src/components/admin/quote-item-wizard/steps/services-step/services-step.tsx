"use client"

import { useTenantConfig } from "@/app/_hooks/use-tenant-config"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/trpc/react"

import { ServiceCheckbox } from "./_components/service-checkbox"
import { useServiceSelection } from "./use-service-selection"

function ServicesStep() {
  const { formatContext } = useTenantConfig()
  const { selectedServiceIds, handleToggleService } = useServiceSelection()

  const { data: services, isLoading } = api.catalog["list-services"].useQuery({})

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Servicios adicionales</h2>
          <p className="text-sm text-muted-foreground">Cargando servicios disponibles...</p>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  if (!services || services.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">No hay servicios disponibles.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Servicios adicionales (opcional)
        </h2>
        <p className="text-sm text-muted-foreground">
          Seleccioná los servicios que deseas agregar a la cotización
        </p>
      </div>
      <div className="space-y-3">
        {services.map((service) => {
          const isSelected = selectedServiceIds?.includes(service.id) ?? false
          return (
            <ServiceCheckbox
              key={service.id}
              formatContext={formatContext}
              isSelected={isSelected}
              service={service}
              onToggle={handleToggleService}
            />
          )
        })}
      </div>
    </div>
  )
}

export { ServicesStep }
