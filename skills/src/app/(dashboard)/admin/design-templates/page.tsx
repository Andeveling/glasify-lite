import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { api } from '@/trpc/server-client'
import { DesignTemplatesList } from './_components/design-templates-list'

export const metadata: Metadata = {
  description: 'Administra las plantillas de diseño para visualización de modelos de ventanas',
  title: 'Plantillas de Diseño | Admin',
}

export const dynamic = 'force-dynamic'

export default async function DesignTemplatesPage() {
  const initialData = await api.admin['design-template'].list({
    limit: 20,
    page: 1,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Plantillas de Diseño</h1>
          <p className="text-muted-foreground">
            Define patrones de paneles (móviles y fijos) para la visualización de modelos
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/design-templates/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Plantilla
          </Link>
        </Button>
      </div>
      <DesignTemplatesList initialData={initialData} />
    </div>
  )
}
