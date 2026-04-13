"use client"

import { DesignRenderer } from "@/components/design"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { DesignTemplateConfig } from "@/domain/design"
import type { RouterOutputs } from "@/trpc/react"
import { TemplateActions } from "./template-actions"

type DesignTemplateItem = RouterOutputs["admin"]["design-template"]["list"]["items"][number]

type DesignTemplatesTableProps = {
  items: DesignTemplateItem[]
  onDelete: (id: string) => void
}

function parseFrameConfig(raw: string) {
  try {
    return JSON.parse(raw) as { thickness: number; profileStyle: "simple" | "double" | "premium" }
  } catch {
    return { thickness: 4, profileStyle: "simple" as const }
  }
}

export function DesignTemplatesTable({ items, onDelete }: DesignTemplatesTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No hay plantillas de diseño. Crea la primera.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Preview</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Patrón</TableHead>
            <TableHead>Estilo</TableHead>
            <TableHead className="text-right">Modelos</TableHead>
            <TableHead className="w-[100px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const frameConfig = parseFrameConfig(item.frameConfig)
            const template: DesignTemplateConfig = {
              id: item.id,
              name: item.name,
              pattern: item.pattern,
              frameConfig,
              showArrows: item.showArrows,
              showHandles: item.showHandles,
            }
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="w-[70px]">
                    <DesignRenderer template={template} size={{ width: 140, height: 105 }} />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {item.pattern}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground capitalize">
                  {frameConfig.profileStyle}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {item._count.models}
                </TableCell>
                <TableCell>
                  <TemplateActions template={item} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
