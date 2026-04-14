"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { RouterOutputs } from "@/trpc/react"
import { DesignTemplatesList } from "./design-templates-list"

type FilterType = "all" | "window" | "door"

type DesignTemplatesClientProps = {
  initialData: RouterOutputs["admin"]["design-template"]["list"]
}

export function DesignTemplatesClient({ initialData }: DesignTemplatesClientProps) {
  const [filter, setFilter] = useState<FilterType>("all")

  const windowCount = initialData.items.filter((item) => item.type === "window").length
  const doorCount = initialData.items.filter((item) => item.type === "door").length
  const totalCount = initialData.items.length

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        <Button
          variant={filter === "all" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Todas ({totalCount})
        </Button>
        <Button
          variant={filter === "window" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("window")}
        >
          Ventanas ({windowCount})
        </Button>
        <Button
          variant={filter === "door" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("door")}
        >
          Puertas ({doorCount})
        </Button>
      </div>
      <DesignTemplatesList initialData={initialData} filter={filter} />
    </div>
  )
}
