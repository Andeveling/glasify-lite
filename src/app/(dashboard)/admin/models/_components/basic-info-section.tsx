/**
 * Basic Information Section
 *
 * Model name, status, profile supplier, and design template selection
 */

"use client"

import { DesignRenderer } from "@/components/design"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DesignTemplateConfig } from "@/domain/design"
import type { RouterOutputs } from "@/trpc/react"
import { FormSelect, FormTextInput } from "./form-fields"

type ProfileSupplier = RouterOutputs["admin"]["profile-supplier"]["list"]["items"][number]
type DesignTemplate = RouterOutputs["admin"]["design-template"]["listAll"][number]

type BasicInfoSectionProps = {
  suppliers: ProfileSupplier[]
  templates: DesignTemplate[]
}

const STATUS_OPTIONS = [
  { label: "Borrador", value: "draft" },
  { label: "Publicado", value: "published" },
]

export function BasicInfoSection({ suppliers, templates }: BasicInfoSectionProps) {
  const supplierOptions = suppliers.map((supplier) => ({
    label: supplier.name,
    value: supplier.id,
  }))

  const templateOptions = templates.map((t) => ({
    label: `${t.name} (${t.pattern})`,
    value: t.id,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Básica</CardTitle>
        <CardDescription>Datos generales del modelo de ventana o puerta</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormTextInput
            description="Nombre descriptivo del modelo"
            label="Nombre"
            name="name"
            placeholder="Ej: Ventana Corrediza PVC"
            required
          />
        </div>

        <FormSelect
          description="Estado de publicación del modelo"
          label="Estado"
          name="status"
          options={STATUS_OPTIONS}
          placeholder="Selecciona estado"
          required
        />

        <FormSelect
          description="Proveedor del perfil de ventana/puerta"
          label="Proveedor de Perfiles"
          name="profileSupplierId"
          options={supplierOptions}
          placeholder="Selecciona proveedor"
        />

        <div className="md:col-span-2">
          <FormSelect
            description="Plantilla de diseño para visualización del modelo"
            label="Plantilla de Diseño"
            name="designTemplateId"
            options={templateOptions}
            placeholder="Sin plantilla (usa imagen)"
          />
        </div>
      </CardContent>
    </Card>
  )
}
