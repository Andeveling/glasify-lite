/**
 * Model Colors List Component
 *
 * Client component that handles color assignment mutations
 * - Displays table of assigned colors
 * - Inline surcharge editing with debounce
 * - Set default color functionality
 * - Remove color assignments
 * - Optimistic UI updates
 *
 * Architecture:
 * - Client Component ('use client')
 * - Uses tRPC mutations for CRUD operations
 * - Two-step cache invalidation pattern
 * - Toast notifications for user feedback
 */

"use client";

import type { Color, ModelColor } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { ModelColorRow } from "./model-color-row";

type ModelColorWithColor = ModelColor & {
  color: Color;
};

type ModelColorsListProps = {
  modelId: string;
  initialColors: ModelColorWithColor[];
};

/**
 * List component with mutation handlers
 * Orchestrates all color assignment operations
 */
export function ModelColorsList({
  modelId,
  initialColors,
}: ModelColorsListProps) {
  const router = useRouter();
  const utils = api.useUtils();

  // Query for real-time data (with initialData from SSR)
  const { data: modelColors = initialColors } = api.admin[
    "model-colors"
  ].listByModel.useQuery({ modelId }, { initialData: initialColors });

  // Update surcharge mutation
  const updateSurchargeMutation = api.admin[
    "model-colors"
  ].updateSurcharge.useMutation({
    onSuccess: () => {
      toast.success("Recargo actualizado");
      void utils.admin["model-colors"].listByModel.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar recargo");
    },
  });

  // Set default mutation
  const setDefaultMutation = api.admin["model-colors"].setDefault.useMutation({
    onSuccess: () => {
      toast.success("Color establecido como predeterminado");
      void utils.admin["model-colors"].listByModel.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Error al establecer color por defecto");
    },
  });

  // Unassign mutation
  const unassignMutation = api.admin["model-colors"].unassign.useMutation({
    onSuccess: () => {
      toast.success("Color eliminado del modelo");
      void utils.admin["model-colors"].listByModel.invalidate();
      void utils.admin["model-colors"].getAvailableColors.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar color");
    },
  });

  const handleSurchargeChange = (id: string, surcharge: number) => {
    updateSurchargeMutation.mutate({
      id,
      surchargePercentage: surcharge,
    });
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate({ id });
  };

  const handleRemove = (id: string) => {
    // TODO: Add confirmation dialog
    if (confirm("¿Estás seguro de eliminar este color del modelo?")) {
      unassignMutation.mutate({ id });
    }
  };

  if (modelColors.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          Este modelo no tiene colores asignados. Agrega el primer color para
          comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Color</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Código RAL</TableHead>
            <TableHead>Hexadecimal</TableHead>
            <TableHead>Recargo (%)</TableHead>
            <TableHead>Por Defecto</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modelColors.map((modelColor) => (
            <ModelColorRow
              isUpdating={
                updateSurchargeMutation.isPending ||
                setDefaultMutation.isPending ||
                unassignMutation.isPending
              }
              key={modelColor.id}
              modelColor={modelColor}
              onDefaultChange={handleSetDefault}
              onDelete={handleRemove}
              onSurchargeChange={handleSurchargeChange}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
