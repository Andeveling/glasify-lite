/**
 * Quote Actions Component
 *
 * Provides Accept and Reject action buttons for quotes in SENT status.
 * Wired to the update-status tRPC mutation.
 */

'use client'

import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'

type QuoteActionsProps = {
  quoteId: string
}

export function QuoteActions({ quoteId }: QuoteActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const updateStatus = api.quote['update-status'].useMutation({
    onSuccess: () => {
      toast.success('Estado actualizado', {
        description: 'La cotización ha sido actualizada exitosamente',
      })
      setIsUpdating(false)
    },
    onError: (error) => {
      toast.error('Error al actualizar estado', {
        description: error.message,
      })
      setIsUpdating(false)
    },
  })

  const handleAccept = () => {
    setIsUpdating(true)
    updateStatus.mutate({ quoteId, status: 'accepted' })
  }

  const handleReject = () => {
    setIsUpdating(true)
    updateStatus.mutate({ quoteId, status: 'rejected' })
  }

  return (
    <div className="flex items-center gap-4">
      <Button disabled={isUpdating} onClick={handleAccept} size="lg" variant="default">
        <Check className="mr-2 size-4" />
        Aceptar Cotización
      </Button>
      <Button disabled={isUpdating} onClick={handleReject} size="lg" variant="destructive">
        <X className="mr-2 size-4" />
        Rechazar Cotización
      </Button>
    </div>
  )
}
