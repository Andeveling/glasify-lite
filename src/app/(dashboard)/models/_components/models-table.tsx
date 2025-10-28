"use client";

import { Edit, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { formatDate } from "@/lib/utils";
import { useTenantConfig } from "@/providers/tenant-config-provider";

type Model = {
  basePrice: number;
  compatibleGlassTypes: string[];
  costPerMmHeight: number;
  costPerMmWidth: number;
  createdAt: string;
  id: string;
  maxHeightMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  minWidthMm: number;
  name: string;
  profileSupplier: string;
  status: "published" | "draft";
  updatedAt: string;
};

type ModelsTableProps = {
  models: Model[];
  onView?: (modelId: string) => void;
  onEdit?: (modelId: string) => void;
  onDelete?: (modelId: string) => void;
};

function ModelsTable({ models, onView, onEdit, onDelete }: ModelsTableProps) {
  const { locale, timezone } = useTenantConfig();
  const router = useRouter();

  const handleView = (modelId: string) => {
    if (onView) {
      onView(modelId);
    } else {
      // Default navigation behavior
      router.push(`/dashboard/models/${modelId}`);
    }
  };

  const handleEdit = (modelId: string) => {
    if (onEdit) {
      onEdit(modelId);
    } else {
      // Default navigation behavior
      router.push(`/dashboard/models/${modelId}/edit`);
    }
  };

  const handleDelete = (modelId: string) => {
    if (onDelete) {
      onDelete(modelId);
    } else {
      // Default delete behavior - could show confirmation dialog
      // TODO: Implement proper delete confirmation
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Modelo</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Dimensiones</TableHead>
            <TableHead className="text-right">Precio Base</TableHead>
            <TableHead>Vidrios Compatibles</TableHead>
            <TableHead>Última Actualización</TableHead>
            <TableHead className="w-32">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((model) => (
            <TableRow key={model.id}>
              <TableCell className="font-medium">{model.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{model.profileSupplier}</Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {formatDimensions(
                  model.minWidthMm,
                  model.maxWidthMm,
                  model.minHeightMm,
                  model.maxHeightMm
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(model.basePrice)}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {model.compatibleGlassTypes.slice(0, 2).map((glassType) => (
                    <Badge
                      className="text-xs"
                      key={glassType}
                      variant="outline"
                    >
                      {glassType}
                    </Badge>
                  ))}
                  {model.compatibleGlassTypes.length > 2 && (
                    <Badge className="text-xs" variant="outline">
                      +{model.compatibleGlassTypes.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(model.updatedAt, locale, timezone)}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    onClick={() => handleView(model.id)}
                    size="sm"
                    title="Ver detalles"
                    variant="outline"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleEdit(model.id)}
                    size="sm"
                    title="Editar modelo"
                    variant="outline"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(model.id)}
                    size="sm"
                    title="Eliminar modelo"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
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

// Utility functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    style: "currency",
  }).format(amount);
}

function formatDimensions(
  minW: number,
  maxW: number,
  minH: number,
  maxH: number
): string {
  return `${minW}-${maxW}×${minH}-${maxH}mm`;
}

export { ModelsTable };
