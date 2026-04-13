/**
 * New Client Page
 *
 * Server Component - Create new client in catalog.
 *
 * Route: /admin/clients/new
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from "next"
import { ClientForm } from "../_components/client-form"

export const metadata: Metadata = {
  description: "Crear un nuevo cliente para el sistema de cotizaciones",
  title: "Nuevo Cliente | Admin",
}

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Crear Nuevo Cliente</h1>
        <p className="text-muted-foreground">
          Agrega un nuevo cliente al sistema de cotizaciones B2B
        </p>
      </div>

      {/* Client Form */}
      <ClientForm mode="create" />
    </div>
  )
}
