import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { RouterOutputs } from '@/trpc/react'
import { api } from '@/trpc/server-client'
import { DesignTemplateForm } from '../../_components/design-template-form'

export const metadata: Metadata = {
  title: 'Editar Plantilla de Diseño | Admin',
}

type PageProps = {
  params: Promise<{ id: string }>
}

function parseFrameConfig(raw: string) {
  try {
    return JSON.parse(raw)
  } catch {
    return { thickness: 4, profileStyle: 'simple' }
  }
}

export default async function EditDesignTemplatePage({ params }: PageProps) {
  const { id } = await params

  let template: RouterOutputs['admin']['design-template']['getById']
  try {
    template = await api.admin['design-template'].getById({ id })
  } catch {
    notFound()
  }

  const frameConfig = parseFrameConfig(template.frameConfig)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/design-templates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-bold text-2xl tracking-tight">Editar Plantilla</h1>
      </div>
      <DesignTemplateForm
        defaultValues={{
          id: template.id,
          name: template.name,
          pattern: template.pattern,
          frameConfig,
          showArrows: template.showArrows,
          showHandles: template.showHandles,
        }}
        mode="edit"
      />
    </div>
  )
}
