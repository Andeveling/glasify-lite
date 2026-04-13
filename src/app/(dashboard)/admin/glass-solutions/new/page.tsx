/**
 * New Glass Solution Page (US6 - T049)
 *
 * Server Component wrapper for creating a new GlassSolution.
 *
 * Route: /admin/glass-solutions/new
 * Access: Admin only (protected by middleware)
 */

import type { Metadata } from "next"

import { GlassSolutionForm } from "../_components/glass-solution-form"

export const metadata: Metadata = {
  description: "Crear nueva solución de cristal",
  title: "Nueva Solución de cristal | Admin",
}

export default function NewGlassSolutionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Nueva Solución de cristal</h1>
        <p className="text-muted-foreground">Crea una nueva solución base para tipos de cristal</p>
      </div>

      <GlassSolutionForm mode="create" />
    </div>
  )
}
