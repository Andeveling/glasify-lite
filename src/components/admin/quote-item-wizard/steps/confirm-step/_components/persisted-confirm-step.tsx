"use client"

import { Loader2 } from "lucide-react"
import { useFormContext } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { api } from "@/trpc/react"
import type { WizardFormValues } from "../../../../wizard-form-schema"

import { useQuoteItemSubmission } from "../use-quote-item-submission"

function PersistedConfirmStep({ quoteId, onSuccess }: { quoteId: string; onSuccess: () => void }) {
  const _form = useFormContext<WizardFormValues>()
  const { buildPayload } = useQuoteItemSubmission()

  const mutation = api.quote["add-item"].useMutation({
    onSuccess: () => {
      onSuccess()
    },
  })

  const handleConfirm = async () => {
    const payload = buildPayload(quoteId)
    await mutation.mutateAsync(payload)
  }

  return (
    <>
      {mutation.error && <p className="text-destructive text-sm">{mutation.error.message}</p>}
      <Button
        className="w-full"
        disabled={mutation.isPending}
        onClick={() => void handleConfirm()}
        type="button"
      >
        {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Confirmar
      </Button>
    </>
  )
}

export { PersistedConfirmStep }
