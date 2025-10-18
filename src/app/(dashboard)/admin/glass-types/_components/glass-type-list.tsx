/**
 * Glass Type List Component (US8 - T068)
 *
 * Client Component with search, filters, pagination and CRUD actions
 *
 * Features:
 * - Search by name, SKU, or description
 * - Filter by purpose, supplier, solution, thickness range, and active status
 * - Pagination with page navigation
 * - Display solutions as badges (primary solution highlighted)
 * - Create, edit, delete actions
 * - Delete confirmation dialog with referential integrity
 */

'use client';

import type { GlassPurpose } from '@prisma/client';
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

type SerializedGlassType = {
  id: string;
  name: string;
  purpose: GlassPurpose;
  thicknessMm: number;
  pricePerSqm: number; // Already converted from Decimal
  uValue: number | null; // Already converted from Decimal
  isTempered: boolean;
  isLaminated: boolean;
  isLowE: boolean;
  isTripleGlazed: boolean;
  glassSupplierId: string | null;
  sku: string | null;
  description: string | null;
  solarFactor: number | null; // Already converted from Decimal
  lightTransmission: number | null; // Already converted from Decimal
  isActive: boolean;
  lastReviewDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    solutions: number;
    characteristics: number;
  };
  glassSupplier: {
    id: string;
    name: string;
  } | null;
  solutions: Array<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    glassTypeId: string;
    solutionId: string;
    isPrimary: boolean;
    performanceRating: string;
    notes: string | null;
    solution: {
      id: string;
      key: string;
      nameEs: string;
    };
  }>;
};

type GlassTypeListProps = {
  initialData: {
    items: SerializedGlassType[];
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
};

export function GlassTypeList({ initialData }: GlassTypeListProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [ search, setSearch ] = useState('');
  const [ isActive, setIsActive ] = useState<'all' | 'active' | 'inactive'>('all');
  const [ purpose, setPurpose ] = useState<'all' | 'general' | 'insulation' | 'security' | 'decorative'>('all');
  const [ page, setPage ] = useState(1);
  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
  const [ glassTypeToDelete, setGlassTypeToDelete ] = useState<{ id: string; name: string } | null>(null);

  // Query with filters
  const { data, isLoading } = api.admin[ 'glass-type' ].list.useQuery(
    {
      isActive,
      limit: 20,
      page,
      purpose: purpose === 'all' ? undefined : purpose,
      search: search || undefined,
      sortBy: 'name',
      sortOrder: 'asc',
    },
    {
      placeholderData: (previousData) => previousData,
    }
  );

  // Delete mutation
  const deleteMutation = api.admin[ 'glass-type' ].delete.useMutation({
    onError: (error) => {
      toast.error('Error al eliminar tipo de vidrio', {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success('Tipo de vidrio eliminado correctamente');
      setDeleteDialogOpen(false);
      setGlassTypeToDelete(null);
      void utils.admin[ 'glass-type' ].list.invalidate();
    },
  });

  const handleCreateClick = () => {
    router.push('/admin/glass-types/new');
  };

  const handleEditClick = (id: string) => {
    router.push(`/admin/glass-types/${id}`);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setGlassTypeToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!glassTypeToDelete) return;
    await deleteMutation.mutateAsync({ id: glassTypeToDelete.id });
  };

  // Use initial data on first render, then switch to query data
  const glassTypes = data?.items ?? initialData.items;
  const totalPages = data?.totalPages ?? initialData.totalPages;

  // Purpose labels
  const purposeLabels: Record<string, string> = {
    decorative: 'Decorativo',
    general: 'General',
    insulation: 'Aislamiento',
    security: 'Seguridad',
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra tipos de vidrio</CardDescription>
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

          {/* Purpose Filter */}
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="purpose">
              Propósito
            </label>
            <Select
              onValueChange={(value) => {
                setPurpose(value as typeof purpose);
                setPage(1);
              }}
              value={purpose}
            >
              <SelectTrigger id="purpose">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="insulation">Aislamiento</SelectItem>
                <SelectItem value="security">Seguridad</SelectItem>
                <SelectItem value="decorative">Decorativo</SelectItem>
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
              Nuevo Tipo de Vidrio
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Vidrio ({data?.total ?? 0})</CardTitle>
          <CardDescription>
            Mostrando {glassTypes.length} de {data?.total ?? 0} tipos de vidrio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Espesor</TableHead>
                <TableHead>Precio/m²</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Soluciones</TableHead>
                <TableHead>Propósito</TableHead>
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
              {!isLoading && glassTypes.length === 0 && (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={8}>
                    No se encontraron tipos de vidrio
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                glassTypes.map((glassType) => (
                  <TableRow key={glassType.id}>
                    <TableCell className="font-medium">{glassType.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{glassType.thicknessMm}mm</Badge>
                    </TableCell>
                    <TableCell className="text-sm">${Number(glassType.pricePerSqm).toLocaleString('es-CO')}</TableCell>
                    <TableCell className="text-sm">
                      {glassType.glassSupplier?.name || <span className="text-muted-foreground">Sin proveedor</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {glassType.solutions.length === 0 ? (
                          <span className="text-muted-foreground text-sm">Sin soluciones</span>
                        ) : (
                          glassType.solutions.map((sol) => (
                            <Badge key={sol.solution.id} variant={sol.isPrimary ? 'default' : 'secondary'}>
                              {sol.solution.id}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{purposeLabels[ glassType.purpose ]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={glassType.isActive ? 'default' : 'secondary'}>
                        {glassType.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleEditClick(glassType.id)} size="icon" variant="ghost">
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(glassType.id, glassType.name)}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        dependencies={[]}
        entityLabel={glassTypeToDelete?.name ?? ''}
        entityName="tipo de vidrio"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
      />
    </div>
  );
}
