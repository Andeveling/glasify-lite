'use client';

/**
 * Profile Supplier Management Page
 *
 * CRUD interface for managing ProfileSupplier entities:
 * - List suppliers with filtering (materialType, isActive, search)
 * - Create new suppliers
 * - Update existing suppliers
 * - Toggle active status
 * - Delete suppliers (with validation)
 *
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md (TASK-037)
 */

import { zodResolver } from '@hookform/resolvers/zod';
import type { MaterialType } from '@prisma/client';
import { Building2, Loader2, Pencil, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  type CreateProfileSupplierInput,
  createProfileSupplierSchema,
  type UpdateProfileSupplierInput,
  updateProfileSupplierSchema,
} from '@/server/schemas/supplier.schema';
import { api } from '@/trpc/react';

/**
 * Material Type Options for forms
 */
const MATERIAL_TYPE_OPTIONS: { label: string; value: MaterialType }[] = [
  { label: 'PVC', value: 'PVC' },
  { label: 'Aluminio', value: 'ALUMINUM' },
  { label: 'Madera', value: 'WOOD' },
  { label: 'Mixto', value: 'MIXED' },
];

/**
 * Material Type Labels for display
 */
const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  ALUMINUM: 'Aluminio',
  MIXED: 'Mixto',
  PVC: 'PVC',
  WOOD: 'Madera',
};

type SupplierFormMode = 'create' | 'edit';

type SupplierFormData = {
  id?: string;
  data: CreateProfileSupplierInput | UpdateProfileSupplierInput;
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Page component with multiple UI states and handlers
export default function ProfileSuppliersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<SupplierFormMode>('create');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierFormData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [materialTypeFilter, setMaterialTypeFilter] = useState<MaterialType | 'ALL'>('ALL');
  const [isActiveFilter, setIsActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const utils = api.useUtils();

  // Fetch suppliers with filters
  const { data: suppliers = [], isLoading } = api.profileSupplier.list.useQuery({
    isActive: isActiveFilter === 'ALL' ? undefined : isActiveFilter === 'ACTIVE',
    materialType: materialTypeFilter === 'ALL' ? undefined : materialTypeFilter,
    search: searchQuery || undefined,
  });

  // Create mutation
  const createMutation = api.profileSupplier.create.useMutation({
    onError: (err) => {
      toast.error('Error al crear proveedor', {
        description: err.message || 'Ocurrió un error inesperado',
      });
    },
    onSuccess: () => {
      toast.success('Proveedor creado', {
        description: 'El proveedor se creó correctamente',
      });
      void utils.profileSupplier.list.invalidate();
      setIsDialogOpen(false);
      form.reset();
    },
  });

  // Update mutation
  const updateMutation = api.profileSupplier.update.useMutation({
    onError: (err) => {
      toast.error('Error al actualizar proveedor', {
        description: err.message || 'Ocurrió un error inesperado',
      });
    },
    onSuccess: () => {
      toast.success('Proveedor actualizado', {
        description: 'Los cambios se guardaron correctamente',
      });
      void utils.profileSupplier.list.invalidate();
      setIsDialogOpen(false);
      setSelectedSupplier(null);
      form.reset();
    },
  });

  // Delete mutation
  const deleteMutation = api.profileSupplier.delete.useMutation({
    onError: (err) => {
      toast.error('Error al eliminar proveedor', {
        description: err.message || 'No se puede eliminar un proveedor con modelos asociados',
      });
    },
    onSuccess: () => {
      toast.success('Proveedor eliminado', {
        description: 'El proveedor se eliminó correctamente',
      });
      void utils.profileSupplier.list.invalidate();
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = api.profileSupplier.toggleActive.useMutation({
    onError: (err) => {
      toast.error('Error al cambiar estado', {
        description: err.message || 'Ocurrió un error inesperado',
      });
    },
    onSuccess: () => {
      toast.success('Estado actualizado');
      void utils.profileSupplier.list.invalidate();
    },
  });

  // React Hook Form
  const form = useForm<CreateProfileSupplierInput | UpdateProfileSupplierInput>({
    defaultValues: {
      isActive: true,
      materialType: 'PVC' as MaterialType,
      name: '',
      notes: '',
    },
    resolver: zodResolver(formMode === 'create' ? createProfileSupplierSchema : updateProfileSupplierSchema),
  });

  // Handle create dialog open
  const handleCreateClick = () => {
    setFormMode('create');
    setSelectedSupplier(null);
    form.reset({
      isActive: true,
      materialType: 'PVC',
      name: '',
      notes: '',
    });
    setIsDialogOpen(true);
  };

  // Handle edit dialog open
  const handleEditClick = (supplier: (typeof suppliers)[0]) => {
    setFormMode('edit');
    setSelectedSupplier({
      data: {
        isActive: supplier.isActive,
        materialType: supplier.materialType,
        name: supplier.name,
        notes: supplier.notes ?? '',
      },
      id: supplier.id,
    });
    form.reset({
      isActive: supplier.isActive,
      materialType: supplier.materialType,
      name: supplier.name,
      notes: supplier.notes ?? '',
    });
    setIsDialogOpen(true);
  };

  // Handle form submission
  const handleFormSubmit = (data: CreateProfileSupplierInput | UpdateProfileSupplierInput) => {
    if (formMode === 'create') {
      createMutation.mutate(data as CreateProfileSupplierInput);
    } else if (selectedSupplier?.id) {
      updateMutation.mutate({
        data: data as UpdateProfileSupplierInput,
        id: selectedSupplier.id,
      });
    }
  };

  // Handle delete
  const handleDelete = (id: string, name: string) => {
    // biome-ignore lint: User confirmation needed for destructive delete operation
    const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar el proveedor "${name}"?`);
    if (confirmed) {
      deleteMutation.mutate({ id });
    }
  };

  // Handle toggle active
  const handleToggleActive = (id: string) => {
    toggleActiveMutation.mutate({ id });
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Proveedores de Perfiles</h1>
          <p className="text-muted-foreground">Administra los fabricantes de perfiles (PVC, Aluminio, etc.)</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 size-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra proveedores por tipo de material, estado o nombre</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre..."
                value={searchQuery}
              />
            </div>
          </div>

          {/* Material Type Filter */}
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="materialType">
              Tipo de Material
            </label>
            <Select
              onValueChange={(value) => setMaterialTypeFilter(value as MaterialType | 'ALL')}
              value={materialTypeFilter}
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
              onValueChange={(value) => setIsActiveFilter(value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              value={isActiveFilter}
            >
              <SelectTrigger id="isActive">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ACTIVE">Activos</SelectItem>
                <SelectItem value="INACTIVE">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Proveedores</CardTitle>
          <CardDescription>
            {suppliers.length} {suppliers.length === 1 ? 'proveedor encontrado' : 'proveedores encontrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && suppliers.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Building2 className="size-12 text-muted-foreground" />
              <p className="text-muted-foreground">No se encontraron proveedores</p>
              <p className="text-muted-foreground text-sm">
                {searchQuery || materialTypeFilter !== 'ALL' || isActiveFilter !== 'ALL'
                  ? 'Intenta ajustar los filtros'
                  : 'Crea tu primer proveedor haciendo clic en "Nuevo Proveedor"'}
              </p>
            </div>
          )}

          {!isLoading && suppliers.length > 0 && (
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
                {suppliers.map((supplier) => (
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
                        <Button onClick={() => handleToggleActive(supplier.id)} size="icon" variant="ghost">
                          {supplier.isActive ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
                          <span className="sr-only">Cambiar estado</span>
                        </Button>
                        <Button onClick={() => handleDelete(supplier.id, supplier.name)} size="icon" variant="ghost">
                          <Trash2 className="size-4 text-destructive" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{formMode === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}</DialogTitle>
            <DialogDescription>
              {formMode === 'create' ? 'Crea un nuevo proveedor de perfiles' : 'Actualiza la información del proveedor'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(handleFormSubmit)}>
              {/* Supplier Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Proveedor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Rehau, Deceuninck" {...field} />
                    </FormControl>
                    <FormDescription>Nombre del fabricante de perfiles</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Material Type */}
              <FormField
                control={form.control}
                name="materialType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Material</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MATERIAL_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Material principal del proveedor</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Información adicional sobre el proveedor..."
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>Notas o información adicional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Is Active */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        checked={field.value}
                        className="size-4"
                        onChange={(e) => field.onChange(e.target.checked)}
                        type="checkbox"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Activo</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)} type="button" variant="outline">
                  Cancelar
                </Button>
                <Button disabled={createMutation.isPending || updateMutation.isPending} type="submit">
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  {formMode === 'create' ? 'Crear' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
