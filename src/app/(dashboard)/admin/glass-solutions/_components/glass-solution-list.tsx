'use client';

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
import type { GlassSolutionListOutput } from '@/lib/validations/admin/glass-solution.schema';
import { api } from '@/trpc/react';

type GlassSolutionListProps = {
  initialData: GlassSolutionListOutput;
};

export function GlassSolutionList({ initialData }: GlassSolutionListProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [solutionToDelete, setSolutionToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = api.admin['glass-solution'].list.useQuery(
    {
      isActive,
      limit: 20,
      page,
      search: search || undefined,
      sortBy: 'sortOrder',
      sortOrder: 'asc',
    },
    {
      initialData,
    }
  );

  const deleteMutation = api.admin['glass-solution'].delete.useMutation({
    onError: (error) => {
      toast.error('Error al eliminar solución', {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success('Solución eliminada correctamente');
      setDeleteDialogOpen(false);
      setSolutionToDelete(null);
      void utils.admin['glass-solution'].list.invalidate();
    },
  });

  const handleCreateClick = () => {
    router.push('/admin/glass-solutions/new');
  };

  const handleEditClick = (id: string) => {
    router.push(`/admin/glass-solutions/${id}`);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setSolutionToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!solutionToDelete) return;
    await deleteMutation.mutateAsync({ id: solutionToDelete.id });
  };

  const solutions = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra soluciones de cristal</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
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
                placeholder="Buscar por clave, nombre..."
                value={search}
              />
            </div>
          </div>

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

          <div className="flex items-end">
            <Button className="w-full" onClick={handleCreateClick}>
              <Plus className="mr-2 size-4" />
              Nueva Solución
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Soluciones de Vidrio ({data?.total ?? 0})</CardTitle>
          <CardDescription>
            Mostrando {solutions.length} de {data?.total ?? 0} soluciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clave</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Nombre (ES)</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Tipos de Vidrio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell className="text-center" colSpan={7}>
                    Cargando...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && solutions.length === 0 && (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={7}>
                    No se encontraron soluciones
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                solutions.map((solution) => (
                  <TableRow key={solution.id}>
                    <TableCell>
                      <Badge className="font-mono" variant="outline">
                        {solution.key}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{solution.name}</TableCell>
                    <TableCell className="text-sm">{solution.nameEs || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{solution.sortOrder}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{solution._count.glassTypes}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={solution.isActive ? 'default' : 'secondary'}>
                        {solution.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleEditClick(solution.id)} size="icon" variant="ghost">
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(solution.id, solution.name)}
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

      <DeleteConfirmationDialog
        dependencies={[]}
        entityLabel={solutionToDelete?.name ?? ''}
        entityName="solución de cristal"
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
      />
    </div>
  );
}
