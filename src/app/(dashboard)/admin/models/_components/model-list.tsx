/**
 * Model List Component (US9 - T084) - SERVER-SIDE FILTERING
 *
 * Client Component that renders data table with server-side filtering via URL
 *
 * Features:
 * - Server-side filtering (status, supplier) via URL search params
 * - Client-side search (instant, on current page data)
 * - Deep linking support
 * - Delete confirmation dialog
 *
 * Architecture:
 * - ServerFilters: Controls that update URL (triggers page refetch)
 * - DataTable: Renders data + client-side search
 * - Page: Server Component that refetches on URL change
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Rendering and delete action handling only
 * - Dependency Inversion: Data comes from server via props
 */

'use client';

import type { MaterialType, ModelStatus } from '@prisma/client';
import { useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/app/_components/delete-confirmation-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/trpc/react';
import { createColumns, type Model } from './columns';
import { DataTable } from './data-table';
import { ServerFilters } from './server-filters';

type SerializedModel = {
  id: string;
  profileSupplierId: string | null;
  name: string;
  status: ModelStatus;
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  basePrice: number;
  costPerMmWidth: number;
  costPerMmHeight: number;
  accessoryPrice: number;
  glassDiscountWidthMm: number;
  glassDiscountHeightMm: number;
  compatibleGlassTypeIds: string[];
  profitMarginPercentage: number | null;
  lastCostReviewDate: Date | null;
  costNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  profileSupplier: {
    id: string;
    name: string;
    materialType: MaterialType;
  } | null;
};

type Supplier = {
  id: string;
  name: string;
  materialType: MaterialType;
};

type ModelListProps = {
  initialData: {
    items: SerializedModel[];
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
  suppliers: Supplier[];
};

export function ModelList({ initialData, suppliers }: ModelListProps) {
  const utils = api.useUtils();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<{ id: string; name: string } | null>(null);

  // Delete mutation
  const deleteMutation = api.admin.model.delete.useMutation({
    onError: (error) => {
      toast.error('Error al eliminar modelo', {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success('Modelo eliminado correctamente');
      setDeleteDialogOpen(false);
      setModelToDelete(null);
      void utils.admin.model.list.invalidate();
    },
  });

  // Handler for delete action
  const handleDeleteClick = (id: string, name: string) => {
    setModelToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!modelToDelete) return;
    await deleteMutation.mutateAsync({ id: modelToDelete.id });
  };

  // Use server-fetched data
  const models = initialData.items as Model[];
  const total = initialData.total;

  // Create columns with delete handler
  const columns = createColumns(handleDeleteClick);

  return (
    <div className="space-y-6">
      {/* Server-side filters (updates URL → page refetches) */}
      <ServerFilters suppliers={suppliers} />

      {/* Data Table with client-side search only */}
      <Card>
        <CardHeader>
          <CardTitle>Modelos ({total})</CardTitle>
          <CardDescription>Gestiona los modelos de perfiles disponibles en el catálogo</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={models} searchKey="name" searchPlaceholder="Buscar por nombre..." />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        dependencies={[]}
        entityLabel={modelToDelete?.name ?? ''}
        entityName="modelo"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
      />
    </div>
  );
}
