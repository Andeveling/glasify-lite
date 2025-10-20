'use client';

/**
 * Profile Supplier Form Component
 *
 * Reusable form for creating and editing ProfileSupplier entities.
 * Handles validation, submission, and error states.
 *
 * @see /specs/011-admin-catalog-management/ (User Story 4)
 */

import { zodResolver } from '@hookform/resolvers/zod';
import type { MaterialType, ProfileSupplier } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  createProfileSupplierSchema,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from '@/lib/validations/admin/profile-supplier.schema';
import { api } from '@/trpc/react';

/**
 * Material Type Options for form select
 */
const MATERIAL_TYPE_OPTIONS: { label: string; value: MaterialType }[] = [
  { label: 'PVC', value: 'PVC' },
  { label: 'Aluminio', value: 'ALUMINUM' },
  { label: 'Madera', value: 'WOOD' },
  { label: 'Mixto', value: 'MIXED' },
];

type ProfileSupplierFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: ProfileSupplier;
};

type FormValues = {
  name: string;
  materialType: MaterialType;
  notes?: string;
  isActive?: boolean;
};

export function ProfileSupplierForm({ mode, defaultValues }: ProfileSupplierFormProps) {
  const router = useRouter();

  // React Hook Form
  const form = useForm<FormValues>({
    defaultValues: {
      isActive: defaultValues?.isActive ?? true,
      materialType: defaultValues?.materialType ?? ('PVC' as MaterialType),
      name: defaultValues?.name ?? '',
      notes: defaultValues?.notes ?? '',
    },
    resolver: zodResolver(mode === 'create' ? createProfileSupplierSchema : createProfileSupplierSchema),
  });

  // Create mutation
  const createMutation = api.admin['profile-supplier'].create.useMutation({
    onError: (err: { message?: string }) => {
      toast.error('Error al crear proveedor', {
        description: err.message || 'Ocurrió un error inesperado',
      });
    },
    onSuccess: () => {
      toast.success('Proveedor creado', {
        description: 'El proveedor se creó correctamente',
      });
      router.push('/admin/profile-suppliers');
      router.refresh();
    },
  });

  // Update mutation
  const updateMutation = api.admin['profile-supplier'].update.useMutation({
    onError: (err: { message?: string }) => {
      toast.error('Error al actualizar proveedor', {
        description: err.message || 'Ocurrió un error inesperado',
      });
    },
    onSuccess: () => {
      toast.success('Proveedor actualizado', {
        description: 'Los cambios se guardaron correctamente',
      });
      router.push('/admin/profile-suppliers');
      router.refresh();
    },
  });

  // Handle form submission
  const handleSubmit = (formData: FormValues) => {
    const notes = formData.notes === '' ? undefined : formData.notes;

    if (mode === 'create') {
      createMutation.mutate({
        isActive: formData.isActive,
        materialType: formData.materialType,
        name: formData.name,
        notes,
      });
    } else if (defaultValues?.id) {
      updateMutation.mutate({
        data: {
          isActive: formData.isActive,
          materialType: formData.materialType,
          name: formData.name,
          notes,
        },
        id: defaultValues.id,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Nuevo Proveedor de Perfiles' : 'Editar Proveedor de Perfiles'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Crea un nuevo fabricante de perfiles para ventanas y puertas'
            : 'Actualiza la información del proveedor de perfiles'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Supplier Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Proveedor *</FormLabel>
                  <FormControl>
                    <Input
                      maxLength={MAX_NAME_LENGTH}
                      placeholder="Ej: Rehau, Deceuninck, Veka"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Nombre del fabricante de perfiles ({MIN_NAME_LENGTH}-{MAX_NAME_LENGTH} caracteres)
                  </FormDescription>
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
                  <FormLabel>Tipo de Material *</FormLabel>
                  <Select disabled={isPending} onValueChange={field.onChange} value={field.value}>
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
                      disabled={isPending}
                      placeholder="Información adicional sobre el proveedor..."
                      rows={4}
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
                <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} disabled={isPending} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Proveedor Activo</FormLabel>
                    <FormDescription>
                      Los proveedores activos están disponibles para asignar a nuevos modelos
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-4">
              <Button disabled={isPending} type="submit">
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {mode === 'create' ? 'Crear Proveedor' : 'Guardar Cambios'}
              </Button>
              <Button disabled={isPending} onClick={() => router.back()} type="button" variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
