'use client'

import type { RouterOutputs } from '@/trpc/react'
import { api } from '@/trpc/react'
import { DesignTemplatesTable } from './design-templates-table'

type DesignTemplatesListProps = {
  initialData: RouterOutputs['admin']['design-template']['list']
}

export function DesignTemplatesList({ initialData }: DesignTemplatesListProps) {
  const { data } = api.admin['design-template'].list.useQuery(
    { page: initialData.page, limit: initialData.limit },
    { initialData },
  )

  const utils = api.useUtils()
  const deleteMutation = api.admin['design-template'].delete.useMutation({
    onSuccess: () => {
      void utils.admin['design-template'].list.invalidate()
    },
  })

  return (
    <DesignTemplatesTable
      items={data.items}
      onDelete={(id) => deleteMutation.mutate({ id })}
    />
  )
}
