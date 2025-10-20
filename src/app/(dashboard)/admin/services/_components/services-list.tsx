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
 * Key differences from old ServiceList:
 * ✅ Eliminado: React state para filtros (page, search, typeFilter)
 * ✅ Agregado: Recibe datos iniciales del servidor
 * ✅ Agregado: Sincroniza con URL via searchParams
 * ✅ Simplificado: Enfocado en presentación, no state management
 */

'use client';

import type { ServiceType, ServiceUnit } from '@prisma/client';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/app/_components/delete-confirmation-dialog';
import { TablePagination } from '@/app/_components/server-table/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/format';
import { api } from '@/trpc/react';

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

export function ServicesList({ initialData }: ServicesListProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{ id: string; name: string } | null>(null);

  // Delete mutation with optimistic UI
  const deleteMutation = api.admin.service.delete.useMutation({
    onError: (error) => {
      toast.error('Error al eliminar servicio', {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success('Servicio eliminado correctamente');
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      void utils.admin.service.list.invalidate();
    },
  });

  const handleEditClick = (id: string) => {
    router.push(`/admin/services/${id}`);
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Servicios Disponibles</CardTitle>
          <CardDescription>
            {total} servicio{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Empty state */}
          {services.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-center text-muted-foreground text-sm">
              No hay servicios disponibles
            </div>
          ) : (
            <>
              {/* Table */}
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
                          <Badge variant={SERVICE_TYPE_VARIANTS[service.type]}>
                            {SERVICE_TYPE_LABELS[service.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {SERVICE_UNIT_LABELS[service.unit]}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(service.rate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button onClick={() => handleEditClick(service.id)} size="sm" variant="ghost">
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
                </Table>
              </div>

              {/* Pagination - reutilizable component */}
              <TablePagination currentPage={currentPage} totalItems={total} totalPages={totalPages} />
            </>
          )}
        </CardContent>
      </Card>

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
