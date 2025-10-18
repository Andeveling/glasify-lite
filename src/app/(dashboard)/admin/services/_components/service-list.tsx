/**
 * Service List Component (US10 - T095)
 *
 * Client Component with search, filters, pagination and CRUD actions
 *
 * Features:
 * - Search by name
 * - Filter by service type
 * - Pagination with page navigation
 * - Edit, delete actions
 * - Delete confirmation dialog with referential integrity
 * - Type and unit badges
 */

'use client';

import type { ServiceType, ServiceUnit } from '@prisma/client';
import { Pencil, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmationDialog } from '@/app/_components/delete-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/trpc/react';

type SerializedService = {
  id: string;
  name: string;
  type: ServiceType;
  unit: ServiceUnit;
  rate: number; // Already converted from Decimal
  createdAt: Date;
  updatedAt: Date;
};

type ServiceListProps = {
  initialData: {
    items: SerializedService[];
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
};

/**
 * Service type labels (Spanish)
 */
const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  area: 'Área',
  fixed: 'Fijo',
  perimeter: 'Perímetro',
};

/**
 * Service unit labels (Spanish)
 */
const SERVICE_UNIT_LABELS: Record<ServiceUnit, string> = {
  ml: 'ml (metros lineales)',
  sqm: 'm² (metros cuadrados)',
  unit: 'unidad',
};

/**
 * Service type badge variants
 */
const SERVICE_TYPE_VARIANTS: Record<ServiceType, 'default' | 'secondary' | 'outline'> = {
  area: 'default',
  fixed: 'secondary',
  perimeter: 'outline',
};

export function ServiceList({ initialData }: ServiceListProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ServiceType>('all');
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{ id: string; name: string } | null>(null);

  // Query with filters
  const { data, isLoading } = api.admin.service.list.useQuery(
    {
      limit: 20,
      page,
      search: search || undefined,
      sortBy: 'name',
      sortOrder: 'asc',
      type: typeFilter,
    },
    {
      placeholderData: (previousData) => previousData,
    }
  );

  // Delete mutation
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Use initial data on first render, then switch to query data
  const services = data?.items ?? initialData.items;
  const total = data?.total ?? initialData.total;
  const totalPages = data?.totalPages ?? initialData.totalPages;

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
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por nombre..."
                value={search}
              />
            </div>

            {/* Type Filter */}
            <Select
              onValueChange={(value) => {
                setTypeFilter(value as 'all' | ServiceType);
                setPage(1);
              }}
              value={typeFilter}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="fixed">Fijo</SelectItem>
                <SelectItem value="area">Área</SelectItem>
                <SelectItem value="perimeter">Perímetro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading && <div className="py-8 text-center text-muted-foreground">Cargando servicios...</div>}

          {!isLoading && services.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No se encontraron servicios con los filtros aplicados
            </div>
          )}

          {!isLoading && services.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead className="text-right">Tarifa</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>
                        <Badge variant={SERVICE_TYPE_VARIANTS[service.type]}>{SERVICE_TYPE_LABELS[service.type]}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">{SERVICE_UNIT_LABELS[service.unit]}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        $
                        {service.rate.toLocaleString('es-CO', {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button disabled={page <= 1} onClick={() => handlePageChange(page - 1)} size="sm" variant="outline">
                  Anterior
                </Button>
                <Button
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  size="sm"
                  variant="outline"
                >
                  Siguiente
                </Button>
              </div>
            </div>
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
