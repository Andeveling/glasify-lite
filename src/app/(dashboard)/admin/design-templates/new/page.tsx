import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DesignTemplateForm } from '../_components/design-template-form'

export const metadata: Metadata = {
  title: 'Nueva Plantilla de Diseño | Admin',
}

export default function NewDesignTemplatePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/design-templates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-bold text-2xl tracking-tight">Nueva Plantilla de Diseño</h1>
      </div>
      <DesignTemplateForm mode="create" />
    </div>
  )
}
