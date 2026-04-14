"use client"

import { DoorOpen } from "lucide-react"
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

function TypeBadge({ type }: { type: "window" | "door" }) {
  return (
    <Badge
      variant={type === "window" ? "secondary" : "outline"}
      className={type === "door" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"}
    >
      {type === "window" ? "Ventana" : "Puerta"}
    </Badge>
  )
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
            <TableHead>Tipo</TableHead>
            <TableHead>Patrón</TableHead>
            <TableHead>Estilo</TableHead>
            <TableHead className="text-right">Modelos</TableHead>
            <TableHead className="w-[100px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const frameConfig = parseFrameConfig(item.frameConfig)
            return (
              <TableRow key={item.id}>
                <TableCell>
                  {item.type === "door" ? (
                    <div className="w-[70px] h-[70px] rounded border border-dashed border-muted-foreground/30 bg-muted/30 flex items-center justify-center">
                      <DoorOpen className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  ) : (
                    <div className="w-[70px]">
                      <DesignRenderer
                        template={{
                          id: item.id,
                          name: item.name,
                          pattern: item.pattern ?? "XX",
                          frameConfig,
                          showArrows: item.showArrows ?? false,
                          showHandles: item.showHandles ?? false,
                        }}
                        size={{ width: 140, height: 105 }}
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <TypeBadge type={item.type} />
                </TableCell>
                <TableCell>
                  {item.type === "door" ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <Badge variant="secondary" className="font-mono">
                      {item.pattern}
                    </Badge>
                  )}
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
