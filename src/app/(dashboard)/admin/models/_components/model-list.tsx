/**
 * Model List Component (US9 - T084)
 *
 * Client Component with search, filters, pagination and CRUD actions
 *
 * Features:
 * - Search by name, SKU, or description
 * - Filter by status and profile supplier
 * - Pagination with page navigation
 * - Display status badges, price range, glass type count
 * - Create, edit, delete actions
 * - Delete confirmation dialog with referential integrity
 */

'use client';

import type { MaterialType, ModelStatus } from '@prisma/client';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
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
  const router = useRouter();
  const utils = api.useUtils();
  const [ search, setSearch ] = useState('');
  const [ status, setStatus ] = useState<'all' | 'draft' | 'published'>('all');
  const [ profileSupplierId, setProfileSupplierId ] = useState<string>('all');
  const [ page, setPage ] = useState(1);
  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
  const [ modelToDelete, setModelToDelete ] = useState<{ id: string; name: string } | null>(null);

  // Fetch profile suppliers for filter
  const { data: suppliersData } = api.admin[ 'profile-supplier' ].list.useQuery({
    isActive: 'active',
    limit: 100,
    page: 1,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Query with filters
  const { data, isLoading } = api.admin.model.list.useQuery(
    {
      limit: 20,
      page,
      profileSupplierId: profileSupplierId === 'all' ? undefined : profileSupplierId,
      search: search || undefined,
      sortBy: 'name',
      sortOrder: 'asc',
      status: status === 'all' ? undefined : status,
    },
    {
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

  const handleCreateClick = () => {
    router.push('/admin/models/new');
  };

  const handleEditClick = (id: string) => {
    router.push(`/admin/models/${id}`);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setModelToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!modelToDelete) return;
    await deleteMutation.mutateAsync({ id: modelToDelete.id });
  };

  // Use initial data on first render, then switch to query data
  const models = data?.items ?? initialData.items;
  const totalPages = data?.totalPages ?? initialData.totalPages;
  const suppliers = suppliersData?.items ?? [];

  // Status labels
  const statusLabels: Record<string, string> = {
    draft: 'Borrador',
    published: 'Publicado',
  };

  // Status variants
  const getStatusVariant = (modelStatus: string): 'default' | 'secondary' | 'outline' => {
    if (modelStatus === 'published') return 'default';
    if (modelStatus === 'draft') return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra modelos</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="search">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-8"
                id="search"
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por nombre, SKU..."
                value={search}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="status">
              Estado
            </label>
            <Select
              onValueChange={(value) => {
                setStatus(value as typeof status);
                setPage(1);
              }}
              value={status}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Profile Supplier Filter */}
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="profileSupplierId">
              Proveedor de Perfiles
            </label>
            <Select
              onValueChange={(value) => {
                setProfileSupplierId(value);
                setPage(1);
              }}
              value={profileSupplierId}
            >
              <SelectTrigger id="profileSupplierId">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Create Button */}
          <div className="flex items-end">
            <Button className="w-full" onClick={handleCreateClick}>
              <Plus className="mr-2 size-4" />
              Nuevo Modelo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Modelos ({data?.total ?? 0})</CardTitle>
          <CardDescription>
            Mostrando {models.length} de {data?.total ?? 0} modelos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Dimensiones</TableHead>
                <TableHead>Precio Base</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Tipos Compatibles</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell className="text-center" colSpan={8}>
                    Cargando...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && models.length === 0 && (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={8}>
                    No se encontraron modelos
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Sin SKU</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col gap-0.5">
                        <span>
                          Ancho: {model.minWidthMm}-{model.maxWidthMm}mm
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Alto: {model.minHeightMm}-{model.maxHeightMm}mm
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">${Number(model.basePrice).toLocaleString('es-CO')}</TableCell>
                    <TableCell className="text-sm">
                      {model.profileSupplier?.name || <span className="text-muted-foreground">Sin proveedor</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{model.compatibleGlassTypeIds.length} tipos</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(model.status)}>{statusLabels[ model.status ]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleEditClick(model.id)} size="icon" variant="ghost">
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button onClick={() => handleDeleteClick(model.id, model.name)} size="icon" variant="ghost">
                          <Trash2 className="size-4 text-destructive" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)} size="sm" variant="outline">
                  Anterior
                </Button>
                <Button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
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
