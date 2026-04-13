/**
 * Client Dialog Component
 *
 * Dialog wrapper for creating/editing clients inline.
 * Used when quick client creation is needed from within another flow
 * (e.g., quote creation form).
 */

'use client'

import { useState } from 'react'
import { ClientForm } from './client-form'
import type { ClientUpdateInput } from '../_schemas/client-form.schema'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type ClientDialogProps = {
  mode: 'create' | 'edit'
  defaultValues?: ClientUpdateInput & { id: string }
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function ClientDialog({ mode, defaultValues, onOpenChange, open }: ClientDialogProps) {
  const [formKey, setFormKey] = useState(0)

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFormKey((k) => k + 1)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}</DialogTitle>
        </DialogHeader>
        <ClientForm key={formKey} defaultValues={defaultValues} mode={mode} />
      </DialogContent>
    </Dialog>
  )
}
