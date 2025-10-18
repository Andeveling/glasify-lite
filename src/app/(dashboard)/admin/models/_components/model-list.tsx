/**
 * Model List Component (US9 - T084) - REFACTORED
 *
 * Optimized Client Component following SOLID principles and Next.js 15 best practices
 *
 * Features:
 * - Search by name, SKU, or description
 * - Filter by status and profile supplier
 * - Pagination with page navigation
 * - Display status badges, price range, glass type count
 * - Create, edit, delete actions (using Link for navigation)
 * - Delete confirmation dialog with referential integrity
 * - Skeleton loading states for better UX
 * - Suspense boundaries for granular loading
 * - Custom hooks for separation of concerns
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Logic separated into custom hooks and smaller components
 * - Open/Closed: Components extensible via props
 * - Liskov Substitution: Components are interchangeable
 * - Interface Segregation: Specific props interfaces
 * - Dependency Inversion: Depends on abstractions (hooks, props)
 */

'use client';

import type { MaterialType, ModelStatus } from '@prisma/client';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/app/_components/delete-confirmation-dialog';
import { api } from '@/trpc/react';
import { useModelFilters } from '../_hooks/use-model-filters';
import { ModelFilters } from './model-filters';
import { ModelTable } from './model-table';
import { Pagination } from './pagination';

type SerializedModel = {
  id: string;
  profileSupplierId: string | null;
  name: string;
  status: ModelStatus;
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  basePrice: number; // Already converted from Decimal
  costPerMmWidth: number; // Already converted from Decimal
  costPerMmHeight: number; // Already converted from Decimal
  accessoryPrice: number; // Already converted from Decimal
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

type ModelListProps = {
  initialData: {
    items: SerializedModel[];
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
};

export function ModelList({ initialData }: ModelListProps) {
  const utils = api.useUtils();
  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
  const [ modelToDelete, setModelToDelete ] = useState<{ id: string; name: string } | null>(null);

  // Custom hook for filter state management (Single Responsibility)
  const { filters, handlers } = useModelFilters();

  // Fetch profile suppliers for filter
  const { data: suppliersData } = api.admin[ 'profile-supplier' ].list.useQuery({
    isActive: 'active',
    limit: 100,
    page: 1,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Query with filters - keepPreviousData for better UX during filter changes
  const { data, isLoading } = api.admin.model.list.useQuery(
    {
      limit: 20,
      page: filters.page,
      profileSupplierId: filters.profileSupplierId === 'all' ? undefined : filters.profileSupplierId,
      search: filters.search || undefined,
      sortBy: 'name',
      sortOrder: 'asc',
      status: filters.status === 'all' ? undefined : filters.status,
    },
    {
      // Keep previous data while fetching new data (better UX)
      placeholderData: (previousData) => previousData,
    }
  );

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

  // Use query data or fallback to initial data
  // Type assertion needed because tRPC returns Decimal but we need number
  const models = (data?.items ?? initialData.items) as SerializedModel[];
  const totalPages = data?.totalPages ?? initialData.totalPages;
  const total = data?.total ?? initialData.total;
  const suppliers = suppliersData?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Filters Component - Single Responsibility */}
      <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
        <ModelFilters
          onSearchChange={handlers.handleSearchChange}
          onStatusChange={handlers.handleStatusChange}
          onSupplierChange={handlers.handleSupplierChange}
          profileSupplierId={filters.profileSupplierId}
          search={filters.search}
          status={filters.status}
          suppliers={suppliers}
        />
      </Suspense>

      {/* Table Component with Skeleton Loading - Better UX */}
      <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" />}>
        <ModelTable isLoading={isLoading} models={models} onDeleteClick={handleDeleteClick} total={total} />
        <Pagination currentPage={filters.page} onPageChange={handlers.handlePageChange} totalPages={totalPages} />
      </Suspense>

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
