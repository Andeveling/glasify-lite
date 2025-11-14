/**
 * Services Table Component
 *
 * Atomic component: Pure presentation of services in a table format
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
import { formatCurrency } from "@/lib/format";
import type { ServiceType, ServiceUnit } from "@prisma/client";

type SerializedService = {
  id: string;
  name: string;
  type: ServiceType;
  unit: ServiceUnit;
  rate: number;
  createdAt: Date;
  updatedAt: Date;
};

type ServicesTableProps = {
  services: SerializedService[];
  onEditAction: (id: string) => void;
  onDeleteAction: (service: { id: string; name: string }) => void;
};

/**
 * Service type labels (Spanish)
 */
const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  area: "Área",
  fixed: "Fijo",
  perimeter: "Perímetro",
};

/**
 * Service unit display
 */
const SERVICE_UNIT_DISPLAY: Record<ServiceUnit, string> = {
  ml: "ml",
  sqm: "m²",
  unit: "unidad",
};

/**
 * Service type badge variants
 */
const SERVICE_TYPE_VARIANTS: Record<
  ServiceType,
  "default" | "secondary" | "outline"
> = {
  area: "default",
  fixed: "secondary",
  perimeter: "outline",
};

export function ServicesTable({
  services,
  onEditAction,
  onDeleteAction,
}: ServicesTableProps) {
  return (
    <div className="">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead className="text-right">Tarifa</TableHead>
            <TableHead className="w-[100px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>
                <Badge variant={SERVICE_TYPE_VARIANTS[service.type]}>
                  {SERVICE_TYPE_LABELS[service.type]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {SERVICE_UNIT_DISPLAY[service.unit]}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(service.rate)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    onClick={() => onEditAction(service.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    onClick={() =>
                      onDeleteAction({ id: service.id, name: service.name })
                    }
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
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
