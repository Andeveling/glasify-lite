'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import { useTenantConfig } from '@/app/_hooks/use-tenant-config'
import { api } from '@/trpc/react'
import type { WizardFormValues } from '../../wizard-form-schema'
import type { UseRunningSummaryDataReturn, WatchedFields } from '../types'

export function useRunningSummaryData(): UseRunningSummaryDataReturn {
  const form = useFormContext<WizardFormValues>()
  const { formatContext } = useTenantConfig()

  const widthMm = useWatch({ control: form.control, name: 'widthMm' })
  const heightMm = useWatch({ control: form.control, name: 'heightMm' })
  const quantity = useWatch({ control: form.control, name: 'quantity' })
  const modelId = useWatch({ control: form.control, name: 'modelId' })
  const colorId = useWatch({ control: form.control, name: 'colorId' })
  const glassTypeId = useWatch({ control: form.control, name: 'glassTypeId' })
  const serviceIds = useWatch({ control: form.control, name: 'serviceIds' })
  const roomLocation = useWatch({ control: form.control, name: 'roomLocation' })

  const { data: modelData } = api.catalog['get-model-by-id'].useQuery(
    { modelId },
    { enabled: !!modelId && modelId.length > 0 },
  )

  const { data: colorData } = api.catalog['get-color-by-id'].useQuery(
    { colorId: colorId ?? '' },
    { enabled: !!colorId && colorId.length > 0 },
  )

  const { data: glassTypeData } = api.catalog['get-glass-type-by-id'].useQuery(
    { glassTypeId },
    { enabled: !!glassTypeId && glassTypeId.length > 0 },
  )

  const { data: servicesData } = api.catalog['list-services'].useQuery({})

  const selectedServices = servicesData?.filter((s) => serviceIds?.includes(s.id)) ?? []

  const watchedFields: WatchedFields = {
    widthMm,
    heightMm,
    quantity,
    modelId,
    colorId,
    glassTypeId,
    serviceIds,
    roomLocation,
  }

  return {
    watchedFields,
    modelData,
    colorData,
    glassTypeData,
    selectedServices,
    formatContext,
  }
}
