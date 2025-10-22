/**
 * Services List Component
 *
 * Client Component - Server-optimized pattern
 *
 * Receives:
 * - initialData: Datos precargados del servidor (SSR)
 * - searchParams: Estado actual de filtros (para sincronización)
 *
 * Responsibilities:
 * - Display tabla con datos
 * - Handle CRUD actions (edit, delete)
 * - Manage optimistic UI
 *
 * Features:
 * - Optimistic delete with rollback on error
 * - Toast notifications with loading states
 * - Cache invalidation after mutations
 *
 * Key differences from old ServiceList:
 * ✅ Eliminado: React state para filtros (page, search, typeFilter)
 * ✅ Agregado: Recibe datos iniciales del servidor
 * ✅ Agregado: Sincroniza con URL via searchParams
 * ✅ Simplificado: Enfocado en presentación, no state management
 */
/** biome-ignore-all assist/source/useSortedKeys: TypeScript necesita que onMutate se defina primero para inferir el tipo del contexto que luego se usa en onError. */

'use client';

import type { Service, ServiceType, ServiceUnit } from '@prisma/client';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/app/_components/delete-confirmation-dialog';
import { TablePagination } from '@/app/_components/server-table/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';
import { api } from '@/trpc/react';
import { ServiceDialog } from './service-dialog';
import { ServicesEmpty } from './services-empty';

type SerializedService = {
  id: string;
  isActive?: boolean;
  name: string;
  rate: number;
  type: ServiceType;
  unit: ServiceUnit;
  createdAt?: Date;
  updatedAt?: Date;
};

type ServicesListProps = {
  initialData: {
    items: SerializedService[];
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
  searchParams: {
    isActive?: string;
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    type?: string;
  };
};

/**
 * Service type labels (Spanish)
 * Used for badges and UI display
 */
const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  area: 'Área',
  fixed: 'Fijo',
  perimeter: 'Perímetro',
};

/**
 * Service unit labels (Spanish)
 * Used for column display
 */
const SERVICE_UNIT_LABELS: Record<ServiceUnit, string> = {
  ml: 'ml',
  sqm: 'm²',
  unit: 'unidad',
};

/**
 * Service type badge variants
 * Visual distinction for different service types
 */
const SERVICE_TYPE_VARIANTS: Record<ServiceType, 'default' | 'secondary' | 'outline'> = {
  area: 'default',
  fixed: 'secondary',
  perimeter: 'outline',
};

export function ServicesList({ initialData, searchParams }: ServicesListProps) {
  const utils = api.useUtils();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{ id: string; name: string } | null>(null);

  // Dialog state for edit only (create is handled in ServicesContent)
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);

  // Delete mutation with optimistic UI
  const deleteMutation = api.admin.service.delete.useMutation({
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await utils.admin.service.list.cancel();

      // Snapshot the previous value
      const previousData = utils.admin.service.list.getData();

      // Optimistically remove the item from cache
      if (previousData) {
        utils.admin.service.list.setData(
          // Match the input parameters of the current query
          {
            isActive: searchParams.isActive as 'all' | 'active' | 'inactive' | undefined,
            limit: initialData.limit,
            page: Number(searchParams.page) || 1,
            search: searchParams.search,
            sortBy: (searchParams.sortBy || 'name') as 'name' | 'createdAt' | 'updatedAt' | 'rate',
            sortOrder: (searchParams.sortOrder || 'asc') as 'asc' | 'desc',
            type: (searchParams.type !== 'all' ? searchParams.type : undefined) as
              | 'all'
              | 'area'
              | 'perimeter'
              | 'fixed'
              | undefined,
          },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.filter((item) => item.id !== variables.id),
              total: old.total - 1,
            };
          }
        );
      }

      // Show immediate feedback
      toast.loading('Eliminando servicio...', { id: 'delete-service' });

      // Return context with snapshot for rollback
      return { previousData };
    },
    onError: (error, _variables, context) => {
      // Rollback to previous data on error
      if (context?.previousData) {
        utils.admin.service.list.setData(
          {
            isActive: searchParams.isActive as 'all' | 'active' | 'inactive' | undefined,
            limit: initialData.limit,
            page: Number(searchParams.page) || 1,
            search: searchParams.search,
            sortBy: (searchParams.sortBy || 'name') as 'name' | 'createdAt' | 'updatedAt' | 'rate',
            sortOrder: (searchParams.sortOrder || 'asc') as 'asc' | 'desc',
            type: (searchParams.type !== 'all' ? searchParams.type : undefined) as
              | 'all'
              | 'area'
              | 'perimeter'
              | 'fixed'
              | undefined,
          },
          context.previousData
        );
      }

      toast.error('Error al eliminar servicio', {
        description: error.message,
        id: 'delete-service',
      });
    },
    onSuccess: () => {
      toast.success('Servicio eliminado correctamente', { id: 'delete-service' });
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    },
    onSettled: () => {
      // Invalidate cache and refresh server data
      void utils.admin.service.list.invalidate();
      router.refresh();
    },
  });

  const handleEditClick = (service: SerializedService) => {
    // Convert to full Service type for the dialog
    // Note: rate is already a number in SerializedService, will be converted in the form
    const mockDecimal = {
      toNumber: () => service.rate,
    };

    setServiceToEdit({
      ...service,
      createdAt: service.createdAt ?? new Date(),
      isActive: service.isActive ?? true,
      rate: mockDecimal as Service['rate'],
      updatedAt: service.updatedAt ?? new Date(),
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (service: { id: string; name: string }) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (serviceToDelete) {
      deleteMutation.mutate({ id: serviceToDelete.id });
    }
  };

  const { items: services, page: currentPage, total, totalPages } = initialData;

  // Check if there are filters active
  const hasFilters = Boolean(
    searchParams?.search ||
      (searchParams?.type && searchParams.type !== 'all') ||
      (searchParams?.isActive && searchParams.isActive !== 'all')
  );

  return (
    <>
      {/* Edit Dialog only - Create is handled by ServicesContent */}
      {serviceToEdit && (
        <ServiceDialog
          defaultValues={serviceToEdit}
          mode="edit"
          onOpenChange={setEditDialogOpen}
          open={editDialogOpen}
        />
      )}

      {/* Empty state */}
      {services.length === 0 ? (
        <ServicesEmpty hasFilters={hasFilters} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
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
                      <Badge variant={SERVICE_TYPE_VARIANTS[service.type]}>{SERVICE_TYPE_LABELS[service.type]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{SERVICE_UNIT_LABELS[service.unit]}</TableCell>
                    <TableCell className="text-right">{formatCurrency(service.rate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => handleEditClick(service)} size="sm" variant="ghost">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick({ id: service.id, name: service.name })}
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
              <TableFooter className="p-2" />
            </Table>
          </div>
          <TablePagination currentPage={currentPage} totalItems={total} totalPages={totalPages} />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        dependencies={[]}
        entityLabel={serviceToDelete?.name ?? ''}
        entityName="servicio"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
        warningMessage="Esta acción no se puede deshacer."
      />
    </>
  );
}
