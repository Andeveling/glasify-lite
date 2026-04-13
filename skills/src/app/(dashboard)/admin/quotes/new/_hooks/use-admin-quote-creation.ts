'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import type { WizardFormValues } from '@/components/admin/quote-item-wizard/wizard-form-schema'
import { api } from '@/trpc/react'
import { createQuoteFromItemsAction } from '../../../_actions/create-quote.actions'
import {
  type AdminQuoteFormValues,
  adminQuoteFormSchema,
  getAdminQuoteFormDefaults,
} from '../_components/schemas/admin-quote-form.schema'

const FIVE_MINUTES_MS = 300_000
const CATALOG_LIMIT = 100

export function useAdminQuoteCreation(clientId: string) {
  const router = useRouter()
  const [wizardOpen, setWizardOpen] = useState(false)

  const form = useForm<AdminQuoteFormValues>({
    defaultValues: getAdminQuoteFormDefaults(clientId),
    resolver: zodResolver(adminQuoteFormSchema),
    mode: 'onBlur',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const { data: modelsData, isLoading: isLoadingModels } = api.catalog['list-models'].useQuery(
    { limit: CATALOG_LIMIT, page: 1, sort: 'name-asc' },
    { staleTime: FIVE_MINUTES_MS },
  )

  const { data: glassTypesData, isLoading: isLoadingGlassTypes } = api.admin[
    'glass-type'
  ].list.useQuery(
    { limit: CATALOG_LIMIT, page: 1, sortBy: 'name', sortOrder: 'asc' },
    { staleTime: FIVE_MINUTES_MS },
  )

  const { data: clientsData, isLoading: isLoadingClients } = api.admin.clients.list.useQuery(
    { limit: CATALOG_LIMIT, page: 1, sortBy: 'name', sortOrder: 'asc' },
    { staleTime: FIVE_MINUTES_MS },
  )

  const serializedGlassTypes = (glassTypesData?.items ?? []).map((gt) => ({
    id: gt.id,
    name: gt.name,
    thicknessMm: gt.thicknessMm,
    pricePerSqm:
      typeof gt.pricePerSqm === 'object' && gt.pricePerSqm !== null
        ? (gt.pricePerSqm as { toNumber: () => number }).toNumber()
        : gt.pricePerSqm,
  }))

  const models = (modelsData?.items ?? []).filter(
    (m: { status: string }) => m.status === 'published',
  )
  const clients = clientsData?.items ?? []
  const glassTypes = serializedGlassTypes
  const isLoading = isLoadingModels || isLoadingGlassTypes || isLoadingClients

  const handleDraftConfirm = (item: WizardFormValues) => {
    append({
      glassTypeId: item.glassTypeId,
      heightMm: item.configuredHeightMm,
      modelId: item.modelId,
      quantity: item.quantity,
      widthMm: item.configuredWidthMm,
    })
  }

  const handleRemoveItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!values.clientId) return

    try {
      const { quoteId } = await createQuoteFromItemsAction({
        clientId: values.clientId,
        items: values.items.map((item) => ({
          glassTypeId: item.glassTypeId,
          heightMm: item.heightMm,
          modelId: item.modelId,
          quantity: item.quantity,
          widthMm: item.widthMm,
        })),
        projectAddress: {
          projectCity: values.projectAddress.projectCity,
          projectName: values.projectAddress.projectName,
          projectState: values.projectAddress.projectState,
          projectStreet: values.projectAddress.projectStreet,
        },
        projectName: values.projectName,
      })

      router.push(`/admin/quotes/${quoteId}`)
    } catch {
      // Error handled by toast in createQuoteFromItemsAction
    }
  })

  return {
    form,
    fields,
    handleSubmit,
    wizardOpen,
    setWizardOpen,
    handleDraftConfirm,
    clients,
    glassTypes,
    models,
    isLoading,
    handleRemoveItem,
  }
}
