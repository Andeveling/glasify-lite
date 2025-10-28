/**
 * Colors Table Component
 *
 * Atomic component: Pure presentation of colors in a table format
 * - No business logic
 * - Single Responsibility: Display tabular data
 * - Receives data as props
 * - Handles edit/delete actions via callbacks
 */

"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ColorChip } from "./color-chip";

type SerializedColor = {
  id: string;
  name: string;
  hexCode: string;
  ralCode: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ColorsTableProps = {
  colors: SerializedColor[];
  onEditAction: (id: string) => void;
  onDeleteAction: (color: { id: string; name: string }) => void;
};

/**
 * Simple relative time formatter (without external dependencies)
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) {
    return "hace un momento";
  }
  if (diffMins < 60) {
    return `hace ${diffMins} min`;
  }
  if (diffHours < 24) {
    return `hace ${diffHours}h`;
  }
  if (diffDays < 30) {
    return `hace ${diffDays}d`;
  }
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ColorsTable({
  colors,
  onEditAction,
  onDeleteAction,
}: ColorsTableProps) {
  if (colors.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="font-medium text-muted-foreground">
            No se encontraron colores
          </p>
          <p className="mt-2 text-muted-foreground text-sm">
            Crea tu primer color para comenzar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Color</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Código RAL</TableHead>
            <TableHead>Código Hex</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Última Actualización</TableHead>
            <TableHead className="w-[100px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {colors.map((color) => (
            <TableRow key={color.id}>
              <TableCell>
                <ColorChip hexCode={color.hexCode} size="md" />
              </TableCell>
              <TableCell className="font-medium">{color.name}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {color.ralCode ?? "—"}
              </TableCell>
              <TableCell className="font-mono text-muted-foreground text-sm uppercase">
                {color.hexCode}
              </TableCell>
              <TableCell>
                <Badge variant={color.isActive ? "default" : "secondary"}>
                  {color.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatRelativeTime(color.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    onClick={() => onEditAction(color.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar {color.name}</span>
                  </Button>
                  <Button
                    onClick={() =>
                      onDeleteAction({ id: color.id, name: color.name })
                    }
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar {color.name}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
