"use client"

import type { RouterOutputs } from "@/trpc/react"
import { api } from "@/trpc/react"
import { DesignTemplatesTable } from "./design-templates-table"

type FilterType = "all" | "window" | "door"

type DesignTemplatesListProps = {
  initialData: RouterOutputs["admin"]["design-template"]["list"]
  filter?: FilterType
  onFilterChange?: (filter: FilterType) => void
}

export function DesignTemplatesList({ initialData, filter = "all", onFilterChange }: DesignTemplatesListProps) {
  const { data } = api.admin["design-template"].list.useQuery(
    { page: initialData.page, limit: initialData.limit },
    { initialData },
  )

  const utils = api.useUtils()
  const deleteMutation = api.admin["design-template"].delete.useMutation({
    onSuccess: () => {
      void utils.admin["design-template"].list.invalidate()
    },
  })

  const filteredItems = data.items.filter((item) => {
    if (filter === "all") return true
    return item.type === filter
  })

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id })
  }

  return (
    <DesignTemplatesTable
      items={filteredItems}
      onDelete={handleDelete}
    />
  )
}
