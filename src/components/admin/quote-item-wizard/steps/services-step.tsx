"use client"

import { useFormContext } from "react-hook-form"
import { useTenantConfig } from "@/app/_hooks/use-tenant-config"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/format"
import { api } from "@/trpc/react"
import type { WizardFormValues } from "../wizard-form-schema"

function ServicesStep() {
  const form = useFormContext<WizardFormValues>()
  const selectedServiceIds = form.watch("serviceIds")
  const { formatContext } = useTenantConfig()

  const { data: services, isLoading } = api.catalog["list-services"].useQuery({})

  const handleToggleService = (serviceId: string) => {
    const current = selectedServiceIds ?? []
    if (current.includes(serviceId)) {
      form.setValue(
        "serviceIds",
        current.filter((id) => id !== serviceId),
        {
          shouldValidate: true,
        },
      )
    } else {
      form.setValue("serviceIds", [...current, serviceId], { shouldValidate: true })
    }
  }

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
        {services.length === 0 && selectedServiceIds.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Sin servicios seleccionados</p>
        ) : (
          services.map((service) => {
            const isSelected = selectedServiceIds?.includes(service.id) ?? false
            return (
              <Card
                key={service.id}
                className={`cursor-pointer border transition-all duration-200 hover:shadow-md ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                    : "border-border/50 hover:border-primary/30"
                }`}
                onClick={() => handleToggleService(service.id)}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`Servicio: ${service.name}`}
              >
                <CardContent className="p-4 flex flex-row items-start gap-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleService(service.id)}
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
          })
        )}
      </div>
    </div>
  )
}

export { ServicesStep }
