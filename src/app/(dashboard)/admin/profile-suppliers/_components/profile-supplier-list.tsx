/**
 * Profile Supplier List Component
 *
 * Client Component with search, filters, pagination and CRUD actions
 *
 * Features:
 * - Search by name
 * - Filter by material type and active status
 * - Pagination with page navigation
 * - Create, edit, delete actions via dialog modals
 * - Delete confirmation dialog with referential integrity
 * - Optimistic UI updates
 */

'use client';

import type { MaterialType, ProfileSupplier } from '@prisma/client';
import { Factory, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteConfirmationDialog } from '@/app/_components/delete-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ListProfileSuppliersOutput } from '@/lib/validations/admin/profile-supplier.schema';
import { api } from '@/trpc/react';
import { useProfileSupplierMutations } from '../_hooks/use-profile-supplier-mutations';
import { ProfileSupplierDialog } from './profile-supplier-dialog';

type ProfileSupplierListProps = {
  initialData: ListProfileSuppliersOutput;
};

const MATERIAL_TYPE_OPTIONS: { label: string; value: MaterialType }[] = [
  { label: 'PVC', value: 'PVC' },
  { label: 'Aluminio', value: 'ALUMINUM' },
  { label: 'Madera', value: 'WOOD' },
  { label: 'Mixto', value: 'MIXED' },
];

const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  ALUMINUM: 'Aluminio',
  MIXED: 'Mixto',
  PVC: 'PVC',
  WOOD: 'Madera',
};

export function ProfileSupplierList({ initialData }: ProfileSupplierListProps) {
  const [search, setSearch] = useState('');
  const [materialType, setMaterialType] = useState<MaterialType | 'ALL'>('ALL');
  const [isActive, setIsActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedSupplier, setSelectedSupplier] = useState<ProfileSupplier | undefined>(undefined);

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<{ id: string; name: string } | null>(null);

  // Query with filters
  const { data, isLoading } = api.admin['profile-supplier'].list.useQuery(
    {
      isActive,
      limit: 20,
      materialType: materialType === 'ALL' ? undefined : materialType,
      page,
      search: search || undefined,
      sortBy: 'name',
      sortOrder: 'asc',
    },
    {
      initialData,
      placeholderData: (previousData) => previousData, // TanStack Query v5 replacement for keepPreviousData
    }
  );

  // Delete mutation from hook
  const { handleDelete, deleteMutation } = useProfileSupplierMutations({
    onSuccess: () => {
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    },
  });

  const handleCreateClick = () => {
    setDialogMode('create');
    setSelectedSupplier(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (supplier: ProfileSupplier) => {
    setDialogMode('edit');
    setSelectedSupplier(supplier);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setSupplierToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!supplierToDelete) return;
    handleDelete(supplierToDelete.id);
  };

  const suppliers = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra proveedores</CardDescription>
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
                  setPage(1); // Reset to first page on search
                }}
                placeholder="Buscar por nombre..."
                value={search}
              />
            </div>
          </div>

          {/* Material Type Filter */}
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="materialType">
              Tipo de Material
            </label>
            <Select
              onValueChange={(value) => {
                setMaterialType(value as MaterialType | 'ALL');
                setPage(1);
              }}
              value={materialType}
            >
              <SelectTrigger id="materialType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {MATERIAL_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Status Filter */}
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="isActive">
              Estado
            </label>
            <Select
              onValueChange={(value) => {
                setIsActive(value as 'all' | 'active' | 'inactive');
                setPage(1);
              }}
              value={isActive}
            >
              <SelectTrigger id="isActive">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Create Button */}
          <div className="flex items-end">
            <Button className="w-full" onClick={handleCreateClick}>
              <Plus className="mr-2 size-4" />
              Nuevo Proveedor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Proveedores ({data?.total ?? 0})</CardTitle>
          <CardDescription>
            Mostrando {suppliers.length} de {data?.total ?? 0} proveedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell className="text-center" colSpan={5}>
                    Cargando...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && suppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Factory />
                        </EmptyMedia>
                        <EmptyTitle>No hay proveedores de perfiles</EmptyTitle>
                        <EmptyDescription>
                          {search || materialType !== 'ALL' || isActive !== 'all'
                            ? 'No se encontraron proveedores que coincidan con los filtros aplicados'
                            : 'Comienza agregando tu primer proveedor de perfiles'}
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <Button onClick={handleCreateClick}>
                          <Plus className="mr-2 size-4" />
                          Crear Primer Proveedor
                        </Button>
                      </EmptyContent>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{MATERIAL_TYPE_LABELS[supplier.materialType]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                        {supplier.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                      {supplier.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleEditClick(supplier)} size="icon" variant="ghost">
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(supplier.id, supplier.name)}
                          size="icon"
                          variant="ghost"
                        >
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

      {/* Profile Supplier Dialog */}
      <ProfileSupplierDialog
        defaultValues={selectedSupplier}
        mode={dialogMode}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        dependencies={[]}
        entityLabel={supplierToDelete?.name ?? ''}
        entityName="proveedor de perfiles"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete} // TODO: Add dependencies from integrityCheck when available
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
      />
    </div>
  );
}
